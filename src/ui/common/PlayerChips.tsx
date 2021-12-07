import { useState } from 'react'
import {
  Chip,
  ChipProps,
  Stack,
  StackProps,
  Avatar,
  Menu,
  MenuItem,
  MenuProps,
} from '@mui/material'
import { Player } from '../../wg/match'
import { playerColors } from '../../wg/match-utils'

export function PlayerChip({
  player: { id, commander, username, color },
  ...chipProps
}: {
  player: Player
  players?: Player[]
} & ChipProps) {
  return (
    <Chip
      {...chipProps}
      avatar={
        <Avatar
          sx={{ background: playerColors[color].hex, color: '#fff !important' }}
        >
          P{id + 1}
        </Avatar>
      }
      label={username ? `${username} (${commander})` : commander}
    />
  )
}

export default function PlayerChips({
  players,
  ...stackProps
}: StackProps & { players: Player[] }) {
  return (
    <Stack direction="row" spacing={1} {...stackProps}>
      {players.map((player, i) => (
        <PlayerChip key={i} player={player} />
      ))}
    </Stack>
  )
}

export function PlayerChipWithEditableColor({
  player,
  players,
  onColorChange,
}: {
  player: Player
  players: Player[]
  onColorChange?: Function
}) {
  const [target, setChanging] = useState<Element>()

  const changeColor = (target?: Element) => {
    setChanging(target)
    if (!target) {
      onColorChange?.()
    }
  }

  return (
    <>
      <PlayerChip
        player={player}
        onClick={(ev) => changeColor(ev.target as Element)}
      />
      {target && (
        <PlayerColorMenu
          anchorEl={target}
          player={player}
          players={players}
          onClose={(ev) => changeColor()}
        />
      )}
    </>
  )
}

const colors = Object.keys(playerColors) as (keyof typeof playerColors)[]

function PlayerColorMenu({
  player,
  players,
  ...menuProps
}: {
  player: Player
  players: Player[]
} & Omit<MenuProps, 'open'>) {
  const [open, setOpen] = useState(Boolean(menuProps.anchorEl))
  const disabledColors = players.filter((p) => p != player).map((p) => p.color)

  function select(color) {
    player.color = color
    setOpen(false)
    menuProps.onClose({}, 'escapeKeyDown')
  }

  return (
    <Menu {...menuProps} open={open}>
      {colors.map((color, i) => (
        <MenuItem
          key={color}
          disabled={disabledColors.includes(color)}
          selected={color == player.color}
          onClick={(ev) => select(color)}
        >
          <Avatar
            sx={{
              background: playerColors[color].hex,
              color: '#fff !important',
            }}
          >
            P{player.id + 1}
          </Avatar>{' '}
          {color}
        </MenuItem>
      ))}
    </Menu>
  )
}
