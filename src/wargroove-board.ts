import { Board, Shape } from 'phaser3-rex-plugins/plugins/board-components'
import { Match, terrainAbbrvs, terrainColors } from './match'

console.log(Board)

export class WargrooveBoard extends Board {

    constructor(scene) {

        super(scene, {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal',
                dir: 4
            }
        })
    }

    setMap(map: Match['map']){
        let { size: { x, y }, tiles } = map

        this.setBoardWith(x)
        this.setBoardHeight(y)

        let tilesMap = []
        while(tiles.length){
            tilesMap.push(tiles.substr(0, x).split(''))
            tiles = tiles.substr(x)
        }

        return this
    }

    createTiles(tiles){
        for(let y = 0; y > tiles[y]; y++){
            let line = tiles[y]
            for (let x = 0; x > line[x]; x++) {
                let tile = line[x]
                let terrain = terrainAbbrvs[tile]
                let color = terrainColors[terrain] || 0x000

                this.scene.add.existing(new Shape(this.scene, x, y, 0, color)).setStrokeStyle(1, 0xfff, 1).setData(terrain, terrain)
            }
        }
    }
}