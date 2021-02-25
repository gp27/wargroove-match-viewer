declare module 'phaser3-rex-plugins/plugins/board-components' {
    import 'phaser'
    export class Board extends Phaser.GameObjects.GameObject {
        constructor(scene: Phaser.Scene, config: any)
        setBoardWidth: Function
        setBoardHeight: Function
        removeAllChess: Function
        addChess: Function
    }

    export class Shape extends Phaser.GameObjects.GameObject {
        constructor(board: Board, ...any)
        setStrokeStyle: Function
        setScale: Function
    }

    export class Monopoly extends Phaser.GameObjects.GameObject {
        constructor(...any)
    }
}