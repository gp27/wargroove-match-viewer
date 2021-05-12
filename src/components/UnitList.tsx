import React from "react"
import { Box, List, Text } from 'grommet'

import { Match, Unit } from "../match"
import { PhaserWargrooveGameContext } from "./GameBoard"
import { getUnitFrameNames } from "../match-utils"

const UnitList = ({ match, playerId }: { match: Match, playerId?: number }) => {
    if (!match) return null

    let units = match.getCurrentCombatUnits(playerId)

    function getFrame(game, unitClassId, playerId){
        let { faction = 'cherrystone', color = 'grey' } = match.getPlayers()[playerId] || {}
        let frameNames = getUnitFrameNames(unitClassId, faction)
        return game?.getFrameCanvas(color, frameNames)
    }
    
    return <PhaserWargrooveGameContext.Consumer>
        {({ game }) => <List
            border="bottom"
            data={units}
            primaryKey={({ id, playerId, unitClassId, health, grooveCharge, grooveId, unitClass: { maxGroove } }: Unit) => ( <Box direction="row">
                {/*<Avatar size="small" background={match.getPlayerColorHex(playerId)} margin={{ right: 'small' }}/>*/}
                <div ref={ele => ele && (ele.innerHTML = '', true) && ele.append(getFrame(game, unitClassId, playerId) || "")}></div>
                <Text>{unitClassId.replace("commander_", "")} (ID:{id})<br /> {health}%{grooveId ? ' Groove: ' + Math.round(grooveCharge / maxGroove * 100) + '%' : ''}</Text>
            </Box>)}
        />}
    </PhaserWargrooveGameContext.Consumer>
}

export default UnitList