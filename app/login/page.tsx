'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = async () => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      alert(error.message)
      return
    }

    const userId = data.user.id

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      alert('Profil bulunamadı')
      return
    }

    if (profile.role === 'azez') {
      router.push('/sevkiyat-olustur')
    }

    if (profile.role === 'kilis') {
      router.push('/teslimatlar')
    }

    if (profile.role === 'muhasebe') {
      router.push('/cari')
    }

    if (profile.role === 'admin') {
      router.push('/cari')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-[#161a20] p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          Giriş Yap
        </h1>

        <input
          type="email"
          placeholder="E-posta"
          className="mb-4 w-full rounded border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Şifre"
          className="mb-6 w-full rounded border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full rounded-xl bg-black px-6 py-4 text-white"
        >
          Giriş Yap
        </button>
      </div>
    </main>
  )
}