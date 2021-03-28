import * as jsondiffpatch from 'jsondiffpatch'
import 'chart.js'
import { ChartConfiguration, ChartData, ChartDataSets } from 'chart.js'
import { getCommanderMeta, PlayerColor, playerColors, Terrain, terrainAbbrvs, terrainPriorities } from './match-utils'

const diffpatcher = jsondiffpatch.create()

type LuaArray<T> = T[] | Record<number, T>

export type MatchData = {
  match_id: string
  map: {
    size: Pos,
    tiles: string
  },

  players: LuaArray<Player>

  state: State,
  deltas: LuaArray<jsondiffpatch.Delta>
}

export interface Pos { x: number, y: number, facing?: number }

export interface Player {
  id: number,
  team: number,
  is_victorious: boolean,
  is_local: boolean,
  is_human: boolean

  commander?: string
  faction?: string
  username?: string
  color?: PlayerColor
}

export interface Unit {
  id: number,
  garrisonClassId: string,
  transportedBy: number,
  unitClassId: string,
  loadedUnits: LuaArray<number>,
  damageTakenPercent: number,
  grooveId: string,
  playerId: number,
  health: number,
  hadTurn: boolean,
  inTransport: boolean,
  state: LuaArray<{ key: string, value: any }>,
  attackerId: number,
  pos: Pos,
  canBeAttacked: boolean,
  grooveCharge: number,
  attackerUnitClass: string,
  attackerPlayerId: number,
  killedByLosing: boolean,
  recruits: LuaArray<string>,
  startPos: Pos,
  unitClass?: UnitClass
}

export interface UnitClass {
  id: string,
  weapons: LuaArray<Weapon>,
  inAir: boolean,
  moveRange: number,
  isCommander: boolean,
  tags: LuaArray<string>,
  cost: number,
  passiveMultiplier: number,
  transportTags: LuaArray<string>,
  isStructure: boolean,
  canReinforce: boolean,
  loadCapacity: number,
  weaponIds: LuaArray<string>,
  maxGroove: number,
  canBeCaptured: boolean,
  maxHealth: number
}

export interface Weapon {
  id: string,
  directionality: string,
  maxRange: number,
  minRange: number,
  horizontalAndVerticalOnly: boolean,
  terrainExclusion: LuaArray<string>,
  canMoveAndAttack: boolean,
  horizontalAndVerticalExtraWidth: number
}

export interface State {
  playerId: number
  turnNumber: number
  gold: Record<number,number>
  units: LuaArray<Unit>
  unitClasses?: Record<string,UnitClass>
}

export type Status = Record<number,{
  income: number
  armyValue: number
  unitCount: number // hq does not count
  combatUnitCount: number
  //activeUnitCount: number
}>

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
  turn?: PlayerTurn
  moveNumber?: number
}

export class Match {

  private entries: Entry[]
  private turns: PlayerTurn[]
  private players: Player[]
  private map: {
    size: {
      x: number
      y: number
    }
    tiles: {
      terrain: Terrain,
      corners: boolean[],
      x: number
      y: number
    }[]
  }

  currentTurn: PlayerTurn | null = null
  currentEntry: Entry | null = null

  /*static load(id?: string){
    return loadMatchData(id).then(matchData => {
      if(!matchData) return
      return new Match(matchData)
    })
  }*/

  static isValid({ match_id, map, players, state, deltas }: any = {}){
    return match_id && map && players && state && deltas
  }

  constructor(private matchData: MatchData){
    let states = generateStates(matchData)

    this.entries = states.map((state, id) => ({
      id,
      state,
      status: generateStateStatus(state),
    }))

    this.players = generatePlayers(this.entries, this.matchData)
    this.turns = generatePlayerTurns(this.entries, this.getPlayers().length)
    this.map = generateMap(matchData)

    this.selectEntry(this.getWinners().length ? 0 : this.entries.length - 1)

    console.log(this)
  }

