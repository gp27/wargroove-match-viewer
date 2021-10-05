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

  const [entryState, setEntryState] = useState<EntryState>({
    entry: makeDefaultEntry(mapInfo),
    map,
    version,
  })

  function setMapName(name: string, map?: MapRecord) {
    entryState.entry.name = name
    if (map != entryState.map) {
      delete entryState.version
      entryState.entry.v = ''
      entryState.entry.code = ''
    }
    entryState.map = map
    setEntryState({ ...entryState })
  }

  function setMapVersion(v: string, version?: MapVersion) {
    entryState.entry.v = v
    entryState.version = version
    setEntryState({ ...entryState })
  }

  function setMapCode(code: string) {
    entryState.entry.code = code
    setEntryState({ ...entryState })
  }

  console.log(entryState)

  const isLocal = version?.isLocal
  const canEditMap = isLocal || !map
  const canEditVersion = isLocal || !version
  const canEditCode = isLocal || (!version?.code && !entryState.version?.code)

  const maps = canEditMap ? mapFinder.getUnseenMaps() : [map]
  const versions =
    map && !version
      ? unseenVersions
      : Object.values(entryState.map?.versions || {})

  const codeVersions = version
    ? [version]
    : entryState.version
    ? [entryState.version]
    : [{ code: '[In game]' }, { code: '[Unknown]' }]

  return (
    <Box sx={{ p: 2 }}>
      <ObjectCreateAutocomplete
        value={entryState.map || entryState.entry.name}
        keyName="name"
        options={maps}
        inputLabel="Map Name"
        disabled={!canEditMap}
        onChange={setMapName}
      />

      <ObjectCreateAutocomplete
        value={entryState.version || entryState.entry.v}
        keyName="v"
        options={versions}
        inputLabel="Map Version"
        defaultLabel="[Initial version]"
        disabled={!canEditVersion}
        onChange={setMapVersion}
      />

      <ObjectCreateAutocomplete
        value={entryState.version || entryState.entry.code}
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
