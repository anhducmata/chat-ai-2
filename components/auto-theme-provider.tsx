'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function AutoThemeProvider() {
  const { setTheme } = useTheme()
  const [isAutoMode, setIsAutoMode] = useState(false)

  useEffect(() => {
    // Check if auto mode is enabled from localStorage
    const checkAutoMode = () => {
      const autoMode = localStorage.getItem('auto-theme-mode')
      return autoMode === 'true'
    }

    // Set initial auto mode state
    setIsAutoMode(checkAutoMode())

    // Watch for changes to auto-theme-mode in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auto-theme-mode') {
        setIsAutoMode(e.newValue === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!isAutoMode) return

    // Check if it's day or night based on current hour
    const updateThemeBasedOnTime = () => {
      const currentHour = new Date().getHours()
      // Consider daytime between 6 AM and 6 PM
      const isDaytime = currentHour >= 6 && currentHour < 18
      setTheme(isDaytime ? 'light' : 'dark')
    }

    // Set theme immediately when auto mode is enabled
    updateThemeBasedOnTime()

    // Update theme if user keeps the app open during day/night transition
    const interval = setInterval(updateThemeBasedOnTime, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [isAutoMode, setTheme])

  // This component doesn't render anything
  return null
} 