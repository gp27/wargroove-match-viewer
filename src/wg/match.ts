import * as jsondiffpatch from 'jsondiffpatch'
import 'chart.js'
import { ChartConfiguration, ChartDataset } from 'chart.js'
import { getCommanderMeta, PlayerColor, playerColors } from './match-utils'
import {
  Biome,
  Terrain,
  terrains,
  tilesFromLinear,
} from '../phaser/phaser-wargroove-map'
import { Opening, OpeningsClusters } from './openings'

const diffpatcher = jsondiffpatch.create()

type LuaArray<T> = T[] | Record<number, T>

export type MatchData = {
  match_id: string
  map: {
    size: Pos
    tiles: string
    biome?: Biome
  }

  players: LuaArray<Player>

  state: State
  deltas: LuaArray<jsondiffpatch.Delta>
  fog_blocks?: string[]
  is_fog?: boolean
}

export interface Pos {
  x: number
  y: number
  facing?: number
}

export interface Player {
  id: number
  team: number
  is_victorious: boolean
  is_local: boolean
  is_human: boolean

  commander?: string
  faction?: string
  username?: string
  color?: PlayerColor
}

export interface UnitData {
  id: number
  garrisonClassId: string
  transportedBy: number
  unitClassId: string
  loadedUnits: LuaArray<number>
  damageTakenPercent: number
  grooveId: string
  playerId: number
  health: number
  hadTurn: boolean
  inTransport: boolean
  state: LuaArray<{ key: string; value: any }>
  attackerId: number
  pos: Pos
  canBeAttacked: boolean
  grooveCharge: number
  attackerUnitClass: string
  attackerPlayerId: number
  killedByLosing: boolean
  recruits: LuaArray<string>
  startPos: Pos
  unitClass: UnitClass
}

export interface UnitClass {
  id: string
  weapons: LuaArray<Weapon>
  inAir: boolean
  moveRange: number
  isCommander: boolean
  tags: LuaArray<string>
  cost: number
  passiveMultiplier: number
  transportTags: LuaArray<string>
  isStructure: boolean
  canReinforce: boolean
  loadCapacity: number
  weaponIds: LuaArray<string>
  maxGroove: number
  canBeCaptured: boolean
  maxHealth: number
}

export interface Weapon {
  id: string
  directionality: string
  maxRange: number
  minRange: number
  horizontalAndVerticalOnly: boolean
  terrainExclusion: LuaArray<string>
  canMoveAndAttack: boolean
  horizontalAndVerticalExtraWidth: number
}

export interface State {
  playerId: number
  turnNumber: number
  gold: Record<string, number>
  units: LuaArray<UnitData>
  unitClasses?: Record<string, UnitClass>
}

export type Status = Record<
  number,
  {
    gold: number
    income: number
    armyValue: number
    unitCount: number // hq does not count
    combatUnitCount: number
    //activeUnitCount: number
  }
>

export interface PlayerTurn {
  id: number
  turnNumber: number
  playerId: number
  entries: Entry[]
  mainEntry: Entry
}

export interface Entry {
  id: number
  state: State
  status: Status
  turn: PlayerTurn
  moveNumber: number
  actionLog?: ActionLog
}

export interface MatchMap {
  w: number
  h: number
  tiles: Terrain[][]
  biome?: Biome
  tileString: string
  stateString: string
}

export class Match {
  private entries: Entry[]
  private turns: PlayerTurn[]
  private players: Player[]
  private map: MatchMap

  currentTurn: PlayerTurn
  currentEntry: Entry
  isFog?: boolean

  /*static load(id?: string){
    return loadMatchData(id).then(matchData => {
      if(!matchData) return
      return new Match(matchData)
    })
  }*/

  static isValid({ match_id, map, players, state, deltas }: any = {}) {
    return Boolean(match_id && map && players && state && deltas)
  }

