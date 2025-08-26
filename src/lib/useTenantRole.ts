'use client'
import { useEffect, useState, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Role } from './roles'

export function useTenantRole(slug: string) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [role, setRole] = useState<Role>(null)
  
  useEffect(() => {
    ;(async () => {
      const t = await supabase.from('tenants').select('id').eq('slug', slug).single()
      if (t.error || !t.data) return setRole(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setRole(null)
      
      const ut = await supabase.from('user_tenants')
        .select('role').eq('tenant_id', t.data.id).eq('user_id', user.id).single()
      setRole((ut.data?.role as Role) ?? null)
    })()
  }, [slug, supabase])
  
  return role
}
