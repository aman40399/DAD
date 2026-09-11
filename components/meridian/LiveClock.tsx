'use client'

import React, { useState, useEffect, memo } from 'react'

function LiveClockComponent() {
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setTimeString(`${now.toLocaleDateString('en-US', dateOptions)} • ${timeStr}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="tracking-wide font-sans text-[11px] text-ink-mute dark:text-dark-mute" suppressHydrationWarning>
      {timeString || 'Sunday, 6 September 2026'}
    </span>
  )
}

export default memo(LiveClockComponent)
