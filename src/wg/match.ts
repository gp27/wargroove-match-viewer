import * as jsondiffpatch from 'jsondiffpatch'
import 'chart.js'
import { ChartConfiguration, ChartDataSets } from 'chart.js'
import { getCommanderMeta, PlayerColor, playerColors } from './match-utils'
import {
  Biome,
  Terrain,
  terrains,
  tilesFromLinear,
} from '../phaser/phaser-wargroove-map'

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
    let states = generateStates(matchData)

    this.entries = states.map((state, id) => ({
      id,
      state,
      status: generateStateStatus(state, matchData),
    }) as Entry)

    this.players = generatePlayers(this.entries, matchData)
    this.turns = generatePlayerTurns(this.entries, this.getPlayers().length)
    this.map = generateMap(matchData, states[0])
    this.isFog = Boolean(matchData.fog_blocks?.length || matchData.is_fog)

    this.selectEntry(this.getWinners().length ? 0 : this.entries.length - 1)

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
  ): ChartConfiguration[] {

    let labels: string[] = []

    let incomeDataSet: ChartDataSets[] = []
    let armyValueDataSet: ChartDataSets[] = []
    let unitCountDataSet: ChartDataSets[] = []
    let combatUnitCountDataSet: ChartDataSets[] = []

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
          [playerIdStr, { income, armyValue, unitCount, combatUnitCount }],
          i
        ) => {
          let playerId = +playerIdStr
          let color = this.getPlayerColorHex(playerId)

          getDataSet(incomeDataSet, i, {
            label: `P${playerId + 1} Income`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(income)

          getDataSet(armyValueDataSet, i, {
            label: `P${playerId + 1} Army Value`,
            borderColor: color,
            pointBackgroundColor,
          }).data?.push(armyValue)

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
            yAxes: [
              {
                ticks: { stepSize: 100 },
              },
            ],
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
            yAxes: [
              {
                ticks: { stepSize: 1 },
              },
            ],
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
            yAxes: [
              {
                ticks: { stepSize: 1 },
              },
            ],
          },
        },
        data: {
          labels,
          datasets: combatUnitCountDataSet,
        },
      },
    ]
  }

  getAverageCharts(){
    return this.getTurnEndCharts().map(chart => {
      let { data: { datasets } } = chart

      let newDSet = datasets.map(({ data, label, borderColor }) =>{
        const n = datasets.length

        return {
          data: data.map((v, i, a) => {
            if((i % n) != 0 || i + n > a.length) return
            return (
              a.slice(i, i + n).reduce((a, b) => a + b, 0) / n
            )
          }).filter(A => A !== undefined),
          label: label + ' Avg',
          borderColor
        }

      })

      return { data: { labels: newDSet[0].data.map((_, i) => `Turn ${i+1}`), datasets: newDSet } }
    })
  }

  getTurnEndCharts() {
    return this.getCharts((entry) => {
      return entry.turn.entries.slice(-1)[0] == entry
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

    if (['city', 'hq'].includes(unitClassId)) {
      playerStatus.income += 100
    }

    if (unitClassId != 'hq') {
      playerStatus.unitCount++
    }

    if (
      !['city', 'hq', 'barracks', 'port', 'tower', 'hideout'].includes(
        unitClassId
      )
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

interface DeltaInfo {
  end_turn?: boolean
  spent_gold?: number
  lost_gold?: number
  new_unit?: string
}

function analyzeDelta(delta: jsondiffpatch.Delta): string[] {
  if (delta.playerId) return ['end_turn']
  return []
}


function getDataSet(
  datasets: ChartDataSets[],
  index: number,
  dataset: ChartDataSets = {}
): ChartDataSets {
  return (datasets[index] =
    datasets[index] || Object.assign({ data: [] }, dataset))
}