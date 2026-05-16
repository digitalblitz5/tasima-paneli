'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-black text-white">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex items-center justify-between">
          <a href="/dashboard" className="text-lg font-bold">
            Taşıma Paneli
          </a>

          <button
            onClick={() => setOpen(!open)}
            className="rounded bg-gray-800 px-4 py-2 md:hidden"
          >
            Menü
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <a href="/dashboard" className="rounded px-3 py-2 hover:bg-gray-800">
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

            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-4 grid gap-2 md:hidden">
            <a href="/dashboard" className="rounded bg-gray-800 px-3 py-3">
              Panel
            </a>

            <a href="/sevkiyat-olustur" className="rounded bg-gray-800 px-3 py-3">
              Yeni Sevkiyat
            </a>

            <a href="/teslimatlar" className="rounded bg-gray-800 px-3 py-3">
              Teslimatlar
            </a>

            <a href="/tasiyicilar" className="rounded bg-gray-800 px-3 py-3">
              Taşıyıcılar
            </a>

            <a href="/cari" className="rounded bg-gray-800 px-3 py-3">
              Cari
            </a>

            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="rounded bg-red-600 px-3 py-3 text-left text-white"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}