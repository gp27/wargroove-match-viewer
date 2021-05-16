import React, { useContext, useEffect, useState } from "react"
import { Box } from "grommet";
import { Match } from "../wg/match";

import { PhaserWargrooveGame } from '../phaser/phaser-wagroove-game'

export const PhaserWargrooveGameContext = React.createContext<{ game: PhaserWargrooveGame, setGame: (v: PhaserWargrooveGame) => void }>({
    game: null,
    setGame: () => { }
})

const GameBoard = ({ match, onSelected }: { match: Match, onSelected?: Function }) => {
    let { game, setGame } = useContext(PhaserWargrooveGameContext)
    //let [game, setGame] = useState<WargrooveMatchViewer>(null)



    useEffect(() => {
        if (!game) {
            game = new PhaserWargrooveGame({ updateUI: onSelected })
        }

        game.onReady(() => {
            game.setMatch(match)
            game.onSceneReady(() => {
                setGame(game)
            })
        })
    }, [match])

    return <Box
        id="phaser-wargroove-game"
        overflow="hidden"
    />
}

export default GameBoard