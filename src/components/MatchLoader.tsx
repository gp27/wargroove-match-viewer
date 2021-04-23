import { Box, Menu, Text, FileInput, Button, Card, CardHeader, CardBody, CardFooter, TextInput } from 'grommet'
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
    /*db.matches.add({
        id: '2938883839',
        online: true,
        updated_date: new Date()
    })*/
})

function loadFiles(files: FileList){
    let promises = Array.from(files).map(file => readAsText(file).then(JSON.parse).catch(e=>null))
    return Promise.all(promises).then(results => results.filter(a => a?.match_id)).then((matches: MatchData[]) => {
        return Promise.all(matches.map(match => {
            if (Match.isValid(match)) {
                return updateMatch(match, false)
            }
        }))
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

    let matchUrl = new URL(`https://firebasestorage.googleapis.com/v0/b/wargroove-match-storage.appspot.com/o/matches%2F${id}.json?alt=media`)

    return fetch(matchUrl.href).then(res => {
        return res.json().then(data => {
            return Match.isValid(data) ? data : null
        }).catch(err => undefined)
    })
}

async function updateMatch(matchData: MatchData, isOnline = true){
    let { name } = (await db.matches.get(matchData.match_id)) || {}
    return db.matches.put({ id: matchData.match_id, updated_date: new Date, online: isOnline, name, data: matchData })
}

export const MatchContext = React.createContext<{match: Match, setMatch: (v: Match) => void}>({ match: null, setMatch: () => {} })


export const MatchLoader = () => {
    let { setMatch } = useContext(MatchContext)
    let [iMatches, setImatches] =  useState<IMatch[]>(null)

    function getImatches(){
        db.matches.toCollection().reverse().sortBy('updated_date').then(setImatches)
    }

    useEffect(() => {
        loadMatchDataFromUrl().then(matchData => {
            if(matchData){
                updateMatch(matchData)
                try {
                    setMatch(new Match(matchData))
                } catch(e){
                    console.error(e)
                }
            }
            else {
                getImatches()
            }
        })
    }, [])

    return iMatches ? <Box direction="column" margin="small" align="center">
        <Box margin="small">
            <Text>Download and install the <a href="https://github.com/gp27/wargroove-match-logger" target="_blank">Wargroove Match Logger Mod</a> to start recording matches.</Text>
        </Box>

        <Box overflow="auto" direction="row" wrap={true} justify="center">
            <Box margin="small">
                <Card background="light-1" pad="small" width="small" fill="vertical" >
                    <CardBody justify="stretch" align="stretch" alignContent="stretch" direction="row" style={{textAlign: 'center'}}>
                        <FileInput
                            messages={{ dropPromptMultiple: 'Drop matches file here or'}}
                            multiple={{aggregateThreshold: 1}}
                            className="grow"
                            onChange={({ target }) => {
                                let files = target.files
                                loadFiles(files).then(getImatches)
                                target.value = ""
                            }}
                        />
                    </CardBody>
                </Card>
            </Box>
            {iMatches.map(imatch => <Box margin="small" key={imatch.id}><IMatchCard imatch={imatch} update={getImatches} /></Box>)}
        </Box>
        
    </Box> : null
}

export const IMatchCard = ({ imatch, update }: { imatch: IMatch, update?: Function }) => {
    let { setMatch } = useContext(MatchContext)
    let { id, online, data, updated_date, match } = imatch

    let [name, setName] = useState(imatch.name)

    function updateName(ev: any){
        let name = ev.target.value
        imatch.name = name
        setName(name)

        db.matches.update(id, { name })
    }

    if (!match && data) {
        try {
            match = new Match(data)
        } catch(e){
            console.error(e)
        }
        imatch.match = match
    }

    async function viewMatch() {
        if (online) {
            data = await loadMatchData(id, { setUrl: true })
            if (data) {
                updateMatch(data)
                try {
                    match = new Match(data)
                } catch (e) {
                    console.error(e)
                }
            }
        }

        if (match) {
            setMatch(match)
        }
    }

    function download() {
        let a = document.createElement('a')
        a.download = `${id}.json`
        a.href = URL.createObjectURL(new Blob([JSON.stringify(data)]))
        a.click()
        URL.revokeObjectURL(a.href)
    }

    let [copied, setCopied] = useState(false)

    function copyLink() {
        let url = new URL(location.origin)
        url.searchParams.set('match_id', id)
        navigator.clipboard.writeText(url.href)
        setCopied(true)
    }

    return <Card background="light-1" width="small">
        <CardHeader pad="small" justify="between">
            <Text size="xsmall">{id}/{online ? 'Online' : 'Local'}</Text>
            {online ? <Icons.CloudDownload /> : <Icons.Document />}
        </CardHeader>
        <CardBody pad={{ horizontal: 'small' }}>
            <Text size="xsmall">Updated: {new Date(updated_date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' } as any)}</Text>

            <Box direction="column" align="center">
                <TextInput placeholder="Unnamed" value={imatch.name} onChange={updateName} style={{padding: '5px', textAlign: 'center'}} />
                {match
                    ? <Box direction="column" align="center">
                        <Box direction="column">

                            {match.getPlayers().map(({ id, commander, username }, index) => <Text key={index}>
                                <Icons.StatusGoodSmall color={match.getPlayerColorHex(id)} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                                {username ? `${username} (${commander})` : commander}
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
            {online ? <Button icon={copied ? <Icons.Copy /> : <Icons.Link />} onClick={copyLink} onBlur={() => setCopied(false)} /> : <Button icon={<Icons.DownloadOption onClick={download} />} />}
            <Menu
                icon={<Icons.Close />}
                hoverIndicator
                items={[{ icon: <Icons.Trash />, label: 'Delete', onClick: () => { db.matches.delete(id); update?.() } }]}
                justifyContent="center"
            />
        </CardFooter>
    </Card>
}