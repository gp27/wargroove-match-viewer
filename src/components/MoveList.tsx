import React, { useEffect, useRef } from "react"
import { Box, List, Text, Avatar } from 'grommet'

import { Entry, Match, PlayerTurn } from "../wg/match"

const MoveList = ({ match, onSelected }: { match: Match, onSelected?: Function }) => {
    if (!match) return null

    //let entries = match.getEntries()
    let turns = match.getTurns()

    let [selectedEntry, setSelectedEntry] = React.useState<Entry>(match.getCurrentEntry());

    selectedEntry = match.getCurrentEntry()
    //setSelected(match?.getCurrentEntry().id)

    function selectEntry(entry: Entry){
        match.selectEntry(entry.id)
        setSelectedEntry(entry)
        onSelected()
    }

    return <List
        pad="none"
        border="bottom"
        data={turns}
        //{itemProps={selected >= 0 ? { [selected]: { background: 'focus' } } : undefined}
        primaryKey={turn => <Turn match={match} turn={turn} selectedEntry={selectedEntry} onSelected={selectEntry}/>}
    />
}

const Turn = ({ match, turn, selectedEntry, onSelected }: { match: Match, turn: PlayerTurn, selectedEntry?: Entry, onSelected: Function }) => {
    let selected = turn.entries.indexOf(selectedEntry)
    let list = selected >= 0 ? turn.entries : [turn.entries[0]]

    return <List
        border="bottom"
        data={list}
        itemProps={selected >= 0 ? { [selected]: { background: 'focus' } } : undefined}
        primaryKey={entry => <Move match={match} entry={entry} selected={selectedEntry == entry} />}
        onClickItem={event => {
            onSelected(event.item)
        }}
    />
}

const Move = ({ match, entry: { moveNumber, turn }, selected }: { match: Match, entry: Entry, selected?: boolean }) => {
    const eleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(selected){
            eleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }, [selected])

    return <Box direction="row" ref={eleRef}>
        <Avatar size="small" background={match.getPlayerColorHex(turn.playerId)} margin={{ right: 'small' }}>
            P{turn.playerId + 1}
        </Avatar>
        <Text weight={moveNumber > 0 ? 'normal' : 'bold'}>{moveNumber > 0 ? 'Move ' + moveNumber : 'Turn ' + turn.turnNumber}</Text>
    </Box>
}

export default MoveList