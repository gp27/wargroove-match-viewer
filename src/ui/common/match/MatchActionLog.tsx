import React, { useEffect, useState } from 'react'
import { Match } from '../../../wg/match'
import {Box, Paper, Typography} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { PhaserWargrooveGame } from '../../../phaser/phaser-wagroove-game'
import { UnitFrame } from '../UnitList'

export function MatchActionLog({
  match,
  game,
}: {
  match: Match
  game?: PhaserWargrooveGame
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const actionLog = match.getCurrentEntry().actionLog

  if(!actionLog) return null

  const { action, unit, otherUnits } = actionLog

  return (
    <Box sx={{ p: 1 }}>
      <Paper sx={{ p: isMobile ? '4px' : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {unit && (
            <UnitFrame
              match={match}
              unit={unit}
              game={game}
              scale={isMobile ? 1 : 1.5}
            />
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              textTransform: 'capitalize',
              fontSize: isMobile ? '1rem' : '1.25rem',
            }}
          >
            {action.replace(/_/g, ' ')}
          </Typography>
          {unit && otherUnits && (
            <Box sx={{ display: 'flex' }}>
              {otherUnits.map((u) => (
                <UnitFrame
                  key={u.id}
                  match={match}
                  unit={u}
                  game={game}
                  scale={isMobile ? 1 : 1.5}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
