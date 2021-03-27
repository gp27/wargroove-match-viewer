import { Box, Menu, Text, FileInput, Button, Card, CardHeader, CardBody, CardFooter, Tip } from 'grommet'
import * as Icons from 'grommet-icons'
import { Dexie } from "dexie";
import React, { useContext, useEffect, useState } from "react";
import { Match, MatchData } from '../match'

import { readAsText } from 'promise-file-reader';

export interface IMatch {
    id?: string
    name?: string
    online: boolean
    updated_date: Date
    data?: MatchData,
    match?: Match
}

class MatchViewerDatabase extends Dexie {
    matches: Dexie.Table<IMatch, string>

    constructor(){
        super('MatchViewerDatabase')
        this.version(1).stores({
            matches: 'id, name, online, updated_date, data'
        })

        this.matches = this.table('matches')
    }
}

const db = new MatchViewerDatabase()

db.on("populate", () => {
    db.matches.add({
        id: '2938883839',
        online: true,
        updated_date: new Date()
    })
})

function loadFiles(files: FileList){
    let promises = Array.from(files).map(file => readAsText(file).then(JSON.parse).catch(e=>null))
    return Promise.all(promises).then(results => results.filter(a => a?.match_id)).then((matches: MatchData[]) => {
        for(let match of matches){
            let { match_id, map, players, state, deltas } = match
            if(match_id && map && players && state && deltas){
                updateMatch(match, false)
            }
        }
    })
}

async function loadMatchDataFromUrl(){
    let url = new URL(location.href)
    let match_id = url.searchParams.get('match_id')
    return loadMatchData(match_id)
}

async function loadMatchData(id?: string, { setUrl = false } = {}): Promise<MatchData | undefined> {
    if(!id) return

    if(setUrl){
        let url = new URL(location.href)
        url.searchParams.set('match_id', id)
        history?.pushState(null, null, url.href)
    }

    let matchUrl = new URL('https://wargroove-match-worker.gp27.workers.dev')
    matchUrl.searchParams.set('match_id', id)

    return fetch(matchUrl.href).then(res => {
        return res.json().catch(err => undefined)
    })
}

function updateMatch(matchData: MatchData, isOnline = true){
    return db.matches.put({ id: matchData.match_id, updated_date: new Date, online: isOnline, data: matchData })
}

export const MatchContext = React.createContext<{match: Match, setMatch: (v: Match) => void}>({ match: null, setMatch: () => {} })

export const IMatchCard = ({ imatch, update }: { imatch: IMatch, update?: Function }) => {
    let { setMatch } = useContext(MatchContext)
    let { id, name, online, data, updated_date, match } = imatch

    if(!match && data){
        match = new Match(data)
        imatch.match = match
    }

    async function viewMatch(){
        if (online) {
            data = await loadMatchData(id, { setUrl: true })
            updateMatch(data)

        }

        if (data) {
            setMatch(new Match(data))
        }
    }

    function download(){
        let a = document.createElement('a')
        a.download = `${id}.json`
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data)]))
        a.click()
        URL.revokeObjectURL(a.href)
    }

    function copyLink(){
        let url = new URL(location.origin)
        url.searchParams.set('match_id', id)
        navigator.clipboard.writeText(url.href)
    }

    return <Card background="light-1" width="small">
        <CardHeader pad="small" justify="between">
            <Text size="xsmall">{id}/{online ? 'Online' : 'Local'}</Text>
            {online ? <Icons.CloudDownload /> : <Icons.Document />}
        </CardHeader>
        <CardBody pad={{horizontal: 'small'}}>
            <Text size="xsmall">Updated: {new Date(updated_date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' } as any)}</Text>
            
            <Box direction="column" align="center">
                <Text>{name}</Text>
                {match
                    ? <Box direction="column" align="center">
                        <Box direction="column">

                            {match.getPlayers().map(({ id, commander, username }, index) => <Text key={index}>
                                <Icons.RadialSelected color={match.getPlayerColorHex(id)} style={{verticalAlign: 'middle', marginRight: '10px'}}/>
                                {username ? `${username} (${commander})`: commander}
                            </Text>)}
                        </Box>

                        <Text>Moves: {match.getEntries().length}</Text>
                    </Box>
                    : null
                }
            </Box>
        </CardBody>
        <CardFooter background="light-2" >
            <Button icon={<Icons.View />} hoverIndicator onClick={viewMatch} />
            {online ? <Button icon={<Icons.Link />} onClick={copyLink}/> : <Button icon={<Icons.DownloadOption onClick={download} />} />}
            <Menu
                icon={<Icons.Close />}
                hoverIndicator
                items={[{ icon: <Icons.Trash />, label: 'Delete', onClick: ()=> { db.matches.delete(id); update?.() }}]}
                justifyContent="center"
            />
        </CardFooter>
    </Card>
}

export const MatchLoader = () => {
    let { setMatch } = useContext(MatchContext)
    let [iMatches, setImatches] =  useState<IMatch[]>([])

    function getImatches(){
        db.matches.toArray().then(setImatches)
    }

    useEffect(() => {
        loadMatchDataFromUrl().then(matchData => {
            if(matchData){
                updateMatch(matchData)
                setMatch(new Match(matchData))
            }
            else {
                getImatches()
            }
        })
    }, [])

    return <Box direction="column" margin="small" align="center">
        <Box margin="small" round="small" pad="small" background="light-1" style={{maxWidth: '1024px'}}>
            <FileInput
                multiple
                onChange={({ target }) => {
                    let files = target.files
                    loadFiles(files).then(getImatches)
                    target.value = ""
                }}
            />
        </Box>
        <Box overflow="auto" direction="row" wrap={true} justify="center">
            {iMatches.map(imatch => <Box margin="small" key={imatch.id}><IMatchCard imatch={imatch} update={getImatches} /></Box>)}
        </Box>
        
    </Box>
}