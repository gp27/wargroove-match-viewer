import { createTheme, Typography, ThemeProvider, Box, Toolbar, IconButton, Link, Drawer, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import { useState } from 'react'
import { Match } from '../wg/match'
import { PhaserWargrooveGame } from '../phaser/phaser-wagroove-game'
import { Close, Menu, Map, SportsEsports } from '@mui/icons-material'

import { useLocation, Route, Switch } from "wouter"

import Maps from './routes/Maps'
import PlayerChips from './common/PlayerChips'

function ChucklefishCredits(props: any) {
  return (
    <Typography variant="body2" align="center">
      Credit to{' '}
      <Link href="https://chucklefish.org/" target="_blank">
        {' '}
        Chucklefish
      </Link>{' '}
      for all images. Check the game on{' '}
      <Link target="_blank" href="https://store.steampowered.com/app/607050/Wargroove/">
        {' '}
        Steam
      </Link>
    </Typography>
  )
}

const mdTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff8f00'
    },
    secondary: {
      main: '#26c6da'
    },
    info: {
      main: '#2196f3'
    }
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default'
      }
    }
  }
})

export default function App() {
  const [open, setOpen] = useState(false)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const [match, setMatch] = useState<Match>(null)
  const [game, setGame] = useState<PhaserWargrooveGame>(null)
  const [location, setLocation] = useLocation()

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <CssBaseline />
        <AppBar position="absolute">
          <Toolbar>
            <IconButton onClick={toggleDrawer}>
              <Menu />
            </IconButton>

            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 2 }}>
              Wargroove Match Viewer
            </Typography>

            <ChucklefishCredits sx={{ flexGrow: 1 }} />
          </Toolbar>
        </AppBar>

        <Drawer open={open} sx={{ maxWidth: '85%', width: 600, position: 'relative', whiteSpace: 'nowrap' }} onBackdropClick={toggleDrawer}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <IconButton onClick={toggleDrawer}>
              <Close />
            </IconButton>
          </Toolbar>
          <Divider />
          <List>
            <ListItem button selected={location == '/'} onClick={() => setLocation('/')}>
              <ListItemIcon>
                <SportsEsports />
              </ListItemIcon>
              <ListItemText primary="Matches" />
            </ListItem>

            <ListItem button selected={location == '/maps'} onClick={() => setLocation('/maps')}>
              <ListItemIcon>
                <Map />
              </ListItemIcon>
              <ListItemText primary="Maps" />
            </ListItem>
          </List>
          <Divider />
          {/*<List>{secondaryListItems}</List>*/}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: "column", width: '100%' }}>
          <Toolbar />
          <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative'}}>
            <Switch>
              <Route path="/">
                  a
              </Route>
              <Route path="/maps" component={Maps} />
            </Switch>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
