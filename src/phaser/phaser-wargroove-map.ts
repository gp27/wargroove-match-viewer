import { PhaserWargrooveBoard } from "./phaser-wargroove-board"

export type Terrain = keyof typeof terrains
export type Biome = 'grass' | 'ice' | 'desert' | 'volcano' | 'default'

export type ExtendedTerrain = Terrain | 'river_mask' | 'sea_mask'

export type MovementType = 'amphibious' | 'flying' | 'hovering' | 'indoor_building' | 'land_building' | 'riding' | 'walking' | 'wheels'

export const movementMappings: Record<string,MovementType> = {
  knight: 'riding',
  wagon: 'wheels',
  trebuchet: 'wheels',
  ballista: 'wheels',
  balloon: 'flying',
  harpy: 'flying',
  dragon: 'flying',
  witch: 'flying',
  merman: 'amphibious',
  drone: 'hovering'
}

export const unitsMovement: {
  [unitClassId: string]: MovementType
} = {
  soldier: 'walking',
  
}

export type TerrainMeta = {
  id: Terrain
  defenceBonus: number
  movementGroupType: string
  tilesets: { [index: string]: Terrain }
  movementCost: { [movement in MovementType]: number }
}

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
  beach: [['plains', 'mountain', 'forest', 'road', 'river', 'wall', 'cobblestone', 'carpet'], ['beach'], ['sea', 'ocean', 'reef', 'bridge']],
  bridge: [['bridge'], ['plains', 'forest', 'mountain', 'road', 'wall', 'cobblestone', 'carpet']],
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

