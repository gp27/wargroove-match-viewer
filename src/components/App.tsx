import React, { useEffect, useState } from "react"
import { Grommet, ThemeType, Box, Text, Button } from 'grommet'
import * as Icons from 'grommet-icons'
import StatusGraphs from './StatusGraphs'
import MatchUI from './MatchUI'
import { Match } from "../match"
import { MatchViewerContext } from "./GameBoard"
import { WargrooveMatchViewer } from "../phaser/macth-viewer"
import { MatchContext, MatchLoader } from './MatchLoader'

const theme: ThemeType = {
    global: {
        colors: {
            brand: 'black',
            focus: 'accent-4'
        },
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
    overflow="visible"
    align="center"
    justify="between"
    background="brand"
    wrap={true}
    style={{ minHeight: 'auto' }}
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    {...props}
/>

const App = () => {
    let [match, setMatch] = useState<Match>(null)
    let [game, setGame] = useState<WargrooveMatchViewer>(null)

    /*if (!match) {
        Match.load().then(match => {
            setMatch(match)
        })
    }*/

    function back(){
        setMatch(null)
        game?.destroy(true)
        setGame(null)
        let url = new URL(location.origin)
        history?.replaceState(null, null, url.href)
    }

    window.addEventListener('popstate', back)

    return <Grommet theme={theme} full>
        <MatchContext.Provider value={{ match, setMatch }}>
            <MatchViewerContext.Provider value={{ game, setGame }}>
                <Box fill direction="column">
                    <NavBar>
                        <Box direction="row">
                            {match ? <Button margin={{right: "small"}} plain icon={<Icons.LinkPrevious />} onClick={back} /> : null}
                            <Text size="1.3em">Wargroove Match Viewer</Text>
                        </Box>
                        <Text size="small">Credit to <a href="https://chucklefish.org/" target="_blank">Chucklefish</a> for all images. Check the game on <a target="_blank" href="https://store.steampowered.com/app/607050/Wargroove/">Steam</a></Text>
                        {match ? <StatusGraphs match={match} /> : <span />}

                    </NavBar>

                    {match ? <MatchUI match={match} /> : <MatchLoader />}
                </Box>
            </MatchViewerContext.Provider>
        </MatchContext.Provider>
    </Grommet>
}

export default App