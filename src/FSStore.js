
'use strict'

const Store = require('orbit-db-store')
const FSIndex = require('./FSIndex')
const FS = require('./FS')
const { joinPath, pathName, pathValid, nameValid, opcodes, errors, ...fs } = FS
const { str2ab } = require('./util')

const paramCheckKeys = {
  path: 'path',
  pathName: 'pathName',
  pathDestName: 'pathDestName',
  payloads: 'payloads'
}

const cTypeError = (cType) => cType === fs.cTypes.dir
  ? errors.pathDirNo
  : errors.pathFileNo

const paramChecks = (self) => ({
  path: ({ path }, cType) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    if (self.content(path) !== cType) throw cTypeError(cType)(path)
    return true
  },
  pathName: ({ path, name }, cType) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    if (self.exists(joinPath(path, name))) throw errors.pathExistYes(joinPath(path, name))
    if (self.content(path) !== fs.cTypes.dir) throw errors.pathDirNo(path)
    return true
  },
  pathDestName: ({ path, dest, name }, cType) => {
    if (!pathValid(path)) throw errors.pathValidNo(path)
    if (!pathValid(dest)) throw errors.pathValidNo(dest)
    if (!nameValid(name)) throw errors.nameValidNo(name)
    if (!self.exists(path)) throw errors.pathExistNo(path)
    if (!self.exists(dest)) throw errors.pathExistNo(dest)
    if (self.exists(joinPath(dest, name))) throw errors.pathExistYes(joinPath(dest, name))
    if (self.content(path) !== cType) throw cTypeError(cType)(path)
    if (self.content(dest) !== fs.cTypes.dir) throw errors.pathDirNo(dest)
    return true
  },
  payloads: ({ payloads }) => Array.isArray(payloads)
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
  [opcodes.CP]: paramCheckKeys.pathDestName,
  [opcodes.BATCH]: paramCheckKeys.payloads
}

const type = 'fsstore'

class FSStore extends Store {
  constructor (ipfs, identity, dbname, options = {}) {
    options = Object.assign({}, options, { Index: FSIndex(options) })
    super(ipfs, identity, dbname, options)
    this._type = FSStore.type

    this.joinPath = joinPath
    this.pathName = pathName
    this.exists = (path = '') => fs.exists(this.index, path)
    this.content = (path = '') => fs.content(this.index, path)
    this.read = (path = '') => fs.read(this.index, path)
    this.tree = (path = '') => fs.tree(this.index, path)
    this.ls = (path = '') => fs.ls(this.index, path)

    this.paramChecks = paramChecks(this)

    this.crypter = options.crypter
  }

  static get type () { return type }

  get root () { return fs.root(this.index) }

  async _addOp ({ op, ...params }) {
    const cType = op.slice(-3) === 'DIR' ? fs.cTypes.dir : fs.cTypes.file
    this.paramChecks[paramKeys[op]](params, cType)
    let payload = { op, ...params }
    if (this.crypter) {
      const serializedPayload = str2ab(JSON.stringify(payload))
      const { bytes, iv } = await this.crypter.encrypt(serializedPayload)
      payload = { bytes: Array.from(bytes), iv: Array.from(iv) }
    }
    return this._addOperation(payload)
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

  batch () {
    const pls = []
    const makeBatchOp = (payloads) => this._addOp({ op: opcodes.BATCH, payloads })

    return {
      mkdir: (...p) => pls.push({ op: opcodes.MKDIR, path: p[0], name: p[1] }),
      rmdir: (...p) => pls.push({ op: opcodes.RMDIR, path: p[0] }),
      mvdir: (...p) => pls.push({ op: opcodes.MVDIR, path: p[0], dest: p[1], name: p[2] }),
      cpdir: (...p) => pls.push({ op: opcodes.CPDIR, path: p[0], dest: p[1], name: p[2] }),
      mk: (...p) => pls.push({ op: opcodes.MK, path: p[0], name: p[1] }),
      write: (...p) => pls.push({ op: opcodes.WRITE, path: p[0], json: p[1] }),
      rm: (...p) => pls.push({ op: opcodes.RM, path: p[0] }),
      mv: (...p) => pls.push({ op: opcodes.MV, path: p[0], dest: p[1], name: p[2] }),
      cp: (...p) => pls.push({ op: opcodes.CP, path: p[0], dest: p[1], name: p[2] }),
      execute: () => makeBatchOp(pls)
    }
  }
}

FSStore.FS = FS
FSStore.FSIndex = FSIndex

module.exports = FSStore
