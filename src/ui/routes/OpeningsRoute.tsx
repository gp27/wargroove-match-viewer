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

export default function OpeningsRoute() {
  const [matches, setMatches] = React.useState<IMatch[]>([])

  function loadMatches() {
    

    /*db.matches.toCollection().toArray().then(matches => {
      matches.sort(({ match: { mapInfo } }, { match: { mapInfo } }) => {
        return 0
      })
    })*/
  }


  return <></>
}
