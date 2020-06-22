
'use strict'

const Store = require('orbit-db-store')
const FSIndex = require('./FSIndex')
const { joinPath, pathValid, nameValid, opcodes, ...fs } = require('./FS')

const errors = {
  pathValidNo: (path) => new Error(`path ${path} is not valid`),
  nameValidNo: (name) => new Error(`name ${name} is not valid`),
  pathExistNo: (path) => new Error(`path '${path}' does not exist`),
  pathExistYes: (path) => new Error(`path '${path}' already exists`)
}

const type = 'fsstore'

class FSStore extends Store {
  constructor (ipfs, identity, dbname, options) {
    options = Object.assign({}, options, { Index: FSIndex })
    super(ipfs, identity, dbname, options)
    this._type = FSStore.type

    this.joinPath = joinPath
    this.exists = (path = '') => fs.exists(this._index.get(), path)
    this.content = (path = '') => fs.content(this._index.get(), path)
    this.read = (path = '') => fs.read(this._index.get(), path)
    this.tree = (path = '') => fs.tree(this._index.get(), path)
    this.ls = (path = '') => fs.ls(this._index.get(), path)
  }

  static get type () { return type }

  mkdir (path, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (this.exists(joinPath(path, name))) throw errors.pathExistYes(joinPath(path, name))
    return this._addOperation({ op: opcodes.MKDIR, path, name })
  }

  rmdir (path) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    return this._addOperation({ op: opcodes.RMDIR, path })
  }

  mvdir (path, dest, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (!this.exists(dest)) throw errors.pathExistNo(dest)
    if (this.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    return this._addOperation({ op: opcodes.MVDIR, path, dest, name })
  }

  cpdir (path, dest, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (!this.exists(dest)) throw errors.pathExistNo(dest)
    if (this.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    return this._addOperation({ op: opcodes.CPDIR, path, dest, name })
  }

  mk (path, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (this.exists(joinPath(path, name))) throw errors.pathExistYes(joinPath(path, name))
    return this._addOperation({ op: opcodes.MK, path, name })
  }

  write (path, json) {
    if (!this.exists(path)) throw errors.pathExistNo(path)
    return this._addOperation({ op: opcodes.WRITE, path, json })
  }

  rm (path) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    return this._addOperation({ op: opcodes.RM, path })
  }

  mv (path, dest, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (!this.exists(dest)) throw errors.pathExistNo(dest)
    if (this.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    return this._addOperation({ op: opcodes.MV, path, dest, name })
  }

  cp (path, dest, name) {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!this.exists(path)) throw errors.pathExistNo(path)
    if (!this.exists(dest)) throw errors.pathExistNo(dest)
    if (this.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    return this._addOperation({ op: opcodes.CP, path, dest, name })
  }
}

module.exports = FSStore
