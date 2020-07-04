
'use strict'

const FS = require('./FS')
const { opcodes, lowercase } = FS

const fsReducer = (fs) => ({ payload } = {}) => {
  try {
    if (opcodes[payload.op]) FS[lowercase[payload.op]](fs, payload)
  } catch (e) {
    console.log(e)
  }
}

class FSIndex {
  constructor () {
    this._index = FS.create()
  }

  get () {
    return this._index
  }

  updateIndex (oplog) {
    const fs = FS.create()
    oplog.values.map(fsReducer(fs))
    this._index = fs
  }
}

module.exports = FSIndex
