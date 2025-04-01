'use client'

import { Clock, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [isAuto, setIsAuto] = useState(false)

  // Check if the user has selected auto mode
  useEffect(() => {
    const autoMode = localStorage.getItem('auto-theme-mode')
    if (autoMode === 'true') {
      setIsAuto(true)
    }
  }, [])

  const handleAutoMode = () => {
    const oldValue = localStorage.getItem('auto-theme-mode') || 'false'
    localStorage.setItem('auto-theme-mode', 'true')
    setIsAuto(true)
    
    // Set initial theme based on time
    const currentHour = new Date().getHours()
    const isDaytime = currentHour >= 6 && currentHour < 18
    setTheme(isDaytime ? 'light' : 'dark')
    
    // Manually dispatch storage event for same window listeners
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auto-theme-mode',
      oldValue,
      newValue: 'true',
      storageArea: localStorage
    }))
  }

  const handleManualMode = (selectedTheme: string) => {
    const oldValue = localStorage.getItem('auto-theme-mode') || 'false'
    localStorage.setItem('auto-theme-mode', 'false')
    setIsAuto(false)
    setTheme(selectedTheme)
    
    // Manually dispatch storage event for same window listeners
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'auto-theme-mode',
      oldValue,
      newValue: 'false',
      storageArea: localStorage
    }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs-icon">
          {isAuto ? (
            <Clock className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleManualMode('light')} className={theme === 'light' && !isAuto ? 'bg-accent' : ''}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualMode('dark')} className={theme === 'dark' && !isAuto ? 'bg-accent' : ''}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManualMode('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAutoMode} className={isAuto ? 'bg-accent' : ''}>
          Auto (Time-based)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
