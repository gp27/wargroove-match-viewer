import React, { useState } from 'react'
import Box from '@mui/material/Box'

export function SideSwitchingBox({ children, align }:  React.PropsWithChildren<{ align: 'top' | 'bottom' }>) {
  const [alignSide, setAlignSide] = useState<'left'|'right'>('left')
  const switchSide = () => { setAlignSide(alignSide == 'left' ? 'right' : 'left') }
  return <Box sx={{position: 'absolute', [align]: 0, [alignSide]: 0}} onMouseEnter={switchSide}>{children}</Box>
}
