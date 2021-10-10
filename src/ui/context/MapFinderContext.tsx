import React, { createContext, useContext, useEffect, useState } from 'react'
import { MapFinder } from '../../wg/map-utils'
import { Match } from '../../wg/match'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { mapRecords } from '../../wg/map-registry'

const MapFinderContext = createContext<MapFinder|undefined>(undefined)

export const useMapFinder = () => useContext(MapFinderContext)

export function MapFinderProvider(props: React.PropsWithChildren<any>) {
  let [mapFinder, setMapFinder] = useState<MapFinder|undefined>()

  function getEntries(){
    return db.mapEntries.toCollection().toArray()
  }

  const ientries = useLiveQuery(getEntries)

  useEffect(() => {
    if(ientries){
      mapFinder = new MapFinder(mapRecords)
      mapFinder.mergeEntries(ientries.map((i) => i.entry))
      setMapFinder(mapFinder)
      console.log(mapFinder)
    }
  }, [ientries])
  //console.log(mapFinder)
  return <MapFinderContext.Provider {...props} value={mapFinder} />
}


export function useMapInfo(match: Match){
  const mapFinder = useMapFinder()
  return mapFinder?.getMapInfo(match)
}