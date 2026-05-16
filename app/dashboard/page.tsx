'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function DashboardPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  const today = new Date().toISOString().split('T')[0]

  const fetchData = async () => {
    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('*, carriers(full_name, phone, is_active)')
      .order('id', { ascending: false })

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .order('id', { ascending: false })

    setShipments((shipmentData || []).filter(s => s.carriers?.is_active !== false))
    setPayments(paymentData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const todayShipments = shipments.filter(s => s.departure_date === today)
  const waitingShipments = shipments.filter(s => s.status === 'hazirlandi')
  const missingShipments = shipments.filter(s => String(s.status).includes('eksik'))
  const damagedShipments = shipments.filter(s => String(s.status).includes('hasarli'))

  const totalAmount = shipments.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const openBalance = totalAmount - totalPaid

  const todayPayments = payments
    .filter(p => String(p.created_at).startsWith(today))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const paymentWaiting = shipments.filter(s => s.payment_status !== 'odendi')

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Kontrol Paneli</h1>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Bugünkü Sevkiyat</p>
            <p className="text-3xl font-bold">{todayShipments.length}</p>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Yolda / Bekleyen</p>
            <p className="text-3xl font-bold">{waitingShipments.length}</p>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Eksik Teslim</p>
            <p className="text-3xl font-bold text-red-700">{missingShipments.length}</p>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Hasarlı Teslim</p>
            <p className="text-3xl font-bold text-orange-700">{damagedShipments.length}</p>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Açık Cari</p>
            <p className="text-3xl font-bold text-red-700">{openBalance} TL</p>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-5 shadow">
            <p>Bugünkü Ödeme</p>
            <p className="text-3xl font-bold text-green-700">{todayPayments} TL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl bg-[#161a20] p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Son Sevkiyatlar</h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Makbuz</th>
                  <th className="p-3">Taşıyıcı</th>
                  <th className="p-3">Tutar</th>
                  <th className="p-3">Durum</th>
                </tr>
              </thead>

              <tbody>
                {shipments.slice(0, 8).map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3 font-bold">
                      <a href={`/sevkiyat/${s.id}`}>{s.receipt_no}</a>
                    </td>
                    <td className="p-3">{s.carriers?.full_name}</td>
                    <td className="p-3">{s.total_amount} TL</td>
                    <td className="p-3">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl bg-[#161a20] p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Ödeme Bekleyenler</h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Makbuz</th>
                  <th className="p-3">Taşıyıcı</th>
                  <th className="p-3">Tutar</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>

              <tbody>
                {paymentWaiting.slice(0, 8).map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3 font-bold">{s.receipt_no}</td>
                    <td className="p-3">{s.carriers?.full_name}</td>
                    <td className="p-3">{s.total_amount} TL</td>
                    <td className="p-3">
                      <a
                        href={`/sevkiyat/${s.id}/odeme`}
                        className="rounded bg-blue-600 px-3 py-2 text-white"
                      >
                        Ödeme Yap
                      </a>
                    </td>
                  </tr>
                ))}

                {paymentWaiting.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      Ödeme bekleyen kayıt yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}