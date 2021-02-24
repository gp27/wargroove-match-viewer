import 'phaser'
import { ScrollablePanel, RoundRectangle, GridTable, Label } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { getMatchStates, getPlayerTurns, Match, PlayerTurn, State } from './match'

import * as testMatch from '../wg-match.json'

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export class MatchScene extends Phaser.Scene {
  match: Match
  states: State[]
  turns: PlayerTurn[]

  currentTurn: PlayerTurn | null = null
  currentState: State | null = null

  ui: Record<string,any> = {}

  constructor() {
    super({key: 'MatchScene'})
  }

  init([match = testMatch]: [Match]) {
    this.match = match
    this.states = getMatchStates(match)
    this.turns = getPlayerTurns(this.states)
    
    this.selectTurnState(0, 0)

    console.log(this.turns)
  }

  preload(){
    

    //this.load.image('maptiles', "assets/maptiles.png")
  }

  create(){
    //let map = this.make.tilemap({ key: 'map' })
    var gridTable = new GridTable(this, {
      x: 10, y: 0,
      width: 300,
      height: 500,

      scrollMode: 0,

      background: new RoundRectangle(this, 0, 0, 20, 10, 10, COLOR_PRIMARY),

      header: {
        text: this.add.text(0, 0, 'Turns')
      },

      table: {
        cellHeight: 60,
        columns: 1,
        mask: {
          padding: 2
        },
        reuseCellContainer: true
      },

      /*slider: {
        track: new RoundRectangle(this, 0, 0, 20, 10, 10, COLOR_DARK),
        thumb: new RoundRectangle(this, 0, 0, 0, 0, 13, COLOR_LIGHT),
      },*/

      space: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,

        table: 10,
        header: 10,
      },

      items: this.turns,

      createCellContainerCallback: ({ scene, width, height, item, index }, cellContainer) => {
        if(cellContainer === null){
          cellContainer = new Label(scene, {
            width,
            height,
            icon: new RoundRectangle(scene, 0, 0, 20, 20, 10, 0x0),
            text: scene.add.text(0, 0, "")
          })
        }

        cellContainer.setMinSize(width, height)
        cellContainer.getElement('text').setText(item.id)
        cellContainer.getElement('icon').setColor(item.playerId ? 0xff0000 : 0x00ff00)

      }
    })

    /*var turnsPanel = this.ui.turnsPanel = new ScrollablePanel(this, {
      x: 0,
      y: 0,
      width: 100,
      height: 400,
      scrollMode: 'v',
      panel: {
        child: new GridTable(this, { width: 100, height: 400 })
      },
      slider: {
        track: this.add.existing(new RoundRectangle(this, 0, 0, 20, 10, 10, 0x260e04)),
        thumb: this.add.existing(new RoundRectangle(this, 0, 0, 0, 0, 13, 0x7b5e57))
      }
    })*/

    this.add.existing(gridTable)
  }

  update(){

  }

  selectTurnState(turnId, stateId){
    this.currentTurn = this.turns.find(t => t.id == turnId)
    this.currentState = this.currentTurn.states.find(s=> s.id == stateId)
  }
}