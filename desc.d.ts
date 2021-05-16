declare module 'phaser3-rex-plugins/plugins/board-components' {
    import 'phaser'
    export class Board extends Phaser.GameObjects.GameObject {
        constructor(scene: Phaser.Scene, config: any)
        setBoardWidth: Function
        setBoardHeight: Function
        removeAllChess: Function
        addChess: Function
        moveChess: Function
        getGridPoints: Function
        tileXYZToChess: Function
        chessToTileXYZ: Function
    }

    export class Shape extends Phaser.GameObjects.GameObject {
        constructor(board: Board, ...any)
        setStrokeStyle: Function
        setScale: Function
    }

    export class PathFinder extends Phaser.GameObjects.GameObject {
        constructor(...any)

        findArea(movingPoints: number): { x: number, y: number, pathCost: number }[]
    }

    export class FieldOfView extends Phaser.GameObjects.GameObject {
        constructor(...any)

        findFOV: Function
    }
}