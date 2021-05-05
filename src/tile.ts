export type Terrain = keyof typeof terrains
export type Biome = 'grass' | 'ice' | 'desert' | 'volcano' | 'default'

export type ExtendedTerrain = Terrain | 'river_mask' | 'sea_mask'

type WangIdArray = [
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined,
  string | undefined
]

export const terrains = {
  forest:     "F",
  river:      "I",
  mountain:   "M",
  reef:       "R",
  wall:       "W",
  bridge:     "b",
  ocean:      "o",
  beach:      "e",
  cobblestone:"f",
  carpet:     "c",
  plains:     "p",
  road:       "r",
  sea:        "s"
}


type TilesInput = Terrain[][]
type LinearTilesInput = {
  tiles: Terrain[]
  width: number
}

export function tilesFromLinear({ tiles, width }: LinearTilesInput): TilesInput {
  let matrix: TilesInput = []
  tiles = Array.from(tiles)
  while (tiles.length) {
    matrix.push(tiles.splice(0, width))
  }
  return matrix
}

/*class Tileset {
  constructor(
    //private tiles: TilesInput,
    private mainTerrain: Terrain,
    private fillTerrains: Terrain[] = []
  ) {

  }

  getBlobIndexMatrix(tiles: TilesInput, { edges = true, corners = true } = {}){
    return tiles.map((row, y, rows) => {
      return row.map((v, x, cRow) => {
        let pRow = rows[y - 1] || []
        let nRow = rows[y + 1] || []

        if(v != this.mainTerrain){
          return null
        }

        return (edges && (
          (v == pRow[x] && 1) |
          (v == cRow[x - 1] && 64) |
          (v == cRow[x + 1] && 4) |
          (v == nRow[x] && 16)
        )) | (corners && (
          (v == pRow[x - 1] && 128) |
          (v == pRow[x + 1] && 2) |
          (v == nRow[x - 1] && 32) |
          (v == nRow[x + 1] && 8)
        ))
      })
    })
  }
}

const terrainGroups = {
  inside: ['cobblestone', 'carpet', 'wall'] as Terrain[],
  outside: ['plains', 'forest', 'mountain'] as Terrain[],
  sea: ['sea', 'ocean', 'reef'] as Terrain[],
  water: ['sea', 'ocean', 'reef', 'river'] as Terrain[],
}

const CarpetTileset = new Tileset('carpet') // blob
const WallTileset = new Tileset('wall') // 2e - y based
const CobblestoneTileset = new Tileset('cobblestone', ['carpet', 'wall']) // blob

const ForestTileset = new Tileset('forest') // simple - y based
const MountainTileset = new Tileset('mountain') // square

const PlainsTileset = new Tileset('plains', [ // blob
  ...terrainGroups.inside,
  ...terrainGroups.outside,
  'road',
  'river',
  'beach'
])
const RoadTileset = new Tileset('road', ['bridge']) // 2e
const RiverTileset = new Tileset('river') // blob

const BridgeTileset = new Tileset('bridge', []) // 2e - y based

const BeachTileset = new Tileset('beach', [ // blob (without tile 255)
  ...terrainGroups.outside,
  ...terrainGroups.inside
])
const SeaTileset = new Tileset('sea', ['ocean', 'reef', 'beach']) // simple
const OceanTileset = new Tileset('ocean') // blob
const ReefTileset = new Tileset('reef') // simple

const tilesetsOrder = [
  PlainsTileset,
  SeaTileset,
  OceanTileset,
  RiverTileset,
  BeachTileset,
  ReefTileset,
  RoadTileset,
  BridgeTileset,
  CobblestoneTileset,
  CarpetTileset,
  MountainTileset,
  WallTileset,
  ForestTileset
]*/

const terrainLayersOrder: Terrain[] = [
  'plains',
  'sea',
  'ocean',
  'river',
  'beach',
  'reef',
  'road',
  'bridge',
  'cobblestone',
  'carpet',
  'mountain',
  'forest',
  'wall'
]

