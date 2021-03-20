import React from "react"
import { Grommet, ThemeType, Box, Sidebar, Main, Text, Button } from 'grommet'
import { hpe } from 'grommet-theme-hpe'
import StatusGraphs from './StatusGraphs'
import MatchUI from './MatchUI'
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

export default class App extends React.Component <any,{ match?: Match}> {
    constructor(props) {
        super(props)

        Match.load().then(match => {
            this.setState({ match })
        })

        this.state = {}
    }

    render() {
        return (
            <Grommet theme={hpe} full>
                <Box fill direction="column">
                    <NavBar>
                        <Text size="1.3em">Wargroove Match Viewer</Text>
                        <Text>Credit to <a href="https://chucklefish.org/">Chucklefish</a> for all images</Text>
                        {this.state.match ? <StatusGraphs match={this.state.match} /> : null}
                        
                    </NavBar>

                    {this.state.match ? <MatchUI match={this.state.match}/> : null}
                </Box>
            </Grommet>
        );
    }
}