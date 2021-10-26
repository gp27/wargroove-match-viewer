import {
  Board,
  Shape,
  FieldOfView,
  PathFinder,
  MoveTo,
} from 'phaser3-rex-plugins/plugins/board-components'
import {
  Label,
  RoundRectangle
} from 'phaser3-rex-plugins/templates/ui/ui-components'
import FadeOutDestroy from 'phaser3-rex-plugins/plugins/fade-out-destroy.js'
import PopUp from 'phaser3-rex-plugins/plugins/popup.js'
import { MatchData, Entry, UnitData, Match } from '../wg/match'
import { getUnitFrameNames, playerColors, terrainColors } from '../wg/match-utils'
import {
  movementMappings,
  MovementType,
  Terrain,
  TerrainMeta,
  PhaserWargrooveMap,
} from './phaser-wargroove-map'
import { PhaserWargrooveScene } from './phaser-wagroove-scene'

export const cellSize = 48

export class PhaserWargrooveBoard extends Board {
  scene: PhaserWargrooveScene

  w: number = 0
  h: number = 0

  map: PhaserWargrooveMap
  chessUnits: Phaser.GameObjects.Group
  elements: Phaser.GameObjects.Group
  gridOverlay: Phaser.GameObjects.Grid
  terrainsMeta: { [key in Terrain]?: TerrainMeta } = this.scene.cache.json
    .get('terrains')
    .reduce((metas, meta: TerrainMeta) => {
      metas[meta.id] = meta
      return metas
    }, {})

  fieldOfView: WargrooveFieldOfView

  constructor(scene: PhaserWargrooveScene) {
    super(scene, {
      grid: {
        x: 24,
        y: 24,
        gridType: 'quadGrid',
        type: 'orthogonal',
        dir: 4,
        cellWidth: cellSize,
        cellHeight: cellSize,
      },
    })

    this.chessUnits = this.scene.add.group()
    this.elements = this.scene.add.group()
    this.gridOverlay = new Phaser.GameObjects.Grid(
      scene,
      0,
      0,
      0,
      0,
      cellSize,
      cellSize
    )
    this.gridOverlay.setDepth(getDepth('floor'))
    this.gridOverlay.setOutlineStyle(0x000000, 0.1)
    this.scene.add.existing(this.gridOverlay)

    this.setInteractive()
    this.on('tiledown', (pointer, { x, y }) => {
      let area = this.getUnitMoveArea(x, y)
      this.setMoveArea(area)
    })
  }

  setMap(map: Match['map']) {
    //this.scene.children.removeAll()

    let { w: x, h: y, tiles, biome } = map

    this.setBoardWidth(x)
    this.setBoardHeight(y)

    let camera = this.scene.cameras.main

    let w = cellSize * x,
      h = cellSize * y

    camera.centerOn(w / 2, h / 2)
    camera.zoom = 0.8

    camera.setBounds(0 - 64, 0 - 64, w + 128, h + 128)

    this.w = x
    this.h = y

    this.gridOverlay.width = w
    this.gridOverlay.height = h

    const tilemap = this.scene.make.tilemap({ key: 'map' })
    const tileset = tilemap.addTilesetImage('wg_tilsets')
    this.map = new PhaserWargrooveMap(tilemap, tileset, biome, this)
    this.map.setTiles(tiles)
    console.log(this.map)
    //this.addElement('villager_cherrystone', 10, 10, 0.5, 0.3)
    this.fieldOfView = new WargrooveFieldOfView(this)

    return this
  }

  unitsCache: Record<number, WargrooveUnit> = {}
  touchedUnits: Record<number, boolean> = {}
  moveArea: Phaser.GameObjects.GameObject[] = []
  sightMap: ReturnType<PhaserWargrooveBoard['generateSightMap']>
  fog: Phaser.GameObjects.GameObject[] = []

