import { Scene } from 'phaser'
import { Board, Shape, Monopoly } from 'phaser3-rex-plugins/plugins/board-components'
import { MatchData, Entry, Unit, Match } from '../match'
import { terrainAbbrvs, terrainColors } from '../match-utils'
import { MatchScene } from './match-scene'

export class WargrooveBoard extends Board {

    tiles = []
    scene: MatchScene

    w: number = 0
    h: number = 0

    constructor(scene: MatchScene) {

        super(scene, {
            grid: {
                x: 24,
                y: 24, 
                gridType: 'quadGrid',
                type: 'orthogonal',
                dir: 4,
                cellWidth: 48,
                cellHeight: 48
            }
        })

        scene.add.existing(this)
    }

    setMap(map: MatchData['map']){
        this.scene.children.removeAll()

        let { size: { x, y }, tiles } = map

        this.setBoardWidth(x)
        this.setBoardHeight(y)

        let tilesMap = []
        while(tiles.length){
            tilesMap.push(tiles.substr(0, x).split(''))
            tiles = tiles.substr(x)
        }

        this.tiles = tilesMap

        let camera = this.scene.cameras.main

        let w = 48*x, h = 48*y

        camera.setViewport(-2*w, -2*h, w*4, h*4)
        //camera.setBounds(0, 0, 48 * x, 48 * y)
        this.createTiles(this.tiles)
        camera.centerOn(0, 0)
        

        this.w = w
        this.h = h

        return this
    }

    createTiles(tiles){
        for(let y = 0; y < tiles.length; y++){
            let line = tiles[y]
            for (let x = 0; x < line.length; x++) {
                let tile = line[x]
                let terrain = terrainAbbrvs[tile]
                let color = terrainColors[terrain] || 0x000000

                this.scene.add.existing(new Shape(this, x, y, 0, color)).setStrokeStyle(1, 0xffffff, 1).setData('terrain', terrain)
            }
        }
        return this
    }

    unitsCache: Record<number,WargrooveChessUnit> = {}
    touchedUnits: Record<number,boolean> = {}

    loadEntry(entry: Entry){
        //this.removeAllChess(true)
        for(let id in this.touchedUnits){
            this.touchedUnits[id] = false
        }

        let { state: { units: u } } = entry

        let units = Object.values(u)

        for(let unit of units){
            let chess = this.unitsCache[unit.id] = this.unitsCache[unit.id] || new WargrooveChessUnit(this, unit)
            chess.update()
            this.touchedUnits[unit.id] = true
        }

        for (let id in this.touchedUnits) {
            if(!this.touchedUnits[id]){
                let unit = this.unitsCache[id]
                unit.removedFromScene()
                unit.destroy()
                delete this.touchedUnits[id]
                delete this.unitsCache[id]
            }
        }

        this.scene.children.sort('id', (e1, e2) => {
            return (e2.z < e1.z) || (e2.y < e1.y)
        })

        return this
    }

    getUnit(id: number){
        return this.unitsCache[id]
    }
}

export class WargrooveSprite extends Phaser.GameObjects.Sprite {
    public readonly id: number
    scene: MatchScene

    currentFrame: Phaser.Textures.Frame | null = null

    constructor(scene: MatchScene, unit: Unit){
        super(scene, 0, 0, '')
        this.id = unit.id
        this.scene = scene
        this.setZ(1)
    }

    getUnit(){
        return Object.values(this.scene.getMatch().getCurrentEntry().state.units).find(u => u.id == this.id)
    }

    getPlayer(){
        let unit = this.getUnit()
        return this.scene.getMatch().getPlayers()[unit.playerId]
    }

    setUnit(){
        let unit = this.getUnit()

        let { pos: { x, y, facing },  unitClassId, hadTurn } = unit
        let { color = 'grey', faction = 'cherrystone' } = this.getPlayer() || {}

        let frames = this.scene.getFrames(color, [unitClassId + '_' + faction, unitClassId])

        if (!frames.length) return
        let frame = frames[0]

        if(frame != this.currentFrame){
            this.currentFrame = frame
            //console.log(frame, this.getSprite())
        }
        

        this.setTexture(frame.texture.key, frame.name)
        this.setFlipX(facing == 3)

        if (hadTurn) {
            this.tint = 0x999999
        }
        else {
            this.tint = 0xffffff
        }

        let outOfBoard = (x < 0 || y < 0)
    }

    getSprite(){
        let { x, y, width, height} = this.currentFrame.canvasData as Record<string,number>
        let source = this.currentFrame.texture.getSourceImage() as HTMLCanvasElement
        let dest = document.createElement('canvas')
        dest.width = width
        dest.height = height
        dest.getContext('2d').drawImage(source, x, y, width, height, 0, 0, width, height)
        let img = new Image()
        img.src = dest.toDataURL()
        return img
    }
}

export class WargrooveChessUnit extends WargrooveSprite {
    monopoly: Monopoly
    board: WargrooveBoard

    constructor(board: WargrooveBoard, unit: Unit){
        super(board.scene, unit)
        this.board = board

        board.scene.add.existing(this)

        //this.monopoly = new Monopoly(this, { face: 0, pathTileZ: 0, })
        //board.scene.add.existing(this.monopoly)
    }

    setUnit(){
        super.setUnit()
        let unit = this.getUnit()
        let { pos: { x, y }, unitClass: { isStructure } } = unit

        this.displayOriginY = this.currentFrame.height - 16 - (isStructure ? 12 : 0)
        this.board.addChess(this, x, y, 1, true)

        let outOfBoard = (x < 0 || y < 0)
    }

    update(){
        this.setUnit()
    }


}