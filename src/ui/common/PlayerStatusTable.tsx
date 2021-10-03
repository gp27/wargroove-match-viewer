import React, { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { PlayerChip } from './PlayerChips'
import IconButton from '@mui/material/IconButton'
import { AutoAwesome, Cancel } from '@mui/icons-material'
import { Match } from '../../wg/match'

export default function PlayerStatusTable({ match }: { match: Match }) {
    let players = match.getPlayers()
    let entries = match.getEntries()
    let entry = match.getCurrentEntry()

    let isLastEntry = entry == entries[entries.length - 1]
    let victoriusPlayers = players.filter((p) => p.is_victorious)

    return (
      <TableContainer
        component={Paper}
        sx={{ maxHeight: '100%', maxWidth: '100%' }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Gold</TableCell>
              <TableCell align="right">Income</TableCell>
              <TableCell align="right">Unit Count</TableCell>
              <TableCell align="right">Combat U.C.</TableCell>
              <TableCell align="right">Army Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player, i) => {
              const { gold, income, unitCount, combatUnitCount, armyValue } =
                entry.status[player.id]

              return (
                <TableRow key={i}>
                  <TableCell>
                    {isLastEntry && victoriusPlayers.length ? (
                      <IconButton size="small"sx={{mr: 1}}>
                        {victoriusPlayers.includes(player) ? <AutoAwesome color="success"/> : <Cancel color="error"/>}
                      </IconButton>
                    ) : (
                      ''
                    )}
                    <PlayerChip player={player} />
                  </TableCell>
                  <TableCell align="right">{gold ?? '???'}</TableCell>
                  <TableCell align="right">{income}</TableCell>
                  <TableCell align="right">{unitCount}</TableCell>
                  <TableCell align="right">{combatUnitCount}</TableCell>
                  <TableCell align="right">{armyValue}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
}
