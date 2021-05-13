import { Board, Shape, Monopoly, PathFinder } from 'phaser3-rex-plugins/plugins/board-components'
import  { Label, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { MatchData, Entry, Unit, Match } from '../match'
import { getUnitFrameNames, terrainColors } from '../match-utils'
import { movementMappings, MovementType, Terrain, TerrainMeta, WargrooveMap } from '../tile'
import { PhaserWargrooveScene } from './phaser-wagroove-scene'

const cellSize = 48

export class PhaserWargrooveBoard extends Board {

    scene: PhaserWargrooveScene

    w: number = 0
    h: number = 0

    map: WargrooveMap
    chessUnits: Phaser.GameObjects.Group
    elements: Phaser.GameObjects.Group
    gridOverlay: Phaser.GameObjects.Grid
    terrainsMeta: { [key in Terrain]?: TerrainMeta } = this.scene.cache.json.get('terrains').reduce((metas, meta: TerrainMeta) => {
        metas[meta.id] = meta
        return metas
    },{})

    constructor(scene: PhaserWargrooveScene) {

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

        this.setInteractive()
        this.on('tiledown', (pointer, { x, y }) => {
            let area = this.getUnitMoveArea(x, y)
            this.setMoveArea(area)
        })
    }

    setMap(map: Match['map']){
        //this.scene.children.removeAll()

        let {  w: x, h: y, tiles, biome } = map

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
        this.map = new WargrooveMap(tilemap, tileset, biome, this)
        this.map.setTiles(tiles)
        console.log(this.map)
        //this.addElement('villager_cherrystone', 10, 10, 0.5, 0.3)

        return this
    }

    unitsCache: Record<number,WargrooveUnit> = {}
    touchedUnits: Record<number,boolean> = {}
    moveArea: Phaser.GameObjects.GameObject[] = []

    loadEntry(entry: Entry){
        //this.removeAllChess(true)
        this.setMoveArea([])

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

    private getUnit(id: number){
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

    private addShadow(x: number, y: number, width: number, height: number, originX?: number, originY?: number) {
        let shadow = new Phaser.GameObjects.Ellipse(this.scene, 0, 0, width, 5, 0x000000, 0.4)
        shadow.setOrigin(originX, originY - 0.8)
        shadow.setScale(2)
        this.addChess(shadow, x, y)
        this.scene.add.existing(shadow)
    }

    getTerrainAt(x: number, y: number): Terrain{
        return this.map?.tiles?.[y][x]
    }

    getUnitAt(x: number, y: number): WargrooveUnit {
        return this.tileXYZToChess(x, y, getDepth('unit'))
    }

    setMoveArea(area: { x: number, y: number, color?: number, alpha?: number }[]){
        this.moveArea.forEach(o => o.destroy())
        this.moveArea = area.map(({ x, y, color = 0x000000, alpha = 0.3}) => {
            let shape = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, cellSize, cellSize)
            shape.setFillStyle(color, alpha)
            shape.setStrokeStyle(2, 0x000000, 1)
            this.scene.add.existing(shape)
            this.addChess(shape, x, y)
            shape.setDepth(getDepth('unit'))
            return shape
        })
    }

    private getUnitMoveArea(x: number, y: number){
        let unit = this.getUnitAt(x, y)
        if(!unit) return []
        let { playerId, unitClassId, unitClass: { moveRange } } = unit.getUnit()

        const pathFinder = new PathFinder(unit, {
            pathMode: 'A*',
            costCallback: ({ x, y }, preTileXY, pathFinder) => {
                let terrain: Terrain = this.getTerrainAt(x, y)
                let { unitClassId, playerId: otherPlayerId = -3, unitClass: { canBeCaptured = false } = {} } = this.getUnitAt(x, y)?.getUnit() || {}
                let movement: MovementType = movementMappings[unitClassId] || 'walking'

                if (otherPlayerId > -3 && ((otherPlayerId != -1 && otherPlayerId != playerId) || (otherPlayerId == -1 && !canBeCaptured))) {
                    return pathFinder.BLOCKER
                }

                let cost = this.terrainsMeta[terrain]?.movementCost?.[movement] ?? pathFinder.BLOCKER
                return cost
            }
        })

        return [{ x,y, color: 0xffffff }].concat(pathFinder.findArea(moveRange).map(({ x, y }) => ({ x, y, color: 0x000000 })))
    }
}

export class WargrooveSprite extends Phaser.GameObjects.Sprite {
    protected currentFrame: Phaser.Textures.Frame | null = null

    constructor(readonly scene: PhaserWargrooveScene) {
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
    constructor(protected board: PhaserWargrooveBoard) {
        super(board.scene)
        this.setDepth(getDepth('unit', 0))
        this.setScale(2)
        board.scene.add.existing(this)

    }

    setBoardPosition(x: number, y: number, z?: number) {
        const depth = getDepth('unit', (y - this.originY) * cellSize)
        this.board.addChess(this, x, y, z)
        this.setDepth(depth)
    }
}

let moveArea: Phaser.GameObjects.GameObject[] = []

export class WargrooveUnit extends WargrooveBoardElement {
    public readonly id: number
    info: any

    constructor(board: PhaserWargrooveBoard, unit: Unit){
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
        if (unitClassId == 'gate' && [this.board.getTerrainAt(x, y - 1), this.board.getTerrainAt(x, y + 1)].every(t => t == 'wall')){
            frameNames = ['gate_2']
        }

        let frames = this.scene.getFrames(color, frameNames)

        if (!frames.length) return
        let frame = frames[0]

        this.setCurrentFrame(frame)
        
        this.setFlipX(facing == 3)

        let outOfBoard = (x < 0 || y < 0)
        this.visible = !outOfBoard

        if (this.currentFrame) {
            this.displayOriginY = this.currentFrame.height - 8 - (isStructure ? 6 : 0)
        }

        this.info.setText(health).layout()
        this.board.addChess(this.info, x, y)
        this.info.visible = health == 100 ? false : true

        this.setBoardPosition(x, y, getDepth('unit'))
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