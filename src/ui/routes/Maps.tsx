import * as React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Box, Switch, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import MapTable from "../MapTable";
import { MapCard } from "../common/MapCard";
import { mapFinder, MapRecord, MapVersion } from "../../wg/map-utils";

export default function Maps() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showCards, setShowCards] = React.useState(false);

  const maps = mapFinder.getMaps();

  return (
    <React.Fragment>
      {!isMobile && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showCards}
                onChange={() => setShowCards(!showCards)}
              />
            }
            label="Show Cards"
          />
        </Box>
      )}

      {isMobile || showCards ? (
        <Box sx={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', alignItems: 'center'}}>
          {maps.map((map, i) => (
            <MapCard key={i} map={map} />
          ))}
        </Box>
      ) : (
        <MapTable maps={maps} />
      )}
    </React.Fragment>
  );
}