  private destroyUnit(id: number) {
    //console.log('destroy', id)
    let unit = this.unitsCache[id]
    this.scene.children.remove(unit)
    unit?.destroy()
    delete this.touchedUnits[id]
    delete this.unitsCache[id]
  }

  private makeUnit(unit: UnitData) {
    //console.log('make', unit.id)
    let chess = this.unitsCache[unit.id] = new WargrooveUnit(this, unit)
    this.chessUnits.add(chess)
    return chess
  }

  loadEntry(entry: Entry, oldEntry?: Entry) {
    this.setMoveArea([])

    const stepByOne = entry.id - (oldEntry || entry).id == 1

    let { unit: mainUnit, otherUnits, action, flags } = entry.actionLog || {}
    let actingUnits = [mainUnit].concat(otherUnits).filter((A) => A)
    //let actingUnitIds: number[] = actingUnits.map((u) => u.id)

    for (let id in this.touchedUnits) {
      this.touchedUnits[id] = false
    }

    let {
      state: { units: u, playerId },
    } = entry

    let units = Object.values(u)

    let toBeUpdated: WargrooveUnit[] = []
    let toBeRemoved: WargrooveUnit[] = []

    for (let unit of units) {
      let chess = this.unitsCache[unit.id] || this.makeUnit(unit)
      this.touchedUnits[unit.id] = true

      let actingU = actingUnits.find((u) => u.id == unit.id)

      if (actingU && stepByOne) {
        toBeUpdated.push(chess)
        chess.updateTo(actingU)
        if(flags?.spawned?.includes(actingU)){
          chess.visible = false
        }
      } else {
        chess.update()
      }
    }

    for (let id in this.touchedUnits) {
      if (!this.touchedUnits[id]) {
        let chess = this.unitsCache[id]
        let actingU = actingUnits.find((au) => chess.id == au.id)
        if (actingU && stepByOne) {
          toBeRemoved.push(chess)
          chess.updateTo(actingU)
        } else {
          chess.isActing = false
          this.destroyUnit(chess.id)
        }
      }
    }

    const entryChanged = () => entry != this.scene.currentEntry

    const next = () => {
      const camera = this.scene.cameras.main
      camera.stopFollow()
      if (entryChanged()) return

      // act order determined by position in actingUnits
      let actUnit = actingUnits.shift()
      if (!actUnit) {
        this.updateFog(playerId)
        this.scene.events.emit('entry.played')
        return
      }

      let cameraShouldFollow = actUnit == mainUnit

      let chess = toBeUpdated.find((chess) => chess.id == actUnit.id)
      if (chess) {
        //console.log('act', chess.id)
        try {
          let after = chess.getUnit()
          if(cameraShouldFollow){
            camera.startFollow(chess, true, 0.2, 0.2)
          }
          chess.act(actUnit, after, next)
        } catch(e){
          console.log(chess)
          console.error(e)
        }
        return
      }

      chess = toBeRemoved.find((chess) => chess.id == actUnit.id)
      if (chess) {
        //console.log('die', chess.id)
        let pos = actUnit.pos
        if(action == 'suicide'){
          pos = otherUnits?.[0].pos
        }

        chess.die(actUnit, pos, () => {
          if (!entryChanged()){
            this.destroyUnit(chess.id)
          }
          next()
        })
        return
      }
      next()
    }

    next()

    return this
  }

  private updateFog(playerId: number) {
    let match = this.scene.getMatch()
    if (match.isFog) {
      this.sightMap = this.generateSightMap()
      //console.log(this.sightMap)
      let players = match.getPlayers()
      let player = players.find((p) => p.id == playerId)
      let alliesId = players
        .filter((p) => p.team == player.team)
        .map((p) => p.id)

      this.fog.forEach((s) => s.destroy())
      this.fog = []
      this.sightMap.forEach((row, y) => {
        row.forEach((sights, x) => {
          let visible = alliesId.some((id) => sights[id])

          if (!visible) {
            let square = this.addSquare(
              x,
              y,
              0x967b3e,
              0.7,
              undefined,
              undefined,
              'fog'
            )
            this.fog.push(square)
          }
        })
      })
    }
  }

