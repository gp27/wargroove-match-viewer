import React, {useEffect, useState } from 'react'
import Box from '@mui/material/Box'

import { Switch, Button, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { Map } from '@mui/icons-material'
import SearchField from '../common/generic/SearchField'
import { db, IMatch } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMapFinder } from '../context/MapFinderContext'
import { OpeningGroups, OpeningsClusters } from '../../wg/openings'
import Chart from 'react-chartjs-2'

export default function OpeningsRoute() {
  const mapFinder = useMapFinder()
  const matches = useLiveQuery(() => db.matches.toArray())

  let [openingGroups, setOpeningGroups] = useState<OpeningGroups>()
  let [openingsClusters, setOpeningsClusters] = useState<OpeningsClusters>()

  useEffect(() => {
    if(!matches || !mapFinder) return
    setOpeningGroups(
      new OpeningGroups(
        matches.map(({ match }) => match),
        mapFinder
      )
    )
  }, [mapFinder, matches])

  if (!mapFinder || !matches || !openingGroups) return null

  function setCluster(id: string){
    let cls = openingGroups.getOpeningCluster(id)
    setOpeningsClusters(cls)
  }

  return (<>
    {openingsClusters && <Box>
      <OpeningsView openingsClusters={openingsClusters}/>
    </Box>}
    <List>
      {openingGroups.getGroups().map(({ name, id, playersN, matches }) => (
        <ListItem key={id} divider>
          <ListItemButton onClick={() => setCluster(id)}>
            <ListItemIcon><Map/></ListItemIcon>
            <ListItemText primary={name} secondary={playersN + ' players - ' + matches.length + ' matches'} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    </>
  )
}

const Chart2: any = Chart

function OpeningsView({ openingsClusters }: { openingsClusters: OpeningsClusters }){
  console.log(openingsClusters.clusterized)

  function toChart(
    { children = [], height, indexes = [] }: any = {},
    data = [],
    //labels = [],
    parent?
  ) {
    data.push({ x: height, parent })
    //labels.push(indexes.length === 1 ? indexes[0] : '')
    let parentId = data.length - 1
    children.forEach((c) => toChart(c, data, parentId))
    return data
  }

  function getData(){
    const colors = ['red', 'blue']
    let labels: string[] = []
    let datasets = openingsClusters.clusterized.map(c => toChart(c)).map((data, i) => {
      labels.push('Player' + (i+1))
      return { data, borderColor: colors[i] }
    })
    console.log(datasets)
    return {
      labels,
      datasets
    }
  }

  return (
    <Chart2
      type={'dendogram'}
      data={getData}
      options={{ tree: { orientation: 'horizontal' } }}
    />
  )
}