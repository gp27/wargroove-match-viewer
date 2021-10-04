import levenshtein from 'js-levenshtein'
import { mapRecords, sheetMapEntries } from './map-registry'

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
  unseenVersions?: MapVersion[]
}

export type MapInfo = MapIdentifiers & Partial<MapGuess>

export type MapEntry = Omit<MapRecord, 'versions'> & MapVersion

export class MapFinder {
  index: {
    [tileHash: string]: [
      map: MapRecord,
      tileString: string,
      unseenVersions: MapVersion[]
    ]
  }
  unseen: { [name: string]: MapRecord }
  byCode: { [code: string]: [MapRecord, MapVersion] }

  constructor(private maps: MapRecord[]) {
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

  private makeIndexes() {
    this.index = {}
    this.unseen = {}
    this.byCode = {}

    for (let map of this.maps) {
      const allVersions = Object.values(map.versions)
      const unseenVersions = allVersions.filter((v) => !v.tileHash)

      allVersions.forEach((version) => {
        let { tileHash, tileString, code } = version
        if (!code.startsWith('[')) {
          this.byCode[code] = [map, version]
        }

        if (tileHash) {
          this.index[tileHash] = [map, tileString, unseenVersions]
        }
      })

      if (unseenVersions.length === allVersions.length) {
        const name = this.normalizeName(map.name)
        this.unseen[name] = map
        continue
      }
    }
  }

  guess(info: MapInfo) {
    return (
      this.find(info.tileHash, info.stateHash) ||
      this.findSimiliar(info.tileString)
    )
  }

  find(tileHash: string, stateHash: string): MapGuess | undefined {
    let [map, str, unseenVersions] = this.index[tileHash] || []
    let version = Object.values(map?.versions || {}).find(
      ({ stateHash: shash, tileHash: thash }) =>
        shash == stateHash && tileHash == thash
    )
    if (map) {
      return { map, version, unseenVersions }
    }
  }

  findSimiliar(tileString: string): MapGuess | undefined {
    let minDist = Infinity
    let minMap: MapRecord

    Object.values(this.index).forEach(([map, str]) => {
      if (!str) return
      const dist = this.getTileStrDistance(tileString, str)
      if (dist < minDist) {
        minDist = dist
        minMap = map
      }
    })

    if (minDist < tileString?.length * 0.1) {
      return { map: minMap }
    }
  }

  searchName(search: string) {
    search = this.normalizeName(search)

    let minDist = Infinity
    let minName: string

    Object.keys(this.unseen).forEach((name) => {
      const dist = levenshtein(search, name)
      if (dist < minDist) {
        minDist = dist
        minName = name
      }
    })

    if (minDist < 3) {
      return this.unseen[minName]
    }
  }

  private makeMapFromEntry({
    name,
    author,
    archived,
    isNew,
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
    let [isGeneric, included, unknown] =
      key.match(/(included)|(unknown)/i) || []
    if (isGeneric) {
      key = Math.random().toString(36).substr(2)
      code = included ? '[In game]' : '[Unknown]'
    }

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
        },
      },
    }

    map = JSON.parse(JSON.stringify(map))

    return [map, map.versions[code]]
  }

  mergeFromEntries(entries: MapEntry[]) {
    for (let entry of entries) {
      let [map, version] = this.byCode[entry.code] || []
      let [eMap, eVersion] = this.makeMapFromEntry(entry)

      if (version) {
        Object.assign(version, eVersion)
      }

      if (!map) {
        map = this.searchName(eMap.name)
      }

      if (map) {
        const versions = Object.assign(eMap.versions, map.versions)
        Object.assign(map, eMap, { versions })
        continue
      }
      this.maps.push(eMap)
    }

    this.makeIndexes()
  }

  getMaps() {
    return Array.from(this.maps)
  }
}

export const mapFinder = new MapFinder(mapRecords)

mapFinder.mergeFromEntries(sheetMapEntries)

console.log(mapFinder)
