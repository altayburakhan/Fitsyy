'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      {/* BACKDROP */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-center bg-cover will-change-transform animate-kenburns"
          style={{ backgroundImage: 'url(/login/bg-1.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* SOL ÜST LOGO ALANI */}
      <div className="absolute top-6 left-8 z-20">
        {/* Sen logo-wordmark.png ya da svg koyduğunda görünecek */}
        <img
          src="/logo-wordmark.png"
          alt="Fitsyy"
          className="h-10 w-auto opacity-95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* PANEL */}
      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
          <div className="hidden lg:block lg:col-span-7" />
          <div className="flex items-center lg:col-span-5 py-12">
            <section className="ms-auto w-full max-w-md relative rounded-2xl bg-card/55 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,.6)] border border-white/5">
              <div className="px-7 pt-8 pb-7 space-y-6">
                <h1 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.01em]">
                  Hesabına giriş yap
                </h1>
                <p className="text-sm text-muted-foreground">E-posta ile şifresiz giriş.</p>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground">
                      E-posta
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-xl border border-input bg-background/70 px-3 text-foreground outline-none
                                 transition focus:border-ring focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {err && <p className="text-sm text-red-500">{err}</p>}
                  {sent && <p className="text-sm text-primary">Giriş linki gönderildi. E-posta kutunu kontrol et.</p>}

                  <button
                    disabled={loading}
                    className="group relative mt-1 h-11 w-full rounded-xl bg-primary text-primary-foreground font-medium
                               transition hover:opacity-95 disabled:opacity-60"
                  >
                    {loading ? 'Gönderiliyor…' : 'Giriş linki gönder'}
                  </button>

                  <p className="pt-3 text-[11px] text-muted-foreground text-center">
                    Giriş yaparak KVKK ve kullanım şartlarını kabul etmiş olursun.
                  </p>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
