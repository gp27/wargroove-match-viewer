import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { mapFinder, MapRecord, MapVersion } from '../wg/map-utils'
import { Visibility, VisibilityOff } from '@mui/icons-material'

function VersionRow({ version, map, firstCellEle, showBorder = false }: { version: MapVersion; map?: MapRecord; firstCellEle?: React.ReactElement; showBorder?: boolean }) {
  return (
    <TableRow sx={!showBorder ? { '& > *': { borderBottom: 'unset !important' } } : null}>
      <TableCell>{firstCellEle}</TableCell>
      <TableCell>
        <Typography component="h4" variant="h6">
          {map?.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ mr: 2 }}>
            {version.tileHash && version.tileString ? <Visibility color="success" sx={{ verticalAlign: 'middle' }} /> : <VisibilityOff color="warning" sx={{ verticalAlign: 'middle' }} />}
          </Box>
          {version.v}
        </Box>
      </TableCell>
      <TableCell>{version.code}</TableCell>
      <TableCell>{version.notes}</TableCell>
      <TableCell>{map?.footer}</TableCell>
      <TableCell>{map?.author}</TableCell>
      <TableCell sx={{ height: '80px', width: '80px', p: 0 }}>
        <Link href={version.imgSrc} target="_nlank">
          <img src={version.imgSrc} style={{ maxHeight: '100%', maxWidth: '100%' }} />
        </Link>
      </TableCell>
    </TableRow>
  )
}

function MapRow({ map }: { map: MapRecord }) {
  const [open, setOpen] = React.useState(false)

  const rowPropsList = Object.values(map.versions).map(version => ({ map, version }))
  const mainRowProps = rowPropsList.shift()

  const expandButton = (
    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
      {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
    </IconButton>
  )

  const rows = [
    <VersionRow key={0} {...mainRowProps} firstCellEle={rowPropsList.length ? expandButton : null} showBorder={!open} />,
    ...(open ? rowPropsList.map(({ version }, i) => <VersionRow key={i + 1} version={version} showBorder={i == rowPropsList.length - 1} />) : [])
  ]

  return <React.Fragment>{...rows}</React.Fragment>
}

export default function MapTable() {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell>Version</TableCell>
            <TableCell>Code</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Info</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Image</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mapFinder.getMaps().map((map, i) => (
            <MapRow key={i} map={map} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
