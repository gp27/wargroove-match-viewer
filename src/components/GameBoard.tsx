import React from "react"

import Phaser from "phaser";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';


import { MatchScene } from '../match-scene';
import { Box } from "grommet";
import { Match } from "../match";

const config: Phaser.Types.Core.GameConfig = {
    title: "Wargroove Match Viewer",
    parent: "game-board",
    backgroundColor: "#fff",
    scene: [MatchScene],
    scale: {
        mode: Phaser.Scale.RESIZE ,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: Phaser.Scale.MAX_ZOOM
    },
    plugins: {
        global: [{
            key: 'rexAwaitLoader',
            plugin: AwaitLoaderPlugin,
            start: true
        }],
        /*scene: [{
          key: 'rexUI',
          plugin: UIPlugin,
          mapping: 'rexUI'
        }]*/
    }
};

export class WargrooveMatchViewer extends Phaser.Game {
    setMatch(match: Match){
        let scene = this.scene.getScene('MatchScene') as MatchScene
        scene.loadMatch(match)
    }
}

export default class GameBoard extends React.Component<{ match: Match }> {
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
        this.game = new WargrooveMatchViewer(config)
    }

    componentDidUpdate(){
        if(this.props.match){
            this.game.setMatch(this.props.match)
        }
    }
}