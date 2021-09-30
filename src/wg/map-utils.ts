import levenshtein from "js-levenshtein"
import { mapRecords } from './map-registry'

export interface MapIdentifiers {
    tileHash: string
    tileString: string
    stateHash: string
    stateString: string
}

export interface MapRecord {
    name: string
    author?: string
    versions: Record<string, MapVersion>
}

export type MapVersion = {
    v: string
    code: string
    bans?: string
    imgSrc?: string
    date?: Date | string
} & Partial<MapIdentifiers>

export type MapGuess = {
    map: MapRecord
    version?: MapVersion
    unseenVersions?: MapVersion[]
}

export type MapInfo = MapIdentifiers & Partial<MapGuess>

export class MapFinder {
    index: { [tileHash: string]: [map: MapRecord, tileString: string, unseenVersions: MapVersion[]] }
    unseen: { [name: string]: MapRecord }

    constructor(private maps: MapRecord[]) {
        this.makeIndexes()
    }

    private normalizeName(name: string) {
        return name.trim().toLowerCase().replace(/[^a-z0-9\u00C0-\u017F]/g, '')
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

        for (let map of this.maps) {
            const allVersions = Object.values(map.versions)
            const unseenVersions = allVersions.filter(v => !v.tileHash)

            if (unseenVersions.length === allVersions.length) {
                const name = this.normalizeName(map.name)
                this.unseen[name] = map
                continue
            }

            allVersions.forEach(({ tileHash, tileString }) => {
                if (tileHash) {
                    this.index[tileHash] = [map, tileString, unseenVersions]
                }
            })
        }
    }

    guess(info: MapInfo){
        return (
            this.find(info.tileHash, info.stateHash) || 
            this.findSimiliar(info.tileString)
        )
    }

    find(tileHash: string, stateHash: string): MapGuess | undefined {
        let [map, str, unseenVersions] = this.index[tileHash] || []
        let version = Object.values(map?.versions || {}).find(({ stateHash: hash }) => hash == stateHash)
        if (map) {
            return { map, version, unseenVersions }
        }
    }

    findSimiliar(tileString: string): MapGuess | undefined {
        let minDist = Infinity
        let minMap: MapRecord

        Object.values(this.index).forEach(([map, str]) => {
            if(!str) return
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

        Object.keys(this.unseen).forEach(name => {
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
}



export const mapFinder = new MapFinder(mapRecords)