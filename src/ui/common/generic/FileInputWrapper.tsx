import { InputLabelProps, InputProps } from "@mui/material";
import React from "react";
import { readAsText } from 'promise-file-reader'

function loadFiles(files: FileList | null): Promise<string[]> {
    let promises = Array.from(files || []).map((file) =>
      readAsText(file)
      .catch((e) => null)
  )

  return Promise.all(promises).then(texts => texts.filter(A => A!== null) as string[])
}

export default function FileInputWrapper({
  children,
  onChange,
  ...props
}: {
  children?: React.ReactNode
  accept?: string
  multiple?: boolean
  onChange?: (filesText: string[]) => void
}) {
    const [id, setId] = React.useState('file-'+Math.random().toString(36).substr(2))

  return (
      <>
      <input
        {...props}
        type="file"
        style={{ display: 'none' }}
        id={id}
        onChange={({ target }) => {
            loadFiles(target.files).then(onChange || (()=>{}))
        }}
      />
    <label htmlFor={id}>
      {children}
    </label>
    </>
  )
}