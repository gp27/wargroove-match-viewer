import * as React from 'react'
import { Box, Slider, IconButton } from '@mui/material'
import { PlayArrow, Pause, FastForward } from '@mui/icons-material'

export function SliderControls({ onSpeedChange }: { onSpeedChange?: (number) => void }){
  const marks = [
    {
      value: 0,
      label: (
        <IconButton>
          <Pause />
        </IconButton>
      ),
    },
    {
      value: 50,
      label: (
        <IconButton>
          <PlayArrow />
        </IconButton>
      ),
    },
    /*{
      value: 60,
      label: <FastForward />,
    },*/
    {
      value: 100,
      label: (
        <IconButton>
          <FastForward />
        </IconButton>
      ),
    },
  ]

  return <Box sx={{p: 4, pt: 0, pb: 2}}>
    <Slider
      defaultValue={0}
      step={null}
      marks={marks}
      onChange={(ev, val) => onSpeedChange?.(val)}
    />
  </Box>
}