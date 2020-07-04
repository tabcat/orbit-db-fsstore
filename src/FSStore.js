
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

const paramCheckKeys = {
  path: 'path',
  pathName: 'pathName',
  pathDestName: 'pathDestName'
}

const paramChecks = (self) => ({
  path: ({ path }) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    return true
  },
  pathName: ({ path, name }) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    if (self.exists(joinPath(path, name))) throw errors.pathExistYes(joinPath(path, name))
    return true
  },
  pathDestName: ({ path, dest, name }) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    if (!self.exists(dest)) throw errors.pathExistNo(dest)
    if (self.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    return true
  }
})

const paramKeys = {
  [opcodes.MKDIR]: paramCheckKeys.pathName,
  [opcodes.RMDIR]: paramCheckKeys.path,
  [opcodes.MVDIR]: paramCheckKeys.pathDestName,
  [opcodes.CPDIR]: paramCheckKeys.pathDestName,
  [opcodes.MK]: paramCheckKeys.pathName,
  [opcodes.WRITE]: paramCheckKeys.path,
  [opcodes.RM]: paramCheckKeys.path,
  [opcodes.MV]: paramCheckKeys.pathDestName,
  [opcodes.CP]: paramCheckKeys.pathDestName
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

    this.paramChecks = paramChecks(this)
  }

  static get type () { return type }

  _addOp ({ op, ...payload }) {
    this.paramChecks[paramKeys[op]](payload)
    return this._addOperation({ op, ...payload })
  }

  mkdir (path, name) {
    return this._addOp({ op: opcodes.MKDIR, path, name })
  }

  rmdir (path) {
    return this._addOp({ op: opcodes.RMDIR, path })
  }

  mvdir (path, dest, name) {
    return this._addOp({ op: opcodes.MVDIR, path, dest, name })
  }

  cpdir (path, dest, name) {
    return this._addOp({ op: opcodes.CPDIR, path, dest, name })
  }

  mk (path, name) {
    return this._addOp({ op: opcodes.MK, path, name })
  }

  write (path, json) {
    return this._addOp({ op: opcodes.WRITE, path, json })
  }

  rm (path) {
    return this._addOp({ op: opcodes.RM, path })
  }

  mv (path, dest, name) {
    return this._addOp({ op: opcodes.MV, path, dest, name })
  }

  cp (path, dest, name) {
    return this._addOp({ op: opcodes.CP, path, dest, name })
  }
}

module.exports = FSStore
