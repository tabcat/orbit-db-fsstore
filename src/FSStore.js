
'use strict'
const Store = require('orbit-db-store')
const FSIndex = require('./FSIndex')
const { combinedPath, tree, ls, opcodes } = require('./FS')

class FSStore extends Store {
  constructor (ipfs, identity, dbname, options) {
    Object.assign({}, options, { Index: FSIndex })
    super(ipfs, identity, dbname, options)
    this._type = 'fsstore'
    this.combinedPath = combinedPath
  }

  tree (path) {
    return tree(this.state, path)
  }

  ls (path) {
    return ls(this.state, path)
  }

  mkdir (path, name) {
    return this._addOperation({
      op: opcodes.MKDIR,
      path,
      name
    })
  }

  rmdir (path) {
    return this._addOperation({
      op: opcodes.RMDIR,
      path
    })
  }

  mvdir (path, dest, name) {
    return this._addOperation({
      op: opcodes.MVDIR,
      path,
      dest,
      name
    })
  }

  cpdir (path, dest, name) {
    return this._addOperation({
      op: opcodes.CPDIR,
      path,
      dest,
      name
    })
  }

  mk (path, name) {
    return this._addOperation({
      op: opcodes.CPDIR,
      path,
      name
    })
  }

  write (path, content) {
    return this._addOperation({
      op: opcodes.WRITE,
      path,
      content
    })
  }

  rm (path) {
    return this._addOperation({
      op: opcodes.RM,
      path
    })
  }

  mv (path, dest, name) {
    return this._addOperation({
      op: opcodes.MV,
      path,
      dest,
      name
    })
  }

  cp (path, dest, name) {
    return this._addOperation({
      op: opcodes.CP,
      path,
      dest,
      name
    })
  }
}

module.exports = FSStore
