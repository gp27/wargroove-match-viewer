import React, { useEffect, useState } from 'react'
import { TextField } from '@mui/material'
import Autocomplete, {
  createFilterOptions,
} from '@mui/material/Autocomplete'

type onChangeCb<T> = (label: string, value?: T) => void

type AutocompletOptionWithData<T> = {
  label: string
  data?: T
  isNew?: boolean
}

function normalizeWhiteSpace(str: string){
  return str.trim().replace(/\s+/g, ' ')
}

const filter = createFilterOptions<string|AutocompletOptionWithData<any>>({ trim: true })

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
  getOptionDisabled,
  startAdornment,
  error,
}: {
  value: T | string
  keyName: P
  inputLabel?: string
  options: (T | string)[]
  disabled?: boolean
  defaultLabel?: string
  onChange?: onChangeCb<T>
  getOptionDisabled?: (opt: AutocompletOptionWithData<T> | string) => boolean
  startAdornment?: React.ReactNode,
  error?: string
}) {
  function labelize(data: T | string): AutocompletOptionWithData<T> {
    if (typeof data == 'string') {
      return { label: data || defaultLabel }
    }
    return {
      label: data[keyName] || defaultLabel,
      data,
    }
  }

  function setupOptions() {
    const seenLabels = {}
    return options
      .map((data) => {
        let x = labelize(data)
        if (seenLabels[x.label]) return
        seenLabels[x.label] = true
        return x
      })
      .filter((A) => A)
  }

  function onChangeInternal(
    event,
    value: string | AutocompletOptionWithData<T>
  ) {
    if (!onChange) return
    if (!value) {
      onChange('')
    } else if (typeof value == 'string') {
      onChange(value)
    } else {
      onChange(value.label, value.data)
    }
  }

  function getOptionLabel(opt: AutocompletOptionWithData<T> | string) {
    if (!opt) return ''
    if (typeof opt == 'string') return opt
    return opt.isNew ? `Add "${opt.label}"` : opt.label
  }

  return (
    <Autocomplete
      fullWidth
      value={
        typeof value == 'string'
          ? value
          : { label: value[keyName] || defaultLabel, data: value }
      }
      options={setupOptions()}
      clearOnBlur
      handleHomeEndKeys
      onChange={onChangeInternal}
      getOptionLabel={getOptionLabel}
      renderInput={({ InputProps, ...params }) => (
        <TextField
          InputProps={{ ...InputProps, startAdornment }}
          {...params}
          placeholder={inputLabel}
          label={inputLabel}
          error={!!error}
          helperText={error}
        />
      )}
      disabled={disabled}
      isOptionEqualToValue={(opt, val) => {
        if(!val) val = ''
        if(!opt) opt = ''

        if (typeof val == 'string') {
          val = { label: normalizeWhiteSpace(val) }
        }
        if (typeof opt == 'string') {
          opt = { label: opt }
        }
        return opt.label == val.label
      }}
      getOptionDisabled={getOptionDisabled}
      filterOptions={(options: AutocompletOptionWithData<T>[], params) => {
        const filtered = filter(options, params)

        let { inputValue } = params
        inputValue = normalizeWhiteSpace(inputValue)

        const isExisting = options.some(
          (option) =>
            inputValue === (typeof option == 'string' ? option : option.label)
        )
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            //inputValue,
            isNew: true,
            label: inputValue,
          })
        }

        return filtered
      }}
    />
  )
}
