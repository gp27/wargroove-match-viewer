import './match'
import * as Phaser from "phaser";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';


import { MatchScene } from './match-scene';

const config: Phaser.Types.Core.GameConfig = {
  title: "Wargroove Match Viewer",
  width: 1920,
  height: 1080,
  parent: "game",
  //backgroundColor: "#aaa",
  scene: [MatchScene],
  scale: {
    
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
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
  
}
window.onload = () => {
  var game = new WargrooveMatchViewer(config);
};