const terrainConnections: {
  [key in Terrain]: [Terrain[], Terrain[]?, Terrain[]?]
} = {
  beach: [['plains', 'mountain', 'forest', 'road', 'river', 'wall', 'cobblestone', 'carpet'], ['beach'], [undefined, 'sea', 'ocean', 'reef', 'bridge']],
  bridge: [[undefined, 'bridge'], ['plains', 'forest', 'mountain', 'road', 'wall', 'cobblestone', 'carpet']],
  carpet: [[undefined, 'carpet']],
  cobblestone: [[undefined, 'cobblestone']],
  forest: [[]],
  mountain: [[]],
  ocean: [[undefined, 'ocean'], ['sea', 'beach', 'ocean', 'reef']],
  plains: [[]],
  reef: [[undefined, 'reef']],
  river: [[undefined, 'river', 'bridge']],
  road: [[undefined, 'road', 'bridge']],
  sea: [[undefined, 'sea', 'bridge', 'beach', 'ocean']],
  wall: [[undefined, 'wall']]
}

type TileGroup = [x: number, y: number, tile: number][]
type TerrainData = {
  connections: {
    [connectionId: string]: number[]
  }
  groups: {
    [id: string]: TileGroup
  }
}

export class WargrooveMap {
  tilesetData: {
    [key in Terrain]?: {
      [key in Biome]?: TerrainData
    }
  } = {}

  constructor(
    private tilemap: Phaser.Tilemaps.Tilemap,
    private tileset: Phaser.Tilemaps.Tileset,
    tiles?: TilesInput
    ){
    this.tilesetData = this.parseTileset(this.tileset)
    
    if(tiles){
      this.setTiles(tiles)
    }
  }

  setTiles(tiles: TilesInput){
    this.tilemap.removeAllLayers()
    this.generateLayers(tiles)
  }

  private parseTileset(tileset: Phaser.Tilemaps.Tileset, index: WargrooveMap['tilesetData'] = {}) {
    let cols = tileset.columns

    for (let id in tileset.tileProperties) {
      let tileId = +id

      const { biome = "default", terrain, group } = tileset.tileProperties[id] as { biome: Biome, terrain: Terrain, group: string }
      const corners: WangIdArray = tileset.tileData[id]?.wangid?.connections || Array(8).fill(undefined)
      if (!terrain) continue

      index[terrain] = index[terrain] || {}
      const terrainData = index[terrain][biome] = index[terrain][biome] || { connections: {}, groups: {} }

      let keys = { p: 0, s: 0, t: 0 }
      const connId = corners.map((c, i) => {
        return (c in keys) ? c : '.'
      }).join('')
      
        ; (terrainData.connections[connId] = terrainData.connections[connId] || []).push(tileId)
      
      if(group) {
        const g = terrainData.groups[group] = terrainData.groups[group] || []
        g.push([
          tileId % cols,
          Math.floor(tileId / cols),
          tileId
        ])
      }
    }

    return index
  }

  private generateLayers(tiles: TilesInput, biome: Biome = 'grass'){
    terrainLayersOrder.forEach(terrain => {
      this.generateTerrainLayer(terrain, tiles, biome)
    })
  }

  private generateTerrainLayer(terrain: Terrain, tiles: TilesInput, biome: Biome){
    const terrainDataRoot = this.tilesetData[terrain]
    if(!terrainDataRoot) return

    this.generateTerrainExtraLayerMask('bg', terrain, tiles, biome)
    
    const layer = this.tilemap.createBlankLayer(terrain, this.tileset, 0, 0, tiles[0].length, tiles.length)
    layer.setScale(2)

    const terrainData = terrainDataRoot[biome] || terrainDataRoot.default

    if(Object.values(terrainData.groups).length) {
      this.generateTerrainGroups(layer, terrain, tiles, terrainData)
    }
    else {
      this.generateTerrainConnections(layer, terrain, tiles, terrainData)
    }

    this.generateTerrainExtraLayerMask('mask', terrain, tiles, biome)
    this.generateTerrainExtraLayerMask('overlay', terrain, tiles, biome)?.setDepth(200)

    return layer
  }

  private generateTerrainExtraLayerMask(extraName: string, terrain: Terrain, tiles: TilesInput, biome: Biome) {
    const terrainExtraName = terrain + '_' + extraName
    const terrainDataRoot = this.tilesetData[terrainExtraName]
    if (!terrainDataRoot) return

    const layer = this.tilemap.createBlankLayer(terrainExtraName, this.tileset, 0, 0, tiles[0].length, tiles.length)
    layer.setScale(2)

    const terrainData = terrainDataRoot[biome] || terrainDataRoot.default

    this.generateTerrainConnections(layer, terrain, tiles, terrainData)

    return layer
  }

