
'use strict'

const assert = require('assert')
const rmrf = require('rimraf')
const path = require('path')
const OrbitDB = require('orbit-db')
const FSStore = require('../src/FSStore')
OrbitDB.addDatabaseType(FSStore.type, FSStore)

const {
  config,
  startIpfs,
  stopIpfs,
  testAPIs
} = require('orbit-db-test-utils')

const dbPath = './orbitdb/tests/fsstore'
const ipfsPath = './orbitdb/tests/fsstore/ipfs'

Object.keys(testAPIs).forEach(API => {
  describe(`orbit-db - FS Store (${API})`, function () {
    this.timeout(config.timeout)

    let ipfsd, ipfs, orbitdb1, db, dbAddr

    before(async () => {
      config.daemon1.repo = ipfsPath
      rmrf.sync(config.daemon1.repo)
      ipfsd = await startIpfs(API, config.daemon1)
      ipfs = ipfsd.api
      orbitdb1 = await OrbitDB.createInstance(ipfs, { directory: path.join(dbPath, '1') })
      dbAddr = await orbitdb1.determineAddress('orbit-db-tests', FSStore.type)
    })

    after(async () => {
      if (orbitdb1) await orbitdb1.stop()
      if (ipfsd) await stopIpfs(ipfsd)
    })

    it('creates and opens a database', async () => {
      db = await orbitdb1.create('orbit-db-tests', FSStore.type, { replicate: false })
      assert.strict.equal(db.type, FSStore.type)
      assert.strict.equal(db.dbname, 'orbit-db-tests')
      assert.strict.equal(db.address.toString(), dbAddr.toString())
      await db.drop()
    })

    it('static .type returns store type', async () => {
      assert.strict.equal(FSStore.type, 'fsstore')
    })

    describe('FS Store Instance', function () {
      beforeEach(async () => {
        const options = {
          replicate: false,
          maxHistory: 0,
          path: dbPath
        }
        db = await orbitdb1.open(dbAddr, options)
      })

      afterEach(async () => {
        await db.drop()
      })

      it('.joinPath join a path and name', async function () {
        const path = '/r/dir1'
        const name = 'asdf'
        assert.strict.equal(db.joinPath(path, name), `${path}/${name}`)
      })

      it('.exists check whether a path exists', async function () {
        assert.strict.equal(db.exists(''), false)
        assert.strict.equal(db.exists('/r'), true)
      })

      it('.tree tree an existing path', async function () {
        assert.strict.deepEqual(db.tree('/r'), [])
      })

      it('.ls list an existing path', async function () {
        assert.strict.deepEqual(db.ls('/r'), [])
      })

      it('.mkdir make a new directory', async function () {
        await db.mkdir('/r', 'dir1')
        assert.strict.deepEqual(db.ls('/r'), ['/r/dir1'])
      })

      it('.rmdir remove an existing directory', async function () {
        await db.mkdir('/r', 'dir1')
        await db.rmdir('/r/dir1')
        assert.strict.deepEqual(db.ls('/r'), [])
      })

      it('.mvdir move an existing directory', async function () {
        await db.mkdir('/r', 'dir1')
        await db.mvdir('/r/dir1', '/r', 'dir2')
        assert.strict.deepEqual(db.ls('/r'), ['/r/dir2'])
      })

      it('.cpdir copy an existing directory', async function () {
        await db.mkdir('/r', 'dir1')
        await db.cpdir('/r/dir1', '/r', 'dir2')
        assert.strict.deepEqual(db.ls('/r'), ['/r/dir1', '/r/dir2'])
      })

      it('.mk make a new file', async function () {
        await db.mk('/r', 'file1')
        assert.strict.deepEqual(db.ls('/r'), ['/r/file1'])
      })

      it('.write write an existing file', async function () {
        await db.mk('/r', 'file1')
        await db.write('/r/file1', true)
        assert.strict.deepEqual(db.ls('/r'), ['/r/file1'])
      })

      it('.read read an existing file', async function () {
        await db.mk('/r', 'file1')
        await db.write('/r/file1', true)
        assert.strict.deepEqual(db.read('/r/file1'), true)
        assert.strict.deepEqual(db.read('/r/file2'), undefined)
      })

      it('.rm remove an existing file', async function () {
        await db.mk('/r', 'file1')
        await db.rm('/r/file1')
        assert.strict.deepEqual(db.ls('/r'), [])
      })

      it('.mv move an existing file', async function () {
        await db.mk('/r', 'file1')
        await db.mv('/r/file1', '/r', 'file2')
        assert.strict.deepEqual(db.ls('/r'), ['/r/file2'])
      })

      it('.cp copy an existing file', async function () {
        await db.mk('/r', 'file1')
        await db.cp('/r/file1', '/r', 'file2')
        assert.strict.deepEqual(db.ls('/r'), ['/r/file1', '/r/file2'])
      })
    })
  })
})
