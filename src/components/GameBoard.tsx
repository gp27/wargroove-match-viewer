import React, { useContext, useEffect, useState } from "react"
import { Box } from "grommet";
import { Match } from "../match";

import { WargrooveMatchViewer } from '../phaser/macth-viewer'

export const MatchViewerContext = React.createContext<{ game: WargrooveMatchViewer, setGame: (v: WargrooveMatchViewer) => void }>({
    game: null,
    setGame: () => { }
})

const GameBoard = ({ match }: { match: Match }) => {
    let { game, setGame } = useContext(MatchViewerContext)
    //let [game, setGame] = useState<WargrooveMatchViewer>(null)



    useEffect(() => {
        if (!game) {
            game = new WargrooveMatchViewer()
        }

        game.onReady(() => {
            game.setMatch(match)
            game.onSceneReady(() => {
                setGame(game)
            })
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