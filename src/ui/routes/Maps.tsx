import * as React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Box, Switch, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MapTable from "../MapTable";
import { MapCard } from "../common/MapCard";
import SearchField from "../common/SearchField";
import { mapFinder } from "../../wg/map-utils";

export default function Maps() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showCards, setShowCards] = React.useState(false);

  const allMaps = mapFinder.getMaps()

  let [maps, setMaps] = React.useState(allMaps)

  function filterMaps(search: string){
    const searches = search.toLowerCase().split(' ').filter(A => A)

    if(searches.length){
      maps = allMaps.filter(({ name, author }) => {
        const t = `${name} ${author}`.toLowerCase()
        return searches.some(s => t.includes(s))
      })
    }
    else{
      maps = allMaps
    }

    setMaps(maps)
  }

  return (
    <React.Fragment>
      <Box sx={{ p: 2, display: 'flex' }}>
        <span style={{ flex: 1 }} />
        <SearchField onChange={filterMaps} />
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

      {isMobile || showCards ? (
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
      )}
    </React.Fragment>
  )
}
