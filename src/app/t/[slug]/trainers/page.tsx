'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users2, Plus, Mail, Phone, Calendar, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trainer = { 
  id: string; 
  full_name: string; 
  email: string | null; 
  phone: string | null; 
  active: boolean;
  created_at: string;
  expertise?: string;
}

export default function TrainersPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [trainers, setTrainers] = useState<Trainer[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        // Tenant ID al
        const { data: tenant, error: terr } = await supabase
          .from('tenants')
          .select('id')
          .eq('slug', slug)
          .single()
        
        if (terr || !tenant) {
          setErr('Tenant bulunamadı')
          return
        }

        // Eğitmenleri çek
        const { data, error } = await supabase
          .from('trainers')
          .select('id, full_name, email, phone, active, created_at')
          .eq('tenant_id', tenant.id)
          .order('full_name')

        if (error) throw error
        setTrainers(data || [])

      } catch (error: any) {
        setErr(error.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug, supabase])

  if (loading) return (
    <main className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users2 className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-500">Eğitmenler yükleniyor...</p>
        </div>
      </div>
    </main>
  )

  if (err) return (
    <main className="p-6">
      <div className="text-center py-8">
        <p className="text-red-600">Hata: {err}</p>
      </div>
    </main>
  )

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Eğitmenler</h1>
        </div>
        <Button variant="default" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Yeni Eğitmen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Eğitmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{trainers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktif Eğitmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {trainers?.filter(t => t.active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bu Ay Eklenen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {trainers?.filter(t => {
                const created = new Date(t.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <CardTitle>Eğitmen Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainers && trainers.length > 0 ? (
              trainers.map(trainer => (
                <div key={trainer.id} className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{trainer.full_name}</span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          trainer.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        )}>
                          {trainer.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      {trainer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {trainer.email}
                        </div>
                      )}
                      {trainer.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {trainer.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trainer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Düzenle</Button>
                    <Button variant="ghost" size="sm">Detay</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Henüz eğitmen yok</p>
                <p className="text-sm">İlk eğitmeninizi ekleyerek başlayın</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Future Features */}
      <Card>
        <CardHeader>
          <CardTitle>Gelecek Özellikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Star className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Performans Puanı</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Çalışma Takvimi</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Users2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Müşteri Yorumları</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
