import {
  createTheme,
  Typography,
  ThemeProvider,
  Box,
  Toolbar,
  IconButton,
  Link,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import { useState } from 'react'
import { Match } from '../wg/match'
import { PhaserWargrooveGame } from '../phaser/phaser-wagroove-game'
import { Close, Menu, Map, SportsEsports, AltRoute } from '@mui/icons-material'
import { SnackbarProvider } from 'notistack'
import ModalProvider from 'mui-modal-provider'
import { MapFinderProvider } from './context/MapFinderContext'

import { useLocation, Route, Switch, Redirect } from 'wouter'
import { initialUrlParams } from '../utils'

import Maps from './routes/MapsRoute'
import MatchesRoute from './routes/MatchesRoute'
import MatchRoute from './routes/MatchRoute'
import OpeningsRoute from './routes/OpeningsRoute'

function ChucklefishCredits(props: any) {
  return (
    <Typography variant="body2" align="center">
      Credit to{' '}
      <Link href="https://chucklefish.org/" target="_blank">
        {' '}
        Chucklefish
      </Link>{' '}
      for all images. Check the game on{' '}
      <Link
        target="_blank"
        href="https://store.steampowered.com/app/607050/Wargroove/"
      >
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
      main: '#ff8f00',
    },
    secondary: {
      main: '#26c6da',
    },
    info: {
      main: '#2196f3',
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
      },
    }
  },
})

export default function App() {
  const [location, setLocation] = useLocation()
  const [matchId, setMatchId] = useState(initialUrlParams.match_id)

  if (matchId) {
    setLocation('/match/' + matchId, { replace: true })
    setMatchId(null)
  }

  return (
    <ThemeProvider theme={mdTheme}>
      <MapFinderProvider>
        <SnackbarProvider maxSnack={3}>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </SnackbarProvider>
      </MapFinderProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const [open, setOpen] = useState(false)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  const [match, setMatch] = useState<Match>()
  const [game, setGame] = useState<PhaserWargrooveGame>()
  const [location, setLocation] = useLocation()

  function navigate(url: string) {
    toggleDrawer()
    setLocation(url)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar position="absolute">
        <Toolbar>
          <IconButton onClick={toggleDrawer}>
            <Menu />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 2 }}
          >
            Wargroove Match Viewer
          </Typography>

          <ChucklefishCredits sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>

      <Drawer
        open={open}
        sx={{
          '& .MuiDrawer-paper': {
            maxWidth: '85%',
            width: 300,
            position: 'relative',
            whiteSpace: 'nowrap',
          },
        }}
        onBackdropClick={toggleDrawer}
      >
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          <ListItem
            button
            selected={location == '/'}
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <SportsEsports />
            </ListItemIcon>
            <ListItemText primary="Matches" />
          </ListItem>

          <ListItem
            button
            selected={location == '/maps'}
            onClick={() => navigate('/maps')}
          >
            <ListItemIcon>
              <Map />
            </ListItemIcon>
            <ListItemText primary="Maps" />
          </ListItem>

          {/*<ListItem
            button
            selected={location == '/openings'}
            onClick={() => navigate('/openings')}
          >
            <ListItemIcon>
              <AltRoute />
            </ListItemIcon>
            <ListItemText primary="Openings" />
          </ListItem>}*/}
        </List>
        <Divider />
        {/*<List>{secondaryListItems}</List>*/}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Switch>
            <Route path="/" component={MatchesRoute} />
            <Route path="/maps" component={Maps} />
            <Route path="/match/:id" component={MatchRoute} />
            <Route path="/openings" component={OpeningsRoute} />
            <Route path="/*">
              <Redirect to="/"/>
            </Route>
          </Switch>
        </Box>
      </Box>
    </Box>
  )
}
