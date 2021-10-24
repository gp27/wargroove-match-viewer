import { useState } from 'react'
import { Chart, LinearScale, PointElement } from 'chart.js'
import { DendogramController, EdgeLine } from 'chartjs-chart-graph'

Chart.register(DendogramController, EdgeLine, LinearScale, PointElement)

const initialUrl = new URL(location.href)

export const initialUrlParams = {
  match_id: initialUrl.searchParams.get('match_id'),
}

const cleanUrl = new URL(initialUrl.href)
cleanUrl.search = ''

history?.replaceState(null, '', cleanUrl.href)

export function useLocalStorage<T>(propName: string, initialVal?: T) {
  try {
    let val = localStorage[propName]
    if (val !== undefined) {
      initialVal = JSON.parse(val)
    }
    else if(initialVal !== undefined) {
      localStorage[propName] = JSON.stringify(initialVal)
    }
    
  } catch (e) {}

  let [val, setVal] = useState(initialVal)

  return [
    val,
    (val: T) => {
      let json = JSON.stringify(val)
      if (json !== undefined) {
        localStorage[propName] = json
      }
      setVal(val)
    },
  ] as [T, (v: T) => void]
}


export function useSessionId(){
  const [sessionId] = useLocalStorage(
    'wgmv_anon_session_id',
    'wgmv.1.' + Date.now() + '.' + Math.random().toString().substr(2)
  )
  return sessionId
}