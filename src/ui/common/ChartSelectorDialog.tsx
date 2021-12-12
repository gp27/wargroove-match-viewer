import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogActions,
  Button,
  IconButton,
  Box,
  Select,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
} from '@mui/material'
import { DragHandle, Save, Add, RestartAlt, Clear } from '@mui/icons-material'
import { DraggableItems } from './generic/DraggableList'

import { useModal } from 'mui-modal-provider'

import { getChartDatasetNames, getChartTransformNames } from '../../wg/charts'
import { useLocalStorage } from '../../utils'

export function getDefaultChartItems(): [string, string][] {
  return [
    ['income', 'avg'],
    ['army', 'avg'],
    ['unit_count', 'avg'],
    ['groove', 'turn_start'],
    ['commander_health', 'turn_start'],
    //['potential', 'delta'],
    //['potential', 'zerosum']
  ]
}

export function ChartSelectorDialog({
  close,
  items: initialItems,
  setItems: setInitialItems,
  ...props
}: {
  items: [string,string][]
  setItems: (items: [string,string][]) => void,
  close: Function
} & DialogProps){
  let [savedItems, setSavedItems] = useLocalStorage('match_chartsConfig', getDefaultChartItems()) 
  let [items, setItems] = useState([...initialItems])

  const dsetnames = getChartDatasetNames()
  const transfnames = getChartTransformNames()

  const update = items => {
    setItems(items)
    setInitialItems(items)
  }

  const remove = (index: number) => {
    items = [...items]
    items.splice(index, 1)
    update(items)
  }

  const add = () => {
    const chnames = items.map(i => i[0])
    const name = dsetnames.find(n => !chnames.includes(n)) || chnames[0]
    const trnames = items.filter(i => i[0] == name).map(i => i[1])
    const tr = transfnames.find(n => !trnames.includes(n)) || trnames[0]

    update([...items, [name, tr]])
  }

  const setDataset = (item, dset) => {
    item[0] = dset
    update([...items])
  }

  const setTransf = (item, tr) => {
    item[1] = tr
    update([...items])
  }

  const resetDefault = () => {
    update(getDefaultChartItems())
  }

  const save = () => {
    setSavedItems(items)
  }

  return (
    <Dialog {...props}>
      <DialogTitle>Chart configurations</DialogTitle>
      <List dense>
        <DraggableItems
          onOrderChange={(items) => update(items)}
          dragHandleSelector=".drag-handle"
          items={items}
          itemComponent={(item, i) => (
            <ListItem sx={{ zIndex: 9999 }} divider>
              <ListItemIcon className="drag-handle">
                <DragHandle />
              </ListItemIcon>
              <Box>
                <FormControl variant="standard" sx={{ width: 170 }}>
                  <InputLabel>Chart Name</InputLabel>
                  <Select
                    label="Chart Name"
                    value={item[0]}
                    onChange={(ev) => setDataset(item, ev.target.value)}
                  >
                    {dsetnames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="standard" sx={{ width: 100 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    label="Chart Type"
                    value={item[1]}
                    onChange={(ev) => setTransf(item, ev.target.value)}
                  >
                    {transfnames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {items.length >= 2 && (
                <IconButton onClick={(ev) => remove(i)}>
                  <Clear />
                </IconButton>
              )}
            </ListItem>
          )}
        />
      </List>
      <DialogActions sx={{ display: 'flex' }}>
        <Button onClick={add} variant="outlined" size="small">
          Add chart <Add />
        </Button>
        <Box sx={{flex:1}}></Box>
        <IconButton onClick={save} disabled={items.toString()==savedItems.toString()}>
          <Save />
        </IconButton>
        <IconButton onClick={resetDefault}>
          <RestartAlt />
        </IconButton>
      </DialogActions>
    </Dialog>
  )
}