import * as React from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import SwipeableViews from "react-swipeable-views";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { BoxProps } from "@mui/system";

export const SwipeableViewsWithArrows: React.FC<BoxProps & { initialIndex?: number }> =
  ({ children, initialIndex = 0 }) => {
    let [index, setIndex] = React.useState(initialIndex)
    const n = React.Children.count(children)

    function stepIndex(i: number) {
      index = index + i
      index = index < 0 ? 0 : index >= n ? n - 1 : index
      setIndex(index)
    }

    return (
      <Box sx={{ position: 'relative' }}>
        {n > 1 && (
          <IconButton
            sx={{ position: 'absolute', left: 0, zIndex: 1 }}
            onClick={() => stepIndex(-1)}
            disabled={index == 0}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {n > 1 && (
          <IconButton
            sx={{ position: 'absolute', right: 0, zIndex: 1 }}
            onClick={() => stepIndex(+1)}
            disabled={index == n - 1}
          >
            <ChevronRight />
          </IconButton>
        )}
        <SwipeableViews
          enableMouseEvents
          index={index}
          onChangeIndex={setIndex}
        >
          {children}
        </SwipeableViews>
      </Box>
    )
  }
