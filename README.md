[![npm (scoped)](https://img.shields.io/npm/v/@tabcat/orbit-db-fsstore)](https://www.npmjs.com/package/@tabcat/orbit-db-fsstore)
# orbit-db-fsstore
an orbit-db store representing a file system

#### This is a custom [OrbitDB](https://github.com/orbitdb/orbit-db/) store ([add this store to your OrbitDB instance](https://github.com/tabcat/orbit-db-fsstore))

**IMPORTANT:** The fsstore creates a root directory named '/r' and every path must be built ontop/contained inside of this!

### Install
```
npm install @tabcat/orbit-db-fsstore
```

##### Credit [File system on CRDT; Mehdi Ahmed-Nacer, Stéphane Martin, Pascal Urso](https://arxiv.org/pdf/1207.5990.pdf) for filesystem datatype and operation structure

## FSStore Instance Methods API
*check out [./test](./test) for more info*
### .joinPath(path, name)
> returns a new path by combining path and name
```js
const newPath = fsstore.joinPath('/r/this/is/a', 'path')
// '/r/this/is/a/path'
```
### .exists(path)
> returns a bool, true if path exists and false if not
```js
const exists = fsstore.exists('/r/file1')
// true
```
### .content(path)
> returns the content type at path or undefined if path doesn't exist
```js
const json = fsstore.content('/r')
// 'dir'
const json = fsstore.content('/r/file1')
// 'file'
```
### .read(path)
> returns the json data written at path or undefined if path doesn't exist
```js
const json = fsstore.read('/r/file1')
// { hello: 'ipfs cid' }
```
### .tree(path)
> return an array of all paths located *under* the path in the store state
```js
const pathTree = fsstore.tree('/r/dir1')
// ['/r/dir1/file2', '/r/dir1/dir2', '/r/dir1/dir2/file2']
```
### .ls(path)
> return an array of only paths located *inside* the path in the store state
```js
const pathLs = fsstore.ls('/r/dir1')
// ['/r/dir1/file2', '/r/dir1/dir2']
```
### .mkdir(path, name)
> makes a new directory at joinPath(path, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.mkdir('/r', 'dir1')
```
### .rmdir(path)
> removes an existing directory at path
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.rmdir('/r/dir1')
```
### .mvdir(path, dest, name)
> moves an existing directory at path to joinPath(dest, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.mvdir('/r/dir1', '/r', 'dir2')
```
### .cpdir(path, dest, name)
> copies an existing directory at path to joinPath(dest, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.cpdir('/r/dir1', '/r', 'dir1')
```
### .mk(path, name)
> make a new file at joinPath(path, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.mk('/r', 'file1')
```
### .write(path, json)
> map json (any JSON-serializable value) to a file path (*!!! do not store blob data in orbitdb, ONLY REFERENCES*)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.write('/r/file1', { hello: 'ipfs cid' })
```
### .rm(path)
> remove an existing file at path
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.rm('/r/file1')
```
### .mv(path, dest, name)
> move an existing file at path to joinPath(dest, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.mv('/r/file1', '/r', 'file2')
```
### .cp(path, dest, name)
> copy an existing file at path to joinPath(dest, name)
> returns a Promise that resolves to a String that is the multihash of the entry.
```js
const entryHash = await fsstore.cp('/r/file1', '/r', 'file2')
```
