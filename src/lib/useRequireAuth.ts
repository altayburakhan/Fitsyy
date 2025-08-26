'use client'
import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export function useRequireAuth() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) location.href = '/login'
    })
  }, [])
}
