import React, { PropsWithChildren } from "react"
import { Grommet, ThemeType, Box, Sidebar, Main, DataTable, Text, Avatar } from 'grommet'
import GameBoard from './GameBoard'
import { getPlayerColor, getPlayerColorString, Match } from "../match"

const theme: ThemeType = {
    global: {
        colors: {
            //brand: ''
        },
        font: {
            family: 'Roboto',
            size: '18px',
            height: '20px',
        },
    }
}

const NavBar = props => <Box
    tag="header"
    direction="row"
    align="center"
    justify="between"
    background="brand"
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    {...props}
/>

const MoveList = ({ match }: { match: Match }) => <DataTable
    border="horizontal"
    data={match?.getEntries() || []}
    columns={[
        {
            property: 'player',
            render: ({ turn }) => (<Avatar size="small" background={getPlayerColorString(turn.playerId)}>P{turn.playerId + 1}</Avatar>)
        },
        {
            property: 'move',
            render: (entry) => <Text>Move {entry.moveNumber}</Text>
        }
    ]}
/>

export default class App extends React.Component {
    match: Match

    constructor(props) {
        super(props)
        Match.load().then(match => {
            this.match = match
            this.setState({})
        })
    }

    render() {
        return (
            <Grommet plain theme={theme} full>
                <NavBar>Wargroove Match Viewer</NavBar>

                <Box direction='row' flex>
                    <Sidebar
                        background="brand"
                        round="small"
                        margin="small"
                    >
                        <MoveList match={this.match}></MoveList>
                    </Sidebar>

                    <Main flex align='center' justify='center'>
                        <GameBoard />
                    </Main>
                </Box>
            </Grommet>
        );
    }
}