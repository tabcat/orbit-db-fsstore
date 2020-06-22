
'use strict'
const assert = require('assert')
const FS = require('../src/FS')

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
    ['/r/dir1/dir2', dirContent],
    ['/r/dir1/dir2/file3', fileContent]
  ]
  const fsState = [
    ...fsState1,
    ...fsState2,
    ...fsState3,
    ...fsState4,
    ...fsState5
  ]

  let fs

  it('create an empty filesystem', function () {
    fs = FS.create()
    assert.deepStrictEqual([...fs.entries()], fsState1)
  })

  it('create a non-empty filesystem', function () {
    fs = FS.create(fsState)
    assert.deepStrictEqual([...fs.entries()], fsState)
  })

  it('reset a created filesystem', function () {
    fs = FS.create(fsState)
    assert.deepStrictEqual([...fs.entries()], fsState)
    FS.reset(fs)
    assert.deepStrictEqual([...fs.entries()], fsState1)
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

  describe('tree', function () {
    it('tree an existing directory with contents', function () {
      fs = FS.create(fsState)
      let tree
      tree = fsState.slice(1).map(x => x[0])
      assert.deepStrictEqual(FS.tree(fs, '/r'), tree)
      tree = fsState5.map(x => x[0])
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
      const ls = [fsState5[0]].map(x => x[0])
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
      FS.mkdir(fs, '/r', 'make-here')
      assert.deepStrictEqual(fs.get('/r/make-here'), dirContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/r/make-here', dirContent]])
    })

    it('fail to make a directory in an existing file', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/r/file1', 'make-here')
      assert.deepStrictEqual(fs.get('/r/file1/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make a directory in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/r/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/r', 'dir1')
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/r', 'file1')
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rmdir', function () {
    it('remove an existing directory with contents', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/r/dir1')
      assert.deepStrictEqual(fs.get('/r/dir1'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState3, ...fsState4]
      )
    })

    it('remove an existing directory without contents', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/r/dir2')
      assert.deepStrictEqual(fs.get('/r/dir2'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState2, ...fsState3, fsState4[1], ...fsState5]
      )
    })

    it('fail to remove an existing file', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/r/file1')
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/r/non-exist')
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mvdir', function () {
    it('move an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/dir1', '/r', 'move-here')
      assert.deepStrictEqual(fs.get('/r/move-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState3,
          ...fsState4,
          ['/r/move-here', dirContent],
          ['/r/move-here/dir2', dirContent],
          ['/r/move-here/dir2/file3', fileContent]
        ]
      )
    })

    it('move an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/dir2', '/r', 'move-here')
      assert.deepStrictEqual(fs.get('/r/move-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState3,
          fsState4[1],
          ...fsState5,
          ['/r/move-here', dirContent]
        ]
      )
    })

    it('fail to move an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/dir1', '/r/non-exist', 'move-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/non-exist', '/r', 'move-here')
      assert.deepStrictEqual(fs.get('/r/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/file1', '/r/file2', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file2/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/dir1', '/r/file1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/file1', '/r/dir1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/r/dir1', '/r/dir1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cpdir', function () {
    it('copy an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/dir1', '/r', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/copy-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/copy-here', dirContent],
          ['/r/copy-here/dir2', dirContent],
          ['/r/copy-here/dir2/file3', fileContent]
        ]
      )
    })

    it('copy an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/dir2', '/r', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/copy-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/copy-here', { type: 'dir' }]
        ]
      )
    })

    it('fail to copy an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/dir1', '/r/non-exist', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/non-exist', '/r/dir1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/file1', '/r/file2', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file2/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/dir1', '/r/file1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/file1', '/r/dir1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/r/dir1', '/r/dir1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mk', function () {
    it('make a file in an existing directory', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/r', 'make-here')
      const makeFileContent = { type: 'file', json: null }
      assert.deepStrictEqual(fs.get('/r/make-here'), makeFileContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/r/make-here', makeFileContent]])
    })

    it('fail to make file in an existing file', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/r/file1', 'make-here')
      assert.deepStrictEqual(fs.get('/r/file1/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make file in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/r/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/r', 'dir1')
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/r', 'file1')
      assert.deepStrictEqual(fs.get('/r/file1'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('write', function () {
    const writeFileContent = { type: 'file', json: 'hello' }

    it('write to an existing file', function () {
      fs = FS.create(fsState)
      FS.write(fs, '/r/file1', writeFileContent.json)
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

    it('fail to write to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.write(fs, '/r/non-exist', writeFileContent.content)
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to write to a directory', function () {
      fs = FS.create(fsState)
      FS.write(fs, '/r/dir1', writeFileContent.content)
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rm', function () {
    it('remove an existing file', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/r/file1')
      assert.deepStrictEqual(fs.get('/r/file1'), undefined)
      assert.deepStrictEqual(
        [...fs.entries()],
        [...fsState1, ...fsState2, ...fsState4, ...fsState5]
      )
    })

    it('fail to remove an existing directory', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/r/dir1')
      assert.deepStrictEqual(fs.get('/r/dir1'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/r/non-exist')
      assert.deepStrictEqual(fs.get('/r/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mv', function () {
    it('move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/file1', '/r', 'move-here')
      assert.deepStrictEqual(fs.get('/r/move-here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState4,
          ...fsState5,
          ['/r/move-here', fileContent]
        ]
      )
    })

    it('fail to move an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/file1', '/r/non-exist', 'move-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/non-exist', '/r', 'move-here')
      assert.deepStrictEqual(fs.get('/r/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/file1', '/r/file2', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file2/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/dir1', '/r/file1', 'move-here')
      assert.deepStrictEqual(fs.get('/r/file1/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/dir1', '/r/dir2', 'move-here')
      assert.deepStrictEqual(fs.get('/r/dir2/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cp', function () {
    it('copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cp(fs, '/r/file1', '/r', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/copy-here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/r/copy-here', fileContent]
        ]
      )
    })

    it('fail to copy an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/file1', '/r/non-exist', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/non-exist/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/non-exist', '/r', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/file1', '/r/file2', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/file2/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/dir1', '/r/file1', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/file1/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/r/dir1', '/r/dir2', 'copy-here')
      assert.deepStrictEqual(fs.get('/r/dir2/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })
})
