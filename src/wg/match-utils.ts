import { Terrain } from '../phaser/phaser-wargroove-map'

export const terrainColors: Record<Terrain, number> = {
  forest: 0x277d23,
  river: 0x9ad6d4,
  mountain: 0x5c3600,
  reef: 0x33312e,
  wall: 0x333333,
  bridge: 0xd9d9d9,
  ocean: 0x03005c,
  beach: 0xf0e8a5,
  cobblestone: 0x9c9c9c,
  plains: 0xadd49f,
  road: 0xe0cea4,
  sea: 0x549af0,
  carpet: 0xcc3333,
}

export const playerColors = {
  red: { hex: '#b41c10', val: 0xb41c10 },
  blue: { hex: '#3969a4', val: 0x3969a4 },
  green: { hex: '#5da21a', val: 0x5da21a },
  yellow: { hex: '#cc9212', val: 0xcc9212 },
  purple: { hex: '#a434b4', val: 0xa434b4 },
  teal: { hex: '#31ae8b', val: 0x31ae8b },
  pink: { hex: '#e62cac', val: 0xe62cac },
  orange: { hex: '#cd5d10', val: 0xcd5d10 },
  black: { hex: '#5c465e', val: 0x5c465e },
  grey: { hex: '#737288', val: 0x737288 },
}

/*export const playerColors = {
  red: { hex: '#e00031' },
  blue: { hex: '#1d81e4' },
  green: { hex: '#abcb05' },
  yellow: { hex: '#f7d863' },
  purple: { hex: '#bc47d6' },
  teal: { hex: '#10ca94' },
  pink: { hex: '#ff28b4' },
  orange: { hex: '#ff7518' },
  black: { hex: '#5f4d72' },
  grey: { hex: '#a7a4b2' }
}*/

export type PlayerColor = keyof typeof playerColors

const commandersMeta: Record<string, { color: PlayerColor; faction: string }> =
  {
    mercia: { color: 'red', faction: 'cherrystone' },
    caesar: { color: 'red', faction: 'cherrystone' },
    mercival: { color: 'red', faction: 'cherrystone' },
    emeric: { color: 'red', faction: 'cherrystone' },
    valder: { color: 'blue', faction: 'felheim' },
    ragna: { color: 'blue', faction: 'felheim' },
    sigrid: { color: 'blue', faction: 'felheim' },
    greenfinger: { color: 'green', faction: 'floran' },
    nuru: { color: 'green', faction: 'floran' },
    sedge: { color: 'green', faction: 'floran' },
    tenri: { color: 'yellow', faction: 'heavensong' },
    ryota: { color: 'yellow', faction: 'heavensong' },
    koji: { color: 'yellow', faction: 'heavensong' },
    elodie: { color: 'purple', faction: 'guardian' },
    darkmercia: { color: 'purple', faction: 'guardian' },
    wulfar: { color: 'black', faction: 'outlaw' },
    twins: { color: 'black', faction: 'outlaw' },
    vesper: { color: 'black', faction: 'outlaw' },
  }

export function getCommanderMeta(commander: string) {
  return commandersMeta[commander]
}

export function getUnitFrameNames(unitClassId: string, faction: string) {
  let names = [unitClassId + '_' + faction, unitClassId]

  if (faction != 'cherrystone') {
    names.push(unitClassId + '_cherrystone')
  }

  return names
}


const xmashatOriginsByClass = {
  soldier: [0.1, -0.2],
  soldier_felheim: [0.12, -0.2],
  dog: [0.2, -0.15],
  dog_floran: [0.18, -0.12],
  spearman: [-0.1, -0.2],
  mage: [0.15, -0.2],
  mage_floran: [0.05, -0.2],
  giant: [0.15, -0.4],
  harpy: [0.15],
  witch: [0.15],
  witch_cherrystone: [0.1, -0.25],
  balloon: [0.24, -0.45],
  balloon_heavensong: [0.15, -0.4],
  balloon_felheim: [0.18, -0.45],
  dragon: [0.3, -0.05],
  dragon_heavensong: [0.3, 0],
  dragon_felheim: [0.32, 0],
  archer: [0.1],
  archer_heavensong: [0.12, -0.2],
  thief: [0.15, -0.25],
  thief_with_gold: [0.25, -0.25],
  vine: [0.15],
  commander_mercia: [0.12],
  commander_darkmercia: [0.12],
  commander_wulfar: [0.07, -0.28],
  commander_twins: [0, -0.1],
  commander_caesar: [0.18, 0],
  commander_koji: [-0.05],
  commander_ragna: [0.12, -0.25],
  commander_valder: [0.1, -0.25],
  commander_elodie: [0.15],
  commander_sigrid: [0.15],
  commander_sedge: [0.05, -0.2],
  commander_emeric: [0.1],
  merman: [0.15, -0.2],
  rifleman: [0, -0.25],
  wagon: [0.3, -0.35],
  trebuchet: [0.32, -0.32],
}

;(window as any).xmashatOriginsByClass = xmashatOriginsByClass

export function getXmasHatOriginByClass(unitClass: string, faction){
  let [ox = 0, oy = -0.3] =
    xmashatOriginsByClass[`${unitClass}_${faction}`] ||
    xmashatOriginsByClass[unitClass] ||
    []
  return [ox, oy]
}

