import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { Cloud, InsertDriveFile, Map } from '@mui/icons-material'

import { IMatch, db } from '../../../db'
import PlayerChips from '../PlayerChips'
import SkeletonRow from '../generic/SkeletonRow'
import { MapCardDialog } from '../map/MapCard'
import MatchActions from './MatchActions'
import { useModal } from 'mui-modal-provider'
import { useMapInfo } from '../../context/MapFinderContext'
import { MapInfo } from '../../../wg/map-utils'

function MatchRow({ imatch }: { imatch: IMatch }) {
  let { id, online, data, updated_date, match } = imatch
  if(!match) return null

  let [name, setName] = React.useState(imatch.name)

  const { showModal } = useModal()

  function updateName(ev: any) {
    name = name?.trim() || undefined
    if(name == imatch.name) return
    imatch.name = name
    db.matches.update(id, { name })
  }

  const entries = match.getEntries()
  const players = match.getPlayers()

  const mapInfo = useMapInfo(match)
  if(!mapInfo) return <SkeletonRow length={6} />

  let {
    map: { name: mapName = '' } = {},
    version: { v: vName, code } = { v: '?' },
  } = mapInfo

  function openMapDialog() {
    const { map, version } = mapInfo as MapInfo
    if (map) {
      showModal(MapCardDialog, { map, version })
    }
  }

  return (
    <TableRow>
      <TableCell>
        <IconButton>
          {online ? <Cloud /> : <InsertDriveFile />}
        </IconButton>
        {id}/{online ? 'Online' : 'Local'}
      </TableCell>
      <TableCell>
        <TextField
          placeholder="Unnamed"
          variant="standard"
          value={name||''}
          onChange={(ev) => setName(ev.target.value)}
          onBlur={updateName}
        />
      </TableCell>
      <TableCell>
        <PlayerChips players={players} />
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>
        {mapName && (
          <IconButton onClick={openMapDialog}>
            <Map />
          </IconButton>
        )}
        {mapName && `${mapName} ${vName && '(' + vName + ')'}`}
      </TableCell>
      <TableCell>
        <Box>
          Updated:{' '}
          {new Date(updated_date).toLocaleString(navigator.language, {
            dateStyle: 'short',
            timeStyle: 'short',
          } as any)}{' '}
          - {entries.length} move{entries.length > 1 && 's'}
        </Box>
      </TableCell>
      <TableCell>
        <MatchActions imatch={imatch} />
      </TableCell>
    </TableRow>
  )
}

export default function MatchTable({ matches }: { matches?: IMatch[] }) {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: '100%', maxWidth: '100%' }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Players</TableCell>
            <TableCell>Map</TableCell>
            <TableCell>Info</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches?.map((match, i) => (
            <MatchRow key={i} imatch={match} />
          ))}
          {!matches &&
            Array(10)
              .fill(0)
              .map((_, i) => <SkeletonRow key={i} length={6} />)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
