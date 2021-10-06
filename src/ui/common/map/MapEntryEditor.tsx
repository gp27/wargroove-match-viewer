import React, { useEffect, useState } from 'react'
import {
  MapInfo,
  mapFinder,
  MapEntry,
  MapRecord,
  MapVersion,
  MapFinder,
} from '../../../wg/map-utils'
import { ObjectCreateAutocomplete } from '../generic/ObjectCreateAutocomplete'
import {
  Dialog,
  DialogProps,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material'
import { Info } from '@mui/icons-material'
import { useLocalStorage } from '../../../utils'

type EntryState = { entry: MapEntry; map?: MapRecord; version?: MapVersion }

export function MapEntryEditor({ mapInfo }: { mapInfo: MapInfo }) {
  //const [infoOpen, setInfoOpen] = useLocalStorage('mapEntryEditor_infoOpen', true)
  /*const [versionInfoOpen, setVersionInfoOpen] = useLocalStorage(
    'mapEntryEditor_versionInfoOpen',
    true
  )*/

  const { map, version } = mapInfo

  const [state, setState] = useState<EntryState>({
    entry: mapFinder.makeMapEntry(mapInfo),
    map,
    version,
  })

  console.log(state)
  const [showAdditional, setShowAddition] = useState(false)
  const [shareMap, setShareMap] = useState(false)

  function setMapName(name: string, map?: MapRecord) {
    state.entry.name = map?.name || name
    if (map != state.map) {
      delete state.version
      state.entry.v = ''
      state.entry.code = ''
    }
    state.map = map
    setState({ ...state })
  }

  function setMapVersion(v: string, version?: MapVersion) {
    state.entry.v = version?.v || v
    if (version != state.version) {
      state.entry.code = ''
    }
    state.version = version
    setState({ ...state })
  }

  function setEntryField(val: string, field: 'author' | 'notes' | 'code') {
    state.entry[field] = val
    setState({ ...state })
  }

  const isLocal = version?.isLocal
  const canEditMap = isLocal || !map
  const canEditVersion = isLocal || !version
  const canEditCode = isLocal || (!version?.code && !state.version?.code)

  const maps = canEditMap ? mapFinder.getUnseenMaps() : [map]
  const versions = Object.values<(MapVersion | string)>(
    state.map?.versions || {}
  ).concat(MapFinder.INITIAL_VERSION)

  const codeVersions = version
    ? [version]
    : state.version
    ? [state.version]
    : Object.keys(MapFinder.SPECIAL_CODES)

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        '& > *': { mb: 2 },
      }}
    >
      {/*infoOpen && (
        <Alert
          severity="info"
          onClose={() => setInfoOpen(false)}
          sx={{ mb: 2 }}
        >
          You ca
        </Alert>
      )}
      {!infoOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
          <IconButton onClick={() => setInfoOpen(true)} size="small">
            <Info color="info" />
          </IconButton>
        </Box>
      )*/}

      <ObjectCreateAutocomplete
        value={state.map || state.entry.name}
        keyName="name"
        options={maps}
        inputLabel="Map Name (required)"
        disabled={!canEditMap}
        onChange={setMapName}
      />

      <ObjectCreateAutocomplete
        value={state.version || state.entry.v}
        keyName="v"
        options={versions}
        inputLabel="Map Version (required)"
        defaultLabel={MapFinder.INITIAL_VERSION}
        disabled={!canEditVersion}
        onChange={setMapVersion}
        getOptionDisabled={(version) =>
          typeof version != 'string' && !!version.data?.tileHash
        }
        startAdornment={
          <InputAdornment position="start">
            <Tooltip
              title={
                "If this map doesn't have a version number yet, please select: " +
                MapFinder.INITIAL_VERSION
              }
            >
              <IconButton size="small">
                <Info color="info" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
      />

      <ObjectCreateAutocomplete
        value={state.version || state.entry.code}
        keyName="code"
        options={codeVersions}
        inputLabel="Map Code (required)"
        disabled={!canEditCode}
        onChange={(label) => setEntryField(label, 'code')}
      />

      {showAdditional && (
        <>
          <TextField
            sx={{ mb: 2 }}
            label="Author"
            value={state.entry.author}
            disabled={!!map?.author}
            onChange={(ev) => setEntryField(ev.target.value, 'author')}
          />

          <TextField
            sx={{ mb: 2 }}
            label="Notes, unit bans etc."
            value={state.entry.notes}
            disabled={!!version?.notes}
            multiline
            onChange={(ev) => setEntryField(ev.target.value, 'notes')}
          />
        </>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={showAdditional}
            onChange={(ev) => setShowAddition(ev.target.checked)}
          />
        }
        label="Show additional fields"
      />

      <FormControlLabel
        control={
          <Switch
            checked={shareMap}
            onChange={(ev) => setShareMap(ev.target.checked)}
          />
        }
        label="Share this Map *"
      />

      <Button variant="contained" sx={{ mb: 2 }}>
        {isLocal ? 'Update' : 'Create'} Map
      </Button>

      <Typography variant="caption" component="p">
        * You can choose to anonymously share this Map data to help other people
        who use the Match Viewer to automatically detect the same map.
      </Typography>
    </Box>
  )
}

export function MapEntryEditorModal({
  mapInfo,
  ...props
}: { mapInfo: MapInfo } & DialogProps) {
  return (
    <Dialog {...props}>
      <MapEntryEditor mapInfo={mapInfo} />
    </Dialog>
  )
}
