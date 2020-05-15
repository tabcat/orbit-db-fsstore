
'use strict'

const FS = require('./FS')
const { opcodes } = FS

const fsReducer = (state) => ({ payload } = {}) => {
  try {
    switch (payload.op) {
      case opcodes.MKDIR:
        FS.mkdir(state, payload.path, payload.name)
        break
      case opcodes.RMDIR:
        FS.rmdir(state, payload.path)
        break
      case opcodes.MVDIR:
        FS.mvdir(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.CPDIR:
        FS.cpdir(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.MK:
        FS.mk(state, payload.path, payload.name)
        break
      case opcodes.WRITE:
        FS.write(state, payload.path, payload.content)
        break
      case opcodes.RM:
        FS.rm(state, payload.path)
        break
      case opcodes.MV:
        FS.mv(state, payload.path, payload.dest, payload.name)
        break
      case opcodes.CP:
        FS.cp(state, payload.path, payload.dest, payload.name)
    }
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
    FS.reset(this._index)

    oplog.values
      .map(fsReducer(this._index))
  }
}

module.exports = FSIndex
