'use client'
import { ReactNode } from 'react'
import { useTenantRole } from '@/lib/useTenantRole'
import { hasMinRole, Role } from '@/lib/roles'

export default function RoleGate({
  slug, min, children, fallback = null,
}: {
  slug: string
  min: Exclude<Role,null>
  children: ReactNode
  fallback?: ReactNode
}) {
  const role = useTenantRole(slug)
  if (!role) return null
  return hasMinRole(role, min) ? <>{children}</> : <>{fallback}</>
}
