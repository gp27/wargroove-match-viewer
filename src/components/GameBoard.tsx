import React, { useContext, useEffect, useState } from "react"
import { Box } from "grommet";
import { Match } from "../match";

import { WargrooveMatchViewer } from '../phaser/macth-viewer'

let game: WargrooveMatchViewer = null
export const MatchViewerContext = React.createContext({
    get game(){ return game },
    setGame: (v: WargrooveMatchViewer) => { game = v }
})

const GameBoard = ({ match }: { match: Match }) => {
    let { game, setGame } = useContext(MatchViewerContext)
    //let [game, setGame] = useState<WargrooveMatchViewer>(null)

    useEffect(() => {
        if (!game) {
            game = new WargrooveMatchViewer()
            setGame(game)
        }

        game.onReady(() => {
            game.setMatch(match)
        })
    }, [match])

    return <Box
        id="game-board"
        overflow="hidden"
    />
}

export default GameBoard

/*export default class GameBoard extends React.Component<{ match: Match }> {
    game: WargrooveMatchViewer
   
    render() {
        return (
            <Box
                id="game-board"
                overflow="hidden"
            />
        );
    }

    componentDidMount() {
        this.game = new WargrooveMatchViewer()
        this.game.onReady(() => {
            this.game.setMatch(this.props.match)
        })
    }

    componentDidUpdate(){
        //this.game.setMatch(this.props.match)
    }
}*/