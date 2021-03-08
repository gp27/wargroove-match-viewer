import React from "react"
import { Box, List, Text, Avatar, DataTable } from 'grommet'

import { getPlayerColorString, Match, Unit } from "../match"

const PlayerStatus = ({ match }: { match: Match }) => {
    if (!match) return null

    let players = match.getPlayers()
    let entry = match.getCurrentEntry()


    return <DataTable
        pad="small"
        border="bottom"
        data={players}
        columns={[
            {
                property: 'player',
                header: <Text>Player</Text>,
                primary: true,
                render: player => <Avatar size="small" background={getPlayerColorString(player.id)}>
                    P{player.id + 1}
                </Avatar>
            },
            {
                property: 'gold',
                header: <Text>Gold</Text>,
                render: player => <Text>{entry.state.gold[player.id]}</Text>
            },
            {
                property: 'income',
                header: <Text>Income</Text>,
                render: player => <Text>{entry.status[player.id].income}</Text>
            },
            {
                property: 'unit_count',
                header: <Text>Unit Count</Text>,
                render: player => <Text>{entry.status[player.id].unitCount}</Text>
            },
            {
                property: 'combat_unit_count',
                header: <Text>Combat U.C.</Text>,
                render: player => <Text>{entry.status[player.id].combatUnitCount}</Text>
            },
            {
                property: 'army_value',
                header: <Text>Army Value</Text>,
                render: player => <Text>{entry.status[player.id].armyValue}</Text>
            }
        ]}
    />
}

export default PlayerStatus