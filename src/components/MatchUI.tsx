import React, { useState } from "react"
import { Grommet, ThemeType, Box, Sidebar, Main, Text, Button } from 'grommet'

import GameBoard from './GameBoard'
import MoveList from './MoveList'
import UnitList from './UnitList'
import PlayerStatus from './PlayerStatus'
import { Match } from "../match"

const MatchUI = ({ match }: { match: Match }) => {
    let [_, setState] = useState<any>(0)

    function update(){
        setState({})
    }

    return <Box direction='row' flex pad="small">
        <Sidebar
            background="light-2"
            round="small"
            margin="small"
            overflow="auto"
        >
            <MoveList match={match} onSelected={update} />
        </Sidebar>

        <Main flex align='center' justify='center' margin="small">
            <GameBoard match={match} />
        </Main>

        <Box direction="column">
            <Box background="light-2"
                round="small"
                margin="small"
            >
                <PlayerStatus match={match} />
            </Box>
            <Box flex direction="row">
                {match.getPlayers().map(({ id }) => (
                    <Sidebar
                        key={id}
                        background="light-2"
                        round="small"
                        margin="small"
                        overflow="auto"
                    >
                        <UnitList match={match} playerId={id} />
                    </Sidebar>
                ))}
            </Box>
        </Box>
    </Box>
}

export default MatchUI