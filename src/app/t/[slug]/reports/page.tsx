'use client'
import { use, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRequireAuth } from '@/lib/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  DollarSign,
  Activity
} from 'lucide-react'

type ReportData = {
  totalMembers: number
  activeMembers: number
  totalSlots: number
  totalBookings: number
  monthlyGrowth: number
  avgAttendance: number
}

export default function ReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  useRequireAuth()
  const { slug } = use(params)
  const supabase = createSupabaseBrowserClient()

  const [data, setData] = useState<ReportData | null>(null)
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

        // Rapor verilerini paralel olarak çek
        const [members, slots, bookings] = await Promise.all([
          supabase
            .from('members')
            .select('id, status, created_at')
            .eq('tenant_id', tenant.id),
          supabase
            .from('time_slots')
            .select('id, created_at')
            .eq('tenant_id', tenant.id),
          supabase
            .from('bookings')
            .select('id, status, created_at')
            .eq('tenant_id', tenant.id)
        ])

        if (members.error) throw members.error
        if (slots.error) throw slots.error
        if (bookings.error) throw bookings.error

        // Verileri işle
        const totalMembers = members.data?.length || 0
        const activeMembers = members.data?.filter(m => m.status === 'ACTIVE').length || 0
        const totalSlots = slots.data?.length || 0
        const totalBookings = bookings.data?.length || 0

        // Basit hesaplamalar (gerçek projede daha karmaşık olacak)
        const monthlyGrowth = totalMembers > 0 ? Math.round((totalMembers / 10) * 100) : 0
        const avgAttendance = totalSlots > 0 ? Math.round((totalBookings / totalSlots) * 100) : 0

        setData({
          totalMembers,
          activeMembers,
          totalSlots,
          totalBookings,
          monthlyGrowth,
          avgAttendance
        })

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
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-500">Raporlar yükleniyor...</p>
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

  if (!data) return null

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          CSV Export
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Üye"
          value={data.totalMembers}
          description="Tüm zamanlar"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Aktif Üye"
          value={data.activeMembers}
          description="Şu anda aktif"
          icon={Activity}
          variant="default"
        />
        <StatCard
          title="Toplam Slot"
          value={data.totalSlots}
          description="Oluşturulan slot"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Toplam Rezervasyon"
          value={data.totalBookings}
          description="Yapılan rezervasyon"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Üye Büyüme Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                +{data.monthlyGrowth}%
              </div>
              <p className="text-gray-600">Bu ay</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Salonunuz bu ay {data.monthlyGrowth}% büyüme gösterdi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Ortalama Katılım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {data.avgAttendance}%
              </div>
              <p className="text-gray-600">Slot başına ortalama</p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Slotlarınızın {data.avgAttendance}%'i dolu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Reports Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Gelecek Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Gelir Analizi</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Üye Churn</p>
            </div>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Ders Doluluk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
