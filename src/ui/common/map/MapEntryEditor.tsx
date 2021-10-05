import React, { useEffect, useState } from 'react'
import {
  MapInfo,
  mapFinder,
  MapEntry,
  MapRecord,
  MapVersion,
} from '../../../wg/map-utils'
import { ObjectCreateAutocomplete } from '../generic/ObjectCreateAutocomplete'
import { Dialog, DialogProps, Box } from '@mui/material'

function makeDefaultEntry({
  tileHash,
  tileString,
  stateHash,
  stateString,
  map: { name = '' } = {} as MapRecord,
  version: { v = '', code = '', notes = '' } = {} as MapVersion,
}: MapInfo) {
  return {
    name,
    v,
    code,
    notes,
    tileHash,
    tileString,
    stateHash,
    stateString,
    isLocal: true,
  }
}

type EntryState = { entry: MapEntry; map?: MapRecord; version?: MapVersion }

export function MapEntryEditor({ mapInfo }: { mapInfo: MapInfo }) {
  const { map, version, unseenVersions } = mapInfo

  const [state, setState] = useState<EntryState>({
    entry: makeDefaultEntry(mapInfo),
    map,
    version,
  })

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

  function setMapCode(code: string) {
    state.entry.code = code
    setState({ ...state })
  }

  console.log(state)

  const isLocal = version?.isLocal
  const canEditMap = isLocal || !map
  const canEditVersion = isLocal || !version
  const canEditCode = isLocal || (!version?.code && !state.version?.code)

  const maps = canEditMap ? mapFinder.getUnseenMaps() : [map]
  const versions =
    map && !version ? unseenVersions : Object.values(state.map?.versions || {})

  const codeVersions = version
    ? [version]
    : state.version
    ? [state.version]
    : [{ code: '[In game]' }, { code: '[Unknown]' }]

  return (
    <Box sx={{ p: 2 }}>
      <ObjectCreateAutocomplete
        value={state.map || state.entry.name}
        keyName="name"
        options={maps}
        inputLabel="Map Name"
        disabled={!canEditMap}
        onChange={setMapName}
      />

      <ObjectCreateAutocomplete
        value={state.version || state.entry.v}
        keyName="v"
        options={versions}
        inputLabel="Map Version"
        defaultLabel="[Initial version]"
        disabled={!canEditVersion}
        onChange={setMapVersion}
      />

      <ObjectCreateAutocomplete
        value={state.version || state.entry.code}
        keyName="code"
        options={codeVersions}
        inputLabel="Map Code"
        disabled={!canEditCode}
        onChange={setMapCode}
      />
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