  constructor(private matchData: MatchData) {
    //console.profile(matchData.match_id)
    let states = generateStates(matchData)

    this.entries = states.map(
      (state, id) =>
        ({
          id,
          state,
          status: generateStateStatus(state, matchData),
          actionLog: analyzeDelta(
            matchData.deltas[id - 1],
            states[id - 1],
            state
          ),
        } as Entry)
    )

    this.players = generatePlayers(this.entries, matchData)
    this.turns = generatePlayerTurns(this.entries, this.getPlayers().length)
    this.map = generateMap(matchData, states[0])
    this.isFog = Boolean(matchData.fog_blocks?.length || matchData.is_fog)

    this.selectEntry(this.getWinners().length ? 0 : this.entries.length - 1)
    //new OpeningsClusters([this, this, this])
    //new MatchHistory(this)
    //console.profileEnd(matchData.match_id)
    //console.log(this)
  }

  selectEntry(entryId: number) {
    this.currentEntry =
      this.entries.find((e) => e.id == entryId) ||
      this.currentEntry ||
      this.entries[0]
    this.currentTurn = this.currentEntry.turn
    return this.currentEntry
  }

  selectNextEntry() {
    this.selectEntry(this.currentEntry.id + 1)
  }

  selectPreviousEntry() {
    this.selectEntry(this.currentEntry.id - 1)
  }

  getCurrentEntry() {
    return this.currentEntry
  }

  getCurrentTurn() {
    return this.currentTurn
  }

  getEntries() {
    return this.entries
  }

  getTurns() {
    return this.turns
  }

  getMap() {
    return this.map
  }

  getWinners() {
    return this.getPlayers().filter((p) => p.is_victorious)
  }

  getPlayers() {
    return this.players
  }

  getPlayerColorHex(playerId) {
    let color = this.players[playerId].color || 'grey'
    return playerColors[color].hex
  }

  changePlayerColor(playerId: number, color: PlayerColor) {
    let p = this.players[playerId]
    if (
      p &&
      color in playerColors &&
      !this.players.find((p) => p.color == color)
    ) {
      p.color = color
    }
  }

  getCurrentCombatUnits(playerId?: number) {
    let players = this.getPlayers()
    let relativePlayerId = (playerId, currentPlayerId) =>
      (playerId - currentPlayerId + players.length) % players.length

    let entry = this.getCurrentEntry()

    return Object.values(entry.state.units)
      .filter((u) =>
        playerId === undefined ? u.playerId >= 0 : u.playerId == playerId
      )
      .filter(
        (u) =>
          !u.garrisonClassId &&
          !['area_damage', 'area_heal', 'smoke_producer'].includes(
            u.unitClassId
          )
      )
      .sort((u1, u2) => {
        let deltaPlayer =
          relativePlayerId(u1.playerId, entry.state.playerId) -
          relativePlayerId(u2.playerId, entry.state.playerId)

        if (deltaPlayer != 0) return deltaPlayer

        return (
          Number(u2.unitClass.isCommander) - Number(u1.unitClass.isCommander)
        )
      })
  }