  selectEntry(entryId: number) {
    this.currentEntry = this.entries.find(e => e.id == entryId) || this.entries[0]
    this.currentTurn = this.currentEntry.turn
    return this.currentEntry
  }

  getCurrentEntry(){
    return this.currentEntry
  }

  getCurrentTurn() {
    return this.currentTurn
  }

  getEntries(){
    return this.entries
  }

  getTurns() {
    return this.turns
  }

  getMap(){
    return this.map
  }

  getWinners(){
    return this.getPlayers().filter(p => p.is_victorious)
  }

  getPlayers(){
    return this.players
  }

  getPlayerColorHex(playerId){
    let color = this.players[playerId].color || 'grey'
    return playerColors[color].hex
  }

  changePlayerColor(playerId: number, color: PlayerColor){
    let p = this.players[playerId]
    if(p &&  color in playerColors && !this.players.find(p => p.color == color)){
      p.color = color
    }
  }

  getCurrentCombatUnits(playerId?: number){
    let players = this.getPlayers()
    let relativePlayerId = (playerId, currentPlayerId) => (playerId - currentPlayerId + players.length) % players.length

    let entry = this.getCurrentEntry()

    return Object.values(entry.state.units)
      .filter(u => playerId === undefined ? u.playerId >= 0 : u.playerId == playerId)
      .filter(u => !u.garrisonClassId)
      .sort((u1, u2) => {

        let deltaPlayer = relativePlayerId(u1.playerId, entry.state.playerId) - relativePlayerId(u2.playerId, entry.state.playerId)
        
        if(deltaPlayer != 0) return deltaPlayer

        return Number(u2.unitClass.isCommander) - Number(u1.unitClass.isCommander)
      })
  }

  getCharts(): ChartConfiguration[] {
    function getDataSet(datasets: ChartDataSets[], index: number, dataset: ChartDataSets = {}): ChartDataSets{
      return datasets[index] = datasets[index] || Object.assign({ data: [] }, dataset)
    }

    let labels: string[] = []

    let incomeDataSet: ChartDataSets[] = []
    let armyValueDataSet: ChartDataSets[] = []
    let unitCountDataSet: ChartDataSets[] = []
    let combatUnitCountDataSet: ChartDataSets[] = []

    let pointBackgroundColor: string[] = []


    for(let entry of this.entries){
      let { status, turn: { turnNumber, playerId, entries: tEntries } } = entry
      labels.push(`T${turnNumber}-P${playerId+1}-M${tEntries.indexOf(entry) + 1}`)

      let color = this.getPlayerColorHex(playerId)
      pointBackgroundColor.push(color)

      Object.entries(status).forEach(([playerIdStr, { income, armyValue, unitCount, combatUnitCount }], i)=> {
        let playerId = +playerIdStr
        let color = this.getPlayerColorHex(playerId)

        getDataSet(incomeDataSet, i, { label: `P${playerId + 1} Income`, borderColor: color, pointBackgroundColor }).data.push(income)
        getDataSet(armyValueDataSet, i, { label: `P${playerId + 1} Army Value`, borderColor: color, pointBackgroundColor }).data.push(armyValue)
        getDataSet(unitCountDataSet, i, { label: `P${playerId + 1} Unit Count`, borderColor: color, pointBackgroundColor }).data.push(unitCount)
        getDataSet(combatUnitCountDataSet, i, { label: `P${playerId + 1} Combat Unit Count`, borderColor: color, pointBackgroundColor }).data.push(combatUnitCount)
      })
    }

    return [{
      type: 'line',
      options: {
        scales: {
          yAxes: [{
            ticks: { stepSize: 100 }
          }]
        }
      },
      data: {
        labels,
        datasets: incomeDataSet
      }
    }, {
        type: 'line',
        data: {
          labels,
          datasets: armyValueDataSet
        }
      }, {
        type: 'line',
        options: {
          scales: {
            yAxes: [{
              ticks: { stepSize: 1 }
            }]
          }
        },
        data: {
          labels,
          datasets: unitCountDataSet
        }
      }, {
        type: 'line',
        options: {
          scales: {
            yAxes: [{
              ticks: { stepSize: 1 }
            }]
          }
        },
        data: {
          labels,
          datasets: combatUnitCountDataSet
        }
      }]
  }
}

