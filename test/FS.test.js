
'use strict'
const assert = require('assert')
const FS = require('../src/FS')
const { opcodes } = FS
const sortFn = (o, t) => o.toLowerCase().localeCompare(t.toLowerCase())

describe('FS', function () {
  const dirContent = { type: 'dir' }
  const fileContent = { type: 'file', json: true }

  const fsState1 = [['/r', dirContent]]
  const fsState2 = [['/r/dir1', dirContent]]
  const fsState3 = [['/r/file1', fileContent]]
  const fsState4 = [
    ['/r/dir2', dirContent],
    ['/r/file2', fileContent]
  ]
  const fsState5 = [
    ['/r/dir1/dir3', dirContent],
    ['/r/dir1/dir3/file3', fileContent]
  ]
  const fsState = [
    ...fsState1,
    ...fsState2,
    ...fsState3,
    ...fsState4,
    ...fsState5
  ]

  const paths = {
    root: { path: '/r' },
    nonExist: { path: '/r/non-exist' },
    file1: { path: '/r/file1' },
    file2: { path: '/r/file2' },
    dir1: { path: '/r/dir1' },
    dir2: { path: '/r/dir2' }
  }

  const dests = {
    root: { dest: '/r' },
    nonExist: { dest: '/r/non-exist' },
    file1: { dest: '/r/file1' },
    file2: { dest: '/r/file2' },
    dir1: { dest: '/r/dir1' },
    dir2: { dest: '/r/dir2' }
  }

  const names = {
    here: { name: 'here' },
    invalid: { name: '/invalid' },
    file1: { name: 'file1' },
    file2: { name: 'file2' },
    dir1: { name: 'dir1' },
    dir2: { name: 'dir2' }
  }
  let fs

  it('exposes root path', function () {
    fs = FS.create()
    assert.strict.equal(fs.root, '/r')
    assert.strict.equal(FS.root(fs), '/r')
  })

  it('create an empty filesystem', function () {
    fs = FS.create()
    assert.deepStrictEqual([...fs.entries()], fsState1)
  })

  it('create a non-empty filesystem', function () {
    fs = FS.create(fsState)
    assert.deepStrictEqual([...fs.entries()], fsState)
  })

  describe('exists', function () {
    it('return true if directory path exists', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.exists(fs, '/r'), true)
    })

    it('return true if file path exists', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.exists(fs, '/r/file1'), true)
    })

    it('return false if path does not exist', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.exists(fs, 'does not exist'), false)
    })
  })

  describe('content', function () {
    it('return directory content type for directory path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.content(fs, '/r'), 'dir')
    })

    it('return file content type for file path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.content(fs, '/r/file1'), 'file')
    })

    it('return undefined for non-existing path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.content(fs, 'does not exist'), undefined)
    })
  })

  describe('read', function () {
    it('return json data at file path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.read(fs, '/r/file1'), true)
    })

    it('return undefined at directory path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.read(fs, '/r'), undefined)
    })

    it('return undefined for non-existing path', function () {
      fs = FS.create(fsState)
      assert.strict.equal(FS.read(fs, 'does not exist'), undefined)
    })
  })

  describe('pathValid', function () {
    it('return true for valid names', function () {
      assert.strict.equal(FS.pathValid('/!'), true)
      assert.strict.equal(FS.pathValid('/asdf1234!@#$'), true)
    })

    it('return false for invalid names', function () {
      assert.strict.equal(FS.pathValid(), false)
      assert.strict.equal(FS.pathValid(''), false)
      assert.strict.equal(FS.pathValid({ asdf: 'asdf' }), false)
      assert.strict.equal(FS.pathValid('/asdf1234!@#$/'), false)
      assert.strict.equal(FS.pathValid('asdf1234!@#$/'), false)
      assert.strict.equal(FS.pathValid('asdf1234!@#$'), false)
    })
  })

  describe('nameValid', function () {
    it('return true for valid names', function () {
      assert.strict.equal(FS.nameValid('!'), true)
      assert.strict.equal(FS.nameValid('asdf1234!@#$'), true)
    })

    it('return false for invalid names', function () {
      assert.strict.equal(FS.nameValid(), false)
      assert.strict.equal(FS.nameValid(''), false)
      assert.strict.equal(FS.nameValid({ asdf: 'asdf' }), false)
      assert.strict.equal(FS.nameValid('/asdf1234!@#$/'), false)
      assert.strict.equal(FS.nameValid('/asdf1234!@#$'), false)
      assert.strict.equal(FS.nameValid('asdf1234!@#$/'), false)
    })
  })

  describe('joinPath', function () {
    it('join path with names', function () {
      assert.strict.equal(FS.joinPath('/r', 'file1'), '/r/file1')
    })

    it('join path with invalid names throws', function () {
      assert.throws(() => FS.joinPath('/r', '/file1'))
      assert.throws(() => FS.joinPath('/r', 'file1/'))
      assert.throws(() => FS.joinPath('/r', '/file1/'))
      assert.throws(() => FS.joinPath('/r', 'fi/le1'))
    })
  })

  describe('pathName', function () {
    it('get name of path', function () {
      assert.strict.equal(FS.pathName('/r/file1'), 'file1')
    })

    it('path name invalid path throws', function () {
      assert.throws(() => FS.pathName('/r/file1/'))
      assert.throws(() => FS.pathName('r/file1/'))
      assert.throws(() => FS.pathName('r/file1'))
    })
  })

  describe('baseName', function () {
    it('get path parent of path', function () {
      assert.strict.equal(FS.baseName('/r/file1'), '/r')
    })

    it('base name invalid path throws', function () {
      assert.throws(() => FS.baseName('/r/file1/'))
      assert.throws(() => FS.baseName('r/file1/'))
      assert.throws(() => FS.baseName('r/file1'))
    })
  })

  describe('tree', function () {
    it('tree an existing directory with contents', function () {
      fs = FS.create(fsState)
      let tree
      tree = fsState.slice(1).map(x => x[0]).sort(sortFn)
      assert.deepStrictEqual(FS.tree(fs, '/r'), tree)
      tree = fsState5.map(x => x[0]).sort(sortFn)
      assert.deepStrictEqual(FS.tree(fs, '/r/dir1'), tree)
    })

    it('tree an existing directory without contents', function () {
      fs = FS.create(fsState)
      const tree = []
      assert.deepStrictEqual(FS.tree(fs, '/r/dir2'), tree)
    })
  })

  describe('ls', function () {
    it('ls an existing directory with contents', function () {
      fs = FS.create(fsState)
      const ls = [fsState5[0]].map(x => x[0]).sort(sortFn)
      assert.deepStrictEqual(FS.ls(fs, '/r/dir1'), ls)
    })

    it('ls an existing directory without contents', function () {
      fs = FS.create(fsState)
      const ls = []
      assert.deepStrictEqual(FS.ls(fs, '/r/dir2'), ls)
    })
  })

  describe('mkdir', function () {
    it('make a directory in an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), dirContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/r/here', dirContent]])
    })

    it('fail to make a directory in an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make a directory in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.root, ...names.dir1 })
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.root, ...names.file1 })
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make directory with an invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.mkdir(fs, { ...paths.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rmdir', function () {
    it('remove an existing directory with contents', function () {
      fs = FS.create(fsState)
      FS.ops.rmdir(fs, { ...paths.dir1 })
      assert.deepStrictEqual(fs.get('/r/dir1'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState3, ...fsState4]
      )
    })

    it('remove an existing directory without contents', function () {
      fs = FS.create(fsState)
      FS.ops.rmdir(fs, { ...paths.dir2 })
      assert.deepStrictEqual(fs.get('/r/dir2'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState2, ...fsState3, fsState4[1], ...fsState5]
      )
    })

    it('fail to remove an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.rmdir(fs, { ...paths.file1 })
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.rmdir(fs, { ...paths.nonExist })
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mvdir', function () {
    it('move an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.dir1, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState3,
          ...fsState4,
          ['/r/here', dirContent],
          ['/r/here/dir3', dirContent],
          ['/r/here/dir3/file3', fileContent]
        ]
      )
    })

    it('move an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.dir2, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState3,
          fsState4[1],
          ...fsState5,
          ['/r/here', dirContent]
        ]
      )
    })

    it('fail to move an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.dir1, ...dests.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.nonExist, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.file1, ...dests.file2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.dir1, ...dests.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.file1, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.dir1, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move directory to invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.mvdir(fs, { ...paths.file1, ...dests.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cpdir', function () {
    it('copy an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir1, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/here', dirContent],
          ['/r/here/dir3', dirContent],
          ['/r/here/dir3/file3', fileContent]
        ]
      )
    })

    it('copy an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir2, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/here', { type: 'dir' }]
        ]
      )
    })

    it('fail to copy an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir1, ...dests.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.nonExist, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.file1, ...dests.file2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir1, ...dests.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.file1, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir1, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy directory to an invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.cpdir(fs, { ...paths.dir1, ...dests.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mk', function () {
    it('make a file in an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.root, ...names.here })
      const makeFileContent = { type: 'file', json: null }
      assert.deepStrictEqual(fs.get('/r/here'), makeFileContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/r/here', makeFileContent]])
    })

    it('fail to make file in an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make file in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.root, ...names.dir1 })
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.root, ...names.file1 })
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make file with invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.mk(fs, { ...paths.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('write', function () {
    const writeFileContent = { type: 'file', json: 'hello' }

    it('write to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.write(fs, { ...paths.file1, json: writeFileContent.json })
      assert.deepStrictEqual(fs.get('/r/file1'), writeFileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ['/r/file1', writeFileContent],
          ...fsState4,
          ...fsState5
        ]
      )
    })

    it('fail to write to a directory', function () {
      fs = FS.create(fsState)
      FS.ops.write(fs, { ...paths.dir1, json: writeFileContent.json })
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to write to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.write(fs, { ...paths.nonExist, json: writeFileContent.json })
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rm', function () {
    it('remove an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.rm(fs, { ...paths.file1 })
      assert.deepStrictEqual(fs.get('/r/file1'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState2, ...fsState4, ...fsState5]
      )
    })

    it('fail to remove an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.rm(fs, { ...paths.dir1 })
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.rm(fs, { ...paths.nonExist })
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mv', function () {
    it('move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.file1, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState4,
          ...fsState5,
          ['/r/here', fileContent]
        ]
      )
    })

    it('fail to move an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.file1, ...dests.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.nonExist, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.file1, ...dests.file2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.dir1, ...dests.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.dir1, ...dests.dir2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move file to invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.mv(fs, { ...paths.file1, ...dests.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cp', function () {
    it('copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.file1, ...dests.root, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/here', fileContent]
        ]
      )
    })

    it('fail to copy an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.file1, ...dests.nonExist, ...names.here })
      assert.deepStrictEqual(fs.get('/r/non-exist/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.nonExist, ...dests.dir1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.file1, ...dests.file2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.dir1, ...dests.file1, ...names.here })
      assert.deepStrictEqual(fs.get('/r/file1/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.dir1, ...dests.dir2, ...names.here })
      assert.deepStrictEqual(fs.get('/r/dir2/here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy file to invalid name', function () {
      fs = FS.create(fsState)
      FS.ops.cp(fs, { ...paths.file1, ...dests.root, ...names.invalid })
      assert.deepStrictEqual(fs.get('/r/invalid'), undefined)
      assert.deepStrictEqual(fs.get('/r//invalid'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('batch', function () {
    it('batch operations together', function () {
      fs = FS.create()
      const payloads = [
        { op: opcodes.MKDIR, path: '/r', name: 'dir1' },
        { op: opcodes.MK, path: '/r', name: 'file1' },
        { op: opcodes.WRITE, path: '/r/file1', json: true },
        { op: opcodes.MKDIR, path: '/r', name: 'dir2' },
        { op: opcodes.MK, path: '/r', name: 'file2' },
        { op: opcodes.WRITE, path: '/r/file2', json: true },
        { op: opcodes.MKDIR, path: '/r/dir1', name: 'dir3' },
        { op: opcodes.MK, path: '/r/dir1/dir3', name: 'file3' },
        { op: opcodes.WRITE, path: '/r/dir1/dir3/file3', json: true }
      ]
      FS.ops.batch(fs, { payloads })
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })
})
