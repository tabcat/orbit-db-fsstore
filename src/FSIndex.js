
'use strict'

const FS = require('./FS')
const { opcodes, lowercase } = FS
const { ab2str } = require('./util')
const b64 = require('base64-js')

const fsReducer = (crypter) => async (fs, { payload } = {}) => {
  try {
    fs = await fs
    if (crypter) {
      const bytes = await crypter.decrypt(
        b64.toByteArray(payload.cipherbytes).buffer,
        b64.toByteArray(payload.iv)
      )
      payload = JSON.parse(ab2str(bytes))
    }
    if (opcodes[payload.op]) FS.ops[lowercase[payload.op]](fs, payload)
  } catch (e) {
    console.log(e)
  }
  return fs
}

class FSIndex {
  constructor () {
    this._index = FS.create()
    this._crypter = null
  }

  async updateIndex (oplog) {
    const fs = FS.create()
    await oplog.values.reduce(fsReducer(this.crypter), fs)
    this._index = fs
  }
}

module.exports = FSIndex
