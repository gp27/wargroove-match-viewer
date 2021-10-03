import React, { useEffect, useRef } from 'react'
import { Entry, Match } from '../../wg/match'

import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  Chip,
} from '@mui/material'

import SwipeableViews from 'react-swipeable-views'

export function TurnMoveList({
  match,
  onSelected,
}: {
  match: Match
  onSelected?: Function
}) {
  let turns = match.getTurns()
  const selectedEntry = match.getCurrentEntry()

  return (
    <List sx={{
        display: { xs: 'flex', md: 'block' } as any,
        flexDirection: 'row',
        padding: 0
    }}>
      {turns.map((turn, i) => {
        const { playerId, entries } = turn
        const isTurnSelected = turn == selectedEntry.turn

        let visibleEntries = isTurnSelected ? entries : [entries[0]]

        return (
          <React.Fragment key={i}>
            {visibleEntries.map((entry, i) => {
              return <MoveListItem key={i} match={match} entry={entry}/>
            })}
          </React.Fragment>
        )
      })}
    </List>
  )
}

function MoveListItem({
  match,
  entry
}: {
  match: Match
  entry: Entry
}) {
  const selectedEntry  = match.getCurrentEntry()
  const isEntrySelected = entry == selectedEntry
  const isTurnSelected = entry.turn == selectedEntry.turn
  const { moveNumber, turn: { playerId, turnNumber } } = entry

  const eleRef = useRef<any>(null)

  useEffect(() => {
    if (isEntrySelected) {
      eleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [isEntrySelected])
  return (
    <ListItem
      divider
      selected={isEntrySelected}
      disablePadding
      sx={{ background: isTurnSelected ? 'rgba(0,0,0,0.1)' : '' }}
      ref={eleRef}
    >
      <ListItemButton onClick={() => match.selectEntry(entry.id)}>
        <ListItemAvatar sx={{ pl: moveNumber > 0 ? 1 : 0 }}>
          <Avatar
            sx={{
              background: match.getPlayerColorHex(playerId),
              color: '#fff !important',
              width: 28,
              height: 28,
              fontSize: '0.8rem',
            }}
          >
            P{playerId + 1}
          </Avatar>
        </ListItemAvatar>
        <ListItemText>
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontWeight: moveNumber > 0 ? 'normal' : 'bold',
            }}
          >
            {moveNumber > 0 ? 'Move ' + moveNumber : 'Turn ' + turnNumber}
          </Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  )
}

export function TurnMoveSwipable({
  match
}: {
  match: Match
}) {
  const entries = match.getEntries()
  const selectedEntry = match.getCurrentEntry()
  const selectedEntryIndex = entries.indexOf(selectedEntry)

  function setIndex(index: number){
      let entry = entries[index]
      match.selectEntry(entry.id)
  }

  return (
      <SwipeableViews enableMouseEvents index={selectedEntryIndex} onChangeIndex={setIndex} style={{padding: '10px calc(50% - 60px)'}}>
          {entries.map((entry, i) => <MoveChip key={i} match={match} entry={entry}/>)}
      </SwipeableViews>
  )
}

function MoveChip({ match, entry }: { match: Match; entry: Entry }) {
    const selectedEntry = match.getCurrentEntry()
    const isEntrySelected = entry == selectedEntry
    const isTurnSelected = entry.turn == selectedEntry.turn
    const {
      moveNumber,
      turn: { playerId, turnNumber },
    } = entry

    return (
      <Chip
        color={isEntrySelected ? 'primary' : 'default'}
        variant={isEntrySelected ? 'outlined' : 'filled'}
        avatar={
          <Avatar
            sx={{
              background: match.getPlayerColorHex(playerId) + ' !important',
              color: '#fff !important',
            }}
          >
            P{playerId + 1}
          </Avatar>
        }
        label={
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontWeight: moveNumber > 0 ? 'normal' : 'bold',
            }}
          >
            {moveNumber > 0 ? `T${turnNumber} - M${moveNumber}` : 'Turn ' + turnNumber}
          </Typography>
        }
        onClick={() => match.selectEntry(entry.id)}
      />
    )
}