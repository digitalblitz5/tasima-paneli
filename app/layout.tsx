import type { Metadata } from 'next'
import './globals.css'
import Navbar from './navbar'

export const metadata: Metadata = {
  title: 'Taşıma Takip Sistemi',
  description: 'Sevkiyat, teslimat ve cari takip sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}