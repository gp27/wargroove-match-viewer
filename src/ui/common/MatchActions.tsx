import * as React from 'react'
import IconButton from '@mui/material/IconButton'
import { IMatch, db } from '../../db'
import { Match, MatchData } from '../../wg/match'
import { useSnackbar } from 'notistack'
import { useLocation } from 'wouter'

import { Close, Download, Link, Launch } from '@mui/icons-material'

export default function MatchActions({ imatch }: { imatch: IMatch }){
    const { enqueueSnackbar } = useSnackbar()
    const [, setLocation] = useLocation()

    let { id, online, data, name } = imatch

    function openMatch(){
        setLocation('/match/' + id)
    }

    function download() {
      let a = document.createElement('a')
      let filename =
        (name ? name.replace(/[^\w\-\.]/g, '_') + '_' : '').replace(
          /_+/g,
          '_'
        ) + `${id}.json`
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

    function deleteMatch(){
        db.matches.delete(id)
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
          <IconButton onClick={download}>
            <Download />
          </IconButton>
        )}

        <IconButton>
          <Close />
        </IconButton>
      </React.Fragment>
    )
}