  getCharts(
    entryFilter: (entry: Entry) => boolean = () => true
  ): ChartConfiguration<'line', number[]>[] {
    let labels: string[] = []

    let incomeDataSet: ChartDataset<'line', number[]>[] = []
    let armyValueDataSet: ChartDataset<'line', number[]>[] = []
    let unitCountDataSet: ChartDataset<'line', number[]>[] = []
    let combatUnitCountDataSet: ChartDataset<'line', number[]>[] = []

    let pointBackgroundColor: string[] = []

    for (let entry of this.entries) {
      if (!entryFilter(entry)) continue

      let {
        status,
        turn: { turnNumber, playerId, entries: tEntries },
      } = entry
      labels.push(
        `T${turnNumber}-P${playerId + 1}-M${tEntries.indexOf(entry) + 1}`
      )

      let color = this.getPlayerColorHex(playerId)
      pointBackgroundColor.push(color)

      Object.entries(status).forEach(
        (
          [
            playerIdStr,
            { gold, income, armyValue, unitCount, combatUnitCount },
          ],
          i
        ) => {
          let playerId = +playerIdStr
          let color = this.getPlayerColorHex(playerId)

          getDataSet(incomeDataSet, i, {
            label: `P${playerId + 1} Income`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(income)

          getDataSet(armyValueDataSet, i * 2, {
            label: `P${playerId + 1} Army Value`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(armyValue)

          getDataSet(armyValueDataSet, i * 2 + 1, {
            label: `P${playerId + 1} Army Value + Gold`,
            borderDash: [5],
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(armyValue + gold)

          getDataSet(unitCountDataSet, i, {
            label: `P${playerId + 1} Unit Count`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(unitCount)

          getDataSet(combatUnitCountDataSet, i, {
            label: `P${playerId + 1} Combat U.C.`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(combatUnitCount)
        }
      )
    }

    return [
      {
        type: 'line',
        options: {
          scales: {
            yAxes: { ticks: { stepSize: 100 } },
          },
        },
        data: {
          labels,
          datasets: incomeDataSet,
        },
      },
      {
        type: 'line',
        data: {
          labels,
          datasets: armyValueDataSet,
        },
      },
      {
        type: 'line',
        options: {
          scales: {
            yAxes: {
              ticks: { stepSize: 1 },
            },
          },
        },
        data: {
          labels,
          datasets: unitCountDataSet,
        },
      },
      {
        type: 'line',
        options: {
          scales: {
            yAxes: {
              ticks: { stepSize: 1 },
            },
          },
        },
        data: {
          labels,
          datasets: combatUnitCountDataSet,
        },
      },
    ]
  }

  getTurnEndCharts() {
    let charts = this.getCharts((entry) => {
      return entry.turn.entries.slice(-1)[0] == entry
    })

    charts.forEach(({ data }) => {
      data.labels = data.labels.map(
        (str) => String(str).match(/^(T[0-9]+-P[0-9]+)/)?.[1]
      )
    })

    return charts
  }

  getAverageCharts() {
    const n = Object.keys(this.players).length

    return this.getTurnEndCharts().map((chart, chartIndex) => {
      let {
        data: { datasets },
      } = chart

      let newDSet = datasets.map(({ data, label, borderColor }, i) => {
        return {
          data: data
            .map((v, i, a) => {
              if (i % n != 0 || i + n > a.length) return
              return a.slice(i, i + n).reduce((a, b) => a + b, 0) / n
            })
            .filter((A) => A !== undefined),
          label: label + ' Avg',
          borderColor,
          borderDash: chartIndex == 1 && i % 2 == 1 ? [5] : undefined,
        }
      })

      return {
        data: {
          labels: newDSet[0].data.map((_, i) => `Turn ${i + 1}`),
          datasets: newDSet,
        },
      }
    })
  }
}

function generateStates({ state, deltas }: MatchData) {
  let states: State[] = [diffpatcher.clone(state)]

  for (let delta of Object.values(deltas).reverse()) {
    let prev = diffpatcher.clone(states[0])
    try {
      states.unshift(diffpatcher.unpatch(prev, delta))
    } catch (e) {
      console.error(e)
      console.warn('Error while unpatching delta-state', delta, prev)
      break
    }
  }

  states.forEach(({ units = {}, unitClasses = {} }) => {
    Object.values(units).forEach((unit) => {
      if (!unit.unitClass) {
        unit.unitClass = unitClasses[unit.unitClassId]
      }
    })
  })

  return states
}

function generateStateStatus({ units, gold }: State, { players }: MatchData) {
  let status: Status = {}

  Object.values(players).forEach((_, playerId) => {
    status[playerId] = {
      gold: gold['p_' + playerId] ?? gold[playerId],
      income: 0,
      armyValue: 0,
      unitCount: 0,
      combatUnitCount: 0,
    }
  })

  for (let i in units) {
    let unit = units[i]
    if (!unit) continue

    let {
      playerId,
      health,
      unitClassId,
      unitClass: { cost },
    } = unit
    if (playerId < 0) continue

    let playerStatus = status[playerId]

    if (['city', 'hq', 'water_city'].includes(unitClassId)) {
      playerStatus.income += 100
    }

    if (unitClassId != 'hq') {
      playerStatus.unitCount++
    }

    if (
      ![
        'city',
        'hq',
        'barracks',
        'port',
        'tower',
        'hideout',
        'water_city',
      ].includes(unitClassId)
    ) {
      playerStatus.combatUnitCount++
      playerStatus.armyValue += Math.round((cost * health) / 100)
    }
  }

  return status
}

function generatePlayers(entries: Entry[], { players }: MatchData) {
  let commanderUnits = Object.values(entries[0].state.units).filter(
    (u) => u.unitClass.isCommander
  )

  let comm: Record<
    number,
    { commander: string; faction: string; color: PlayerColor }
  > = {}

  let takenColors: Partial<Record<PlayerColor, boolean>> = {}

  for (let c of commanderUnits) {
    let commander = c.unitClassId.replace(/commander_/, '')
    let { color, faction } = getCommanderMeta(commander)

    if (takenColors[color]) {
      color = (Object.keys(playerColors) as PlayerColor[]).find(
        (c) => !takenColors[c]
      ) as PlayerColor
    }
    takenColors[color] = true

    comm[c.playerId] = {
      commander,
      color,
      faction,
    }
  }

  return Object.values(players).map((p) => Object.assign({}, p, comm[p.id]))
}

function generatePlayerTurns(entries: Entry[], n: number) {
  let turns: PlayerTurn[] = []
  let turnsById: Record<string, PlayerTurn> = {}

  for (let entry of entries) {
    let { playerId, turnNumber } = entry.state

    let id = (turnNumber - 1) * n + playerId
    let turn = turnsById[id]

    if (!turn) {
      turn = { id, turnNumber, playerId, entries: [], mainEntry: entry }
      turnsById[id] = turn
      turns.push(turn)
    }

    turn.entries.push(entry)
    entry.turn = turn
    entry.moveNumber = turn.entries.length - 1
  }

  return turns
}

const terrainAbbrvs: Record<string, Terrain> = Object.entries(terrains).reduce(
  (o, [key, val]) => ((o[val] = key), o),
  {}
)

function getTerrainFromAbbr(code: string): Terrain {
  return terrainAbbrvs[code] || 'plains'
}

function generateMap(matchData: MatchData, state: State): MatchMap {
  let {
    size: { x, y },
    tiles: tileString,
    biome,
  } = matchData.map
  let linearData = tileString.split('')

  let tiles = tilesFromLinear({
    tiles: linearData.map(getTerrainFromAbbr),
    width: x,
  })

  return {
    w: x,
    h: y,
    tiles,
    biome,
    tileString,
    stateString: generateStateString(state),
  } as Match['map']
}

function generateStateString(state: State) {
  let g = Object.entries(state.gold)
    .sort(([a], [b]) => +a - +b)
    .map(([i, g]) => `${i}-${g}g`)
    .sort()
  let u = Object.values(state.units)
    .sort((u1, u2) => u1.id - u2.id)
    .map((u) =>
      [
        u.unitClassId.startsWith('commander_') ? 'commander' : u.unitClassId,
        u.playerId,
        u.pos.x,
        u.pos.y,
        u.health,
        u.grooveCharge,
      ].join('.')
    )
    .sort()

  return g.concat(u).join(',')
}

export interface ActionLog {
  action:
    | 'match_start'
    | 'end_turn'
    | 'build'
    | 'capture'
    | 'attack'
    | 'kill'
    | 'suicide'
    | 'decap'
    | 'groove'
    | 'reinforce'
    | 'wait'
    | 'move'
    | 'heal'
    | 'hex'
    | 'steal'
    | 'heist'
    | 'bypass'
    | 'deposit'
    | 'load'
    | 'unload'
    | 'reload'
    | 'reposition'
    | 'explode'
    | 'state_change'
    | 'other'
  unit?: UnitData
  otherUnits?: UnitData[]
  moved?: boolean
  flags?: ActionFlags

  spentGold?: number
  lostGold?: number
}

export interface ActionFlags {
  died?: UnitData[]
  spawned?: UnitData[]
  grooved?: UnitData[]
  posChanged?: UnitData[]
  hadTurn?: UnitData[]
  damaged?: UnitData[]
  healed?: UnitData[]
  captured?: UnitData[]
  decapped?: UnitData[]
  load?: UnitData[]
  loaded?: UnitData[]
  unload?: UnitData[]
  unloaded?: UnitData[]
  reloaded?: UnitData[]

  spent?: number
  gained?: number
  stole?: number
}

function analyzeDelta(
  delta: jsondiffpatch.Delta | undefined,
  state: State,
  nextState: State
): ActionLog | undefined {
  if (!delta)
    return { action: 'match_start', otherUnits: Object.values(nextState.units) }

  const { playerId, turnNumber, units } = state

  let unitsDelta = Object.entries(delta.units || {})

  const flags: ActionFlags = {}

  const setFlag = <
    T extends { [key in K]: UnitData[] },
    K extends keyof ActionFlags
  >(
    flag: K,
    value: UnitData
  ) => {
    ;(flags[flag] = (flags[flag] as T[K]) || ([] as T[K])).push(value)
  }

  Object.entries(delta.gold || {}).forEach(([pid, d]) => {
    let isCurrentPlayer = pid == 'p_' + playerId
    let [newGold, oldGold] = getDeltaVal(d)
    let dGold = newGold - oldGold
    if (dGold < 0) {
      if (isCurrentPlayer) {
        flags.spent = -dGold
      } else {
        flags.stole = -dGold
      }
    }
    if (dGold > 0 && isCurrentPlayer) {
      flags.gained = dGold
    }
  })

  unitsDelta.forEach(([uid, d]) => {
    const unit = units[uid] || nextState.units[uid]
    setDeltaUnitFlags([unit, d], setFlag)
  })

  const withFlags = (log: ActionLog) => Object.assign(log, { flags })

  //console.log(flags)

  const mergeUnits = (...list: (UnitData[]|undefined)[]) => {
    let units: UnitData[] = []
    for(let e of list){
      if(e){
        units.push(...e)
      }
    }
    return units
  }

  if (delta.playerId)
    return withFlags({
      action: 'end_turn',
      otherUnits: Object.keys(delta.units || {})
        .map((uid) => state.units[uid])
        .filter((A) => A),
    })

  if (flags.grooved) {
    let groover = flags.grooved[0]

    return withFlags({
      action: 'groove',
      unit: groover,
      otherUnits: mergeUnits(
        flags.posChanged,
        flags.damaged,
        flags.died,
        flags.decapped,
        flags.spawned
      ).filter((a) => a != groover),
    })
  }

  if (flags.died && !flags.hadTurn) {
    let u = units['u_' + flags.died?.[0].id] as UnitData
    if (u.health <= 35 && u.playerId != playerId) {
      let sedgeWhoGrooved = Object.values(nextState.units).find(
        ({ pos, unitClassId }) =>
          unitClassId == 'commander_sedge' &&
          Math.abs(pos.x - u.pos.x) + Math.abs(pos.y - u.pos.y) == 1
      )
      if (sedgeWhoGrooved) {
        return withFlags({ action: 'groove', unit: units['u_'+sedgeWhoGrooved.id], otherUnits: mergeUnits(flags.died, flags.damaged) })
      }
    }
  }

  if (unitsDelta.length == 1) {
    if (flags.gained && flags.hadTurn?.[0].unitClassId == 'thief_with_gold') {
      return withFlags({ action: 'deposit', unit: flags.hadTurn[0] })
    }
  } else if (unitsDelta.length == 2) {
    if (flags.captured && flags.captured[0].garrisonClassId == 'garrison') {
      let unit = flags.hadTurn?.find((u) => u.id != flags.captured[0].id)
      return withFlags({
        action: 'capture',
        unit,
        otherUnits: [flags.captured[0]],
      })
    }

    if (flags.spawned) {
      let builder = flags.hadTurn?.find((u) => u.garrisonClassId)
      if (builder) {
        return withFlags({
          action: 'build',
          unit: builder,
          otherUnits: flags.spawned,
          spentGold: flags.spent,
        })
      }
    }

    if (flags.stole && flags.hadTurn?.[0].unitClassId == 'thief') {
      return withFlags({
        action: flags.decapped ? 'steal' : 'heist',
        unit: flags.hadTurn[0],
        otherUnits: flags.decapped,
        // amount
      })
    }

    if (flags.loaded) {
      return withFlags({
        action: 'load',
        unit: flags.loaded[0],
        otherUnits: flags.load,
      })
    }
  }

  if (
    flags.spent &&
    flags.damaged?.[0].garrisonClassId &&
    flags.healed?.[0].playerId == flags.damaged?.[0].playerId
  ) {
    return withFlags({
      action: 'reinforce',
      unit: flags.healed[0],
      otherUnits: flags.damaged,
    })
  }

  if (flags.decapped) {
    return withFlags({
      action: 'decap',
      unit: flags.hadTurn?.[0],
      otherUnits: flags.decapped,
    })
  }

  if (flags.unloaded) {
    return withFlags({
      action: 'unload',
      unit: flags.unload?.[0],
      otherUnits: flags.unloaded,
    })
  }

  if (flags.hadTurn?.length == 1 && flags.hadTurn[0].playerId == playerId) {
    let unit = flags.hadTurn[0]

    if (flags.spent) {
      let classId = unit.unitClassId
      if (classId == 'witch') {
        return withFlags({
          action: 'hex',
          unit,
          otherUnits: (flags.damaged || []).concat(flags.died || []),
        })
      }
      if (classId == 'mage') {
        return withFlags({ action: 'heal', unit, otherUnits: flags.healed })
      }
    }

    if (flags.died) {
      return withFlags({ action: 'kill', unit, otherUnits: flags.died })
    }

    if (flags.damaged) {
      return withFlags({
        action: 'attack',
        unit,
        otherUnits: flags.damaged.filter((a) => a.playerId != playerId),
      })
    }
  }

  if (flags.died?.length == 1 && flags.died[0].playerId == playerId) {
    return withFlags({
      action: 'suicide',
      unit: flags.died[0],
      otherUnits: flags.damaged,
    })
  }

  if (flags.posChanged) {
    let isVine = flags.posChanged[0].unitClassId == 'vine'

    return withFlags({
      action: isVine ? 'reposition' : 'move',
      unit: flags.posChanged[0],
    })
  }

  if (flags.reloaded) {
    return withFlags({ action: 'reload', unit: flags.reloaded[0] })
  }

  if (flags.hadTurn) {
    return withFlags({ action: 'wait', unit: flags.hadTurn[0] })
  }
}

function setDeltaUnitFlags(
  [unit, d]: [UnitData, jsondiffpatch.Delta],
  setFlag: (flag: keyof ActionFlags, value: UnitData) => void
) {
  if (!unit) return
  let [u, , removedUnit] = getDeltaVal(d)

  if (removedUnit) return setFlag('died', unit)
  if (u) return setFlag('spawned', unit)

  let [newGroove, oldGroove] = getDeltaVal(d.grooveCharge)
  if (newGroove < oldGroove) {
    setFlag('grooved', unit)
  }

  if (d.pos) {
    setFlag('posChanged', unit)
  }

  let [hadTurn] = getDeltaVal(d.hadTurn)
  if (hadTurn) {
    setFlag('hadTurn', unit)
  }

  let [newHealth, prevHealth] = getDeltaVal(d.health)
  if (newHealth < prevHealth) {
    setFlag('damaged', unit)
  }
  if (newHealth > prevHealth) {
    setFlag('healed', unit)
  }

  let [newPlayerId, oldPlayerId] = getDeltaVal(d.playerId)
  if (oldPlayerId === -1) {
    setFlag('captured', unit)
  }
  if (newPlayerId === -1) {
    setFlag('decapped', unit)
  }

  let [newInTransport, oldInTransport] = getDeltaVal(d.inTransport)
  if (newInTransport === true) {
    setFlag('loaded', unit)
  }
  if (newInTransport === false) {
    setFlag('unloaded', unit)
  }

  if (d.loadedUnits) {
    if (d.hadTurn) {
      setFlag('unload', unit)
    } else {
      setFlag('load', unit)
    }
  }

  // loaded units
  //let [newLoadedUnits, oldLoadedUnits] = getDeltaVal(d.loadedUnits)

  getDeltaArrayVal(d.state).forEach(([i, [newV, oldV, removed]]) => {
    let { key } = unit.state[i]
    if (key == 'ammo') {
      let [newVal, oldVal] = getDeltaVal(newV?.value)
      if (+newVal > +oldVal) {
        setFlag('reloaded', unit)
      }
    }
  })
}

function getDeltaVal(d: jsondiffpatch.Delta): [any, any, boolean] {
  if (d instanceof Array) {
    let [oldV, newV, deleted] = d
    if (d.length == 3 && deleted === 0) return [undefined, oldV, true]
    else if (d.length == 1) return [oldV, undefined, false]
    else return [newV, oldV, false]
  }

  return [undefined, undefined, false]
}

function getDeltaArrayVal(d: jsondiffpatch.Delta) {
  let changes: [string, [any, any, boolean]][] = []

  if (d?._t == 'a') {
    for (let i in d) {
      if (i == '_t') continue
      if (i.startsWith('_')) {
        i = i.substr(1)
        let [oldV, newIndex, op] = d[i]
        changes.push([i, [undefined, oldV, true]])
        if (op === 3) {
          changes.push([newIndex, [oldV, undefined, false]])
        }
      } else {
        changes.push([i, [d[i], undefined, false]])
      }
    }
  }

  return changes
}

function getDataSet(
  datasets: ChartDataset[],
  index: number,
  dataset: Partial<ChartDataset<'line', number[]>>
): ChartDataset {
  return (datasets[index] =
    datasets[index] || Object.assign({ data: [] }, dataset))
}

export interface UnitHistoryLog {
  log: ActionLog
  isMain: boolean
  entry: Entry
}
export interface UnitHistoryPath {
  x: number
  y: number
  captureId?: number | string
}

export interface UnitHistory {
  id: string
  buildId: string
  unit: UnitData
  logs: UnitHistoryLog[]
  path: UnitHistoryPath[]
}

export class MatchHistory {
  private unitHistories: UnitHistory[]

  constructor(private match: Match, private depth: number = 4) {
    this.generate()
    //console.log(this.unitHistories)
  }

  private generate() {
    this.unitHistories = []
    let unitHistories: { [id: string]: UnitHistory } = {}

    const makeHistory = (unit: UnitData, buildId: string) => {
      const id = String(unit.id)
      if (!unitHistories[id]) {
        unitHistories[id] = {
          id,
          buildId,
          unit,
          logs: [],
          path: [],
        }
        this.unitHistories.push(unitHistories[id])
      }
    }

    const entries = this.match.getEntries()

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const {
        state: { playerId, turnNumber },
        actionLog,
      } = entry

      if (turnNumber > this.depth) break

      if (!actionLog) continue

      let {
        action,
        unit,
        otherUnits,
        flags: { died = [], captured = [], spawned = [] } = {},
      } = actionLog

      if (action == 'match_start') {
        otherUnits.forEach((u) => makeHistory(u, `U-T0-B${u.id}`))
      }

      if (spawned.length) {
        spawned.forEach((u) => makeHistory(u, `U-T${turnNumber}-B${unit.id}`))
      }

      const pushHistoryLog = (u: UnitData) => {
        let isMain = u == unit
        let h = unitHistories[u.id]
        if (!h) return

        h.logs.push({ log: actionLog, isMain, entry })

        if (isMain) {
          let captureId = action == 'capture' ? captured[0]?.id : undefined
          h.path.push({ x: u.pos.x, y: u.pos.y, captureId })
        }

        if (died.includes(u)) {
          delete unitHistories[u.id]
        }
      }

      if (unit) {
        pushHistoryLog(unit)
      }

      otherUnits?.forEach((unit) => {
        pushHistoryLog(unit)
      })
    }
  }

  getUnitsHistory() {
    return Array.from(this.unitHistories)
  }
}
