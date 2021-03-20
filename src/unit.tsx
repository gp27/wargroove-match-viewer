import { MatchData, Entry, Unit, Match } from './match'

export class MatchUnits {
    newId: number

    constructor(private match: Match){
        this.newId = 0
    }

    getNewId(){
        return this.newId++
    }

    makeUnits(){
        this.match.getEntries()
    }
}

export class MatchUnit {
    id: number
    matchId: number
    entries: Entry[]
}