  getUnit(id: number) {
    return this.unitsCache[id]
  }

  addSquare(
    x: number,
    y: number,
    color?: number,
    alpha?: number,
    strokeColor?: number,
    strokeAlpha?: number,
    depth = 'floor'
  ) {
    let shape = new Phaser.GameObjects.Rectangle(
      this.scene,
      0,
      0,
      cellSize,
      cellSize
    )
    shape.setFillStyle(color, alpha)
    if (strokeColor != undefined)
      shape.setStrokeStyle(2, strokeColor, strokeAlpha)
    this.scene.add.existing(shape)
    this.addChess(shape, x, y, undefined)
    shape.setDepth(getDepth(depth))
    return shape
  }

  addElement(
    frame: string | Phaser.Textures.Frame,
    x: number,
    y: number,
    originX?: number,
    originY?: number,
    withShadow = false
  ) {
    if (typeof frame == 'string') {
      frame = this.scene.getFrames('grey', [frame])[0]
    }
    if (!frame) return

    const ele = new WargrooveBoardElement(this)
    ele.setCurrentFrame(frame)
    ele.setOrigin(originX, originY)
    ele.setBoardPosition(x, y)
    ele.setScale(2)
    this.elements.add(ele)

    if (withShadow) {
      this.addShadow(x, y, ele.width, ele.height, originX, originY)
    }

    return ele
  }

  private addShadow(
    x: number,
    y: number,
    width: number,
    height: number,
    originX?: number,
    originY?: number
  ) {
    let shadow = new Phaser.GameObjects.Ellipse(
      this.scene,
      0,
      0,
      width,
      5,
      0x000000,
      0.3
    )
    shadow.setOrigin(originX, originY - 0.8)
    shadow.setScale(2)
    this.addChess(shadow, x, y, undefined)
    this.scene.add.existing(shadow)
  }

  getTerrainAt(x: number, y: number): Terrain {
    return this.map?.tiles?.[y]?.[x]
  }

  getUnitAt(x: number, y: number): WargrooveUnit {
    return this.tileXYZToChess(x, y, getDepth('unit')) as WargrooveUnit
  }

  setMoveArea(
    area: { x: number; y: number; color?: number; alpha?: number }[]
  ) {
    this.moveArea.forEach((o) => o.destroy())
    this.moveArea = area.map(({ x, y, color = 0x000000, alpha = 0.3 }) => {
      return this.addSquare(x, y, color, alpha, 0x00000, 1)
    })
  }

  getUnitPathFinder(unit: WargrooveUnit, unitData?: UnitData) {
    let { playerId, unitClassId } = unitData || unit.getUnit() 

    const pathFinder = new PathFinder(unit, {
      pathMode: 'A*',
      costCallback: ({ x, y }, preTileXY, pathFinder) => {
        let terrain: Terrain = this.getTerrainAt(x, y)
        let {
          playerId: otherPlayerId = -3,
          unitClass: { canBeCaptured = false } = {},
        } = this.getUnitAt(x, y)?.getUnit() || {}
        let movement: MovementType = movementMappings[unitClassId] || 'walking'

        if (
          otherPlayerId > -3 &&
          ((otherPlayerId != -1 && otherPlayerId != playerId) ||
            (otherPlayerId == -1 && !canBeCaptured))
        ) {
          return pathFinder.BLOCKER
        }

        let cost =
          this.terrainsMeta[terrain]?.movementCost?.[movement] ??
          pathFinder.BLOCKER
        return cost
      },
    })

    return pathFinder
  }

