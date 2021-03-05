import React from "react"
import { Box, List, Text, Avatar } from 'grommet'

import { getPlayerColorString, Match } from "../match"

const MoveList = ({ match, onSelected }: { match: Match, onSelected: Function }) => {
    if (!match) return null

    let entries = match.getEntries()

    const [selected, setSelected] = React.useState<number>(entries.indexOf(match.getCurrentEntry()));
    //setSelected(match?.getCurrentEntry().id)

    return <List
        border="bottom"
        data={entries}
        itemProps={selected >= 0 ? { [selected]: { background: 'focus' } } : undefined}
        primaryKey={({ turn, moveNumber }) => (<Box direction="row">
            <Avatar size="small" background={getPlayerColorString(turn.playerId)} margin={{ right: 'small' }}>
                P{turn.playerId + 1}
            </Avatar>
            <Text>{moveNumber > 0 ? 'Move ' + moveNumber : 'Start of Turn'}</Text>
        </Box>)}
        onClickItem={event => {
            match.selectEntry(event.item.id)
            setSelected(selected === event.index ? undefined : event.index)
            onSelected()
        }}
    />
}

export default MoveList