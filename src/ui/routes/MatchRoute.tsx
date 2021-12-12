import React, { useEffect, useState } from 'react'
import { useRoute, useLocation } from 'wouter'
import { Box, Skeleton, Button } from '@mui/material'
import { Settings } from '@mui/icons-material'

import WargrooveGame from '../common/WargrooveGame'
import PlayerStatsTable from '../common/PlayerStatsTable'
import PlayersUnitList from '../common/UnitList'
import { MatchActionLog } from '../common/match/MatchActionLog'
import { TurnMoveList, TurnMoveSwipable } from '../common/TurnMoveList'
import { SideSwitchingBox } from '../common/generic/SideSwitchingBox'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { IMatch, db } from '../../db'
import { Match, MatchData } from '../../wg/match'
import { Line } from 'react-chartjs-2'
import { PhaserWargrooveGame } from '../../phaser/phaser-wagroove-game'
import { useModal } from 'mui-modal-provider'
import { MapEntrySuggestion } from '../common/map/MapEntryEditor'
import { useMapInfo } from '../context/MapFinderContext'
import { SliderControls } from '../common/generic/SliderControls'
import { useXmas } from '../App'
import { ChartSelectorDialog, getDefaultChartItems } from '../common/ChartSelectorDialog'
import { getChartsByName } from '../../wg/charts'
import { useLocalStorage } from '../../utils'

function loadMatchData(id: string): Promise<MatchData | undefined> {
  let matchUrl = `https://firebasestorage.googleapis.com/v0/b/wargroove-match-storage.appspot.com/o/matches%2F${id}.json?alt=media`

  return fetch(matchUrl, { cache: 'no-cache' }).then((res) => {
    if (res.status != 200) return null

    return res
      .json()
      .then((data) => {
        return Match.isValid(data) ? data : undefined
      })
      .catch((err) => undefined)
  })
}

function putIMatch(matchData: MatchData, imatch?: IMatch) {
  let { name, online = true } = imatch || {}
  return db.matches.put({
    id: matchData.match_id,
    name,
    updated_date: new Date(),
    online,
    data: matchData,
  })
}

function loadMatch(matchId: string) {
  return db.matches.get(matchId).then((imatch) => {
    if (!imatch || imatch.online) {
      return loadMatchData(matchId).then((matchData) => {
        let match: Match | undefined

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
  const { id: matchId } = params || {}

  const [match, setMatch] = useState<Match>()

  useEffect(() => {
    if (!matchId) {
      setLocation('/', { replace: true })
      return null
    }

    loadMatch(matchId).then((match) => {
      if (match) setMatch(match)
      else setLocation('/', { replace: true })
    })
  }, [matchId])

  return (
    <React.Fragment>
      {match ? <MatchDashboard match={match} /> : <MatchSkeleton />}
    </React.Fragment>
  )
}

function MatchDashboard({ match }: { match: Match }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isGameReady, setGameReady] = useState(false)

  const xmas = useXmas()

  let [_, setState] = useState<any>(0)
  function update() {
    setState({})
  }

  const [speed, setSpeed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [game, setGame] = useState<PhaserWargrooveGame>()

  const mapInfo = useMapInfo(match)

  useEffect(() => {
    if (!game || isPlaying || !speed) return
    setIsPlaying(true)
    game.playNextEntry(speed == 100 ? 'fast' : 'normal', () => {
      setIsPlaying(false)
    })
  }, [game, speed, isPlaying])

  useEffect(() => {
    ;(window as any).xmas = xmas
    match.selectNextEntry()
  }, [xmas])

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
        <Box sx={{ position: 'absolute', width: '100%', right: 0 }}>
          {mapInfo && <MapEntrySuggestion mapInfo={mapInfo} />}
        </Box>

        <SideSwitchingBox align="bottom">
          <MatchActionLog match={match} game={game} />
        </SideSwitchingBox>

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
      <Box
        sx={{
          p: 1,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <SliderControls onSpeedChange={setSpeed} />
          {/*<Box>{match.getCurrentEntry().actionLog?.action}</Box>*/}
          <PlayerStatsTable match={match} onPlayerColorChange={update} />
          <PlayersUnitList match={match} game={game} />
        </Box>

        <ChartsWithConfig match={match} />
      </Box>
    </Box>
  )
}

function MatchSkeleton() {
  return <div />
}

/*function Charts({ match }: { match: Match }) {
  const [chartType, setChartsType] = useState<
    'average' | 'turn_end' | 'all_moves'
  >('average')

  let charts =
    chartType == 'average'
      ? match.getAverageCharts()
      : chartType == 'turn_end'
      ? match.getTurnEndCharts()
      : match.getCharts()
  //console.log(charts)

  return (
    <Box sx={{ p: 1, textAlign: 'center' }}>
      <ChartSelector />

      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={(ev, value) => setChartsType(value)}
      >
        <ToggleButton value="average">Turn Average</ToggleButton>
        <ToggleButton value="turn_end">Turn End</ToggleButton>
        <ToggleButton value="all_moves">All Moves</ToggleButton>
      </ToggleButtonGroup>

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
    </Box>
  )
}*/

function ChartsWithConfig({ match }: { match: Match }) {
  const { showModal } = useModal()

  let [savedItems, setSavedItems] = useLocalStorage(
    'match_chartsConfig',
    getDefaultChartItems()
  )

  const [items, setItems] = useState(savedItems)

  const openDialog = () => {
    const modal = showModal(ChartSelectorDialog, {
      items,
      close: () => modal.destroy(),
      setItems,
    })
  }

  const charts = getChartsByName(match, items)

  return <Box sx={{ p: 1 }}>
    <Box>
      <Button disableRipple onClick={openDialog} variant='outlined'>
        <span>Charts</span>
        <Settings />
      </Button>
    </Box>

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
  </Box>
}