'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TasiyicilarPage() {
  const [carriers, setCarriers] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  const fetchData = async () => {
    const { data: carrierData } = await supabase.from('carriers')
.select('*')
.eq('is_active', true).order('id', { ascending: false })
    const { data: shipmentData } = await supabase.from('shipments').select('*')
    const { data: paymentData } = await supabase.from('payments').select('*')

    setCarriers(carrierData || [])
    setShipments(shipmentData || [])
    setPayments(paymentData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const reportForCarrier = (carrierId: number) => {
    const carrierShipments = shipments.filter(s => s.carrier_id === carrierId)
    const carrierPayments = payments.filter(p => p.carrier_id === carrierId)

    const totalAmount = carrierShipments.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
    const totalPaid = carrierPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      totalJobs: carrierShipments.length,
      totalAmount,
      totalPaid,
      remaining: totalAmount - totalPaid,
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">Taşıyıcılar</h1>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Taşıyıcı</th>
              <th className="p-3">Telefon</th>
              <th className="p-3">Toplam İş</th>
              <th className="p-3">Hakediş</th>
              <th className="p-3">Ödenen</th>
              <th className="p-3">Kalan</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {carriers.map(carrier => {
              const report = reportForCarrier(carrier.id)

              return (
                <tr key={carrier.id} className="border-b">
                  <td className="p-3 font-bold">{carrier.full_name}</td>
                  <td className="p-3">{carrier.phone}</td>
                  <td className="p-3">{report.totalJobs}</td>
                  <td className="p-3">{report.totalAmount} TL</td>
                  <td className="p-3 text-green-700">{report.totalPaid} TL</td>
                  <td className="p-3 font-bold text-red-700">{report.remaining} TL</td>
                  <td className="p-3">
                    <a
                      href={`/tasiyicilar/${carrier.id}`}
                      className="rounded bg-black px-4 py-2 text-white"
                    >
                      Detay Gör
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}