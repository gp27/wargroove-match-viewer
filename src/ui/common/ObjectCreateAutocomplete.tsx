import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'

function makeGetOptionLabel<T>(key: keyof T) {
  return (opt: string | T): string => {
    if (typeof opt == 'string') return opt
    return String(opt[key])
  }
}

function makeRenderOption<T>(key: keyof T) {
  return (props, opt: T) => <li {...props}>{opt[key]}</li>
}

function makeOnChange<T>(
  key: keyof T,
  value: T,
  stateSetter: React.Dispatch<React.SetStateAction<T>>
) {
  return (event, value:  T) => {
    if (typeof value == 'string') {
      //stateSetter({ [key]: value as string })
    } else {
      stateSetter(value)
    }
  }
}

export function ObjectCreateAutocomplete<T extends Record<string,string>>({ key, initialValue, label, options }: { key: keyof T, initialValue: T, label?: string, options: T[] }){
    const [value, setValue] = useState<T>(initialValue)

    return (
      <Autocomplete
        value={null}
        options={options}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        onChange={/*makeOnChange<T>(key, value, setValue)*/ null}
        getOptionLabel={makeGetOptionLabel<T>(key)}
        renderOption={makeRenderOption<T>(key)}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    )
}