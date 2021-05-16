import React, { useState } from "react"
import { Grommet, ThemeType, Box, Main, Text, Button } from 'grommet'

import GameBoard from './GameBoard'
import MoveList from './MoveList'
import UnitList from './UnitList'
import PlayerStatus from './PlayerStatus'
import { Match } from "../wg/match"

const MatchUI = ({ match }: { match: Match }) => {
    let [_, setState] = useState<any>(0)

    function update(){
        setState({})
    }

    return <Box direction='row' flex pad="small">
        <Box
            background="light-2"
            round="small"
            margin="small"
            overflow="auto"
        >
            <MoveList match={match} onSelected={update} />
        </Box>

        <Box flex align='center' justify='center' margin="small" round="small" overflow="hidden">
            <GameBoard match={match} onSelected={update}/>
        </Box>

        <Box direction="column">
            <Box background="light-2"
                round="small"
                margin="small"
            >
                <PlayerStatus match={match} />
            </Box>
            <Box flex direction="row">
                {match.getPlayers().map(({ id }) => (
                    <Box
                        key={id}
                        flex
                        background="light-2"
                        round="small"
                        margin="small"
                        overflow="auto"
                    >
                        <UnitList match={match} playerId={id} />
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
}

export default MatchUI