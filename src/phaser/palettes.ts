export type Palette = Record<string, Phaser.Display.Color[]>

function swapPalette(palettes: Palette, pixels: Uint8ClampedArray, from: string | string[], to: string){
    from = from instanceof Array ? from : [from]

    let toPalette = palettes[to]

    if(!toPalette) return

    for (let name of from) {
        let fromPalette = palettes[name]
        if(!fromPalette) continue

        for (var p = 0; p < pixels.length / 4; p++) {
            var index = 4 * p;

            var r = pixels[index];
            var g = pixels[++index];
            var b = pixels[++index];
            var alpha = pixels[++index];

            if (alpha === 0) continue

            // Iterate through the colors in the palette.
            for (var i = 0; i < fromPalette.length; i++) {
                var oldColor = fromPalette[i];
                var newColor = toPalette[i];

                // If the color matches, replace the color.
                if (r === oldColor.red && g === oldColor.green && b === oldColor.blue && alpha === 255) {
                    pixels[--index] = newColor.blue;
                    pixels[--index] = newColor.green;
                    pixels[--index] = newColor.red;
                }
            }
        }
    }
}

let savedPalettes: Record<string, Palette> = {}

export class PalettePlugin extends Phaser.Plugins.BasePlugin {

    generatePalette(paletteKey: string, names: string[]){
        let width = this.game.textures.get(paletteKey).getSourceImage().width
        let palette: Palette = {}

        for (let y = 0; y < names.length; y++) {
            let p = palette[names[y]] = []

            for (let x = 0; x < width; x++) {
                p.push(this.game.textures.getPixel(x, y, 'palette'))
            }
        }

        savedPalettes[paletteKey] = palette
    }

    applyPalette(imageKey: string, paletteKey: string, from: string, to: string){
        let canvas = this.game.textures.get(imageKey).getSourceImage() as HTMLCanvasElement

        let canvasTexture = this.game.textures.createCanvas(imageKey + '-' + to, canvas.width, canvas.height)
        let ctx = canvasTexture.getContext()
        ctx.drawImage(canvas, 0, 0)

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let pixels = imageData.data
        
        if(from != to){
            swapPalette(savedPalettes[paletteKey], pixels, from, to)
            ctx.putImageData(imageData, 0, 0)
        }

        canvas = canvasTexture.getSourceImage() as HTMLCanvasElement

        let img = new Image()
        img.src = (canvas as any).toDataURL('image/png')
        //console.log(img)

        canvasTexture.destroy()
        return img
    }
}