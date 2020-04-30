
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

const setRoot = (mapInstance) => mapInstance.set('/', { type: cTypes.dir })

// creates an fs with a root dir
const create = () => setRoot(new Map())

// reset fs state
const reset = (fs) => { fs.clear(); return setRoot(fs) }

const combinedPath = (path, ...names) => path === '/'
  ? `/${names.join('/')}`
  : `${path}/${names.join('/')}`

function tree (fs, path) {
  const a = []
  for (const p of fs.keys()) {
    if (
      path === '/' || path === p ||
      (path === p.slice(0, path.length) && p.charAt(path) === '/')
    ) {
      a.push(p)
    }
  }
  return a
}

function ls (fs, path) {
  if (fs.has(path) && fs.get(path).type === cTypes.dir) {
    return tree(fs, path)
      .filter(p => path.split('/').length + 1 === p.split('/').length)
  } else {
    throw new Error(`path:${path} is not a directory`)
  }
}

// make directory at path + name
function mkdir (fs, path, name) {
  if (
    fs.has(path) && !fs.has(combinedPath(path, name)) &&
    fs.get(path).type === cTypes.dir
  ) {
    fs.set(combinedPath(path, name), { type: cTypes.dir })
  }
}

// remove directory at path
function rmdir (fs, path) {
  if (fs.has(path) && fs.get(path).type === cTypes.dir) {
    const pathTree = tree(fs, path)
    for (const p of pathTree) {
      if (p !== '/') fs.delete(p)
    }
  }
}

// move directory at path to destination path + name
function mvdir (fs, path, dest, name) {
  if (
    fs.has(path) && fs.has(dest) && !fs.has(combinedPath(dest, name)) &&
    fs.get(path).type === cTypes.dir && fs.get(dest).type === cTypes.dir
  ) {
    if (!tree(path).includes(dest)) {
      const pathTree = tree(fs, path)
      for (const p of pathTree) {
        fs.set(`${combinedPath(dest, name)}${p.slice(path.length)}`, fs.get(p))
        fs.delete(p)
      }
    }
  }
}

// copy directory at path to destination path + name
function cpdir (fs, path, dest, name) {
  if (
    fs.has(path) && fs.has(dest) && !fs.has(combinedPath(dest, name)) &&
    fs.get(path).type === cTypes.dir && fs.get(dest).type === cTypes.dir
  ) {
    if (!tree(path).includes(dest)) {
      const pathTree = tree(fs, path)
      for (const p of pathTree) {
        fs.set(`${combinedPath(dest, name)}${p.slice(path.length)}`, fs.get(p))
      }
    }
  }
}

// make file at path + name
function mk (fs, path, name) {
  if (
    fs.has(path) && !fs.has(combinedPath(path, name)) &&
    fs.get(path).type === cTypes.dir
  ) {
    fs.set(combinedPath(path, name), { type: cTypes.file, content: null })
  }
}

// write file content to path
function write (fs, path, content) {
  if (fs.has(path) && fs.get(path).type === cTypes.file) {
    fs.set(path, { type: cTypes.file, content })
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
    fs.has(path) && fs.has(dest) && !fs.has(combinedPath(dest, name)) &&
    fs.get(path).type === cTypes.file && fs.get(dest).type === cTypes.dir
  ) {
    fs.set(combinedPath(dest, name), fs.get(path))
    fs.delete(path)
  }
}

// copy file at path to destination path + name
function cp (fs, path, dest, name) {
  if (
    fs.has(path) && fs.has(dest) && !fs.has(combinedPath(dest, name)) &&
    fs.get(path).type === cTypes.file && fs.get(dest).type === cTypes.dir
  ) {
    fs.set(combinedPath(dest, name), fs.get(path))
  }
}

module.exports = {
  create,
  reset,
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
  cTypes
}
