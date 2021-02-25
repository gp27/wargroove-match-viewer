import './match'
import * as Phaser from "phaser";
//import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

import { MatchScene } from './match-scene';

const config: Phaser.Types.Core.GameConfig = {
  title: "Wargroove Match Viewer",
  width: 1200,
  height: 600,
  parent: "game",
  //backgroundColor: "#aaa",
  scene: [MatchScene],
  /*plugins: {
    scene: [{
      key: 'rexUI',
      plugin: UIPlugin,
      mapping: 'rexUI'
    }]
  }*/
};
export class WargrooveMatchViewer extends Phaser.Game {
  
}
window.onload = () => {
  var game = new WargrooveMatchViewer(config);
};
