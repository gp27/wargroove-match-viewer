import React from "react"
import { Box, List, Text, Avatar, DataTable } from 'grommet'

import { Match } from "../match"

const PlayerStatus = ({ match }: { match: Match }) => {
    if (!match) return null

    let players = match.getPlayers()
    let entries = match.getEntries()
    let entry = match.getCurrentEntry()

    let isLastEntry = entry == entries[entries.length - 1]
    let victoriusPlayers = players.filter(p => p.is_victorious)

    return <DataTable
        pad="small"
        border="bottom"
        data={players}
        columns={[
            {
                property: 'player',
                header: <Text>Player</Text>,
                primary: true,
                render: player => <Box direction="row">
                    <Avatar size="small" background={match.getPlayerColorHex(player.id)}>
                    P{player.id + 1}
                    </Avatar>
                    <Text margin={{ left: "small" }}>{player.username || player.commander} {isLastEntry ? victoriusPlayers.includes(player) ? '(W)' : '(L)' : ''}</Text>
                </Box>
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