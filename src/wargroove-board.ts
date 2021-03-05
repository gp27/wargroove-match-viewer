import { Scene } from 'phaser'
import { Board, Shape, Monopoly } from 'phaser3-rex-plugins/plugins/board-components'
import { MatchData, Entry, terrainAbbrvs, terrainColors, Unit, getPlayerColor } from './match'

export class WargrooveBoard extends Board {

    tiles = []

    constructor(scene: Scene) {

        super(scene, {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal',
                dir: 4,
                cellWidth: 40,
                cellHeight: 40
            }
        })

        scene.add.existing(this)
    }

    setMap(map: MatchData['map']){
        let { size: { x, y }, tiles } = map

        this.setBoardWidth(x)
        this.setBoardHeight(y)

        let tilesMap = []
        while(tiles.length){
            tilesMap.push(tiles.substr(0, x).split(''))
            tiles = tiles.substr(x)
        }

        this.tiles = tilesMap

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

    loadEntry(entry: Entry){
        this.removeAllChess(true)

        this.createTiles(this.tiles)

        let { state: { units } } = entry

        for(let i in units){
            let unit = units[i]
            if(!unit) continue

            let chess = new ChessUnit(this, unit)
            this.addChess(chess)
        }
        return this
    }
}

export class ChessUnit extends Shape {
    monopoly: Monopoly

    constructor(board: Board, unit: Unit){
        let { pos: { x, y } } = unit

        let outOfBoard = (x < 0 || y < 0)

        let color = getPlayerColor(unit.playerId)
        if(unit.hadTurn){
            color = Phaser.Display.Color.IntegerToColor(color).darken(50).color
        }

        super(board, x, y, 1, color, 1, !outOfBoard)
        board.scene.add.existing(this)

        this.setScale(0.65)

        if(outOfBoard) return

        //this.monopoly = new Monopoly(this, { face: 0, pathTileZ: 0, })
        //board.scene.add.existing(this.monopoly)
    }
}