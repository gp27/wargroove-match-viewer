import * as React from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Switch, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import { Add, Info } from '@mui/icons-material'
import SearchField from '../common/SearchField'
import { db, IMatch } from '../../db'
import MatchCard, { MatchCardSkeleton } from '../common/MatchCard'
import FileInputWrapper from '../common/FileInputWrapper'
import MatchTable from '../MatchTable'
import { Match, MatchData } from '../../wg/match'

const matchLoggerInfo = (
  <React.Fragment>
    Download and install the{' '}
    <Link href="https://github.com/gp27/wargroove-match-logger" target="_blank">
      Wargroove Match Logger Mod
    </Link>{' '}
    to start recording matches.
  </React.Fragment>
)

export default function Matches() {
  const [infoOpen, setInfoOpen] = React.useState(!Boolean(localStorage.matchesInfoClosed))

  function setOpen(open: boolean){
      localStorage.matchesInfoClosed = open ? '' : '1'
      setInfoOpen(open)
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showCards, setShowCards] = React.useState(false)

  const [matches, setMatches] = React.useState<IMatch[]>([])

  function loadMatches(){
    db.matches.toCollection().reverse().sortBy('updated_date').then(setMatches)
  }

  function loadMatchFiles(rawData: string[]){
    let matchesData = rawData.map(text => {
      try {
        return JSON.parse(text) as MatchData
      } catch(e){}
    })
    .filter(a => a?.match_id && Match.isValid(a))
    
    const promises = matchesData.map(async matchData => {
      let { name, online } = (await db.matches.get(matchData.match_id)) || {}
      return db.matches.put({
        id: matchData.match_id,
        updated_date: new Date(),
        online: Boolean(online),
        name,
        data: matchData,
      })
    })

    Promise.all(promises).then(loadMatches)
  }

  React.useEffect(() => {
    loadMatches()
  }, [])

  function filterMatches(search: string){

  }

  return (
    <React.Fragment>
      <Box sx={{ p: 2 }}>
        {infoOpen && (
          <Alert severity="info" onClose={() => setOpen(false)} sx={{ mb: 2 }}>
            {matchLoggerInfo}
          </Alert>
        )}
        <Box sx={{ display: 'flex' }}>
          <span style={{ flex: 1 }} />
          <FileInputWrapper
            onChange={loadMatchFiles}
            multiple
            accept="application/json, text/txt"
          >
            <Button
              startIcon={<Add />}
              variant="outlined"
              color="primary"
              aria-label="add"
              component="span"
            >
              Add Matches
            </Button>
          </FileInputWrapper>
          {/*<SearchField sx={{ mr: 2 }} onChange={filterMatches} />*/}
          {!isMobile && (
            <FormControlLabel
              sx={{ ml: 2 }}
              control={
                <Switch
                  checked={showCards}
                  onChange={() => setShowCards(!showCards)}
                />
              }
              label="Show Cards"
            />
          )}

          {!infoOpen && (
            <IconButton onClick={() => setOpen(true)} size="small">
              <Info color="info" />
            </IconButton>
          )}
        </Box>
      </Box>

      {isMobile || showCards ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {matches.map((match, i) => (
            <MatchCard key={i} imatch={match} />
          ))}
          {matches.length == 0 &&
            Array(4)
              .fill(0)
              .map((_, i) => <MatchCardSkeleton key={i} />)}
        </Box>
      ) : (
        <MatchTable matches={matches} />
      )}
    </React.Fragment>
  )
}
