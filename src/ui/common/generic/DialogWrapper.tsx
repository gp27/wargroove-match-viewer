import React from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'

export function makeDialogWrapper<T extends React.ComponentType<any>, P>(
  Component: React.ComponentType<any>
) {
  return function DialogWrapper<K extends T>({
    props,
    ...dialogProps
  }: DialogProps & { props: React.ClassAttributes<K> & P }) {
    return (
      <Dialog {...dialogProps}>
        <Component {...props} />
      </Dialog>
    )
  }
}

type p = React.ClassAttributes<{ banane: string }>

let x: p = {}
