import { AutoThemeProvider } from '@/components/auto-theme-provider'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mata Chat'
const description =
  'A fully open-source AI-powered answer engine with a generative UI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://your-deployed-url.com'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@miiura'
  },
  icons: {
    icon: [
      { url: '/icons/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/icons/favicon-light.svg', media: '(prefers-color-scheme: light)' }
    ],
    apple: [
      { url: '/icons/favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/icons/favicon-light.svg', media: '(prefers-color-scheme: light)' }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/favicon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icons/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoThemeProvider />
          <div className="relative min-h-screen overflow-hidden">
            <Header />
            <main className="transition-all duration-300 ease-in-out min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
