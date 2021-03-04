import * as jsondiffpatch from 'jsondiffpatch'
import 'chart.js'
import { ChartConfiguration, ChartData, ChartDataSets } from 'chart.js'

const diffpatcher = jsondiffpatch.create()

export type MatchData = {
  map: {
    size: Pos,
    tiles: string
  },

  players: LuaArray<Player>

  state: State,
  deltas: jsondiffpatch.Delta[]
}

type LuaArray<T> = T[] | Record<number,T>

export interface Pos { x: number, y: number, facing?: number }

export interface Player {
  id: number,
  team: number,
  is_victorious: boolean,
  is_local: boolean,
  is_human: boolean
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
  unitClass: UnitClass
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
  id: number
  playerId: number
  turnNumber: number
  gold: Record<number,number>
  units: LuaArray<Unit>
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

  currentTurn: PlayerTurn | null = null
  currentEntry: Entry | null = null

  static load(id?: string){
    return loadMatchData(id).then(matchData => {
      return new Match(matchData)
    })
  }

  constructor(private matchData: MatchData){
    let states = generateStates(matchData)

    this.entries = states.map(state => ({
      get id(){
        return this.state.id
      },
      state,
      status: getStateStatus(state),
    }))

    this.turns = getPlayerTurns(this.entries, this.getPlayers().length)

    this.selectEntry(0)

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
    return this.matchData.map
  }

  getPlayers(){
    return Object.values(this.matchData.players)
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


    for(let entry of this.entries){
      let { status, turn: { turnNumber, playerId, entries: tEntries } } = entry
      labels.push(`T${turnNumber}-P${playerId+1}-M${tEntries.indexOf(entry) + 1}`)

      Object.entries(status).forEach(([playerIdStr, { income, armyValue, unitCount, combatUnitCount }], i)=> {
        let playerId = +playerIdStr
        let colorRGB = Phaser.Display.Color.IntegerToRGB(getPlayerColor(playerId))
        let color = Phaser.Display.Color.RGBToString(colorRGB.r, colorRGB.g, colorRGB.b, colorRGB.a);

        getDataSet(incomeDataSet, i, { label: `P${playerId + 1} Income`, borderColor: color }).data.push(income)
        getDataSet(armyValueDataSet, i, { label: `P${playerId + 1} Army Value`, borderColor: color }).data.push(armyValue)
        getDataSet(unitCountDataSet, i, { label: `P${playerId + 1} Unit Count`, borderColor: color }).data.push(unitCount)
        getDataSet(combatUnitCountDataSet, i, { label: `P${playerId + 1} Combat Unit Count`, borderColor: color }).data.push(combatUnitCount)
      })
    }

    return [{
      type: 'line',
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
        data: {
          labels,
          datasets: unitCountDataSet
        }
      }, {
        type: 'line',
        data: {
          labels,
          datasets: combatUnitCountDataSet
        }
      }]
  }
}

export async function loadMatchData(id?: string): Promise<MatchData|null>{
  let url = new URL(location.href)
  if(id){
    url.searchParams.set('match_id', id)
    history?.replaceState(null, null, url.href)
  }
  let match_id = url.searchParams.get('match_id')

  let matchUrl = new URL('https://wargroove-match-worker.gp27.workers.dev')
  matchUrl.searchParams.set('match_id', match_id)

  return fetch(matchUrl.href).then(res => {
    return res.json().catch(err => null)
  })
}

function generateStates({ state, deltas }: MatchData){
  let states: State[] = [
    diffpatcher.clone(state)
  ]

  for(let delta of deltas.reverse()){
    let prev = diffpatcher.clone(states[0])
    states.unshift(diffpatcher.unpatch(prev, delta))
  }

  console.log(states)

  return states
}

function getStateStatus({ units }: State){
  let meta: Status = {}

  for(let i in units){
    let unit = units[i]
    if(!unit) continue

    let { playerId, unitClassId, unitClass: { cost } } = unit
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

    if (!['city', 'hq', 'barracks', 'port', 'tower'].includes(unitClassId)){
      playerMeta.combatUnitCount++
      playerMeta.armyValue += cost
    }
  }

  return meta
}

function getPlayerTurns(entries: Entry[], n: number){
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
    entry.moveNumber = turn.entries.length
  }

  return turns
}

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
  plains:     "p",
  road:       "r",
  sea:        "s"
}

export const terrainAbbrvs: Record<string,string> = Object.entries(terrains)
  .reduce((o, [key, val]) => (o[val] = key, o), {})


export const terrainColors = {
  forest: 0x277d23,
  river: 0x9ad6d4,
  mountain: 0x5c3600,
  reef: 0x33312e,
  wall: 0x333333,
  bridge: 0xd9d9d9,
  ocean: 0x03005c,
  beach: 0xf0e8a5,
  cobblestone: 0x9c9c9c,
  plains: 0xadd49f,
  road: 0xe0cea4,
  sea: 0x549af0
}

export function getPlayerColor(playerId: number){
  return ({
    '-1': 0xaaaaaa,
    '0': 0xff0000,
    '1': 0x0000ff
  })[playerId] || 0xffffff
}

export function getPlayerColorString(playerId: number) {
  return VBColorToHEX(getPlayerColor(playerId))
}

function VBColorToHEX(i) {
  var bbggrr = ("000000" + i.toString(16)).slice(-6);
  var rrggbb = bbggrr.substr(4, 2) + bbggrr.substr(2, 2) + bbggrr.substr(0, 2);
  return "#" + rrggbb;
}
