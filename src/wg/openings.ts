import { MatchHistory, Match, UnitHistoryLog, ActionLog } from './match'
import { Minhash } from 'minhash'
import { clusterData } from '@greenelab/hclust'
import { MapFinder, MapInfo } from './map-utils'

export class Opening {
  private shinglings: {
    [playerId: number]: string[][]
  }
  private shinglingSets: { [playerId: string]: Set<string> }
  private minHashes: { [playerId: string]: Minhash }

  private history: MatchHistory

  constructor(private match: Match, private depth = 4) {
    this.generateShinglings()
    this.genShinglingsSet()
  }

  private generateShinglings() {
    this.shinglings = {}
    this.match.getPlayers().forEach(({ id }) => {
      this.shinglings[id] = Array(this.depth)
        .fill(0)
        .map(() => [])
    })

    this.history = new MatchHistory(this.match, this.depth)
    this.history
      .getUnitsHistory()
      .forEach(({ id, unit: initialUnit, buildId, logs, path }) => {
        logs.forEach((unitLog, i) => {
          const {
            log: { action, unit, otherUnits },
            isMain,
            entry: {
              state: { playerId, turnNumber, gold },
            },
          } = unitLog
          const isMatchStart = action == 'match_start'

          const shinglings = this.shinglings[isMatchStart ? initialUnit.playerId : playerId]?.[isMatchStart ? 0 : turnNumber]
          if(!shinglings) return
          if (i === 0) {
            shinglings.push(
              [
                buildId,
                'C',
                initialUnit.unitClassId.replace(/^commander_.*/, 'commander'),
              ].join(':')
            )
          }

          if (action == 'end_turn') {
            shinglings.push(
              ['saved-gold', gold['p_' + playerId] || 0].join(':')
            )
          }

          if (!isMain || action == 'wait') return
          shinglings.push(
            [buildId, 'A', action].join(':'),
            [buildId, 'M', `x${unit.pos.x}-y${unit.pos.y}`].join(':')
          )

          if (
            (
              ['capture', 'reinforce', 'decap'] as ActionLog['action'][]
            ).includes(action)
          ) {
            shinglings.push(
              [
                action,
                otherUnits
                  .map((u) => u.id)
                  .sort()
                  .join(','),
              ].join(':')
            )
          }
        })
      })
    //console.log(this.shinglings)
  }

  private genShinglingsSet() {
    const sets: Record<string,Set<string>> = {}

    for(let playerId in this.shinglings){
      sets[playerId] = new Set<string>()
      for(let turnNumber in this.shinglings[playerId]){
        this.shinglings[playerId][turnNumber].forEach(s => {
          sets[playerId].add(`[P${+playerId+1}][T${turnNumber}][${s}]`)
        })
      }
    }

    this.shinglingSets = sets
  }

  private genMinHashes(){
    this.minHashes = {}
    for(let playerId in this.shinglingSets){
      const h = this.minHashes[playerId] = new Minhash()
      for(let shingle of this.shinglingSets[playerId]){
        h.update(shingle)
      }
    }
  }

  setDepth(depth: number) {
    this.depth = depth
  }

  getMinhashes(){
    if(!this.minHashes){
      this.genMinHashes()
    }
    return { ...this.minHashes }
  }

  getShinglingSets(){
    return { ...this.shinglingSets }
  }
}

export class OpeningsClusters {
  private openings: Opening[]
  private playersN: number
  distances: { [playerId: string]: number[][] }
  clusterized: any[]

  constructor(private matches: Match[]) {
    this.playersN = matches[0]?.getPlayers().length
    this.openings = matches.map((match) => new Opening(match))
    this.clusterized = this.clusterize()
    //console.log(this.generateJaccardDistances(), this.generateMinhashDistances())
  }

  private generateMinhashDistances(){
    let dist: OpeningsClusters['distances'] = {}
    this.openings.forEach((opA, i) => {
      let mhA = opA.getMinhashes()
      this.openings.forEach((opB, j) => {
        let mhB = opB.getMinhashes()

        for(let playerId in mhA){
          let table = dist[playerId] = dist[playerId] || []
          let row = table[i] = table[i] || []
          row[j] = 1 - mhA[playerId].jaccard(mhB[playerId])
        }
      })
    })
    return dist
  }

  private generateJaccardDistances(){
    let dist: OpeningsClusters['distances'] = {}
    this.openings.forEach((opA, i) => {
      let shA = opA.getShinglingSets()
      this.openings.forEach((opB, j) => {
        let shB = opB.getShinglingSets()

        for (let playerId in shA) {
          let table = (dist[playerId] = dist[playerId] || [])
          let row = (table[i] = table[i] || [])

          let union = new Set([...shA[playerId], ...shB[playerId]])
          let inters = new Set(
            [...shA[playerId]].filter((s) => shB[playerId].has(s))
          )
          row[j] = (union.size - inters.size) / union.size
        }
      })
    })
    return dist
  }

  private clusterize(){
    let iterPlayerId = Array(this.playersN).fill(0).map((_, i) => i)
    let data = this.openings.map((row, opI) => [opI])

    let dist = iterPlayerId.map(playerId => ([opIa], [opIb]) => {
      let shA = this.openings[opIa].getShinglingSets()[playerId]
      let shB = this.openings[opIb].getShinglingSets()[playerId]

      let union = new Set([...shA, ...shB])
      let inters = new Set([...shA].filter(s => shB.has(s)))
      return (union.size - inters.size) / union.size
    })


    return iterPlayerId.map(playerId => {
      let { clusters, distances } = clusterData({ data, distance: dist[playerId] })
      console.log(distances)
      return clusters
    })
  }
}

export class OpeningGroups {
  private matchMaps: (readonly [Match, MapInfo])[]
  private groups: Record<
    string,
    {
      id: string
      name: string
      playersN: number
      mapInfo: MapInfo
      matches: Match[]
    }
  >

  constructor(matches: Match[], mapFinder: MapFinder) {
    this.matchMaps = matches.map(
      (match) => [match, mapFinder.getMapInfo(match)] as const
    ).sort(([, { map: mA, version: vA }], [, { map: mB, version: vB }]) => {
      let nc = mA?.name.localeCompare(mB?.name)
      if(nc != 0) return nc
      return vA?.code.localeCompare(vB?.v)
    })
    //.filter(([match, mapInfo]) => mapInfo.version)
    this.groupMatchesByMap()
  }

  private groupMatchesByMap() {
    const groups: OpeningGroups['groups'] = {}
    this.matchMaps.forEach(([match, mapInfo]) => {
      let {
        tileHash,
        stateHash,
        map: { name: mapName = 'Unknonwn Map' } = {},
        version: { v = '' } = {},
      } = mapInfo
      if(!mapInfo.map) return
      let id = [tileHash, stateHash].join(':')
      let name = [mapName, v].filter((A) => A).join(' ')
      let playersN = match.getPlayers().length
      groups[id] = groups[id] || { id, name, playersN, matches: [], mapInfo }
      groups[id].matches.push(match)
    })
    this.groups = groups
  }

  getGroups() {
    return Object.values(this.groups)
  }

  getOpeningCluster(groupId: string) {
    let group = this.groups[groupId]
    if (!group) return
    return new OpeningsClusters(group.matches)
  }
}