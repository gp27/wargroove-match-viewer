import React from "react"
import { Box, List, Text } from 'grommet'
import { Favorite, Trigger } from 'grommet-icons'

import { Match, UnitData } from "../wg/match"
import { PhaserWargrooveGameContext } from "./GameBoard"
import { getUnitFrameNames } from "../wg/match-utils"

const UnitList = ({ match, playerId }: { match: Match, playerId?: number }) => {
    if (!match) return null

    let units = match.getCurrentCombatUnits(playerId)

    return <List
        border="bottom"
        data={units}
        primaryKey={(unit: UnitData) => <UnitInfo unit={unit} match={match} />}
    />
}

function UnitInfo({ unit: { id, playerId, unitClassId, health, grooveCharge, grooveId, unitClass: { maxGroove } }, match }: { match: Match, unit: UnitData }) {
    function getFrame(game, unitClassId, playerId) {
        let { faction = 'cherrystone', color = 'grey' } = match.getPlayers()[playerId] || {}
        let frameNames = getUnitFrameNames(unitClassId, faction)
        return game?.getFrameCanvas(color, frameNames)
    }

    return (
        <PhaserWargrooveGameContext.Consumer>
            {({ game }) =>
                <Box direction="row">
                    {/*<Avatar size="small" background={match.getPlayerColorHex(playerId)} margin={{ right: 'small' }}/>*/}
                    <div ref={ele => ele && (ele.innerHTML = '', true) && ele.append(getFrame(game, unitClassId, playerId) || "")}></div>
                    <Text>{unitClassId.replace("commander_", "")} (ID:{id})<br /> <Favorite size="small" /> {health}% {grooveId && <><Trigger size="small" /> {Math.round(grooveCharge / maxGroove * 100) + '%'}</>}</Text>
                </Box>
            }
        </PhaserWargrooveGameContext.Consumer>
    )
}

export default UnitList