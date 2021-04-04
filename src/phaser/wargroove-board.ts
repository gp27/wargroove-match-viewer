import { Board, Shape, Monopoly } from 'phaser3-rex-plugins/plugins/board-components'
import  { Label, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { MatchData, Entry, Unit, Match } from '../match'
import { getUnitFrameNames, terrainAbbrvs, terrainColors } from '../match-utils'
import { MatchScene } from './match-scene'

export class WargrooveBoard extends Board {

    //tiles = []
    scene: MatchScene

    w: number = 0
    h: number = 0

    tiles: Phaser.GameObjects.Group
    chessUnits: Phaser.GameObjects.Group

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
        this.tiles = this.scene.add.group()
        this.chessUnits = this.scene.add.group()
    }

    setMap(map: Match['map']){
        this.scene.children.removeAll()

        let { size: { x, y }, tiles } = map

        this.setBoardWidth(x)
        this.setBoardHeight(y)

        let camera = this.scene.cameras.main

        let w = 48*x, h = 48*y

        this.createTiles(tiles)
        camera.centerOn(w/2, h/2)
        camera.zoom = 0.8
        

        this.w = w
        this.h = h

        return this
    }

    createTiles(tiles: Match['map']['tiles']){
        this.tiles.clear(true)

        for(let tile of tiles) {
            let { terrain, x, y } = tile
            let color = terrainColors[terrain] || 0x000000

            let tileSprite = new RoundRectangle(this.scene, 0, 0, 48, 48, 0, color)
            //let shape = new Shape(this, x, y, 0, color)
            this.tiles.add(tileSprite)
            this.addChess(tileSprite, x, y, getDepth('tile'))

            this.scene.add.existing(tileSprite).setStrokeStyle(2, 0xffffff, 0.3).setData('terrain', terrain)
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
}

export class WargrooveSprite extends Phaser.GameObjects.Sprite {
    public readonly id: number
    scene: MatchScene

    currentFrame: Phaser.Textures.Frame | null = null

    constructor(scene: MatchScene, unit: Unit){
        super(scene, 0, 0, '')
        this.id = unit.id
        this.scene = scene
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

        if(frame != this.currentFrame){
            this.currentFrame = frame
            //console.log(frame, this.getSprite())
            this.setTexture(frame.texture.key, frame.name)
        }
        
        this.setFlipX(facing == 3)

        let outOfBoard = (x < 0 || y < 0)
        this.visible = !outOfBoard
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
    info: any

    constructor(board: WargrooveBoard, unit: Unit){
        super(board.scene, unit)
        this.board = board
        this.setDepth(getDepth('unit', 0))

        let background = new RoundRectangle(board.scene, 0, 0, 0, 0, 5, 0x888888)

        let text = new Phaser.GameObjects.Text(board.scene, 0, 0, "", {
            fontSize: '12px',
            strokeThickness: 1.1,
            resolution: 4,
        })


        this.info = new Label(board.scene, {
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

        background.setFillStyle(0x333333, 0.9)

        this.info.setOrigin(-0.2, -0.2)

        let uiDepth = getDepth('ui')
        
        this.info.setDepth(uiDepth);
        background.setDepth(uiDepth)
        text.setDepth(uiDepth)

        board.scene.add.existing(this)
        board.scene.add.existing(this.info)
        this.scene.add.existing(background)
        this.scene.add.existing(text)

        this.info.layout()

        //this.monopoly = new Monopoly(this, { face: 0, pathTileZ: 0, })
        //board.scene.add.existing(this.monopoly)
    }

    setUnit(){
        super.setUnit()
        let unit = this.getUnit()
        let { pos: { x, y }, unitClass: { isStructure }, health } = unit

        if(this.currentFrame){
            this.displayOriginY = this.currentFrame.height - 16 - (isStructure ? 12 : 0)
        }
        let depth = getDepth('unit', y)
        this.board.addChess(this, x, y, depth)
        this.setDepth(depth)

        this.info.setText(health).layout()
        this.info.visible = health == 100 ? false : true
        this.board.addChess(this.info, x, y, getDepth('ui'))
    }

    update(){
        this.setUnit()
    }

    destroy(){
        this.info?.destroy()
        super.destroy()
    }

}

function getDepth(type: string, y: number = 0){
    let depth = {
        'tile': 0,
        'unit': 100,
        'ui': 200
    }[type] || 0

    return (depth + y)
}