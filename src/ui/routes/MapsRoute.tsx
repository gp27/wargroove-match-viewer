import * as React from 'react'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Box, Switch, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MapTable from '../common/map/MapTable'
import { MapCard } from '../common/map/MapCard'
import SearchField from '../common/generic/SearchField'
import { useMapFinder } from '../context/MapFinderContext'
import { useLocalStorage } from '../../utils'

export default function MapsRoute() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showCards, setShowCards] = useLocalStorage('maps_showCards', false)
  const [search, setSearch] = React.useState<string>('')

  const mapFinder = useMapFinder()
  const allMaps = mapFinder?.getMaps()

  function filterMaps() {
    const searches = search
      .toLowerCase()
      .split(' ')
      .filter((A) => A)

    if (searches.length) {
      return allMaps?.filter(({ name, author, versions }) => {
        const vs = Object.values(versions)
          .map((v) => v.v)
          .join(' ')
        const t = `${name} ${author} ${vs}`.toLowerCase()
        return searches.some((s) => t.includes(s))
      })
    }

    return allMaps
  }

  const maps = filterMaps()

  return (
    <React.Fragment>
      <Box sx={{ p: 2, display: 'flex' }}>
        <span style={{ flex: 1 }} />
        <SearchField onChange={setSearch} />
        {!isMobile && (
          <FormControlLabel
            sx={{ ml: 2 }}
            control={
              <Switch
                checked={showCards}
                onChange={() => setShowCards(!showCards)}
              />
            }
            label="Show Cards"
          />
        )}
      </Box>
      

      {maps && (isMobile || showCards ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          {maps.map((map, i) => (
            <MapCard key={i} map={map} />
          ))}
        </Box>
      ) : (
        <MapTable maps={maps} />
      ))}
    </React.Fragment>
  )
}
