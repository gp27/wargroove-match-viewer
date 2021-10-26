import Phaser from 'phaser'
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js'
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin.js'
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js'
import { PhaserWargrooveScene } from './phaser-wagroove-scene'

import { Match, UnitData } from '../wg/match'
import { getUnitFrameNames } from '../wg/match-utils'

const config: Phaser.Types.Core.GameConfig = {
  title: 'Wargroove Match Viewer',
  type: Phaser.WEBGL,
  render: {
    pixelArt: true,
  },
  parent: 'phaser-wargroove-game',
  backgroundColor: '#e7dab0', //"#e7dab0",
  scene: [PhaserWargrooveScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: Phaser.Scale.MAX_ZOOM,
  },
  input: {
    activePointers: 2,
  },
  plugins: {
    global: [
      {
        key: 'rexGlowFilterPipeline',
        plugin: GlowFilterPipelinePlugin,
        start: true,
      },
      {
        key: 'rexOutlinePipeline',
        plugin: OutlinePipelinePlugin,
        start: true,
      },
      /*{
        key: 'rexAwaitLoader',
        plugin: AwaitLoaderPlugin,
        start: true,
      }*/
    ],
  },
}

export class PhaserWargrooveGame extends Phaser.Game {
  readonly updateUI: Function

  constructor({
    updateUI,
    match,
    onReady,
  }: { updateUI?: Function; match?: Match; onReady?: Function } = {}) {
    super(config)
    this.updateUI = updateUI
    if (match) {
      this.setMatch(match)
    }

    if (onReady) {
      this.onReady(() => {
        let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
        if (scene.loaded) onReady()
        else scene.events.once('create', onReady)
      })
    }
  }

  setMatch(match: Match) {
    console.log(match)

    this.onReady(() => {
      let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
      scene.loadMatch(match)
    })
  }

  private onReady(cb: Function) {
    if (this.isRunning) {
      cb()
    } else {
      this.events.on('ready', cb)
    }
  }

  getFrameCanvas(colorName: string, frameNames: string[], scale?: number) {
    let scene = this.scene.getScene('MatchScene') as PhaserWargrooveScene
    if (!scene?.loaded) return
    return scene.getFrameCanvas(colorName, frameNames, scale)
  }

  getUnitFrame(
    match: Match,
    { playerId, unitClassId }: UnitData,
    scale?: number
  ) {
    let { faction = 'cherrystone', color = 'grey' } =
      match.getPlayers()[playerId] || {}
    let frameNames = getUnitFrameNames(unitClassId, faction)
    return this.getFrameCanvas(color, frameNames, scale)
  }
}
