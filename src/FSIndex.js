
'use strict'

const FS = require('./FS')
const { opcodes, lowercase, setRoot } = FS
const { ab2str } = require('./util')
const b64 = require('base64-js')

const fsReducer = (crypter) => async (fs, { payload } = {}) => {
  fs = await fs
  try {
    const fsCopy = new Map(fs)
    if (crypter) {
      if (payload.cipherbytes && payload.iv) {
        const bytes = await crypter.decrypt(
          b64.toByteArray(payload.cipherbytes).buffer,
          b64.toByteArray(payload.iv)
        )
        payload = JSON.parse(ab2str(bytes))
        if (opcodes[payload.op]) FS.ops[lowercase[payload.op]](fsCopy, payload)
      }
    } else {
      if (opcodes[payload.op]) FS.ops[lowercase[payload.op]](fsCopy, payload)
    }
    fs = fsCopy
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
    this._index = await oplog.values.reduce(fsReducer(this._crypter), fs)
    setRoot(this._index, fs.root)
  }
}

module.exports = FSIndex
