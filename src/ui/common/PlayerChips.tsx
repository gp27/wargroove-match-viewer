import Chip from '@mui/material/Chip';
import Stack, {StackProps} from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { Player } from '../../wg/match'
import { playerColors } from '../../wg/match-utils';

export function PlayerChip({ player: { id, commander, username, color } }: { player: Player }){
    return <Chip avatar={<Avatar sx={{ background: playerColors[color].hex, color: '#fff !important' }}>P{id + 1}</Avatar>} label={username ? `${username} (${commander})` : commander} />
}

export default function PlayerChips({ players, ...stackProps }: StackProps & { players: Player[] }){
    return (
        <Stack direction="row" spacing={1} {...stackProps}>
            {players.map((player, i) => <PlayerChip key={i} player={player}/>)}
        </Stack>
    )
}