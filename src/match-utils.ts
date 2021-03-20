export const terrains = {
  forest:     "F",
  river:      "I",
  mountain:   "M",
  reef:       "R",
  wall:       "W",
  bridge:     "b",
  ocean:      "o",
  beach:      "e",
  cobblestone:"f",
  plains:     "p",
  road:       "r",
  sea:        "s"
}

export const terrainAbbrvs: Record<string, string> = Object.entries(terrains)
  .reduce((o, [key, val]) => (o[val] = key, o), {})

export const terrainColors = {
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
  sea: 0x549af0
}

export const playerColors = {
  red: { hex: '#b41c10' },
  blue: { hex: '#3969a4' },
  green: { hex: '#5da21a' },
  yellow: { hex: '#cc9212' },
  purple: { hex: '#a434b4' },
  teal: { hex: '#31ae8b' },
  pink: { hex: '#e62cac' },
  orange: { hex: '#cd5d10' },
  black: { hex: '#5c465e' },
  grey: { hex: '#737288' }
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

const commandersMeta: Record<string,{color: PlayerColor, faction: string}> = {
  mercia: { color: 'red', faction: 'cherrystone' },
  caesar: { color: 'red', faction: 'cherrystone' },
  mercival: { color: 'red', faction: 'cherrystone' },
  emric: { color: 'red', faction: 'cherrystone' },
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
  vesper: { color: 'black', faction: 'outlaw' }
}

export function getCommanderMeta(commander: string){
  return commandersMeta[commander]
}

