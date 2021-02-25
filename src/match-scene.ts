import * as Phaser from'phaser'
import { RoundRectangle, GridTable, Label } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { getMatchStates, getPlayerTurns, Match, PlayerTurn, State } from './match'
import { WargrooveBoard } from './wargroove-board'

import { testMatch } from '../wg-match'

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

      anchor: {
        left: 'left+10',
        top: 'top+10',
        bottom: '100%'
      },
      width: 300,
      height: 580,

      scrollMode: 0,

      background: this.add.existing(new RoundRectangle(this, 0, 0, 20, 10, 10, COLOR_PRIMARY)),

      header: this.add.existing(new Label(this, {
        height: 20,
        text: this.add.text(0, 0, 'Turns')
      })),

      table: {
        cellHeight: 60,
        columns: 1,
        mask: {
          padding: 2
        },
        reuseCellContainer: true
      },

      slider: {
        track: this.add.existing(new RoundRectangle(this, 0, 0, 20, 10, 10, COLOR_DARK)),
        thumb: this.add.existing(new RoundRectangle(this, 0, 0, 0, 0, 13, COLOR_LIGHT)),
      },

      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,

        table: 10,
        header: 10,
      },

      items: this.states,

      createCellContainerCallback: ({ scene, width, height, item, index }, cellContainer) => {
        if(cellContainer === null){
          cellContainer = scene.add.existing(new Label(scene, {
            width,
            height,

            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 20, 0)).setStrokeStyle(1, COLOR_DARK),
            icon: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 20, 10, 0x0)),
            text: scene.add.text(0, 0, ""),

            space: {
              icon: 10,
              left: 15,
              top: 0
            }
          }))
        }

        cellContainer.setMinSize(width, height)
        cellContainer.getElement('text').setText(item.id)
        cellContainer.getElement('icon').setFillStyle(item.playerId ? 0xff0000 : 0x00ff00)
        cellContainer.getElement('background').setStrokeStyle(1, COLOR_DARK).setDepth(0)

        return cellContainer
      }
    })
    this.add.existing(gridTable).layout()


    let board = new WargrooveBoard(this).setMap(this.match.map)

    this.add.existing(board) 
  }

  update(){

  }

  selectTurnState(turnId, stateId){
    this.currentTurn = this.turns.find(t => t.id == turnId)
    this.currentState = this.currentTurn.states.find(s=> s.id == stateId)
  }
}