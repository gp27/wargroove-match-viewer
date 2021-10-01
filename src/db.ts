import { Dexie } from "dexie"
import { Match, MatchData } from './wg/match'

export interface IMatch {
    id?: string
    name?: string
    online: boolean
    updated_date: Date
    data?: MatchData,
    match?: Match
}

/*export interface IMapEntry {
    id?: number

}*/

class MatchViewerDatabase extends Dexie {
    matches: Dexie.Table<IMatch, string>

    constructor() {
        super('MatchViewerDatabase')

        this.version(1).stores({
            matches: 'id, name, online, updated_date, data'
        })

        /*this.version(2).stores({
            matches: 'id, name, online, updated_date, data',

        })*/

        this.matches = this.table('matches')
    }
}

export const db = new MatchViewerDatabase()

db.on("populate", () => {
    /*db.matches.add({
        id: '2938883839',
        online: true,
        updated_date: new Date()
    })*/
})