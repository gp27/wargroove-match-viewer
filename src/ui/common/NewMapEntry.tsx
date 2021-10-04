import React, { useEffect, useState } from 'react'
import { MapInfo, mapFinder, MapEntry } from '../../wg/map-utils'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

function makeGetOptionLabel<T>(prop: keyof T) {
  return (opt: string | T) => {
    if (typeof opt == 'string') return opt
    return opt[prop]
  }
}

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

  const [entry, setEntry] = useState<MapEntry>(makeDefaultEntry(mapInfo))

  return <>{/*<Autocomplete selectOnFocus clearOnBlur handleHomeEndKeys />*/}</>
}
