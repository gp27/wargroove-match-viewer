import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, {
  AutocompleteProps,
  createFilterOptions,
} from '@mui/material/Autocomplete'

type onChangeCb<T> = (label: string, value?: T) => void

type AutocompletOptionWithData<T> = {
  label: string
  data: T
}

export function ObjectCreateAutocomplete<
  T extends { [key in P]: string },
  P extends keyof T
>({
  value,
  keyName,
  inputLabel,
  options,
  disabled,
  defaultLabel = '[empty]',
  onChange,
}: {
  value: T | string
  keyName: P
  inputLabel?: string
  options: T[]
  disabled?: boolean
  defaultLabel?: string
  onChange?: onChangeCb<T>
}) {
  function labelize(data: T, prop: P): AutocompletOptionWithData<T> {
    return {
      label: data[prop] || defaultLabel,
      data,
    }
  }

  function onChangeInternal(
    event,
    value: string | AutocompletOptionWithData<T>
  ) {
    if (!onChange) return
    if (!value) {
      onChange('')
    } else if (typeof value == 'string') {
      onChange(value.trim())
    } else {
      onChange(value.label, value.data)
    }
  }

  function getOptionLabel(opt: AutocompletOptionWithData<T> | string) {
    if (!opt) return ''
    if (typeof opt == 'string') return opt
    return opt.label
  }

  return (
    <Autocomplete
      sx={{ width: 300 }}
      value={
        typeof value == 'string'
          ? value
          : { label: value[keyName] || defaultLabel, data: value }
      }
      options={options.map((data) => labelize(data, keyName))}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
      onChange={onChangeInternal}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => <TextField {...params} label={inputLabel} />}
      disabled={disabled}
    />
  )
}
