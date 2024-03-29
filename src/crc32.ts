const crcTable: number[] = []
let c: number

for (var n = 0; n < 256; n++) {
  c = n
  for (var k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

export function crc32(str: string) {
  let crc = 0 ^ -1
  for (var i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff]
  }
  return (crc ^ -1) >>> 0
}
