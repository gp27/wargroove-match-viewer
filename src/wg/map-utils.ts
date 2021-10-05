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
  byTileHash: {
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
    this.byTileHash = {}
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
          this.byTileHash[tileHash] = [map, tileString, unseenVersions]
        }
      })

      if (unseenVersions.length === allVersions.length) {
        const name = this.normalizeName(map.name)
        this.unseen[name] = map
        continue
      }
    }
  }

  guess({ tileHash, stateHash, tileString, code }: Partial<MapIdentifiers> & { code?: string }): MapGuess | undefined {
    return (
      this.find(tileHash, stateHash) ||
      this.findSimiliar(tileString) ||
      this.findByCode(code)
    )
  }

  find(tileHash?: string, stateHash?: string): MapGuess | undefined {
    let [map, str, unseenVersions] = this.byTileHash[tileHash] || []
    let version = Object.values(map?.versions || {}).find(
      ({ stateHash: shash, tileHash: thash }) =>
        shash == stateHash && tileHash == thash
    )
    if (map) {
      return { map, ...(version ? { version } : { unseenVersions }) }
    }
  }

  findSimiliar(tileString?: string): MapGuess | undefined {
    if (!tileString) return

    let minDist = Infinity
    let minMap: MapRecord
    let minUnseen: MapVersion[]

    Object.values(this.byTileHash).forEach(([map, str, unseenVersions]) => {
      if (!str) return
      const dist = this.getTileStrDistance(tileString, str)
      if (dist < minDist) {
        minDist = dist
        minMap = map
        minUnseen = unseenVersions
      }
    })

    if (minDist < tileString?.length * 0.1) {
      return { map: minMap, unseenVersions: minUnseen }
    }
  }

  findByCode(code?: string): MapGuess | undefined {
    const [map, version] = this.byCode[code] || []
    if(map) return {
      map,
      version,
    }
  }

  searchByName(search: string) {
    return this.searchListByName(search)[0]
  }

  searchListByName(search: string) {
    search = this.normalizeName(search)

    return Object.keys(this.unseen)
      .map((name) => {
        const dist = levenshtein(search, name)
        return [name, dist] as [string, number]
      })
      .filter(([name, dist]) => dist < 5)
      .sort(([n1, d1], [n2, d2]) => d1 - d2)
      .map(([name]) => this.unseen[name])
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
      let [eMap, eVersion] = this.makeMapFromEntry(entry)
      let { map, version } = this.guess(entry)

      if (version) {
        Object.assign(version, eVersion)
      }

      if (!map) {
        map = this.searchByName(eMap.name)
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
