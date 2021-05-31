/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import crypto from 'crypto'
import ScratchPad from '../index.mjs'
import gc from 'expose-gc/function.js'
import { memoryUsage } from 'process'

const get1mb = () => crypto.randomBytes(1024 * 1024)

describe('ScratchPad genuinely works well with GC and doesn\'t memory leak', async () => {
  let pad
  let memUseBefore
  before(async () => {
    pad = await ScratchPad.create()
    // warm up the code paths
    for (let i = 0; i < 25; i++) {
      await pad.write(get1mb())
    }
    // run garbage collector, and check memory use
    gc(true)
    const { heapUsed, external } = memoryUsage()
    memUseBefore = heapUsed + external
  })

  it('after writing 512mb, memory use wont grow more than 25mb', async () => {
    for (let i = 0; i < 512; i++) {
      await pad.write(get1mb())
    }

    gc(true)

    const { heapUsed, external } = memoryUsage()
    const total = heapUsed + external
    // verify that memory use after is less than 25mb increase
    expect(total).to.be.lessThan(memUseBefore + (1024 * 1024 * 25))
    // console.log('memory use before:', memUseBefore)
    // console.log('memory use after 512mb:', total)
    // console.log('memory increase:', (total - memUseBefore))
  })

  after('closes', async () => {
    await pad.close()
  })
})
