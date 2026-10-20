import { useEffect, useState } from 'react'
import { getCountdown, type CountdownParts } from '../lib/date'

export function useCountdown(targetISO: string): CountdownParts {
  const [parts, setParts] = useState(() => getCountdown(targetISO))
  useEffect(() => {
    if (parts.remaining <= 0) return
    // Align ticks to wall-clock seconds.
    let timer = 0
    const tick = () => {
      const next = getCountdown(targetISO)
      setParts(next)
      if (next.remaining > 0) timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetISO])
  return parts
}