  getUnitMoveArea(x: number, y: number) {
    let unit = this.getUnitAt(x, y)
    if (!unit) return []
    let pathFinder = this.getUnitPathFinder(unit)

    let {
      unitClass: { moveRange },
    } = unit.getUnit()

    return [{ x, y, color: 0xffffff }].concat(
      pathFinder
        .findArea(moveRange)
        .map(({ x, y }) => ({ x, y, color: 0x000000 }))
    )
  }

  getTargetsInRange({ x: x0, y: y0 }, radius) {
    let result: { x: number; y: number }[] = []
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        let d = Math.abs(dx) + Math.abs(dy)
        if (d > radius) continue

        let x = x0 + dx
        let y = y0 + dy
        if (x >= 0 && y >= 0 && x < this.w && y < this.h) {
          result.push({ x, y })
        }
      }
    }
    return result
  }

  generateSightMap() {
    let { w, h } = this

    let sights: { [playerId: number]: boolean }[][] = Array(h)
      .fill(0)
      .map(() =>
        Array(w)
          .fill(undefined)
          .map((x) => ({}))
      )

    Object.values(this.unitsCache).forEach((unit) => {
      let {
        playerId,
        pos: { x, y },
      } = unit.getUnit()
      if (playerId < 0) return

      let sight = this.fieldOfView.findUnitFieldOfView(unit)
      sight.forEach(({ x, y }) => {
        sights[y][x][playerId] = true
      })
    })

    return sights
  }
}

export class WargrooveSprite extends Phaser.GameObjects.Sprite {
  protected currentFrame: Phaser.Textures.Frame | null = null

  constructor(readonly scene: PhaserWargrooveScene) {
    super(scene, 0, 0, '')
  }

  getSpriteImage() {
    let { x, y, width, height } = this.currentFrame.canvasData as Record<
      string,
      number
    >
    let source = this.currentFrame.texture.getSourceImage() as HTMLCanvasElement
    let dest = document.createElement('canvas')
    dest.width = width
    dest.height = height
    dest
      .getContext('2d')
      .drawImage(source, x, y, width, height, 0, 0, width, height)
    let img = new Image()
    img.src = dest.toDataURL()
    return img
  }

