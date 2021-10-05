import Box, { BoxProps } from '@mui/system/Box'
import React, { useEffect, useState } from 'react'

export type PhaserGameGenerator = (parentId: string) => Phaser.Game

type CParams<T> = ConstructorParameters<new(...a: any[]) => T>
type GameParams<T extends Phaser.Game> = CParams<T>

export default function PhaserGame<T extends Phaser.Game, P extends GameParams<T>>({
  gameClass,
  gameParams,
  onGameCreated,
  parentId,
  ...boxProps
}: {
  gameClass: new(...a: P) => T,
  gameParams?: P,
  onGameCreated?: (game: T) => void,
  parentId?: string
} & BoxProps) {
  const [gameParentId] = useState(
    parentId || 'game-' + Math.random().toString().substr(2)
  )
  useEffect(() => {
    const game = new gameClass(...gameParams || [] as P)
    onGameCreated?.(game)
    return () => {
      game.destroy(true)
    }
  }, [])

  return <Box id={gameParentId} {...boxProps} />
}
