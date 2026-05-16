'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function HomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        router.push('/login')
        return
      }

      if (profile.role === 'azez') router.push('/sevkiyat-olustur')
      if (profile.role === 'kilis') router.push('/teslimatlar')
      if (profile.role === 'muhasebe') router.push('/cari')
      if (profile.role === 'admin') router.push('/dashboard')
    }

    checkLogin()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-lg font-semibold">Yönlendiriliyor...</p>
    </main>
  )
}