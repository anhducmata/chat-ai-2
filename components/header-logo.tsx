'use client'

import { useRouter } from 'next/navigation'
import { IconLogo } from './ui/icons'

export default function HeaderLogo() {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Use replace instead of push to avoid adding to history stack
    router.replace('/')
  }

  return (
    <a 
      href="/" 
      onClick={handleClick}
      className="flex items-center gap-2" // Changed to flex to align logo and text
    >
      <IconLogo className="h-6 w-6" />
      <span className="font-semibold text-lg">MataChat</span>
      <span className="sr-only">Mata Chat</span>
    </a>
  )
} 