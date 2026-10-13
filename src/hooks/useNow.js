import { useEffect, useState } from 'react'

// Current time that updates on each whole interval
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id
    const tick = () => {
      setNow(new Date())
      id = setTimeout(tick, interval - (Date.now() % interval))
    }
    id = setTimeout(tick, interval - (Date.now() % interval))
    return () => clearTimeout(id)
  }, [interval])
  return now
}
