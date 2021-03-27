import Phaser from "phaser";
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import { MatchScene } from '../phaser/match-scene';

import { Match } from "../match";

const config: Phaser.Types.Core.GameConfig = {
    title: "Wargroove Match Viewer",
    type:  Phaser.WEBGL,
    render: {
        pixelArt: true
    },
    parent: "game-board",
    backgroundColor: '#fff',//"#e7dab0",
    scene: [MatchScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
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
            key: 'palette',
            plugin: PalettePlugin,
            mapping: 'palette',
            start: true
        }]*/
    }
};

export class WargrooveMatchViewer extends Phaser.Game {
    constructor(){
        super(config)
    }    

    setMatch(match: Match) {
        let scene = this.scene.getScene('MatchScene') as MatchScene
        scene.loadMatch(match)
    }

    onReady(cb: Function){
        if(this.isRunning){
            cb()
        }
        else {
            this.events.on('ready', cb)
        }
    }

    onSceneReady(cb: Function){
        let scene = this.scene.getScene('MatchScene') as MatchScene
        if (scene.loaded) {
            cb()
        }
        else {
            scene.events.once('create', () => {
                setTimeout(cb)
            })
        }
    }

    getFrameCanvas(colorName: string, frameNames: string[]){
        let scene = this.scene.getScene('MatchScene') as MatchScene
        return scene?.getFrameCanvas(colorName, frameNames)
    }
}