  private generateTerrainConnections(layer: Phaser.Tilemaps.TilemapLayer, terrain: Terrain, tiles: TilesInput, terrainData: TerrainData) {
    const connectionTiles = terrainData.connections
    const [p, s = [], t = []] = terrainConnections[terrain]

    tiles.forEach((row, y, rows) => {
      row.forEach((v, x, cRow) => {
        let isLayerTerrain = v == terrain
        let isPlains = terrain == 'plains'
        let isWaterUnderBridge = (v == 'bridge' && ['sea', 'river'].includes(terrain))


        if (!isLayerTerrain && !isPlains && !isWaterUnderBridge) return

        let pRow = rows[y - 1] || []
        let nRow = rows[y + 1] || []

        const connections = [
          pRow[x],
          pRow[x + 1],
          cRow[x + 1],
          nRow[x + 1],
          nRow[x],
          nRow[x - 1],
          cRow[x - 1],
          pRow[x - 1]
        ]

        if (isWaterUnderBridge) {
          let seaPoints = 0
          let riverPoints = 0

          connections.forEach((terr, i) => {
            if (i % 2 != 0) return
            if (terr == 'river') riverPoints++
            if (['sea', 'ocean', 'beach', 'reef'].includes(terr)) seaPoints++
          })

          if (terrain == 'sea' && riverPoints > seaPoints) return
        }

        const connId = connections.map(terr => {
          return p.includes(terr) ? 'p' : s.includes(terr) ? 's' : t.includes(terr) ? 't' : '-'
        }).join('')

        let bestScore = -1
        let conns: number[] = null

        Object.entries(connectionTiles).forEach(([id, cs]) => {
          let score = 0
          for (let i = 0; i < id.length; i++) {
            if (id[i] == connId[i]) {
              score++
            }
            else if (id[i] != '.') return

            /*if (id[i] != '-' && connections[i] === undefined) {
              console.log(connections[i])
              score -= 0.1
            }*/
          }
          if (score > bestScore) {
            bestScore = score
            conns = cs
          }
        })

        if (!conns) return

        const tileId = conns[Math.floor(Math.random() * conns.length)] + 1

        layer.putTileAt(tileId, x, y)
      })
    })
  }

  private generateTerrainGroups(layer: Phaser.Tilemaps.TilemapLayer, terrain: Terrain, tiles: TilesInput, terrainData: TerrainData) {
    const groups = Object.values(terrainData.groups).sort((a, b) => b.length - a.length).map(this.normalizeGroup)

    let ts = tiles.map(row => row.map(t => t == terrain))

    groups.forEach(g => {
      for (let y = 0; y < ts.length; y++) {
        let row = ts[y]

        for (let x = 0; x < row.length; x++) {
          let m = row[x]
          if (!m) continue

          if (!g.every(([dx, dy]) => ts[y + dy]?.[x + dx])) continue

          g.forEach(([dx, dy, tileId]) => {
            ts[y + dy][x + dx] = false
            layer.putTileAt(tileId + 1, x + dx, y + dy)
          })
        }
      }
    })

    /*for (let y = 0; y < ts.length; y++) {
      let row = ts[y]

      for (let x = 0; x < row.length; x++) {
        let m = row[x]
        if (!m) continue

        let gs = groups.filter(g => {
          return g.every(([dx, dy]) => ts[y + dy]?.[x + dx])
        })

        let max = gs.reduce((max, g) => g.length >= max.length ? g : max, [])

        max.forEach(([dx, dy, tileId]) => {
          ts[y + dy][x + dx] = false
          layer.putTileAt(tileId + 1, x + dx, y + dy)
        })
      }
    }*/
  }

  private normalizeGroup(g: TileGroup): TileGroup {
    g = Array.from(g).sort(([ax, ay], [bx, by]) => (ay - by) || (ax - bx))
    let [dx0, dy0] = g[0]
    return g.map(([dx, dy, t]) => [dx - dx0, dy - dy0, t])
  }

}