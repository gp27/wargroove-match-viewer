import Phaser from 'phaser'
import { Entry, Match } from '../wg/match'
import { PhaserWargrooveBoard } from './phaser-wargroove-board'
import { applyPalette, generatePalette } from '../palettes'
import { Pinch } from 'phaser3-rex-plugins/plugins/gestures.js'
import 'chart.js'

const paletteNames = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'teal',
  'pink',
  'orange',
  'black',
  'grey',
]

export class PhaserWargrooveScene extends Phaser.Scene {
  match: Match

  ui: Record<string, any> = {}
  loaded = false

  constructor() {
    super({ key: 'MatchScene' })
  }

  preload() {
    this.load.image('palette', '/assets/wargroove_palette_small.png')
    this.load.image('units', '/assets/units.png')
    this.load.image('wg_tilsets', '/assets/tilesets_clean.png')
    this.load.json('units', '/assets/units.json')
    this.load.json('terrains', '/assets/terrains.json')
    this.load.atlas('trees', '/assets/trees.png', '/assets/trees.json')
    this.load.tilemapTiledJSON('map', '/assets/map.json')
  }

  create() {
    generatePalette(
      'wg-palette',
      this.game.textures.get('palette').getSourceImage() as HTMLImageElement,
      paletteNames
    )
    const unitsCanvas = this.game.textures
      .get('units')
      .getSourceImage() as HTMLCanvasElement
    applyPalette(unitsCanvas, 'wg-palette', 'grey', 'grey')

    this.loaded = true
    this.makeUi()

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.match.selectNextEntry()
    })

    this.input.keyboard.on('keydown-LEFT', () => {
      this.match.selectPreviousEntry()
    })

    this.input.on('wheel', (pointer, objs, dX, dY, dZ) => {
      if (dY > 0) {
        this.zoom(1 / 1.1)
      }
      if (dY < 0) {
        this.zoom(1.1)
      }
    })

    const pinch = new Pinch(this, { enable: true })

    pinch.on(
      'pinch',
      function ({ scaleFactor }) {
        this.zoom(scaleFactor)
      },
      this
    )

    pinch.on(
      'drag1',
      function ({ drag1Vector: { x, y } }) {
        let camera = this.cameras.main
        camera.scrollX -= x / camera.zoom
        camera.scrollY -= y / camera.zoom
      },
      this
    )
  }

  zoom(scale: number) {
    const camera = this.cameras.main
    let oldZoom = camera.zoom
    camera.zoom *= scale

    let bounds = camera.getBounds()

    if (
      scale < 1 &&
      camera.worldView.width > bounds.width &&
      camera.worldView.width > bounds.width
    ) {
      camera.zoom = oldZoom
    }

    if (camera.zoom > 2) {
      camera.zoom = 2
    }
  }

  makeAtlas(colorName: string) {
    let key = `units-${colorName}`
    let canvas = applyPalette(
      this.game.textures.get('units').getSourceImage() as HTMLCanvasElement,
      'wg-palette',
      'grey',
      colorName
    )
    let json = this.cache.json.get('units')
    return this.textures.addAtlas(key, canvas, json)
  }

  getAtlasByColor(colorName: string) {
    let key = `units-${colorName}`
    let texture = this.textures.get(key)
    if (texture.key == '__MISSING') {
      texture = this.makeAtlas(colorName)
    }

    return texture
  }

  getFrames(colorName: string, frameNames: string[]) {
    let texture = this.getAtlasByColor(colorName)
    if (!texture) return
    let frames = texture.getFramesFromTextureSource(0, false)
    return frames
      .filter((f) => frameNames.includes(f.name))
      .sort((a, b) => frameNames.indexOf(a.name) - frameNames.indexOf(b.name))
  }

  getFrameCanvas(colorName: string, frameNames: string[], scale = 2) {
    let frames = this.getFrames(colorName, frameNames)
    if (!frames?.length) return
    let {
      cutHeight: height,
      cutWidth: width,
      cutX: x,
      cutY: y,
      texture,
    } = frames[0]

    let c = document.createElement('canvas')
    c.width = width * scale
    c.height = height * scale

    let ctx = c.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.scale(scale, scale)
    ctx.drawImage(
      texture.getSourceImage() as HTMLImageElement,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    )
    return c
  }

  makeUi() {
    this.ui.board = new PhaserWargrooveBoard(this)
    /*if (this.match) {
      board.setMap(this.match.getMap())
      this.reloadMatchEntry()
    }*/
  }

  loadMatch(match: Match) {
    if (this.match == match) return
    this.match = match

    let cb = () => {
      let { board } = this.ui
      board.setMap(match.getMap())
      this.reloadMatchEntry()
    }

    if (this.loaded) cb()
    else this.events.once('create', cb)
  }

  getMatch() {
    return this.match
  }

  currentEntry: Entry | undefined

  reloadMatchEntry() {
    if (!this.match || !this.loaded) return
    let entry = this.match.getCurrentEntry()
    if (entry != this.currentEntry) {
      let oldEntry = this.currentEntry
      this.currentEntry = entry
      this.ui.board.loadEntry(entry, oldEntry)
      ;(this.game as any).updateUI?.()
    }
  }

  update() {
    this.reloadMatchEntry()
  }
}
