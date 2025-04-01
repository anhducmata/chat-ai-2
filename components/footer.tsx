import Link from 'next/link'
import React from 'react'
import { SiLinkedin } from 'react-icons/si'
import { Button } from './ui/button'

const Footer: React.FC = () => {
  return (
    <footer className="w-fit p-1 md:p-2 fixed bottom-0 right-0 hidden lg:block">
      <div className="flex justify-end">
        <Button
          variant={'ghost'}
          size={'xs-icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://www.linkedin.com/in/ducmata/" target="_blank">
            <SiLinkedin size={18} />
          </Link>
        </Button>
      </div>
    </footer>
  )
}

export default Footer
