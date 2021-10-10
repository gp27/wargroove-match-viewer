import levenshtein from 'js-levenshtein'
import { crc32 } from '../crc32'
import { db } from '../db'
import { mapRecords, sheetMapEntries } from './map-registry'
import { Match } from './match'

export interface MapIdentifiers {
  tileHash: string
  tileString: string
  stateHash: string
  stateString: string
}

export interface MapRecord {
  name: string
  author?: string
  footer?: string
  versions: Record<string, MapVersion>
  archived?: boolean
  isNew?: boolean
}

export type MapVersion = {
  v: string
  code: string
  notes?: string
  imgSrc?: string
  isLocal?: boolean
  //date?: Date | string
} & Partial<MapIdentifiers>

export type MapGuess = {
  map: MapRecord
  version?: MapVersion
}

export type MapInfo = MapIdentifiers & Partial<MapGuess>

export type MapEntry = Omit<MapRecord, 'versions'> & MapVersion

export class MapFinder {
  static SPECIAL_CODES = {
    '[In Game]': /included/i,
    '[Unknown]': /unknown/i,
  }

  static INITIAL_VERSION = '[Initial version]'

  maps: MapRecord[]
  entries: MapEntry[]
  byTileHash: {
    [tileHash: string]: [map: MapRecord, tileString?: string]
  }
  unseenMaps: { [name: string]: MapRecord }
  byCode: { [code: string]: [MapRecord, MapVersion] }

  constructor(maps: MapRecord[]) {
    this.maps = JSON.parse(JSON.stringify(maps))
    this.makeIndexes()
  }

