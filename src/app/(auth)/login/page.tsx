'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}` }
    })
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Giriş</h1>
        <input
          className="border rounded p-2 w-full"
          type="email" value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="you@example.com" required
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="rounded bg-black text-white px-4 py-2">Giriş linki gönder</button>
        {sent && <p>E-posta kutunu kontrol et.</p>}
      </form>
    </main>
  )
}

