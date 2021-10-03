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
import { CloudDownload, InsertDriveFile, Map } from '@mui/icons-material'

import { IMatch, db } from '../db'
import PlayerChips from './common/PlayerChips'
import SkeletonRow from './common/SkeletonRow'
import { MapCardDialog } from './common/MapCard'
import MatchActions from './common/MatchActions'
import { useModal } from 'mui-modal-provider'

function MatchRow({ imatch }: { imatch: IMatch }){
    let { id, online, data, updated_date, match } = imatch

    let [name, setName] = React.useState(imatch.name)

    const { showModal } = useModal()

    function updateName(ev: any) {
      let name = ev.target.value
      imatch.name = name
      setName(name)

      db.matches.update(id, { name })
    }

    const entries = match.getEntries()
    const players = match.getPlayers()
    let {
      map: { name: mapName = '' } = {},
      version: { v: vName, code } = { v: '?' },
    } = match.mapInfo
    
    function openMapDialog(){
        const { map, version } = match.mapInfo
        if(map) {
          showModal(MapCardDialog, { map, version })
        }
    }

    return (
      <TableRow>
        <TableCell>
          <IconButton>
            {online ? <CloudDownload /> : <InsertDriveFile />}
          </IconButton>
          {id}/{online ? 'Online' : 'Local'}
        </TableCell>
        <TableCell>
          <TextField
            placeholder="Unnamed"
            variant="standard"
            value={name}
            onChange={updateName}
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

export default function MatchTable({ matches }: { matches: IMatch[] }) {
    const [dialogContent, setDialogContent] = React.useState<React.ReactElement>()

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
