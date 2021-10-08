import React, { createContext, useContext, useEffect, useState } from 'react'
import { MapFinder } from '../../wg/map-utils'
import { Match } from '../../wg/match'

const MapFinderContext = createContext<MapFinder|undefined>(undefined)

export const useMapFinder = () => useContext(MapFinderContext)

export function MapFinderProvider(props: React.PropsWithChildren<any>) {
  const [mapFinder, setMapFinder] = useState<MapFinder|undefined>()
  useEffect(() => {
      MapFinder.getInstance().then(mapFinder => {
        setMapFinder(mapFinder)
      })
  }, [])
  //console.log(mapFinder)
  return <MapFinderContext.Provider {...props} value={mapFinder} />
}


export function useMapInfo(match: Match){
  const mapFinder = useMapFinder()
  return mapFinder?.getMapInfo(match)
}