import React, { useEffect, useState } from 'react'
import { useRoute, useLocation } from 'wouter'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import WargrooveGame from '../common/WargrooveGame'
import PlayerStatusTable from '../common/PlayerStatusTable'
import PlayersUnitList from '../common/UnitList'
import {TurnMoveList, TurnMoveSwipable } from '../common/TurnMoveList'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { IMatch, db } from '../../db'
import { Match, MatchData } from '../../wg/match'
import { Line } from 'react-chartjs-2'
import { PhaserWargrooveGame } from '../../phaser/phaser-wagroove-game'
import { useLocalStorage } from '../../utils'
import { FormControlLabel, Switch } from '@mui/material'


function loadMatchData(id: string): Promise<MatchData|undefined> {
  let matchUrl = `https://firebasestorage.googleapis.com/v0/b/wargroove-match-storage.appspot.com/o/matches%2F${id}.json?alt=media`

    return fetch(matchUrl).then((res) => {
      return res
        .json()
        .then((data) => {
          return Match.isValid(data) ? data : null
        })
        .catch((err) => undefined)
    })
}

function putIMatch(matchData: MatchData, imatch?: IMatch){
  let { name, online = true } = imatch || {}
  return db.matches.put({
    id: matchData.match_id,
    name,
    updated_date: new Date(),
    online,
    data: matchData
  })
}

function loadMatch(matchId: string){
  return db.matches.get(matchId).then((imatch) => {
    if (!imatch || imatch.online) {
      return loadMatchData(matchId).then((matchData) => {
        let match: Match

        if (matchData) {
          match = new Match(matchData)
          if (imatch) {
            imatch.data = matchData
            imatch.match = match
          }

          putIMatch(matchData, imatch)
        }

        if (imatch && !match) {
          match = imatch.match || new Match(imatch.data)
        }

        return match
      })
    }

    return imatch.match || new Match(imatch.data)
  })
}

export default function MatchRoute() {
  const [, params] = useRoute<{ id: string }>('/match/:id')
  const [, setLocation] = useLocation()
  const { id: matchId } = params

  const [match, setMatch] = useState<Match>()

  useEffect(() => {
    loadMatch(matchId).then(match => {
      if (match) setMatch(match)
      else setLocation('/')
    })
  }, [matchId])

  return <React.Fragment>
    {match ? <MatchDashboard match={match}/> : <MatchSkeleton />}
  </React.Fragment>
}

function MatchDashboard({ match }: { match: Match }){
   const theme = useTheme()
   const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isGameReady, setGameReady] = useState(false)

  let [_, setState] = useState<any>(0)
  function update() {
    setState({})
  }

  const [game, setGame] = useState<PhaserWargrooveGame>()

  return (
    <Box
      sx={{
        flex: 1,
        display: { md: 'flex' },
        width: '100%',
        flexDirection: { xs: 'column', md: 'row' } as any,
        overflow: { xs: 'auto', md: 'hidden' },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: { md: 'min(960px, 50%)' },
          height: { xs: '60%', md: '100%' } as any,
        }}
      >
        {!isGameReady && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ position: 'absolute' }}
          />
        )}
        <WargrooveGame
          match={match}
          onReady={() => setGameReady(true)}
          onSelected={update}
          onGameCreated={setGame}
        />
      </Box>
      <Box sx={{ overflow: 'auto', minWidth: 150 }}>
        {isMobile ? (
          <TurnMoveSwipable match={match} />
        ) : (
          <TurnMoveList match={match} />
        )}
      </Box>
      <Box sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Box sx={{ flexGrow: 1 }}>
          <PlayerStatusTable match={match} />
          <PlayersUnitList match={match} game={game} />
        </Box>

        <Box sx={{ p: 1 }}>
          <Charts match={match} />
        </Box>
      </Box>
    </Box>
  )
}

function MatchSkeleton(){
  return <div />
}

function Charts({ match }: { match: Match }){
  const [showTurnEndCharts, setsShowTurnEndCharts] = useLocalStorage(
    'match_showTurnEndCharts',
    false
  )

  let charts = showTurnEndCharts ? match.getTurnEndCharts() : match.getCharts()

  return (
    <React.Fragment>
      <FormControlLabel
        sx={{ ml: 2 }}
        control={
          <Switch
            checked={showTurnEndCharts}
            onChange={() => setsShowTurnEndCharts(!showTurnEndCharts)}
          />
        }
        label="Show Turn End Charts"
      />

      {charts.map((chart, index) => (
        <Box
          key={index}
          sx={{ p: 1, maxHeight: 400, minHeight: 250, height: '50%' }}
        >
          <Line
            data={chart.data}
            options={Object.assign(chart.options || {}, {
              maintainAspectRatio: false,
            })}
          />
        </Box>
      ))}
    </React.Fragment>
  )
}