  setCurrentFrame(frame: Phaser.Textures.Frame | null) {
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

  private buffs: Phaser.GameObjects.Group
  private moveTo: MoveTo
  isActing: boolean = false

  constructor(board: PhaserWargrooveBoard, unit: UnitData) {
    super(board)
    this.id = unit.id
    this.info = makeLabel(board.scene)
    this.info.setOrigin(-0.2, -0.2)
    this.buffs = this.scene.add.group()
    this.moveTo = new MoveTo(this, { speed: 400, sneak: true })
  }

  getUnit() {
    return Object.values(
      this.scene.getMatch().getCurrentEntry().state.units
    ).find((u) => u.id == this.id)
  }

  getPlayer(unit: UnitData = this.getUnit()) {
    return this.scene.getMatch().getPlayers()[unit.playerId]
  }

  updateTo(unit: UnitData) {
    let {
      pos: { x, y },
      health,
    } = unit

    let outOfBoard = x < 0 || y < 0
    this.visible = !outOfBoard

    this.info.visible =
      this.visible &&
      (!Number.isInteger(health) || health == 100 ? false : true)
    if (this.info.visible) {
      this.info.setText(health).layout()
      this.board.addChess(this.info, x, y, undefined)
    }

    this.setBuffs(unit)
    this.setUnitFrame(unit)
    this.moveTo.stop()
    this.setBoardPosition(x, y, getDepth('unit'))
    this.isActing = false
  }

  update() {
    let unit = this.getUnit()
    this.updateTo(unit)
  }

  act(before: UnitData, after: UnitData, cb: Function) {
    // spawned
    if(before == after){
      this.spawn(after, cb)
      return
    }

    if (!this.visible) { // in transport
      this.updateTo(after)
      cb()
      return
    }

    let {
      pos: { x: ox, y: oy }
    } = before
    let {
      pos: { x, y },
      transportedBy,
    } = after
    if (x < 0 || y < 0) {
      let transport = this.board.getUnit(transportedBy)?.getUnit()
      if (transport) {
        x = transport.pos.x
        y = transport.pos.y
      } else {
        x = ox
        y = oy
      }
    }

    this.isActing = true

    this.move(x, y, before, () => {
      if (!this.isActing) return
      this.isActing = false
      this.updateTo(after)
      cb()
    })
  }

  move(x: number, y: number, unitData: UnitData = undefined, cb: Function) {
    let ud = unitData || this.getUnit()
    let path = this.board.getUnitPathFinder(this, ud).findPath({ x, y }, ud.unitClass.moveRange)
    this.info.visible = false
    this.moveAlongPath(path, () => {
      cb()
    })
  }

  die(unit: UnitData, pos: { x: number, y: number} = undefined, cb: Function) {
    if(!pos){
      pos = unit.pos
    }
    this.isActing = true
    this.move(pos.x, pos.y, unit, () => {
      const fade = FadeOutDestroy(this, 200, false)
      fade.once('complete', () => {
        if(!this.isActing) return
        this.isActing = false
        cb()
      })
    })
  }

  spawn(unit: UnitData, cb: Function) {
    this.isActing = true
    this.visible = true
    PopUp(this, 200).setScaleRange(0, 2).once('complete', () => {
      if (!this.isActing) return
      this.isActing = false
      this.updateTo(unit)
      cb()
    })
  }

  moveAlongPath(path: { x: number; y: number }[], cb?: Function) {
    if (!path.length) return cb?.()
    const { x, y } = path[0]
    this.moveTo.once('complete', () => {
      if (this.isActing) {
        this.moveAlongPath(path.slice(1), cb)
      } else {
        cb?.()
      }
    })
    this.moveTo.setSpeed(this.scene.playSpeed)
    this.moveTo.moveTo(x, y)
  }

  setUnitFrame(unit: UnitData) {
    let {
      pos: { x, y, facing },
      unitClassId,
      unitClass: { isStructure, maxGroove },
      hadTurn,
      grooveCharge
    } = unit
    let { color = 'grey', faction = 'cherrystone' } = this.getPlayer(unit) || {}

    if (hadTurn) {
      this.tint = 0x999999
    } else {
      this.tint = 0xffffff
    }

    let frameNames = getUnitFrameNames(unitClassId, faction)

    if (
      unitClassId == 'gate' &&
      [
        this.board.getTerrainAt(x, y - 1),
        this.board.getTerrainAt(x, y + 1),
      ].every((t) => t == 'wall')
    ) {
      frameNames = ['gate_2']
    }

    let frames = this.scene.getFrames(color, frameNames)

    if (!frames.length) return
    let frame = frames[0]

    this.setCurrentFrame(frame)

    this.setFlipX(facing == 3)

    if (this.currentFrame) {
      this.displayOriginY = this.currentFrame.height - 8 - (isStructure ? 6 : 0)
    }

    let outline = this.scene.plugins.get('rexOutlinePipeline') as any
    let glow = this.scene.plugins.get('rexGlowFilterPipeline') as any
    outline.remove(this)
    glow.remove(this)
    if (maxGroove > 0 && grooveCharge >= maxGroove) {
      glow.add(this, {
        outerStrength: 3,
        glowColor: playerColors[color].val,
      })
      outline.add(this, {
        thickness: 2,
        outlineColor: 0x0,
      })
    }

  }

  getSprite() {
    return this.getSpriteImage()
  }

  destroy() {
    this.info?.destroy()
    this.buffs?.destroy(true)
    super.destroy()
  }

  getSight() {
    let {
      pos: { x, y },
      unitClassId,
      unitClass: { isCommander, isStructure, tags },
    } = this.getUnit()
    let tagsa = Object.values(tags)

    let vision: 'normal' | 'air' | 'strong' = tagsa.includes('animal')
      ? 'strong'
      : tagsa.includes('type.air')
      ? 'air'
      : 'normal'

    let sight = 2

    if (isStructure && unitClassId != 'hq') {
      sight = 1
    } else if (
      isCommander ||
      [
        'dog',
        'rifleman',
        'crystal',
        'drone',
        'balloon',
        'harpy',
        'dragon',
        'travelboat',
        'harpoonship',
      ].includes(unitClassId)
    ) {
      sight = 3
    } else if (['witch', 'turtle'].includes(unitClassId)) {
      sight = 4
    }

    let terrain = this.board.getTerrainAt(x, y)
    if (terrain == 'mountain' && vision != 'air') sight += 2

    return { vision, sight }
  }

  getFieldOfView() {
    return this.board.fieldOfView.findUnitFieldOfView(this)
  }

  setBuffs(unit = this.getUnit()) {
    this.buffs.clear(true)
    let { pos, unitClassId, state } = unit
    let s = Object.values(state).reduce((s, { key, value }) => {
      s[key] = value
      return s
    }, {} as Record<string, string>)

    let isAreaDamage = unitClassId == 'area_damage'

    if (isAreaDamage || unitClassId == 'area_heal') {
      let [x0, y0] = s.pos.split(',').map((v) => +v)
      let radius = +s.radius

      this.board
        .getTargetsInRange({ x: x0, y: y0 }, radius)
        .forEach(({ x, y }) => {
          let isEdge = Math.abs(x - x0) + Math.abs(y - y0) == radius
          let shape = this.board.addSquare(
            x,
            y,
            isAreaDamage ? 0xcc3333 : 0x00cccc,
            isEdge ? 0.5 : 0.8,
            0x000000,
            0.4
          )
          this.buffs.add(shape)
        })
    }

    if (unitClassId == 'crystal') {
      let { x, y } = pos
      this.board.getTargetsInRange({ x, y }, 3).forEach(({ x, y }) => {
        let shape = this.board.addSquare(x, y, 0xcc3333, 0.5)
        this.buffs.add(shape)
      })
    }

    if (unitClassId == 'smoke_producer') {
      let [x, y] = s.pos.split(',').map((v) => +v)

      this.board.getTargetsInRange({ x, y }, 3).forEach(({ x, y }) => {
        let shape = this.board.addSquare(x, y, 0x000000, 0.65)
        this.buffs.add(shape)
      })
    }
  }
}

function getDepth(type: string, y: number = 0) {
  let depth =
    {
      tile: 0,
      floor: 99,
      unit: 100,
      overlay: 200 * cellSize,
      fog: 300 * cellSize,
      ui: 400 * cellSize,
    }[type] || 0

  return depth + y
}

export function makeLabel(scene: Phaser.Scene) {
  let background = new RoundRectangle(scene, 0, 0, 0, 0, 5, 0x333333, 0.9)
  background.setStrokeStyle(2, 0x222222)
  background.isFilled = true
  background.setFillStyle(0x333333, 0.9)

  let text = new Phaser.GameObjects.Text(scene, 0, 0, '', {
    fontSize: '12px',
    strokeThickness: 1.1,
    resolution: 4,
  })

  const label = new Label(scene, {
    orientation: 0,
    width: 18,
    height: 18,
    background,
    text,
    align: 'center',
    space: {
      text: 0,
      bottom: 0,
      right: 0,
    },
  })

  let uiDepth = getDepth('ui')

  label.setDepth(uiDepth)
  background.setDepth(uiDepth)
  text.setDepth(uiDepth)

  scene.add.existing(background)
  scene.add.existing(text)
  scene.add.existing(label)

  label.layout()

  return label
}

/**
 * return this.wgLOS.findFieldOfView(unit, 5)
    .map(({ x, y }) => ({ x, y, color: 0xfffff }))
 */
class WargrooveFieldOfView {
  private sightBoard: Board
  private k: number
  private cellSize: number
  private w: number
  private h: number