function generateStates({ state, deltas }: MatchData){
  let states: State[] = [
    diffpatcher.clone(state)
  ]

  for(let delta of Object.values(deltas).reverse()){
    let prev = diffpatcher.clone(states[0])
    states.unshift(diffpatcher.unpatch(prev, delta))
  }

  states.forEach(({ units = {}, unitClasses = {} }) => {
    Object.values(units).forEach(unit => {
      if(!unit.unitClass){
        unit.unitClass = unitClasses[unit.unitClassId]
      }
    })
  })

  return states
}

function generateStateStatus({ units }: State){
  let meta: Status = {}

  for(let i in units){
    let unit = units[i]
    if(!unit) continue

    let { playerId, health, unitClassId, unitClass: { cost } } = unit
    if(playerId < 0) continue

    let playerMeta = meta[playerId]

    if(!playerMeta){
      playerMeta = meta[playerId] = {
        income: 100,
        armyValue: 0,
        unitCount: 0,
        combatUnitCount: 0
      }
    }
    
    if (['city', 'hq'].includes(unitClassId)){
      playerMeta.income += 100
    }

    if(unitClassId != 'hq'){
      playerMeta.unitCount++
    }

    if (!['city', 'hq', 'barracks', 'port', 'tower', 'hideout'].includes(unitClassId)){
      playerMeta.combatUnitCount++
      playerMeta.armyValue += Math.round(cost * health / 100)
    }
  }

  return meta
}

function generatePlayers(entries: Entry[], { players }: MatchData){
  let commanderUnits = Object.values(entries[0].state.units).filter(u => u.unitClass.isCommander)

  let comm: Record<number,{ commander: string, faction: string, color: PlayerColor }> = {}

  let takenColors: Partial<Record<PlayerColor,boolean>> = {}

  for(let c of commanderUnits){
    let commander = c.unitClassId.replace(/commander_/, '')
    let { color, faction } = getCommanderMeta(commander)
    
    if(takenColors[color]){
      color = (Object.keys(playerColors) as PlayerColor[]).find(c => !takenColors[c])
    }
    takenColors[color] = true

    comm[c.playerId] = {
      commander,
      color,
      faction
    }
  }
  

  return Object.values(players).map(p => Object.assign({}, p, comm[p.id]))
}

function generatePlayerTurns(entries: Entry[], n: number){
  let turns: PlayerTurn[] = []
  let turnsById: Record<string, PlayerTurn> = {}

  for(let entry of entries){
    let { playerId, turnNumber } = entry.state

    let id = (turnNumber - 1) * n + playerId
    let turn = turnsById[id]

    if(!turn){
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

function generateMap(matchData: MatchData) {
  let { size: { x, y }, tiles: strData } = matchData.map
  let linearData = strData.split('')
  let matrixData: string[][] = []
  while (linearData.length) {
    matrixData.push(linearData.splice(0, x))
  }

  let tiles: Match['map']['tiles'] = []

  matrixData.forEach((row, y, rows) => {
    row.forEach((v, x, cRow) => {
      let pRow = rows[y - 1] || []
      let nRow = rows[y + 1] || []

      let corners = [
        v == pRow[x - 1],
        v == pRow[x],
        v == pRow[x + 1],
        v == cRow[x - 1],
        v == cRow[x + 1],
        v == nRow[x - 1],
        v == nRow[x],
        v == nRow[x + 1]
      ]

      tiles.push({
        x, y,
        terrain: terrainAbbrvs[v],
        corners
      })
    })
  })

  tiles.sort((a, b) => {
    return terrainPriorities.indexOf(a.terrain) - terrainPriorities.indexOf(b.terrain)
  })

  return {
    size: {x, y},
    tiles
  } as Match['map']
}