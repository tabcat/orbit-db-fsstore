
'use strict'

// require('make-promises-safe')
const FS = require('../src/FS')

// Metrics
let layers = 0
let seconds = 0
let layersPerSecond = 0
let lastTenSeconds = 0

let fs
let cwd = '/r'

const layerLoop = () => {
  const mkLayer = () => {
    FS.mkdir(fs, cwd, `l${layers}`)
    cwd = FS.combinedPath(cwd, `l${layers}`)
    FS.mk(fs, cwd, 'file1')
    FS.mk(fs, cwd, 'file2')
    FS.mk(fs, cwd, 'file3')
    FS.mk(fs, cwd, 'file4')
    FS.mk(fs, cwd, 'file5')
    FS.mk(fs, cwd, 'file6')
    FS.mk(fs, cwd, 'file7')
    FS.mk(fs, cwd, 'file8')
    FS.mk(fs, cwd, 'file9')
  }

  const mvLayers = () => {
    FS.mvdir(fs, '/r/l1', '/r', 'mv')
    FS.mvdir(fs, '/r/mv', '/r', 'l1')
  }

  mkLayer()
  mvLayers()
  layers++
  layersPerSecond++
  lastTenSeconds++
  setImmediate(() => layerLoop())
}

async function main () {
  setInterval(() => {
    seconds++
    if (seconds % 10 === 0) {
      console.log(`--> Average of ${lastTenSeconds / 10} layers per second in last ten seconds`)
      lastTenSeconds = 0
    }
    console.log(`${layersPerSecond} layers per second, ${layers} layers in ${seconds} seconds. ${fs.size} items in fs`)
    layersPerSecond = 0
  }, 1000)

  fs = FS.create()
  layerLoop()
}

main()
