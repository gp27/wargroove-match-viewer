import * as jsondiffpatch from 'jsondiffpatch'

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
}

export class Match {

  private entries: Entry[]
  private turns: PlayerTurn[]

  currentTurn: PlayerTurn | null = null
  currentEntry: Entry | null = null

  constructor(private matchData: MatchData){
    let states = generateStates(matchData)

    this.entries = states.map(state => ({
      get id(){
        return this.state.id
      },
      state,
      status: getStateStatus(state),
    }))

    this.turns = getPlayerTurns(this.entries)

    this.selectEntry(0)
  }

  selectEntry(entryId: number) {
    this.currentEntry = this.entries.find(e => e.id == entryId)
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
    return this.matchData.players
  }
}

function generateStates(matchData: MatchData){
  let states: State[] = [
    diffpatcher.clone(matchData.state)
  ]

  for(let delta of matchData.deltas){
    let prev = diffpatcher.clone(states[states.length - 1])
    states.push(diffpatcher.patch(prev, delta))
  }

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

function getPlayerTurns(entries: Entry[]){
  let turns: PlayerTurn[] = []
  let turnsById: Record<string, PlayerTurn> = {}

  for(let entry of entries){
    let { playerId, turnNumber } = entry.state

    let id = turnNumber - 1 + playerId
    let turn = turnsById[id]

    if(!turn){
      turn = { id, turnNumber, playerId, entries: [], mainEntry: entry }
      turnsById[id] = turn
      turns.push(turn)
    }

    entry.turn = turn
    turn.entries.push(entry)

  }

  return turns
}

export const terrains = {
  forest:   "F",
  river:    "I",
  mountain: "M",
  reefs:    "R",
  bridge:   "b",
  deepsea:  "d",
  beach:    "e",
  flagstone:"f",
  plains:   "p",
  road:     "r",
  sea:      "s"
}

export const terrainAbbrvs: Record<string,string> = Object.entries(terrains)
  .reduce((o, [key, val]) => (o[val] = key, o), {})


export const terrainColors = {
  forest: 0x277d23,
  river: 0x9ad6d4,
  mountain: 0x5c3600,
  reefs: 0x33312e,
  bridge: 0xd9d9d9,
  deepsea: 0x03005c,
  beach: 0xf0e8a5,
  flagstone: 0x9c9c9c,
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