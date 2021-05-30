/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import crypto from 'crypto'
import ScratchPadMJS from '../index.mjs'
import ScratchPadCJS from '../index.cjs'

/* @type {{ name: string, module: ScratchPadMJS }[]} */
const subjects = [
  { name: 'index.mjs - es module version', module: ScratchPadMJS },
  { name: 'index.cjs - commonjs build', module: ScratchPadCJS }
]

const testData = [
  'foo',
  { a: 1, b: 2 },
  crypto.randomBytes(1024 * 8),
  Date.now(),
  new Date(),
  Infinity,
  -Infinity,
  [0, -1, -2]
]

for (const { name, module: ScratchPad } of subjects) {
  describe(name, () => {
    /** @type {ScratchFile} */
    let scratch

    it('file() creates a scratch', async () => {
      scratch = await ScratchPad.create()
      expect(scratch).is.instanceOf(ScratchPad)
    })

    let reads
    it('scratch.write stores stuff', async () => {
      reads = await Promise.all(testData.map(x => scratch.write(x)))
    })

    it('read functions work to recall those objects', async () => {
      const readback = await Promise.all(reads.map(read => read()))

      expect(readback).to.deep.equal(testData)
    })

    it('closes', async () => {
      await scratch.close()
    })
  })
}
