import React from "react"
import { Button, Layer, Text } from 'grommet'

import { getPlayerColorString, Match, Unit } from "../match"

const StatusGraphs = ({ match }: { match: Match }) => {
    if (!match) return null

    const [show, setShow] = React.useState<boolean>();

    return <Button label="Graphs" onClick={()=>setShow(true)}/>
    {show && (<Layer>
        
    </Layer>)}
}

export default StatusGraphs