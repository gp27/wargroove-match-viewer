import React, { useEffect, useState } from 'react'
import { MapInfo, mapFinder, MapEntry, MapRecord } from '../../wg/map-utils'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

function makeDefaultEntry({
  tileHash,
  tileString,
  stateHash,
  stateString,
}: MapInfo) {
  return {
    name: '',
    v: '',
    code: '',
    tileHash,
    tileString,
    stateHash,
    stateString,
    isLocal: true,
  }
}

export function NewMapEntry({ mapInfo }: { mapInfo: MapInfo }) {
  const { map, version, unseenVersions } = mapInfo

  const isLocal = version.isLocal

  const [entry, setEntry] = useState<MapEntry>(makeDefaultEntry(mapInfo))
  const maps = []

  return <>
   
   </>
}
