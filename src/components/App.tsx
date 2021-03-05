import React from "react"
import { Grommet, ThemeType, Box, Sidebar, Main, Text, Button } from 'grommet'
import { hpe } from 'grommet-theme-hpe'
import GameBoard from './GameBoard'
import MoveList from './MoveList'
import UnitList from './UnitList'
import PlayerStatus from './PlayerStatus'
import StatusGraphs from './StatusGraphs'
import { Match } from "../match"

const theme: ThemeType = {
    global: {
        /*colors: {
            brand: 'gray'
        },*/
        font: {
            family: 'Raleway',
            size: '16px',
            height: '18px',
            
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

export default class App extends React.Component {
    match: Match

    constructor(props) {
        super(props)

        this.update = this.update.bind(this)

        Match.load().then(match => {
            this.match = match
            this.setState({})
        })
    }

    update(){
        this.setState(this.state)
    }

    render() {
        return (
            <Grommet theme={hpe} full>
                <Box fill direction="column">
                    <NavBar>
                        <Text size="1.3em">Wargroove Match Viewer</Text>
                        <StatusGraphs match={this.match} />
                    </NavBar>

                    <Box direction='row' flex pad="small">
                        <Sidebar
                            background="light-2"
                            round="small"
                            margin="small"
                            overflow="auto"
                        >
                            <MoveList match={this.match} onSelected={this.update}/>
                        </Sidebar>

                        <Main flex align='center' justify='center' margin="small">
                            <GameBoard match={this.match}/>
                        </Main>

                        <Box direction="column">
                            <Box background="light-2"
                                round="small"
                                margin="small"
                            >
                                <PlayerStatus match={this.match}/>
                            </Box>
                            <Box flex direction="row">
                                {this.match?.getPlayers().map(({ id }) => (
                                    <Sidebar
                                        key={id}
                                        background="light-2"
                                        round="small"
                                        margin="small"
                                        overflow="auto"
                                    >
                                        <UnitList match={this.match} playerId={id} />
                                    </Sidebar>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Grommet>
        );
    }
}