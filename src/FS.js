
'use strict'

const opcodes = {
  MKDIR: 'MKDIR',
  RMDIR: 'RMDIR',
  MVDIR: 'MVDIR',
  CPDIR: 'CPDIR',
  MK: 'MK',
  WRITE: 'WRITE',
  RM: 'RM',
  MV: 'MV',
  CP: 'CP'
}

// content types
const cTypes = {
  dir: 'dir',
  file: 'file'
}

const setRoot = (fs) => fs.set('/r', { type: cTypes.dir })

// creates an fs with a root dir
const create = (state) => setRoot(new Map(state))

// reset fs state
const reset = (fs) => { fs.clear(); return setRoot(fs) }

const exists = (fs, path) => fs.has(path)

const content = (fs, path) => fs.get(path) && fs.get(path).type

const read = (fs, path) => fs.get(path) && fs.get(path).json

const pathPattern = RegExp(/^(?:\/[^/\s]+)+$/) // eslint-disable-line
const pathValid = (path) => typeof path === 'string' && pathPattern.test(path)
const namePattern = RegExp(/^[^\/\s]+$/) // eslint-disable-line
const nameValid = (name) => typeof name === 'string' && namePattern.test(name)

function joinPath (path, ...names) {
  if (!names.every(nameValid)) throw new Error('invalid name supplied')
  return `${path}/${names.join('/')}`
}

function tree (fs, path) {
  const a = []
  for (const p of fs.keys()) {
    if (`${path}/` === p.slice(0, path.length + 1)) {
      a.push(p)
    }
  }
  return a
}

function ls (fs, path) {
  return tree(fs, path)
    .filter(p => path.split('/').length + 1 === p.split('/').length)
}

// make directory at path + name
function mkdir (fs, path, name) {
  if (
    nameValid(name) &&
    fs.has(path) && !fs.has(joinPath(path, name)) &&
    fs.get(path).type === cTypes.dir
  ) {
    fs.set(joinPath(path, name), { type: cTypes.dir })
  }
}

// remove directory at path
function rmdir (fs, path) {
  if (fs.has(path) && fs.get(path).type === cTypes.dir) {
    const paths = [path, ...tree(fs, path)]
    for (const p of paths) {
      fs.delete(p)
    }
  }
}

// move directory at path to destination path + name
function mvdir (fs, path, dest, name) {
  if (
    nameValid(name) &&
    fs.has(path) && fs.has(dest) && !fs.has(joinPath(dest, name)) &&
    fs.get(path).type === cTypes.dir && fs.get(dest).type === cTypes.dir
  ) {
    const paths = [path, ...tree(fs, path)]
    if (!paths.includes(dest)) {
      for (const p of paths) {
        fs.set(`${joinPath(dest, name)}${p.slice(path.length)}`, fs.get(p))
        fs.delete(p)
      }
    }
  }
}

// copy directory at path to destination path + name
function cpdir (fs, path, dest, name) {
  if (
    nameValid(name) &&
    fs.has(path) && fs.has(dest) && !fs.has(joinPath(dest, name)) &&
    fs.get(path).type === cTypes.dir && fs.get(dest).type === cTypes.dir
  ) {
    const paths = [path, ...tree(fs, path)]
    if (!paths.includes(dest)) {
      for (const p of paths) {
        fs.set(`${joinPath(dest, name)}${p.slice(path.length)}`, fs.get(p))
      }
    }
  }
}

// make file at path + name
function mk (fs, path, name) {
  if (
    nameValid(name) &&
    fs.has(path) && !fs.has(joinPath(path, name)) &&
    fs.get(path).type === cTypes.dir
  ) {
    fs.set(joinPath(path, name), { type: cTypes.file, json: null })
  }
}

// write json data to path
function write (fs, path, json) {
  if (fs.has(path) && fs.get(path).type === cTypes.file) {
    fs.set(path, { type: cTypes.file, json })
  }
}

// remove file at path
function rm (fs, path) {
  if (fs.has(path) && fs.get(path).type === cTypes.file) {
    fs.delete(path)
  }
}

// move file at path to destination path + name
function mv (fs, path, dest, name) {
  if (
    nameValid(name) &&
    fs.has(path) && fs.has(dest) && !fs.has(joinPath(dest, name)) &&
    fs.get(path).type === cTypes.file && fs.get(dest).type === cTypes.dir
  ) {
    fs.set(joinPath(dest, name), fs.get(path))
    fs.delete(path)
  }
}

// copy file at path to destination path + name
function cp (fs, path, dest, name) {
  if (
    nameValid(name) &&
    fs.has(path) && fs.has(dest) && !fs.has(joinPath(dest, name)) &&
    fs.get(path).type === cTypes.file && fs.get(dest).type === cTypes.dir
  ) {
    fs.set(joinPath(dest, name), fs.get(path))
  }
}

module.exports = {
  create,
  reset,
  exists,
  content,
  read,
  tree,
  ls,
  mkdir,
  rmdir,
  mvdir,
  cpdir,
  mk,
  write,
  rm,
  mv,
  cp,
  opcodes,
  cTypes,
  pathValid,
  nameValid,
  joinPath
}