  constructor(private board: PhaserWargrooveBoard) {
    this.w = board.width
    this.h = board.height
    let tl = this.w + this.h - 1
    this.k = this.w - 1

    let csize = (this.cellSize = Math.round(cellSize / Math.sqrt(2)))

    this.sightBoard = new Board(board.scene, {
      width: tl,
      height: tl,
      grid: {
        gridType: 'quadGrid',
        type: 'orthogonal',
        dir: 4,
        cellWidth: csize,
        cellHeight: csize,
      },
    })
  }

  isSightBlocker(x: number, y: number, vision: 'normal' | 'air' | 'strong') {
    if (vision != 'normal') return false
    let unit = this.board.getUnitAt(x, y)?.getUnit()
    if (unit?.unitClassId == 'gate') return true
    let terrain = this.board.getTerrainAt(x, y)
    return ['reef', 'forest', 'mountain', 'wall'].includes(terrain)
  }

  isHidingPlace(x: number, y: number, vision: 'normal' | 'air' | 'strong') {
    if (vision == 'strong') return false
    let terrain = this.board.getTerrainAt(x, y)
    return ['reef', 'forest'].includes(terrain)
  }

  xyToSightXY({ x, y }: { x: number; y: number }) {
    return {
      x: x + y,
      y: this.k - x + y,
    }
  }

