import * as Phaser from'phaser'
import { RoundRectangle, GridTable, Label } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { MatchData, Match, PlayerTurn, State, getPlayerColor } from './match'
import { WargrooveBoard } from './wargroove-board'

import { testMatch } from './wg-match'

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export class MatchScene extends Phaser.Scene {
  match: Match

  constructor() {
    super({key: 'MatchScene'})
  }

  init({ match = testMatch }: { match: MatchData }) {
    this.match = new Match(match)
    console.log(this.match)
  }

  preload(){
    

    //this.load.image('maptiles', "assets/maptiles.png")
  }

  create(){
    //let map = this.make.tilemap({ key: 'map' })    

    let gridTable = new GridTable(this, {

      anchor: {
        left: 'left+10',
        top: 'top+10',
        bottom: '100%'
      },
      width: 300,
      height: 1060,

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

      items: this.match.getEntries(),

      createCellContainerCallback: ({ scene, width, height, item, index }, cellContainer) => {
        if(cellContainer === null){
          cellContainer = scene.add.existing(new Label(scene, {
            width,
            height,

            background: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 20, 0)).setStrokeStyle(1, COLOR_DARK),
            icon: scene.add.existing(new RoundRectangle(scene, 0, 0, 20, 20, 10, 0)),
            text: scene.add.text(0, 0, ""),

            space: {
              icon: 10,
              left: 15,
              top: 0
            }
          }))
        }

        cellContainer.setMinSize(width, height)

        this.updateCellContainer(cellContainer, item)

        return cellContainer
      }
    })
    this.add.existing(gridTable).layout()

    let board = new WargrooveBoard(this)
      .setMap(this.match.getMap())
      .loadMatchEntry(this.match.getCurrentEntry())

    gridTable.on('cell.click', (cellContainer, cellIndex, pointer) => {
      let entry = this.match.selectEntry(cellIndex)
      gridTable.refresh()
      board.loadMatchEntry(entry)
    })
  }

  update(){
  }

  updateCellContainer(cellContainer, item) {
    let { turnNumber, playerId } = item.turn
    let moveNumber = item.turn.entries.indexOf(item) + 1
    let playerColor = getPlayerColor(playerId)

    let background = cellContainer.getElement('background')
    let currentEntry = this.match.getCurrentEntry()

    if (item.turn.mainEntry != item) {
      background.setStrokeStyle(1, COLOR_DARK).setDepth(0)
    }
    else {
      background.setStrokeStyle(1, playerColor).setDepth(1)
    }

    cellContainer.getElement('text').setText(`T${turnNumber} P${playerId + 1} - Move ${moveNumber}`).setDepth(2)
    cellContainer.getElement('icon').setFillStyle(playerColor).setDepth(2)

    if (item == currentEntry) {
      background.setFillStyle(COLOR_LIGHT)
    }
    else {
      background.setFillStyle()
    }
  }
}