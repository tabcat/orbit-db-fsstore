
'use strict'
const assert = require('assert')
const FS = require('../src/FS')

// '/asdf/zxcv/qwer/ghjk/vbnm/tyui'

describe('FS', function () {
  const dirContent = { type: 'dir' }
  const fileContent = { type: 'file', content: true }
  const fsState1 = [
    ['/', dirContent],
    ['/asdf', dirContent],
    ['/asdf/fdsa', fileContent]
  ]
  const fsState2 = [['/asdf/ghjk', fileContent]]
  const fsState3 = [['/asdf/zxcv', dirContent]]
  const fsState4 = [
    ['/asdf/qwer', dirContent],
    ['/asdf/qwer/zxcv', dirContent],
    ['/asdf/qwer/zxcv/asdf', fileContent]
  ]
  const fsState = [...fsState1, ...fsState2, ...fsState3, ...fsState4]

  let fs

  beforeEach(function () {
    fs = null
  })

  it('create an empty filesystem', function () {
    fs = FS.create()
    assert.deepStrictEqual([...fs.entries()], [['/', { type: 'dir' }]])
  })

  it('create a non-empty filesystem', function () {
    fs = FS.create(fsState)
    assert.deepStrictEqual([...fs.entries()], fsState)
  })

  it('reset a created filesystem', function () {
    fs = FS.create(fsState)
    assert.deepStrictEqual([...fs.entries()], fsState)
    FS.reset(fs)
    assert.deepStrictEqual([...fs.entries()], [['/', { type: 'dir' }]])
  })

  describe('tree', function () {
    it('tree an existing directory with contents', function () {
      fs = FS.create(fsState)
      const tree = fsState.slice(2).map(x => x[0])
      assert.deepStrictEqual(FS.tree(fs, '/asdf'), tree)
    })

    it('tree an existing directory without contents', function () {
      fs = FS.create(fsState)
      const tree = []
      assert.deepStrictEqual(FS.tree(fs, '/asdf/zxcv'), tree)
    })
  })

  describe('ls', function () {
    it('ls an existing directory with contents', function () {
      fs = FS.create(fsState)
      const ls = fsState.slice(2, 6).map(x => x[0])
      assert.deepStrictEqual(FS.ls(fs, '/asdf'), ls)
    })

    it('ls an existing directory without contents', function () {
      fs = FS.create(fsState)
      const ls = []
      assert.deepStrictEqual(FS.ls(fs, '/asdf/zxcv'), ls)
    })
  })

  describe('mkdir', function () {
    it('make a directory in an existing directory', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/asdf', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/make-here'), dirContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/asdf/make-here', dirContent]])
    })

    it('fail to make a directory in an existing file', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/asdf/fdsa', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/fdsa/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make a directory in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/asdf/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/asdf', 'zxcv')
      assert.deepStrictEqual(fs.get('/asdf/zxcv'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.mkdir(fs, '/asdf', 'fdsa')
      assert.deepStrictEqual(fs.get('/asdf/fdsa'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rmdir', function () {
    it('remove an existing directory with contents', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/asdf/qwer')
      assert.deepStrictEqual(fs.get('/asdf/qwer'), undefined)
      assert.deepStrictEqual([...fs.entries()], [...fsState1, ...fsState2, ...fsState3])
    })

    it('remove an existing directory without contents', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/asdf/zxcv')
      assert.deepStrictEqual(fs.get('/asdf/zxcv'), undefined)
      assert.deepStrictEqual([...fs.entries()], [...fsState1, ...fsState2, ...fsState4])
    })

    it('fail to remove an existing file', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/asdf/fdsa')
      assert.deepStrictEqual(fs.get('/asdf/fdsa'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.rmdir(fs, '/asdf/non-exist')
      assert.deepStrictEqual(fs.get('/asdf/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mvdir', function () {
    it('move an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/qwer', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState3,
          ['/asdf/move-here', dirContent],
          ['/asdf/move-here/zxcv', dirContent],
          ['/asdf/move-here/zxcv/asdf', fileContent]
        ]
      )
    })

    it('move an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/zxcv', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState2,
          ...fsState4,
          ['/asdf/move-here', dirContent]
        ]
      )
    })

    it('fail to move an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/zxcv', '/asdf/non-exist', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/non-exist', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/fdsa', '/asdf/ghjk', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/ghjk/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/zxcv', '/asdf/fdsa', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/fdsa/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/fdsa', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.mvdir(fs, '/asdf/zxcv', '/asdf/zxcv', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cpdir', function () {
    it('copy an existing directory with contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/qwer', '/asdf', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/copy-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/asdf/copy-here', dirContent],
          ['/asdf/copy-here/zxcv', dirContent],
          ['/asdf/copy-here/zxcv/asdf', fileContent]
        ]
      )
    })

    it('copy an existing directory without contents to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/zxcv', '/asdf', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/copy-here'), dirContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/asdf/copy-here', { type: 'dir' }]
        ]
      )
    })

    it('fail to copy an existing directory to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/zxcv', '/asdf/non-exist', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/non-exist', '/asdf/zxcv', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/fdsa', '/asdf/ghjk', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/ghjk/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/zxcv', '/asdf/ghjk', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/ghjk/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/ghjk', '/asdf/zxcv', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to itself', function () {
      fs = FS.create(fsState)
      FS.cpdir(fs, '/asdf/zxcv', '/asdf/zxcv', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mk', function () {
    it('make a file in an existing directory', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/asdf', 'make-here')
      const makeFileContent = { type: 'file', content: null }
      assert.deepStrictEqual(fs.get('/asdf/make-here'), makeFileContent)
      assert.deepStrictEqual([...fs.entries()], [...fsState, ['/asdf/make-here', makeFileContent]])
    })

    it('fail to make file in an existing file', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/asdf/fdsa', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/fdsa/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to make file in a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/asdf/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing directory', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/asdf', 'zxcv')
      assert.deepStrictEqual(fs.get('/asdf/zxcv'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to overwrite an existing file', function () {
      fs = FS.create(fsState)
      FS.mk(fs, '/asdf', 'fdsa')
      assert.deepStrictEqual(fs.get('/asdf/fdsa'), fileContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('write', function () {
    it('write to an existing file', function () {
      fs = FS.create(fsState)
      const writeFileContent = { type: 'file', content: 'hello' }
      FS.write(fs, '/asdf/ghjk', writeFileContent.content)
      assert.deepStrictEqual(fs.get('/asdf/ghjk'), writeFileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ['/asdf/ghjk', writeFileContent],
          ...fsState3,
          ...fsState4
        ]
      )
    })

    it('fail to write to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.write(fs, '/asdf/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to write to a directory', function () {
      fs = FS.create(fsState)
      FS.write(fs, '/asdf/non-exist', 'make-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/make-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('rm', function () {
    it('remove an existing file', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/asdf/ghjk')
      assert.deepStrictEqual(fs.get('/asdf/ghjk'), undefined)
      assert.deepStrictEqual([...fs.entries()], [...fsState1, ...fsState3, ...fsState4])
    })

    it('fail to remove an existing directory', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/asdf/zxcv')
      assert.deepStrictEqual(fs.get('/asdf/zxcv'), dirContent)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to remove a non-existing path', function () {
      fs = FS.create(fsState)
      FS.rm(fs, '/asdf/non-exist')
      assert.deepStrictEqual(fs.get('/asdf/non-exist'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('mv', function () {
    it('move an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/ghjk', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState1,
          ...fsState3,
          ...fsState4,
          ['/asdf/move-here', fileContent]
        ]
      )
    })

    it('fail to move an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/fdsa', '/asdf/non-exist', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/non-exist', '/asdf', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/fdsa', '/asdf/ghjk', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/ghjk/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/zxcv', '/asdf/ghjk', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to move an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/zxcv', '/asdf/qwer', 'move-here')
      assert.deepStrictEqual(fs.get('/asdf/qwer/move-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })

  describe('cp', function () {
    it('copy an existing file to an existing directory', function () {
      fs = FS.create(fsState)
      FS.cp(fs, '/asdf/fdsa', '/asdf', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/copy-here'), fileContent)
      assert.deepStrictEqual(
        [...fs.entries()],
        [
          ...fsState,
          ['/asdf/copy-here', fileContent]
        ]
      )
    })

    it('fail to copy an existing file to a non-existing path', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/fdsa', '/asdf/non-exist', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/non-exist/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy a non-existing path to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/non-exist', '/asdf', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing file to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/fdsa', '/asdf/ghjk', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/ghjk/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing file', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/zxcv', '/asdf/ghjk', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/zxcv/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })

    it('fail to copy an existing directory to an existing directory', function () {
      fs = FS.create(fsState)
      FS.mv(fs, '/asdf/zxcv', '/asdf/qwer', 'copy-here')
      assert.deepStrictEqual(fs.get('/asdf/qwer/copy-here'), undefined)
      assert.deepStrictEqual([...fs.entries()], fsState)
    })
  })
})