  sightXYToXY({ x: sx, y: sy }: { x: number; y: number }) {
    let x = (sx - sy + this.k) / 2
    let y = (sx + sy - this.k) / 2

    if (!Number.isInteger(x)) x = -1
    if (!Number.isInteger(y)) y = -1

    return { x, y }
  }

  setViewChess(x: number, y: number) {
    this.sightBoard.removeAllChess()

    let { x: xv, y: yv } = this.xyToSightXY({ x, y })
    let shape = new Shape(this.sightBoard, xv, yv)
    this.sightBoard.scene.add.existing(shape)
    this.sightBoard.addChess(shape, xv, yv, undefined)
    return shape
  }

  findUnitFieldOfView(unit: WargrooveUnit): { x: number; y: number }[] {
    let {
      pos: { x, y },
    } = unit.getUnit()
    let { vision, sight } = unit.getSight()

    let sightChess = this.setViewChess(x, y)

    const fow = new FieldOfView(sightChess, {
      preTestCallback: undefined, 
      costCallback: ({ x, y }, fieldOfView, tileXYArray) => {
        let { x: ox, y: oy } = this.sightXYToXY({ x, y })

        if (this.isSightBlocker(ox, oy, vision)) {
          return fieldOfView.BLOCKER
        }
        //return (x % 2 == 0) || (y % 2 == 1) ? 1 : 0
        let { x: x0, y: y0 } =
          tileXYArray[
            tileXYArray.findIndex(({ x: xp, y: yp }) => x == xp && y == yp) - 1
          ]
        if (x0 != x && y0 != y) {
          let adjacents = [
            { x: x0, y },
            { x, y: y0 },
          ].map((c) => this.sightXYToXY(c))
          if (
            adjacents.every(({ x, y }) => this.isSightBlocker(x, y, vision))
          ) {
            return fieldOfView.BLOCKER
          }
        }

        return Math.abs(x - x0) + Math.abs(y - y0)
      },
    })

    return fow
      .findFOV(sight * 2)
      .map((xy) => this.sightXYToXY(xy))
      .filter(({ x: xv, y: yv }) => {
        let distance = Math.abs(x - xv) + Math.abs(y - yv)
        return (
          xv >= 0 &&
          xv < this.w &&
          yv >= 0 &&
          yv < this.h &&
          distance <= sight &&
          (distance == 1 || !this.isHidingPlace(xv, yv, vision))
        )
      })
      .concat({ x, y })
  }
}
