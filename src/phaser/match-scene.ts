import Phaser from'phaser'
import { Match } from '../match'
import { WargrooveBoard } from './wargroove-board'
import { PalettePlugin } from './palettes'
import 'chart.js'
import React from 'react'


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
    this.plugins.install('palettePlugin', PalettePlugin, true, 'palettePlugin') as PalettePlugin
    this.load.image('units', 'assets/units.png')
    this.load.json('units', 'assets/units.json')

    //this.load.atlas('units-grey', 'assets/units.png', 'assets/units.json')
  }

  create(){
    let palettePlugin = this.plugins.get('palettePlugin') as PalettePlugin
    palettePlugin.generatePalette('palette', paletteNames)
    palettePlugin.applyPalette('units', 'palette', 'grey', 'grey')

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
    let palettePlugin = this.plugins.get('palettePlugin') as PalettePlugin
    let image = palettePlugin.applyPalette('units', 'palette', 'grey', colorName)

    let json = this.cache.json.get('units')
    return this.textures.addAtlas(key, image , json)
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
    let frames = texture.getFramesFromTextureSource(0)
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

  reloadMatchEntry(){
    if(!this.match || !this.loaded) return
    this.ui.board.loadEntry(this.match.getCurrentEntry())
  }

  dragPosition: Phaser.Math.Vector2

  update(){
    this.reloadMatchEntry()

    if (this.game.input.activePointer.isDown) {
      let camera = this.cameras.main
      let { x, y } = this.game.input.mousePointer
      if(this.dragPosition){
        camera.x += x - this.dragPosition.x
        camera.y += y - this.dragPosition.y
      }
      this.dragPosition = this.game.input.mousePointer.position.clone()
    }
    else {
      this.dragPosition = null
    }

    
  }
}