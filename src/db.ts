import { Dexie } from 'dexie'
import { MapEntry } from './wg/map-utils'
import { Match, MatchData } from './wg/match'

export interface IMatch {
  id?: string
  name?: string
  online: boolean
  updated_date: Date
  data?: MatchData
  match?: Match
}

export interface IMapEntry {
  id?: string
  entry: MapEntry
}

class MatchViewerDatabase extends Dexie {
  matches: Dexie.Table<IMatch, string>
  mapEntries: Dexie.Table<IMapEntry, number>

  constructor() {
    super('MatchViewerDatabase')

    this.version(1).stores({
      matches: 'id, name, online, updated_date, data',
      mapEntries: 'id, entry',
    })

    /*this.version(2).stores({
            matches: 'id, name, online, updated_date, data',

        })*/

    this.matches = this.table('matches')
    this.mapEntries = this.table('mapEntries')
  }
}

export const db = new MatchViewerDatabase()

db.on('populate', () => {
  /*db.matches.add({
        id: '2938883839',
        online: true,
        updated_date: new Date()
    })*/
})

db.matches.hook('reading', (imatch) => {
  if(!imatch) return imatch

  let r = { ...imatch }
  if (imatch.data) {
    try {
      r.match = new Match(imatch.data)
    } catch (e) {
      console.error(e)
    }
  }
  return r
})