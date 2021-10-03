import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import { CloudDownload, InsertDriveFile, Map } from '@mui/icons-material'
import Skeleton from '@mui/material/Skeleton'

import Typography from '@mui/material/Typography'

import { IMatch, db } from '../../db'
import PlayerChips from './PlayerChips'
import MatchActions from './MatchActions'
import { MapCardDialog } from './MapCard'
import { useModal } from 'mui-modal-provider'

export default function MatchCard({ imatch }: { imatch: IMatch }) {
  let { id, online, updated_date, match } = imatch

  let [name, setName] = React.useState(imatch.name)

  function updateName(ev: any) {
    let name = ev.target.value
    imatch.name = name
    setName(name)

    db.matches.update(id, { name })
  }

  const { showModal } = useModal()
  
  function openMapDialog() {
    const { map, version } = match.mapInfo
    if (map) {
      showModal(MapCardDialog, { map, version })
    }
  }

  const entries = match.getEntries()
  const players = match.getPlayers()
  let {
    map: { name: mapName = '' } = {},
    version: { v: vName, code } = { v: '?' },
  } = match.mapInfo

  return (
    <Card sx={{ width: 250, m: 2, boxShadow: 2 }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" component="p">
            {id}/{online ? 'Online' : 'Local'}
          </Typography>
          <IconButton size="small">
            {online ? <CloudDownload /> : <InsertDriveFile />}
          </IconButton>
        </Box>
        <Typography variant="caption" component="p">
          Updated:{' '}
          {new Date(updated_date).toLocaleString(navigator.language, {
            dateStyle: 'short',
            timeStyle: 'short',
          } as any)}{' '}
        </Typography>
        <TextField
          sx={{ m: 2, width: '100%' }}
          placeholder="Unnamed"
          variant="standard"
          value={name}
          onChange={updateName}
        />
        <PlayerChips
          players={players}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center',
            '& > *': { mb: 1 },
          }}
        />
        <Box>
          {mapName && (
            <IconButton onClick={openMapDialog}>
              <Map />
            </IconButton>
          )}
          {mapName && `${mapName} ${vName && '(' + vName + ')'}`}
        </Box>
        <Typography variant="caption" component="p">
          {entries.length} move{entries.length > 1 && 's'}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: 'flex',
          p: 0,
          justifyContent: 'space-between',
          bgcolor: 'ActiveCaption',
        }}
      >
        <MatchActions imatch={imatch} />
      </CardActions>
    </Card>
  )
}

export function MatchCardSkeleton() {
  return (
    <Card sx={{ width: 250, height: 240, m: 2, boxShadow: 2 }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pb: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton animation="wave" height={10} width={100} />
          <Skeleton
            variant="circular"
            animation="wave"
            width={24}
            height={24}
          />
        </Box>
        <Skeleton animation="wave" height={10} width={200} />
        <Box>
          <Skeleton animation="wave" height={40} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Skeleton
            variant="circular"
            animation="wave"
            width={24}
            height={24}
          />
          <Skeleton animation="wave" width={50} sx={{ ml: 1 }} />
          <Skeleton
            variant="circular"
            animation="wave"
            width={24}
            height={24}
            sx={{ ml: 2 }}
          />
          <Skeleton animation="wave" width={50} sx={{ ml: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton>
            <Map />
          </IconButton>
          <Skeleton animation="wave" width={200} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Skeleton animation="wave" width={80} />
        </Box>
      </CardContent>
      <CardActions sx={{ bgcolor: 'ActiveCaption', height: 40 }}></CardActions>
    </Card>
  )
}