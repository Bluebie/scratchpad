'use strict'

const tinyFunctionQueue = require('tiny-function-queue')
const fs = require('fs')
const process = require('process')
const os = require('os')
const path = require('path')
const v8 = require('v8')

/**
 * Scratch Pad is a file you can append data to, and get back a function which
 * when called resolves with the object you originally wrote
 */
class ScratchPad {
  /**
   * create a new temporary scratch file, where objects can be temporarily written out
   * @returns {ScratchPad}
   */
  static async create () {
    const id = `scratch-pad-${process.pid}-${this.seq++}.v8-serializer`
    const tempPath = path.join(os.tmpdir(), id)
    const fileRef = await fs.promises.open(tempPath, 'wx+')
    await fs.promises.unlink(tempPath)
    return new ScratchPad(fileRef, id)
  }

  /**
   * Create a ScratchPad interface from a FileHandle
   * @param {fs.FileHandle} fileRef
   * @param {string} id
   */
  constructor (fileRef, id) {
    this.ref = fileRef
    this.id = id
    this.length = 0
  }

  async write (object) {
    const encoded = v8.serialize(object)
    return await tinyFunctionQueue.lockWhile(['scratch-file', this.id], async () => {
      const length = encoded.length
      const position = this.length
      this.length += length
      await this.ref.write(encoded, 0, length, position)

      const read = async () => {
        const buffer = Buffer.alloc(length)
        await tinyFunctionQueue.lockWhile(['scratch-file', this.id], async () => {
          await this.ref.read(buffer, 0, length, position)
        })
        return v8.deserialize(buffer)
      }
      return read
    })
  }

  /**
   * close the scratch file, deleting it
   */
  async close () {
    this.ref.close()
    this.ref = undefined
  }
}

ScratchPad.seq = 0

module.exports = ScratchPad
