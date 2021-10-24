import React from 'react'
import { Entry, Match, PlayerTurn, UnitData } from '../../wg/match'

import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  Chip,
} from '@mui/material'

import { Favorite, FlashOn } from '@mui/icons-material'
import { PhaserWargrooveGame } from '../../phaser/phaser-wagroove-game'

export default function PlayersUnitList({ match, game }: { match: Match, game?: PhaserWargrooveGame }){
    return (
      <React.Fragment>
        {match.getPlayers().map((player, i) => (
          <Box key={i} sx={{overflow: 'auto'}}>
            <UnitList match={match} playerId={player.id} game={game} />
          </Box>
        ))}
      </React.Fragment>
    )
}

export function UnitList({
  match,
  playerId,
  game,
}: {
  match: Match
  playerId?: number
  game?: PhaserWargrooveGame
}) {
  let units = match.getCurrentCombatUnits(playerId)

  return (
    <List sx={{ display: 'flex', flexDirection: 'row', p: 0 }}>
      {units.map((unit, i) => (
        <UnitListItem key={i} unit={unit} match={match} game={game}/>
      ))}
    </List>
  )
}

function UnitListItem({
  unit,
  match,
  game
}: {
  match: Match
  unit: UnitData
  game?: PhaserWargrooveGame
}) {
    const {
    id,
    playerId,
    unitClassId,
    health,
    grooveCharge,
    grooveId,
    unitClass: { maxGroove },
    } = unit

  return (
    <ListItem sx={{ minWidth: 220 }}>
        <ListItemAvatar>
          <UnitFrame match={match} unit={unit} game={game} />
        </ListItemAvatar>
      <ListItemText
        primary={unitClassId.replace('commander_', '') + ` (ID:${id})`}
        secondary={
          <>
            <Favorite sx={{ width: 20, height: 20, verticalAlign: 'middle' }} />{' '}
            {health}%{' '}
            {grooveId && (
              <>
                <FlashOn
                  sx={{ width: 20, height: 20, verticalAlign: 'middle' }}
                />{' '}
                {Math.round((grooveCharge / maxGroove) * 100) + '%'}
              </>
            )}
          </>
        }
      />
    </ListItem>
  )
}

export function UnitFrame({ match, unit, game, scale }: { match: Match, unit: UnitData, game?: PhaserWargrooveGame, scale?: number }){
  const frame = game?.getUnitFrame(match, unit, scale)
  function setFrame(ele: HTMLElement) {
    if (!ele) return
    ele.innerHTML = ''
    ele.append(frame)
  }
  return <>{frame && <div ref={setFrame}></div>}</>
}