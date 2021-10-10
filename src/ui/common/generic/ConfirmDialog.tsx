import {
  Button,
  Dialog,
  DialogActions,
  DialogProps,
  DialogTitle,
} from '@mui/material'

export function ConfirmDialog({
  close,
  onConfirm,
  message,
  ...props
}: {
  close: Function
  message: string
  onConfirm: Function
} & DialogProps) {
  return (
    <Dialog {...props}>
      <DialogTitle>{message}</DialogTitle>
      <DialogActions>
        <Button onClick={() => close()} autoFocus>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={() => {
            onConfirm()
            close()
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
