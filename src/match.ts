import * as jsondiffpatch from 'jsondiffpatch'

const diffpatcher = jsondiffpatch.create()

export type Match = {
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

export interface StateMeta {
  income: number
  armyValue: number
  unitCount: number // hq does not count
  combatUnitCount: number
  //activeUnitCount: number
}

export interface PlayerTurn {
  id: number
  turnNumber: number
  playerId: number
  states: State[]
  meta: Record<number,StateMeta>[]
}

export function getMatchStates(match: Match){
  let states: State[] = [
    diffpatcher.clone(match.state)
  ]

  for(let delta of match.deltas){
    let prev = diffpatcher.clone(states[states.length - 1])
    states.push(diffpatcher.patch(prev, delta))
  }

  return states
}

export function getStateMetadata({ units }: State){
  let metas: Record<number,StateMeta> = {}

  for(let i in units){
    let unit = units[i]
    if(!unit) continue

    let { playerId, unitClassId, unitClass: { cost } } = unit
    if(playerId < 0) continue

    let meta = metas[playerId]

    if(!meta){
      meta = metas[playerId] = {
        income: 100,
        armyValue: 0,
        unitCount: 0,
        combatUnitCount: 0
      }
    }
    
    if (['city', 'hq'].includes(unitClassId)){
      meta.income += 100
    }

    if(unitClassId != 'hq'){
      meta.unitCount++
    }

    if (!['city', 'hq', 'barracks', 'port', 'tower'].includes(unitClassId)){
      meta.combatUnitCount++
      meta.armyValue += cost
    }
  }

  return metas
}

export function getPlayerTurns(states: State[]){
  let groups: PlayerTurn[] = []
  let groupsById: Record<string, PlayerTurn> = {}

  for(let state of states){
    let { playerId, turnNumber } = state

    let id = turnNumber - 1 + playerId
    let group = groupsById[id]

    if(!group){
      group = { id, turnNumber, playerId, states: [], meta: [] }
      groupsById[id] = group
      groups.push(group)
    }

    group.states.push(state)
    group.meta.push(getStateMetadata(state))

    return groups
  }
}