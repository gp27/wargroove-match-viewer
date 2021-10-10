import React, { useEffect, useState } from 'react'
import {
  MapInfo,
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
  AlertTitle,
  IconButton,
  Tooltip,
  InputAdornment,
  Fab,
} from '@mui/material'
import { Info, Close, Map } from '@mui/icons-material'
import { useLocalStorage, useSessionId } from '../../../utils'
import { useMapFinder } from '../../context/MapFinderContext'
import { useModal } from 'mui-modal-provider'

type EntryState = { entry: MapEntry; map?: MapRecord; version?: MapVersion }

export function MapEntryEditor({ mapInfo, onMapUpsert }: { mapInfo: MapInfo, onMapUpsert?: (entry?: MapEntry) => void }) {
  //const [infoOpen, setInfoOpen] = useLocalStorage('mapEntryEditor_infoOpen', true)
  /*const [versionInfoOpen, setVersionInfoOpen] = useLocalStorage(
    'mapEntryEditor_versionInfoOpen',
    true
  )*/

  const sessionId = useSessionId()
  const mapFinder = useMapFinder()
  const { map, version } = mapInfo

  const [state, setState] = useState<EntryState>({
    entry: mapFinder.makeMapEntry(mapInfo),
    map,
    version,
  })

  console.log(state, map, version)
  const [showAdditional, setShowAddition] = useState(false)
  const [shareMap, setShareMap] = useState(false)

  function setMapName(name: string, map?: MapRecord) {
    state.entry.name = map?.name || name
    if (map != state.map) {
      delete state.version
      state.entry.v = ''
      state.entry.code = ''
      errors.version = ''
      errors.code = ''
    }
    state.map = map
    setState({ ...state })
    errors.map = ''
    setErrors({ ...errors })
  }

  function setMapVersion(v: string, version?: MapVersion) {
    state.entry.v = version?.v || v
    let prevVersion = state.version
    state.version = version

    if (version != prevVersion) {
      state.entry.code = state.version?.code || ''
      errors.code = ''
    }

    setState({ ...state })
    errors.version = ''
    setErrors({ ...errors })
  }

  function setEntryField(val: string, field: 'author' | 'notes' | 'code') {
    if (field == 'code') {
      if (!val.startsWith('[')) val = val.toUpperCase()
      errors.code = ''
      setErrors({ ...errors })
    }
    state.entry[field] = val
    setState({ ...state })
  }

  const [errors, setErrors] = useState({ map: '', version: '', code: '' })
  function validate() {
    let { entry } = state

    errors.map = entry.name ? '' : 'Map Name is required'
    errors.version = entry.v ? '' : 'Map Version is required'

    if (!entry.code) {
      errors.code = 'Code is required'
    } else if (!entry.code.match(/^(([0-9A-Z]+)|(\[(Unknown|In Game)\]))$/)) {
      errors.code =
        'Code format is invalid. Use only letter numbers or the values [Unknown], [In Game]'
    } else {
      errors.code = ''
    }

    setErrors({ ...errors })

    if (!Object.values(errors).reduce((a, b) => !!a || !!b, false)) {
      console.log('passed')
      return true
    }

    console.log('invalid', errors)

    return false
  }

  function putEntry() {
    if (!validate()) return
    const { tileHash, tileString, stateHash, stateString } = mapInfo
    let { entry, map, version } = state
    let e = {
      ...entry,
      ...map,
      ...version,
      isLocal: true,
      tileHash,
      tileString,
      stateHash,
      stateString,
    }
    delete e.versions
    if (!version?.code) e.code = entry.code // format code

    console.log(e)
    mapFinder?.addEntry(e)
    onMapUpsert?.(e)

    if(shareMap){
      shareMapViaImage(e, sessionId)
    }
  }

  function deleteEntry() {
    mapFinder?.deleteEntry(version)
    onMapUpsert?.()
  }

  const isLocal = version?.isLocal
  const canEditMap = !map //|| (isLocal && Object.keys(map.versions).length === 1)
  const canEditVersion = !version
  const canEditCode =
    (!version?.code && !state.version?.code) ||
    [version?.code, state.version?.code].includes('[Unknown]') //|| isLocal

  const maps = canEditMap ? mapFinder.getUnseenMaps() : [map]
  const versions = Object.values<MapVersion | string>(
    state.map?.versions || {}
  ).concat({ v: '', code: '' })

  const codeVersions = version
    ? [version]
    : state.version?.code
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
        inputLabel="*Map Name"
        disabled={!canEditMap}
        onChange={setMapName}
        error={errors.map}
      />

      <ObjectCreateAutocomplete
        value={state.version || state.entry.v}
        keyName="v"
        options={versions}
        inputLabel="*Map Version"
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
        error={errors.version}
      />

      <ObjectCreateAutocomplete
        value={state.version?.code ? state.version : state.entry.code}
        keyName="code"
        options={codeVersions}
        defaultLabel=""
        inputLabel="*Map Code"
        disabled={!canEditCode}
        onChange={(label) => setEntryField(label, 'code')}
        error={errors.code}
      />

      {showAdditional && (
        <>
          <TextField
            sx={{ mb: 2 }}
            label="Author"
            value={state.map?.author || state.entry.author}
            disabled={!!map?.author || !!state.map?.author}
            onChange={(ev) => setEntryField(ev.target.value, 'author')}
          />

          <TextField
            sx={{ mb: 2 }}
            label="Notes, unit bans etc."
            value={state.version?.notes || state.entry.notes}
            disabled={!!version?.notes || !!state.version?.notes}
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
        label="Share this Map ¹"
      />

      <Box sx={{ display: 'flex' }}>
        <Button
          variant="contained"
          sx={{ mb: 2, flexGrow: 1 }}
          onClick={putEntry}
        >
          {isLocal ? 'Update' : 'Create'} Map
        </Button>

        {isLocal && (
          <Button
            variant="contained"
            color="error"
            sx={{ mb: 2, ml: 2 }}
            onClick={deleteEntry}
          >
            Delete Map
          </Button>
        )}
      </Box>

      <Typography variant="caption" component="p">
        ¹ You can choose to anonymously share this Map data to help other people
        who use the Match Viewer to automatically detect the same map.
      </Typography>
    </Box>
  )
}

export function MapEntryEditorModal({
  mapInfo,
  close,
  ...props
}: { mapInfo: MapInfo, close: () => void } & DialogProps) {


  return (
    <Dialog {...props}>
      <MapEntryEditor mapInfo={mapInfo} onMapUpsert={close} />
    </Dialog>
  )
}

export function MapEntrySuggestion({ mapInfo }: {mapInfo: MapInfo}){
  const [open, setOpen] = useState(true)
  const { showModal } = useModal()

  const { map, version } = mapInfo
  if(map && version) return null

  let title = map ? 'Unknown Map version' : 'Unknown Map'
  let message = map ? 'Add a new version of '+map.name : 'Add Map data to be able to recognize it from now on'

  const openEditor = () => {
    const modal = showModal(MapEntryEditorModal, { mapInfo, close: () => modal.destroy() })
  }

  return open ? (
    <Alert
      sx={{ m: 1 }}
      severity="info"
      icon={<Map />}
      action={
        <>
          <Button onClick={openEditor} variant="outlined">
            Add
          </Button>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </>
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  ) : (
    <Fab onClick={() => setOpen(true)} size="small" sx={{ m: 1 }}>
      <Map color="info" />
    </Fab>
  )
}

function shareMapViaImage(entry: MapEntry, sessionId?: string){
  let url = new URL(
    'https://script.google.com/macros/s/AKfycbxm4SZ-eyh7SYhPOiY7S_DS596XcrGlRI4dM1dDsdhvhkljSQ_uK3RmxMmGw01RvUDY7w/exec?action=add_entry'
  )
  for(let key in entry){
    url.searchParams.set(key, entry[key])
  }
  url.searchParams.set('sessionId', sessionId)

  new Image().src = url.href
}