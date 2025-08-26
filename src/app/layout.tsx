import type { Metadata } from 'next'
import './globals.css'
import RootScaffold from '@/components/RootScaffold'

export const metadata: Metadata = {
  title: 'Fitsyy',
  description: 'Gym management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen">
        <RootScaffold>{children}</RootScaffold>
      </body>
    </html>
  )
}
