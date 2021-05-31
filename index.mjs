import { lockWhile } from 'tiny-function-queue'
import { promises as fs } from 'fs'
import { pid } from 'process'
import { tmpdir } from 'os'
import { join } from 'path'
import { serialize, deserialize } from 'v8'

/**
 * @typedef {boolean|null|undefined|number|bigint|string} PrimitiveNonSymbol
 */

/**
 * @typedef {PrimitiveNonSymbol|Date|RegExp|Blob|File|FileList|ArrayBuffer|ArrayBufferTypes|ImageBitmap|ImageData|Array|object|Map|Set|Error} StructuredCloneable
 */

/**
 * Scratch Pad is a file you can append data to, and get back a function which
 * when called resolves with the object you originally wrote
 */
export default class ScratchPad {
  /**
   * create a new temporary scratch file, where objects can be temporarily written out
   * @returns {ScratchPad}
   * @async
   */
  static async create () {
    const id = `scratch-pad-${pid}-${this.seq++}.v8-serializer`
    const tempPath = join(tmpdir(), id)
    const fileRef = await fs.open(tempPath, 'wx+')
    await fs.unlink(tempPath)
    return new ScratchPad(fileRef, id)
  }

  /**
   * Internal, use ScratchPad.create instead
   * @param {fs.FileHandle} file - file handle to unlinked temp file we can append and read
   * @param {string} id - name used to lock resouces
   */
  constructor (fileRef, id) {
    this.ref = fileRef
    this.id = id
    this.length = 0
  }

  /**
   * Write an object to the ScratchPad, returning an function which returns a promise of the object when run
   * @param {StructuredCloneable} object
   * @returns {ReaderCallback}
   * @async
   */
  async write (object) {
    const encoded = serialize(object)
    return await lockWhile(['scratch-file', this.id], async () => {
      const length = encoded.length
      const position = this.length
      this.length += length
      await this.ref.write(encoded, 0, length, position)

      const read = async () => {
        const buffer = Buffer.alloc(length)
        await lockWhile(['scratch-file', this.id], async () => {
          await this.ref.read(buffer, 0, length, position)
        })
        return deserialize(buffer)
      }
      return read
    })
  }

  /**
   * Read function, when called returns a promise which resolves with a structured clone of the original object written to the scratchpad
   * @callback ReaderFunction
   * @returns {StructuredCloneable} - deserialised deep copy of object given to write() command that created this reader
   * @async
   */

  /**
   * Close the scratch file, freeing it's space from the local disk
   */
  close () {
    this.ref.close()
    this.ref = undefined
  }
}

ScratchPad.seq = 0
