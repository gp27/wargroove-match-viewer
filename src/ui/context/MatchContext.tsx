import { db } from '../../db'
import React, { useContext, useEffect, useState } from "react";
import { Match, MatchData } from '../../wg/match'

import { readAsText } from 'promise-file-reader';

function loadFiles(files: FileList) {
    let promises = Array.from(files).map(file => readAsText(file).then(JSON.parse).catch(e => null))
    return Promise.all(promises).then(results => results.filter(a => a?.match_id)).then((matches: MatchData[]) => {
        return Promise.all(matches.map(match => {
            if (Match.isValid(match)) {
                return updateMatch(match, false)
            }
        }))
    })
}

async function loadMatchDataFromUrl() {
    let url = new URL(location.href)
    let match_id = url.searchParams.get('match_id')
    return loadMatchData(match_id)
}

async function loadMatchData(id?: string, { setUrl = false } = {}): Promise<MatchData | undefined> {
    if (!id) return

    if (setUrl) {
        let url = new URL(location.href)
        url.searchParams.set('match_id', id)
        history?.pushState(null, null, url.href)
    }

    let matchUrl = new URL(`https://firebasestorage.googleapis.com/v0/b/wargroove-match-storage.appspot.com/o/matches%2F${id}.json?alt=media`)

    return fetch(matchUrl.href).then(res => {
        return res.json().then(data => {
            return Match.isValid(data) ? data : null
        }).catch(err => undefined)
    })
}

async function updateMatch(matchData: MatchData, isOnline = true) {
    let { name } = (await db.matches.get(matchData.match_id)) || {}
    return db.matches.put({ id: matchData.match_id, updated_date: new Date, online: isOnline, name, data: matchData })
}

export const MatchContext = React.createContext<{ match: Match, setMatch: (v: Match) => void }>({ match: null, setMatch: () => { } })