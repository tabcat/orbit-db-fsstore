
'use strict'
const fs = require('./fs')
const { opcodes } = fs

const fsReducer = (state) => (acc, { payload }, idx) => {
  try {
    switch (payload.op) {
      case opcodes.MKDIR:
        fs.mkdir(state, payload.path, payload.name)
        break
      case opcodes.RMDIR:
        fs.rmdir(state, payload.path)
        break
      case opcodes.MVDIR:
        fs.mvdir(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.CPDIR:
        fs.cpdir(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.MK:
        fs.mk(state, payload.path, payload.name)
        break
      case opcodes.WRITE:
        fs.write(state, payload.path, payload.content)
        break
      case opcodes.RM:
        fs.rm(state, payload.path)
        break
      case opcodes.MV:
        fs.mv(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.CP:
        fs.cp(state, payload.path, payload.dest, payload.name)
    }
  } catch (e) {
    console.log(e)
  }
}

class FSIndex {
  constructor () {
    this._index = fs.create()
  }

  get () {
    return this._index
  }

  updateIndex (oplog) {
    fs.reset(this.index)

    oplog.values
      .filter(e => e && e.payload)
      .map(fsReducer(this._index))
  }
}

module.exports = FSIndex
