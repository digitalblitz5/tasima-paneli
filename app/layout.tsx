import type { Metadata } from 'next'
import './globals.css'

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
        <nav className="bg-black text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 p-4">
            <a href="/dashboard" className="rounded bg-white px-3 py-2 font-bold text-black">
              Panel
            </a>

           <a href="/sevkiyat-olustur" className="rounded px-3 py-2 hover:bg-gray-800">
  Yeni Sevkiyat
</a>

            <a href="/teslimatlar" className="rounded px-3 py-2 hover:bg-gray-800">
              Teslimatlar
            </a>

            <a href="/tasiyicilar" className="rounded px-3 py-2 hover:bg-gray-800">
              Taşıyıcılar
            </a>

            <a href="/cari" className="rounded px-3 py-2 hover:bg-gray-800">
              Cari
            </a>

            <a href="/login" className="ml-auto rounded bg-gray-700 px-3 py-2 hover:bg-gray-600">
              Giriş
            </a>
          </div>
        </nav>

        {children}
      </body>
    </html>
  )
}