import Phaser from "phaser";
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import { PhaserWargrooveScene } from './phaser-wagroove-scene';

import { Match } from "../wg/match";

const config: Phaser.Types.Core.GameConfig = {
    title: "Wargroove Match Viewer",
    type:  Phaser.WEBGL,
    render: {
        pixelArt: true
    },
    parent: "phaser-wargroove-game",
    backgroundColor: '#fff',//"#e7dab0",
    scene: [PhaserWargrooveScene],
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
        }]
    }
};

export class PhaserWargrooveGame extends Phaser.Game {
    readonly updateUI: Function

    constructor({ updateUI }: { updateUI?: Function } = {}){
        super(config)
        this.updateUI = updateUI
    }    

    setMatch(match: Match) {
        let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
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
        let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
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
        let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
        return scene?.getFrameCanvas(colorName, frameNames)
    }
}