import React from "react"
import { Box, List, Text, Avatar } from 'grommet'

import { getPlayerColorString, Match, Unit } from "../match"

const UnitList = ({ match, playerId }: { match: Match, playerId?: number }) => {
    if (!match) return null

    let units = match.getCurrentCombatUnits(playerId)

    return <List
        border="bottom"
        data={units}
        primaryKey={({ playerId, unitClassId, health, grooveCharge, grooveId }: Unit) => (<Box direction="row">
            <Avatar size="small" background={getPlayerColorString(playerId)} margin={{ right: 'small' }}></Avatar>
            <Text>{unitClassId} <br/> {health}%{grooveId ? ' Groove: ' + grooveCharge + '%' : ''}</Text>
        </Box>)}
    />
}

export default UnitList