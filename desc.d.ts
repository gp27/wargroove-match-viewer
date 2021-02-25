declare module 'phaser3-rex-plugins/plugins/board-components' {
    import 'phaser'
    export class Board extends Phaser.GameObjects.GameObject {
        constructor(scene: Phaser.Scene, config: any)
        setBoardWith: Function
        setBoardHeight: Function
    }

    export class Shape extends Phaser.GameObjects.GameObject {
        constructor(...any)
        setStrokeStyle: Function
    }
}