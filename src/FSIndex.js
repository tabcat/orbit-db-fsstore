
'use strict'

const FS = require('./FS')
const { opcodes, lowercase } = FS
const { ab2str } = require('./util')

const fsReducer = (crypter) => async (fs, { payload } = {}) => {
  try {
    fs = await fs
    if (crypter) {
      const bytes = await crypter.decrypt(
        Uint8Array.from(payload.cipherbytes).buffer,
        Uint8Array.from(payload.iv)
      )
      payload = JSON.parse(ab2str(bytes))
    }
    if (opcodes[payload.op]) FS.ops[lowercase[payload.op]](fs, payload)
  } catch (e) {
    console.log(e)
  }
  return fs
}

const passOptionsToIndex = (options = {}) =>
  class FSIndex {
    constructor () {
      this._index = FS.create()
    }

    async updateIndex (oplog) {
      const fs = FS.create()
      await oplog.values.reduce(fsReducer(options.crypter), fs)
      this._index = fs
    }
  }

module.exports = passOptionsToIndex
