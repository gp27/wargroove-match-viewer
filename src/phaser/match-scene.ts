import Phaser from'phaser'
import { Entry, Match } from '../match'
import { WargrooveBoard } from './wargroove-board'
import { applyPalette, generatePalette } from '../palettes'
import 'chart.js'


const paletteNames = ['red', 'blue', 'green', 'yellow', 'purple', 'teal', 'pink', 'orange', 'black', 'grey']

export class MatchScene extends Phaser.Scene {
  match: Match

  ui: Record<string,any> = {}
  loaded = false

  constructor() {
    super({key: 'MatchScene'})
  }

  preload(){
    this.load.image('palette', 'assets/wargroove_palette_small.png')
    this.load.image('units', 'assets/units.png')
    this.load.json('units', 'assets/units.json')
  }

  create(){

    generatePalette('wg-palette', this.game.textures.get('palette').getSourceImage() as HTMLImageElement, paletteNames)
    applyPalette(this.game.textures.get('units').getSourceImage() as HTMLCanvasElement, 'wg-palette', 'grey', 'grey')

    this.loaded = true
    this.makeUi()

    this.input.on('wheel', (pointer, objs, dX, dY, dZ) => {
      let camera = this.cameras.main

      let { centerX, centerY, zoom } = camera

      if(dY > 0) {
        camera.zoom /= 1.1
        if(camera.zoom < 0.2){
          camera.zoom = 0.2
        }
      }

      if(dY < 0) {
        camera.zoom *= 1.1
        if (camera.zoom > 2){
          camera.zoom = 2
        }
      }

      let newZoom = camera.zoom / zoom

      /*let dx = (pointer.worldX - centerX) / newZoom
      let dy = (pointer.worldY - centerY) / newZoom
      camera.x += dx
      camera.y += dy*/

    })
  }

  makeAtlas(colorName: string){
    let key = `units-${colorName}`
    let canvas = applyPalette(this.game.textures.get('units').getSourceImage() as HTMLCanvasElement, 'wg-palette', 'grey', colorName)
    let json = this.cache.json.get('units')
    return  this.textures.addAtlas(key, canvas, json)
  }

  getAtlasByColor(colorName: string){
    let key = `units-${colorName}`
    let texture = this.textures.get(key)
    if (texture.key == '__MISSING'){
      texture = this.makeAtlas(colorName)
    }
    
    return texture
  }

  getFrames(colorName: string, frameNames: string[]){
    let texture = this.getAtlasByColor(colorName)
    if(!texture) return
    let frames = texture.getFramesFromTextureSource(0, false)
    return frames.filter(f => frameNames.includes(f.name))
  }

  getFrameCanvas(colorName: string, frameNames: string[]){
    let frames = this.getFrames(colorName, frameNames)
    if(!frames.length) return
    let { cutHeight: height, cutWidth: width, cutX: x, cutY: y, texture } = frames[0]

    let c = document.createElement('canvas')
    c.width = width
    c.height = height
    c.getContext('2d').drawImage(texture.getSourceImage() as HTMLImageElement, x, y, width, height, 0, 0, width, height)
    return c
  }

  makeUi(){
    let board = this.ui.board = new WargrooveBoard(this)
    if(this.match){
      board.setMap(this.match.getMap())
      this.reloadMatchEntry()
    }
  }

  loadMatch(match: Match){
    this.match = match
    let { board } = this.ui
    
    if(this.loaded){
      board.setMap(match.getMap())
      this.reloadMatchEntry()
    }
  }

  getMatch(){
    return this.match
  }

  currentEntry: Entry = null

  reloadMatchEntry(){
    if(!this.match || !this.loaded) return
    let entry = this.match.getCurrentEntry()
    if(entry != this.currentEntry){
      this.currentEntry = entry
      this.ui.board.loadEntry(entry)
    }
  }

  dragPosition: Phaser.Math.Vector2

  update(){
    this.reloadMatchEntry()

    if (this.game.input.activePointer.isDown) {
      let camera = this.cameras.main
      let { x, y } = this.game.input.mousePointer
      if(this.dragPosition){
        camera.scrollX -= (x - this.dragPosition.x) / camera.zoom
        camera.scrollY -= (y - this.dragPosition.y) / camera.zoom
      }
      this.dragPosition = this.game.input.mousePointer.position.clone()
    }
    else {
      this.dragPosition = null
    }

    
  }
}