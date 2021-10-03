import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Skeleton from '@mui/material/Skeleton'

export default function SkeletonRow({ length }: { length: number }){
    return (
      <TableRow>
        {Array(length)
          .fill(0)
          .map((_, i) => (
            <TableCell key={i}>
              <Skeleton animation="wave" width={200} height={40} />
            </TableCell>
          ))}
      </TableRow>
    )
}