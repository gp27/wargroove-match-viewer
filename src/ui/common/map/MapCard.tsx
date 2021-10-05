import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Dialog, { DialogProps } from '@mui/material/Dialog'

import { MapRecord, MapVersion } from '../../../wg/map-utils'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { SwipeableViewsWithArrows } from '../generic/SwipableViewsWithArrows'
import { makeDialogWrapper } from '../generic/DialogWrapper'

function VersionSection({ version }: { version: MapVersion }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ mr: 2 }}>
          {version.tileHash && version.tileString ? (
            <Visibility color="success" sx={{ verticalAlign: 'middle' }} />
          ) : (
            <VisibilityOff color="warning" sx={{ verticalAlign: 'middle' }} />
          )}
        </Box>
        <Typography
          component="span"
          variant="body2"
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          <div>{version.v || '1.0'}</div>
          <code>{version.code}</code>
        </Typography>
      </Box>
    </Box>
  )
}

export function MapCard({
  map,
  version,
}: {
  map: MapRecord
  version?: MapVersion
}) {
  const versions = Object.values(map.versions)

  if (!version) {
    version = versions[0]
  }

  return (
    <Card sx={{ maxWidth: '380px', m: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', flexGrow: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
          }}
        >
          <CardContent sx={{ pb: 1, minWidth: 150 }}>
            <Typography component="div" variant="h5">
              {map.name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              {map.author}
            </Typography>
          </CardContent>
          <Box
            sx={{
              display: 'flex',
              position: 'relative',
              alignItems: 'center',
              pb: 1,
              pl: 1,
            }}
          >
            <SwipeableViewsWithArrows initialIndex={versions.indexOf(version)}>
              {versions.map((version, i) => (
                <VersionSection key={i} version={version} />
              ))}
            </SwipeableViewsWithArrows>
          </Box>
        </Box>
        <CardMedia
          component="img"
          loading="lazy"
          sx={{ maxWidth: 151, maxHeight: 151, cursor: 'pointer' }}
          image={version.imgSrc}
          onClick={() => window.open(version.imgSrc)}
        />
      </Box>
      {version.notes ? (
        <CardActions
          disableSpacing
          sx={{ bgcolor: 'InfoBackground', pt: 0.5, pb: 0.5 }}
        >
          <Typography
            variant="caption"
            display="div"
            sx={{ textAlign: 'center', maxWidth: 350 }}
          >
            {version.notes}
          </Typography>
        </CardActions>
      ) : null}
    </Card>
  )
}

//export const MapCardDialog = makeDialogWrapper<typeof MapCard>(MapCard)

export function MapCardDialog({
  map,
  version,
  ...props
}: DialogProps & { map: MapRecord; version?: MapVersion }) {
  return (
    <Dialog {...props}>
      <MapCard map={map} version={version} />
    </Dialog>
  )
}
