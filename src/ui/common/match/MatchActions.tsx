import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import { IMatch, db } from '../../../db'
import { useSnackbar } from 'notistack'
import { useModal } from 'mui-modal-provider'
import { useLocation } from 'wouter'

import { Close, Download, Link, Launch, CloudUpload } from '@mui/icons-material'

import { ConfirmDialog } from '../generic/ConfirmDialog'

export default function MatchActions({ imatch }: { imatch: IMatch }) {
  const { enqueueSnackbar } = useSnackbar()
  const { showModal } = useModal()
  const [, setLocation] = useLocation()

  let { id = '', online, data, name, match } = imatch

  function openMatch() {
    setLocation('/match/' + id)
  }

  function upload(){
    if(!match.getWinners().length){
      enqueueSnackbar('Only completed local matches can be migrated to the cloud')
      return
    }

    fetch('https://worker.wgroove.tk/match_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if(res.status == 200){
        db.matches.update(imatch.id, { online: true })
      }
    })
  }

  function download() {
    let a = document.createElement('a')
    let filename =
      (name ? name.replace(/[^\w\-\.]/g, '_') + '_' : '').replace(/_+/g, '_') +
      `${id}.json`
    a.download = filename
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)]))
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function copyLink() {
    let url = new URL(location.origin)
    url.searchParams.set('match_id', id)
    navigator.clipboard.writeText(url.href)
    enqueueSnackbar('Link Copied')
  }

  function openDeleteDialog() {
    const modal = showModal(ConfirmDialog, {
      close: () => modal.destroy(),
      message: 'Delete this match?',
      onConfirm: () => db.matches.delete(id)
    })
  }

  return (
    <React.Fragment>
      <IconButton onClick={openMatch}>
        <Launch />
      </IconButton>

      {online ? (
        <IconButton onClick={copyLink}>
          <Link />
        </IconButton>
      ) : (
        <>
          <IconButton onClick={download}>
            <Download />
          </IconButton>
          <IconButton onClick={upload}>
            <CloudUpload />
          </IconButton>
        </>
      )}

      <IconButton onClick={openDeleteDialog}>
        <Close />
      </IconButton>
    </React.Fragment>
  )
}
