import { useState } from 'react'

const initialUrl = new URL(location.href)

export const initialUrlParams = {
  match_id: initialUrl.searchParams.get('match_id'),
}

const cleanUrl = new URL(initialUrl.href)
cleanUrl.search = ''

history?.replaceState(null, null, cleanUrl.href)

export function useLocalStorage<T>(propName: string, initialVal?: T) {
  try {
    let val = localStorage[propName]
    if (val !== undefined) {
      initialVal = JSON.parse(val)
    }
  } catch (e) {}

  let [val, setVal] = useState<T>(initialVal)

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
