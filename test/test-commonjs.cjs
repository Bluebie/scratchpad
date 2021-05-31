/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const crypto = require('crypto')
const ScratchPad = require('../index.cjs')

const testData = [
  'foo',
  { a: 1, b: 2 },
  crypto.randomBytes(1024 * 8),
  Date.now(),
  new Date(),
  crypto.randomBytes(1024 * 64),
  Infinity,
  -Infinity,
  crypto.randomBytes(1024 * 32),
  [0, -1, -2]
]

describe('index.cjs - commonjs version', () => {
  /** @type {ScratchPad} */
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
