export type Palette = Record<string, Uint8ClampedArray>

let savedPalettes: Record<string, Palette> = {}

export function generatePalette(
  paletteKey: string,
  canvas: HTMLImageElement | HTMLCanvasElement,
  names: string[]
) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    let image = canvas
    canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    canvas.getContext('2d').drawImage(image, 0, 0)
  }

  let { width, height } = canvas

  let pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data

  let palette: Palette = {}

  for (let y = 0; y < names.length; y++) {
    palette[names[y]] = pixels.slice(y * width * 4, (y * width + width) * 4)
  }

  savedPalettes[paletteKey] = palette
}

function swapPalette(
  palettes: Palette,
  pixels: Uint8ClampedArray,
  from: string | string[],
  to: string
) {
  from = from instanceof Array ? from : [from]

  let toPalette = palettes[to]

  if (!toPalette) return

  for (let name of from) {
    let fromPalette = palettes[name]
    if (!fromPalette) continue

    for (var p = 0; p < pixels.length / 4; p++) {
      var index = 4 * p

      let [r, g, b, alpha] = pixels.slice(index, index + 4)

      if (alpha === 0) continue

      // Iterate through the colors in the palette.
      for (var i = 0; i < fromPalette.length; i += 4) {
        var [or, og, ob] = fromPalette.slice(i, i + 4)
        var [nr, ng, nb] = toPalette.slice(i, i + 4)

        // If the color matches, replace the color.
        if (r === or && g === og && b === ob && alpha === 255) {
          pixels[index++] = nr
          pixels[index++] = ng
          pixels[index++] = nb
        }
      }
    }
  }
}

export function applyPalette(
  source: HTMLCanvasElement | HTMLImageElement,
  paletteKey: string,
  from: string,
  to: string
) {
  let canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height

  let ctx = canvas.getContext('2d')
  ctx.drawImage(source, 0, 0)

  let imageData = ctx.getImageData(0, 0, source.width, source.height)
  let pixels = imageData.data

  if (from != to) {
    //swapPalette(savedPalettes[paletteKey], pixels, ['red', 'blue', 'green', 'yellow',  'purple', 'teal', 'orange', 'black'], 'grey')
    swapPalette(savedPalettes[paletteKey], pixels, from, to)
    ctx.putImageData(imageData, 0, 0)
  }

  return canvas as unknown as HTMLImageElement
}
