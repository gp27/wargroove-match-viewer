import React from "react"
import { Button, Layer, Box } from 'grommet'
import { Line } from 'react-chartjs-2'

import { Match } from "../match"

const StatusGraphs = ({ match }: { match: Match }) => {
    if (!match) return null

    let [show, setShow] = React.useState<boolean>();

    let charts = match.getCharts()
    //console.log(charts)

    return <Box>
        <Button color="focus" label="Graphs" onClick={() => setShow(true)} />
        {show && (<Layer onEsc={() => setShow(false)} full="horizontal" margin="medium" background="light-1">
            <Box align="center" pad="medium">
                <Button color="focus" primary label="Close" onClick={() => setShow(false)} />
            </Box>
            

            <Box overflow="auto" direction="column" wrap={true} alignContent="center">
                {charts.map((chart, index) => <div key={index} style={{maxWidth: '800px', minWidth: '40%'}}><Line data={chart.data} options={chart.options}/></div>)}
            </Box>
        </Layer>)}
    </Box>
    
}

export default StatusGraphs