  private normalizeName(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u00C0-\u017F]/g, '')
  }

  private getTileStrDistance(str1: string, str2: string) {
    if (str1.length != str2.length) return Infinity
    let d = 0
    for (let i = 0; i < str1.length; i++) {
      d += +(str1.charAt(i) != str2.charAt(i))
    }
    return d
  }

  private updateIndex(map: MapRecord) {
    const allVersions = Object.values(map.versions)
    const unseenVersions = allVersions.filter((v) => !v.tileHash)

    allVersions.forEach((version) => {
      let { tileHash, tileString, code } = version
      if (!code.startsWith('[')) {
        this.byCode[code] = [map, version]
      }

      if (tileHash) {
        this.byTileHash[tileHash] = [map, tileString]
      }
    })

    if (unseenVersions.length === allVersions.length) {
      const name = this.normalizeName(map.name)
      this.unseenMaps[name] = map
    }
  }

  private makeIndexes() {
    this.byTileHash = {}
    this.unseenMaps = {}
    this.byCode = {}

    for (let map of this.maps) {
      this.updateIndex(map)
    }
    this.mapsInfo = new WeakMap<Match, MapInfo>()
  }

  guess({
    tileHash,
    stateHash,
    tileString,
    code,
    v
  }: Partial<MapVersion>): MapGuess | undefined {
    return (
      this.find(tileHash, stateHash) ||
      this.findSimiliar(tileString, v, code) ||
      this.findByCode(code)
    )
  }

  private find(tileHash?: string, stateHash?: string): MapGuess | undefined {
    if (!tileHash) return
    let [map, str] = this.byTileHash[tileHash] || []
    let version = Object.values(map?.versions || {}).find(
      ({ stateHash: shash, tileHash: thash }) =>
        shash == stateHash && tileHash == thash
    )
    if (map) {
      return { map, version }
    }
  }

  /*private findEntry(tileHash?: string, stateHash?: string): MapGuess | undefined {
    const e = this.entries.find(e => e.tileHash == tileHash && e.stateHash == stateHash)
  }*/

  private findSimiliar(tileString?: string, v?: string, code?: string): MapGuess | undefined {
    if (!tileString) return

    let minDist = Infinity
    let minMap: MapRecord | undefined

    Object.values(this.byTileHash).forEach(([map, str]) => {
      if (!str) return
      const dist = this.getTileStrDistance(tileString, str)
      if (dist < minDist) {
        minDist = dist
        minMap = map
      }
    })

    if (minMap && minDist < tileString.length * 0.1) {
      return {
        map: minMap,
        version: Object.values(minMap.versions).find((ver) => ver.v == v),
      }
    }
  }

  private findByCode(code?: string): MapGuess | undefined {
    if (!code) return
    const [map, version] = this.byCode[code] || []
    if (map)
      return {
        map,
        version,
      }
  }

  searchByName(search: string) {
    const [map, dist] = this.searchListByName(search)[0] || []
    if (dist < 2) return map
  }

  searchListByName(search: string) {
    search = this.normalizeName(search)

    return Object.keys(this.unseenMaps)
      .map((name) => {
        const dist = levenshtein(search, name)
        return [name, dist] as [string, number]
      })
      .filter(([name, dist]) => dist < 5)
      .sort(([n1, d1], [n2, d2]) => d1 - d2)
      .map(
        ([name, dist]) => [this.unseenMaps[name], dist] as [MapRecord, number]
      )
  }

  private makeMapFromEntry({
    name,
    author,
    archived,
    isNew,
    isLocal,
    footer,
    code,
    v,
    notes,
    imgSrc,
    tileHash,
    tileString,
    stateHash,
    stateString,
  }: MapEntry): [MapRecord, MapVersion] {
    let key = code

    Object.entries(MapFinder.SPECIAL_CODES).forEach(([specialCode, regex]) => {
      if (key.match(regex)) {
        key = Math.random().toString(36).substr(2)
        code = specialCode
      }
    })
    let map = {
      name,
      author,
      archived,
      isNew,
      footer,
      versions: {
        [key]: {
          v,
          code,
          notes,
          imgSrc,
          tileHash,
          tileString,
          stateHash,
          stateString,
          isLocal,
        },
      },
    }

    map = JSON.parse(JSON.stringify(map))

    return [map, map.versions[key]]
  }

  private mergeEntry(entry: MapEntry) {
    let [eMap, eVersion] = this.makeMapFromEntry(entry)
    let { map, version } = this.guess(entry) || {}

    if (version) {
      let isOutdated = true
      Object.keys(eVersion).forEach(key => {
        if(!(key in version) && key != 'local'){
          version[key] = eVersion[key]
          isOutdated = false
        }
      })

      if(!isOutdated && 'isLocal' in eVersion){
        version.isLocal = eVersion.isLocal
      }
    }

    if (!map) {
      map = this.searchByName(eMap.name)
    }

    if (map) {
      const versions = Object.assign(eMap.versions, map.versions)
      Object.assign(map, eMap, { versions })
      return map
    }
    this.maps.push(eMap)
    return eMap
  }

  mergeEntries(entries: MapEntry[]) {
    entries.forEach((e) => {
      let map = this.mergeEntry(e)
      this.updateIndex(map)
    })
  }

  addEntry(entry: MapEntry) {
    const { tileHash, stateHash } = entry
    const id = [tileHash, stateHash].join(':')

    let map = this.mergeEntry(entry)
    this.updateIndex(map)

    return db.mapEntries.put({
      id,
      entry,
    })
  }

  deleteEntry(entry: Partial<MapIdentifiers>) {
    const { tileHash = '', stateHash = '' } = entry
    db.mapEntries.delete([tileHash, stateHash].join(':'))
  }

  getMaps() {
    return Array.from(this.maps)
  }

  getUnseenMaps() {
    return Object.values(this.unseenMaps)
  }

  private mapsInfo = new WeakMap<Match, MapInfo>()

  getMapInfo(match: Match) {
    let info = this.mapsInfo.get(match)
    if (info) return info

    const { tileString, stateString, w } = match.getMap()

    info = {
      tileHash: `${w}_${crc32(tileString)}`,
      tileString,
      stateString,
      stateHash: '' + crc32(stateString),
    }

    Object.assign(info, this.guess(info))

    this.mapsInfo.set(match, info)

    return info
  }

  makeMapEntry({
    tileHash,
    tileString,
    stateHash,
    stateString,
    map: { name = '', author = '' } = {} as MapRecord,
    version: { v = '', code = '', notes = '' } = {} as MapVersion,
  }: MapInfo): MapEntry {
    return {
      name,
      author,
      v,
      code,
      notes,
      tileHash,
      tileString,
      stateHash,
      stateString,
      isLocal: true,
    }
  }
}