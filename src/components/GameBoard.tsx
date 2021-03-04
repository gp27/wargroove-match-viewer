import React from "react"

import Phaser from "phaser";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';


import { MatchScene } from '../match-scene';
import { Box } from "grommet";

const config: Phaser.Types.Core.GameConfig = {
    title: "Wargroove Match Viewer",
    parent: "game-board",
    backgroundColor: "#fff",
    scene: [MatchScene],
    /*scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },*/
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
}

export default class GameBoard extends React.Component {
    game: Phaser.Game
   
    render() {
        return (
            <Box
                id="game-board"
                background="brand"
                round="small"
                margin="small"
                overflow="hidden"
            />
        );
    }

    componentDidMount() {
        this.game = new WargrooveMatchViewer(config)
    }
}