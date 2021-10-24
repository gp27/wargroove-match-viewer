import React, { useEffect, useState } from 'react'
import { Match } from '../../../wg/match'
import {Box, Paper, Typography} from '@mui/material'
import { Favorite, FlashOn } from '@mui/icons-material'
import { PhaserWargrooveGame } from '../../../phaser/phaser-wagroove-game'
import { UnitFrame } from '../UnitList'

export function MatchActionLog({
  match,
  game,
}: {
  match: Match
  game?: PhaserWargrooveGame
}) {
  const actionLog = match.getCurrentEntry().actionLog

  if(!actionLog) return null

  const { action, unit, otherUnits } = actionLog

  return (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {unit && <UnitFrame match={match} unit={unit} game={game} scale={1.5} />}
          <Typography
            variant="h6"
            component="div"
            sx={{ textTransform: 'capitalize' }}
          >
            {action.replace(/_/g, ' ')}
          </Typography>
          {unit && otherUnits && (
            <Box sx={{ display: 'flex' }}>
              {otherUnits.map((u) => (
                <UnitFrame key={u.id} match={match} unit={u} game={game} scale={1.5} />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
