'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export function useAuthRole(allowedRoles: string[]) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
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

      setRole(profile.role)

      if (!allowedRoles.includes(profile.role)) {
        alert('Bu sayfaya giriş yetkiniz yok')
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [allowedRoles, router])

  return { loading, role }
}