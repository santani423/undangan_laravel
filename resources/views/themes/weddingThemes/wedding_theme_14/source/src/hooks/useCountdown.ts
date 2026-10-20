import { useEffect, useState } from 'react'

export interface CountdownValue {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
  valid: boolean
}

function compute(target: number): CountdownValue {
  if (!Number.isFinite(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, valid: false }
  const diff = Math.max(0, target - Date.now())
  const s = Math.floor(diff / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff <= 0,
    valid: true,
  }
}

/** Ticks once per second, aligned to the wall-clock second. */
export function useCountdown(isoDate: string): CountdownValue {
  const target = new Date(isoDate).getTime()
  const [value, setValue] = useState(() => compute(target))
  useEffect(() => {
    let timer = 0
    const tick = () => {
      setValue(compute(target))
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [target])
  return value
}