const terrainElements: {
  [key in Terrain]?: {
    [key in Biome]?: [min: number, max: number, atlas: string, names: string[]]
  }
} = {
  forest: {
    grass: [2, 4, 'trees', [
      "trees_grass_cone_big",
      "trees_grass_cone_medium",
      "trees_grass_cone_small",
      "trees_grass_round_big",
      "trees_grass_round_medium",
      "trees_grass_round_small"
    ]],
    desert: [2, 3, 'trees', [
      "trees_desert_cactus_big",
      "trees_desert_cactus_medium",
      "trees_desert_cactus_small",
      "trees_desert_palm_big",
      "trees_desert_palm_medium",
      "trees_desert_palm_small",
      "trees_desert_shrub_medium"
    ]],
    ice: [2, 3, 'trees', [
      "trees_ice_dry_big",
      "trees_ice_dry_medium",
      "trees_ice_dry_small",
      "trees_ice_snowcone_big",
      "trees_ice_snowcone_medium",
      "trees_ice_snowcone_small",
      "trees_ice_snowround_big",
      "trees_ice_snowround_medium",
      "trees_ice_snowround_small"
    ]],
    volcano: [2, 3, 'trees', [
      "trees_volcano_dry_big",
      "trees_volcano_dry_medium",
      "trees_volcano_dry_small"
    ]]
  }
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

export class PhaserWargrooveMap {
  tilesetData: {
    [key in Terrain]?: {
      [key in Biome]?: TerrainData
    }
  } = {}

  constructor(
    private tilemap: Phaser.Tilemaps.Tilemap,
    private tileset: Phaser.Tilemaps.Tileset,
    readonly biome: Biome = 'grass',
    private board: PhaserWargrooveBoard,
    public tiles?: TilesInput
    ){
    this.tilesetData = this.parseTileset(this.tileset)
    
    if(tiles){
      this.setTiles(tiles)
    }
  }

  setTiles(tiles: TilesInput){
    this.tilemap.removeAllLayers()
    this.generateLayers(tiles, this.biome)
    this.tiles = tiles
  }

  private parseTileset(tileset: Phaser.Tilemaps.Tileset, index: PhaserWargrooveMap['tilesetData'] = {}) {
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

  private generateLayers(tiles: TilesInput, biome: Biome){
    terrainLayersOrder.forEach(terrain => {
      this.generateTerrainLayer(terrain, tiles, biome)
    })
  }

  private makeTilesLayer(name: string, tileIds?: number[][]){
    if(!tileIds?.length || !tileIds[0]?.length) return
    const layer = this.tilemap.createBlankLayer(name, this.tileset, 0, 0, tileIds[0].length, tileIds.length)
    if(!layer) return
    //console.log(name)
    layer.setScale(2)

    tileIds.forEach((row, y) => {
      row.forEach((tileId, x) => {
        layer.putTileAt(tileId + 1, x, y)
      })
    })
  }

  private getTerrainData(terrain: Terrain, biome: Biome, extra: string = ''){
    const terrainDataRoot = this.tilesetData[terrain+extra]
    if (!terrainDataRoot) return
    return terrainDataRoot[biome] || terrainDataRoot.default
  }

  private generateTerrainLayer(terrain: Terrain, tiles: TilesInput, biome: Biome) {
    if(terrain == 'forest') {
      this.makeRandomElementsLayer(terrain, biome, tiles)
    }
    else if(terrain == 'mountain') {
      this.makeGroupsLayer(terrain, biome, tiles)
    }
    else {
      //this.makeConnectedLayer(terrain, biome, tiles, '_bg')
      this.makeConnectedLayer(terrain, biome, tiles)
      this.makeConnectedLayer(terrain, biome, tiles, '_mask')
    }
    
    this.makeOverlayLayer(terrain, biome, tiles)
  }

  private makeConnectedLayer(terrain: Terrain, biome: Biome, tiles: TilesInput, extra: string = ""){
    let name = `${terrain}${extra}`
    let terrainData = this.getTerrainData(terrain, biome, extra)
    if(!terrainData?.connections) return
    let tileIds = this.generateTerrainConnections(terrain, tiles, terrainData)
    this.makeTilesLayer(name, tileIds)
  }

  private makeGroupsLayer(terrain: Terrain, biome: Biome, tiles: TilesInput) {
    let terrainData = this.getTerrainData(terrain, biome)
    if (!terrainData?.groups) return
    let tileIds = this.generateTerrainGroups(terrain, tiles, terrainData)
    //console.log(tileIds)
    this.makeTilesLayer(terrain, tileIds)
  }

  private makeOverlayLayer(terrain: Terrain, biome: Biome, tiles: TilesInput) {
    let terrainData = this.getTerrainData(terrain, biome, '_overlay')
    if (!terrainData?.connections) return
    let tileIds = this.generateTerrainConnections(terrain, tiles, terrainData)
    tileIds.forEach((row, y) => {
      row.forEach((tileId, x) => {
        if(!tileId) return
        let frame = this.getFrameFromTileId(tileId)
        if(frame) {
          this.board.addElement(frame, x, y)
        }
      })
    })
  }

  private makeRandomElementsLayer(terrain: Terrain, biome: Biome, tiles: TilesInput){
    const elementsRoot = terrainElements[terrain]
    if(!elementsRoot) return
    const elements = elementsRoot[biome] || elementsRoot['default']
    if(!elements) return
    this.generateRandomElements(terrain, tiles, elements)
  }

  private generateTerrainConnections(terrain: Terrain, tiles: TilesInput, terrainData: TerrainData) {
    const connectionTiles = terrainData.connections
    const [p, s = [], t = []] = terrainConnections[terrain]

    return tiles.map((row, y, rows) => {
      return row.map((v, x, cRow) => {
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

        /*if(terrain == 'beach'){
          const rotatedConnections = connections.slice(4, 4).concat(connections.slice(0,4))

          connections.forEach((terr, i) => {
            if (i % 2 != 0) return
            if(terr !== undefined) return
            let opTerr = rotatedConnections[i]
            let newTerr: Terrain = p.includes(opTerr) ? 'sea' : t.includes(opTerr) ? 'plains' : 'sea'
            //connections[i] = newTerr
          })
        }*/

        if (isWaterUnderBridge) {
          let seaPoints = 0
          let riverPoints = 0

          connections.forEach((terr, i) => {
            let point = (i % 2 == 0) ? 1 : 0.1
            if (terr == 'river') riverPoints += point
            if (['sea', 'ocean', 'beach', 'reef'].includes(terr)) seaPoints += point
          })

          if (terrain == 'sea' && riverPoints > seaPoints) return
          if (terrain == 'river' && seaPoints > riverPoints) return
        }

        const connId = connections.map(terr => {
          return p.includes(terr) ? 'p' : s.includes(terr) ? 's' : t.includes(terr) ? 't' : terr != undefined ? '-' : 'b'
        }).join('')

        let bestScore = -1
        let conns: number[] = null

        Object.entries(connectionTiles).forEach(([id, cs]) => {
          let score = 0
          for (let i = 0; i < id.length; i++) {
            if (id[i] == connId[i] || connId[i] == 'b') {
              score += 1 + (id[i] == 'p' ? 0.02 : id[i] == 's' ? 0.01 : 0)
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

        const tileId = conns[Math.floor(Math.random() * conns.length)]
        return tileId
      })
    })
  }

  private generateTerrainGroups(terrain: Terrain, tiles: TilesInput, terrainData: TerrainData) {
    const groups = Object.values(terrainData.groups).sort((a, b) => b.length - a.length).map(this.normalizeGroup)

    let ts = tiles.map(row => row.map(t => t == terrain))

    let tileIds = tiles.map(row => row.map(t => undefined))

    groups.forEach(g => {
      for (let y = 0; y < ts.length; y++) {
        let row = ts[y]

        for (let x = 0; x < row.length; x++) {
          let m = row[x]
          if (!m) continue

          if (!g.every(([dx, dy]) => ts[y + dy]?.[x + dx])) continue

          g.forEach(([dx, dy, tileId]) => {
            ts[y + dy][x + dx] = false
            //layer.putTileAt(tileId + 1, x + dx, y + dy)
            
            let r = tileIds[y + dy]
            r[x + dx] = tileId
          })
        }
      }
    })

    return tileIds

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

  private generateRandomElements(terrain: Terrain, tiles: TilesInput, elements: typeof terrainElements[Terrain][Biome]){
    const deltas = [[0, 0], [.5, .5], [.5, 0], [0, .5]]
    let [min, max, atlas, names] = elements

    tiles.forEach((row, y) => {
      row.forEach((t, x) => {
        if(t != terrain) return
        
        const len = Math.floor(Math.random() * (max - min)) + min
        Array(len).fill(0).forEach((_, i) => {
          const name = names[Math.floor(Math.random() * names.length)]
          let ox = Math.random(), oy = Math.random()
          if(ox > .5) ox -= .5
          if(oy > .5) oy -= .5

          let [dox, doy] = deltas[i]
          let frame = this.board.scene.textures.getFrame(atlas, name)
          if(frame){
            this.board.addElement(frame, x, y, ox + dox, oy + doy + 0.3, true)
          }
        })


      })
    })
  }

  private getFrameFromTileId(tileId: number) {
    let { tileWidth, tileHeight, texCoordinates: { [tileId]: { x = 0, y = 0 } = {} as any } } = this.tileset
    this.tileset.image.add(tileId, 0, x, y, tileWidth, tileHeight)
    return this.tileset.image.get(tileId)
  }

}