'use client'

import React, { useState, useEffect, memo } from 'react'

function formatLiveDate(now: Date = new Date()): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${now.toLocaleDateString('en-US', dateOptions)} • ${timeStr}`
}

function LiveClockComponent() {
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTimeString(formatLiveDate(new Date()))
    }

    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="tracking-wide font-sans text-[11px] text-ink-mute dark:text-dark-mute" suppressHydrationWarning>
      {timeString}
    </span>
  )
}

export default memo(LiveClockComponent)
