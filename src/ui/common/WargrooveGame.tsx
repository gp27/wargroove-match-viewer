import React, { useEffect } from 'react'
import { PhaserWargrooveGame } from '../../phaser/phaser-wagroove-game'
import PhaserGame from './generic/PhaserGame'
import { Match } from '../../wg/match'

export default function WargrooveGame({
  match,
  onSelected,
  onReady,
  onGameCreated,
}: {
  match: Match
  onSelected?: Function
  onReady?: Function
  onGameCreated?: (game: PhaserWargrooveGame) => void
}) {
  const [game, setGame] = React.useState<PhaserWargrooveGame>()

  const onGameCreatedInernal = (game: PhaserWargrooveGame) => {
    setGame(game)
    onGameCreated?.(game)
  }

  useEffect(() => {
    game?.setMatch(match)
  }, [match, game])

  return (
    <PhaserGame
      parentId="phaser-wargroove-game"
      gameClass={PhaserWargrooveGame}
      gameParams={[{ updateUI: onSelected, match, onReady }]}
      onGameCreated={onGameCreatedInernal}
    />
  )
}
