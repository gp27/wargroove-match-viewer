import { Board, Shape, Monopoly } from 'phaser3-rex-plugins/plugins/board-components'
import  { Label, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { MatchData, Entry, Unit, Match } from '../match'
import { getUnitFrameNames, terrainColors } from '../match-utils'
import { WargrooveMap } from '../tile'
import { MatchScene } from './match-scene'

const cellSize = 48

export class WargrooveBoard extends Board {

    scene: MatchScene

    w: number = 0
    h: number = 0

    map: WargrooveMap
    chessUnits: Phaser.GameObjects.Group
    elements: Phaser.GameObjects.Group
    gridOverlay: Phaser.GameObjects.Grid

    constructor(scene: MatchScene) {

        super(scene, {
            grid: {
                x: 24,
                y: 24, 
                gridType: 'quadGrid',
                type: 'orthogonal',
                dir: 4,
                cellWidth: cellSize,
                cellHeight: cellSize
            }
        })

        scene.add.existing(this)
        this.chessUnits = this.scene.add.group()
        this.elements = this.scene.add.group()
        this.gridOverlay = new Phaser.GameObjects.Grid(scene, 0, 0, 0, 0, cellSize, cellSize)
        this.gridOverlay.setDepth(getDepth('ui'))
        this.gridOverlay.setOutlineStyle(0x000000, 0.1)
        this.scene.add.existing(this.gridOverlay)
        console.log(this.gridOverlay)
    }

    setMap(map: Match['map']){
        //this.scene.children.removeAll()

        let {  w: x, h: y, tiles } = map

        this.setBoardWidth(x)
        this.setBoardHeight(y)

        let camera = this.scene.cameras.main

        let w = cellSize * x, h = cellSize * y

        camera.centerOn(w/2, h/2)
        camera.zoom = 0.8
        

        this.w = this.gridOverlay.width = w
        this.h = this.gridOverlay.height = h

        const tilemap = this.scene.make.tilemap({ key: 'map' })
        const tileset = tilemap.addTilesetImage('wg_tilsets')
        this.map = new WargrooveMap(tilemap, tileset, this)
        this.map.setTiles(tiles)
        console.log(this.map)
        //this.addElement('villager_cherrystone', 10, 10, 0.5, 0.3)

        return this
    }

    /*createTiles(tiles: Match['map']['tiles']){
        this.tiles.clear(true)

        for(let terrain of tiles) {
            let { terrain, x, y } = tile
            let color = terrainColors[terrain] || 0x000000

            let tileSprite = new RoundRectangle(this.scene, 0, 0, 48, 48, 0, color)
            //let shape = new Shape(this, x, y, 0, color)
            this.tiles.add(tileSprite)
            this.addChess(tileSprite, x, y, getDepth('tile'))

            this.scene.add.existing(tileSprite).setStrokeStyle(2, 0xffffff, 0.3).setData('terrain', terrain)
        }
        return this
    }*/

    unitsCache: Record<number,WargrooveUnit> = {}
    touchedUnits: Record<number,boolean> = {}

    loadEntry(entry: Entry){
        //this.removeAllChess(true)
        for(let id in this.touchedUnits){
            this.touchedUnits[id] = false
        }

        let { state: { units: u } } = entry

        let units = Object.values(u)

        for(let unit of units){
            let chess = this.unitsCache[unit.id] = this.unitsCache[unit.id] || new WargrooveUnit(this, unit)
            chess.update()
            this.touchedUnits[unit.id] = true
            this.chessUnits.add(chess)
        }

        for (let id in this.touchedUnits) {
            if(!this.touchedUnits[id]){
                let unit = this.unitsCache[id]
                this.scene.children.remove(unit)
                unit.destroy()
                delete this.touchedUnits[id]
                delete this.unitsCache[id]
            }
        }

        //this.chessUnits.children.entries.sort()

        /*this.scene.children.sort('depth', (e1, e2) => {
            return (e2.depth < e1.depth) || (e2.y < e1.y)
        })*/

        //console.log(this.scene.children)

        return this
    }

    getUnit(id: number){
        return this.unitsCache[id]
    }

    addElement(frame: string | Phaser.Textures.Frame , x: number, y: number, originX?: number, originY?: number, withShadow = false) {
        if(typeof frame == 'string'){
            frame = this.scene.getFrames('grey', [frame])[0]
        }
        if(!frame) return

        const ele = new WargrooveBoardElement(this)
        ele.setCurrentFrame(frame)
        ele.setOrigin(originX, originY)
        ele.setBoardPosition(x, y)
        ele.setScale(2)
        this.elements.add(ele)

        if(withShadow){
            this.addShadow(x, y, ele.width, ele.height, originX, originY)
        }

        return ele
    }

    addShadow(x: number, y: number, width: number, height: number, originX?: number, originY?: number) {
        let shadow = new Phaser.GameObjects.Ellipse(this.scene, 0, 0, width, 5, 0x000000, 0.4)
        shadow.setOrigin(originX, originY - 0.8)
        shadow.setScale(2)
        this.addChess(shadow, x, y, getDepth('unit'))
        this.scene.add.existing(shadow)
    }
}

export class WargrooveSprite extends Phaser.GameObjects.Sprite {
    protected currentFrame: Phaser.Textures.Frame | null = null

    constructor(readonly scene: MatchScene) {
        super(scene, 0, 0, '')
    }

    getSpriteImage() {
        let { x, y, width, height } = this.currentFrame.canvasData as Record<string, number>
        let source = this.currentFrame.texture.getSourceImage() as HTMLCanvasElement
        let dest = document.createElement('canvas')
        dest.width = width
        dest.height = height
        dest.getContext('2d').drawImage(source, x, y, width, height, 0, 0, width, height)
        let img = new Image()
        img.src = dest.toDataURL()
        return img
    }

    setCurrentFrame(frame: Phaser.Textures.Frame | null){
        this.currentFrame = frame
        if (this.frame != frame) {
            this.setTexture(frame.texture.key, frame.name)
        }
    }
}

export class WargrooveBoardElement extends WargrooveSprite {
    constructor(protected board: WargrooveBoard) {
        super(board.scene)
        this.setDepth(getDepth('unit', 0))
        board.scene.add.existing(this)

    }

    setBoardPosition(x: number, y: number) {
        const depth = getDepth('unit', (y - this.originY) * cellSize)
        this.board.addChess(this, x, y, depth)
        this.setDepth(depth)
    }
}

export class WargrooveUnit extends WargrooveBoardElement {
    public readonly id: number
    info: any

    constructor(board: WargrooveBoard, unit: Unit){
        super(board)
        this.id = unit.id
        this.info = makeLabel(board.scene)
        this.info.setOrigin(-0.2, -0.2)
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

        let { pos: { x, y, facing }, unitClassId, unitClass: { isStructure }, hadTurn, health } = unit
        let { color = 'grey', faction = 'cherrystone' } = this.getPlayer() || {}

        if (hadTurn) {
            this.tint = 0x999999
        }
        else {
            this.tint = 0xffffff
        }

        let frameNames = getUnitFrameNames(unitClassId, faction)

        let frames = this.scene.getFrames(color, frameNames)

        if (!frames.length) return
        let frame = frames[0]

        this.setCurrentFrame(frame)
        
        this.setFlipX(facing == 3)

        let outOfBoard = (x < 0 || y < 0)
        this.visible = !outOfBoard

        if (this.currentFrame) {
            this.displayOriginY = this.currentFrame.height - 16 - (isStructure ? 12 : 0)
        }

        this.info.setText(health).layout()
        this.board.addChess(this.info, x, y, getDepth('ui'))
        this.info.visible = health == 100 ? false : true

        this.setBoardPosition(x, y)
    }

    getSprite(){
        return this.getSpriteImage()
    }

    update(){
        this.setUnit()
    }

    destroy() {
        this.info?.destroy()
        super.destroy()
    }
}

function getDepth(type: string, y: number = 0){
    let depth = {
        'tile': 0,
        'unit': 100,
        'overlay': 200 * cellSize,
        'ui': 300 * cellSize
    }[type] || 0

    return (depth + y)
}

export function makeLabel(scene: Phaser.Scene) {
    let background = new RoundRectangle(scene, 0, 0, 0, 0, 5, 0x888888)
    background.setFillStyle(0x333333, 0.9)

    let text = new Phaser.GameObjects.Text(scene, 0, 0, "", {
        fontSize: '12px',
        strokeThickness: 1.1,
        resolution: 4,
    })

    const label = new Label(scene, {
        width: 18,
        height: 18,
        background,
        text,
        align: 'center',
        space: {
            text: 0,
            bottom: 0,
            right: 0
        }
    })

    let uiDepth = getDepth('ui')

    label.setDepth(uiDepth)
    background.setDepth(uiDepth)
    text.setDepth(uiDepth)

    scene.add.existing(label)
    scene.add.existing(background)
    scene.add.existing(text)

    label.layout()

    return label
}