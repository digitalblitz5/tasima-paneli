'use client'

import { supabase } from '../lib/supabase'

export default function Navbar() {
  return (
    <nav className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 p-4">

        <a
          href="/dashboard"
          className="rounded bg-[#161a20] px-3 py-2 font-bold text-white"
        >
          Panel
        </a>

        <a
          href="/sevkiyat-olustur"
          className="rounded px-3 py-2 hover:bg-gray-800"
        >
          Yeni Sevkiyat
        </a>

        <a
          href="/teslimatlar"
          className="rounded px-3 py-2 hover:bg-gray-800"
        >
          Teslimatlar
        </a>

        <a
          href="/tasiyicilar"
          className="rounded px-3 py-2 hover:bg-gray-800"
        >
          Taşıyıcılar
        </a>

        <a
          href="/cari"
          className="rounded px-3 py-2 hover:bg-gray-800"
        >
          Cari
        </a>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="ml-auto rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
        >
          Çıkış Yap
        </button>

      </div>
    </nav>
  )
}