'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type CarrierReport = {
  carrier_id: number
  full_name: string
  phone: string
  is_active: boolean
  total_shipments: number
  total_amount: number
  total_paid: number
  remaining: number
}

export default function CariPage() {
  const [reports, setReports] = useState<CarrierReport[]>([])
  const [showPassive, setShowPassive] = useState(false)

  const fetchReports = async () => {
    const { data: carriers } = await supabase
      .from('carriers')
      .select('*')
      .order('id', { ascending: false })

    const { data: shipments } = await supabase
      .from('shipments')
      .select('*')

    const { data: payments } = await supabase
      .from('payments')
      .select('*')

    const result: CarrierReport[] = []

    for (const carrier of carriers || []) {
      if (!showPassive && carrier.is_active === false) continue

      const carrierShipments =
        shipments?.filter(s => s.carrier_id === carrier.id) || []

      const totalAmount = carrierShipments.reduce(
        (sum, s) => sum + Number(s.total_amount || 0),
        0
      )

      const carrierPayments =
        payments?.filter(p => p.carrier_id === carrier.id) || []

      const totalPaid = carrierPayments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      )

      result.push({
        carrier_id: carrier.id,
        full_name: carrier.full_name,
        phone: carrier.phone,
        is_active: carrier.is_active !== false,
        total_shipments: carrierShipments.length,
        total_amount: totalAmount,
        total_paid: totalPaid,
        remaining: totalAmount - totalPaid,
      })
    }

    setReports(result)
  }

  useEffect(() => {
    fetchReports()
  }, [showPassive])

  const setCarrierActive = async (carrierId: number, isActive: boolean) => {
    await supabase
      .from('carriers')
      .update({ is_active: isActive })
      .eq('id', carrierId)

    fetchReports()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-[#161a20] p-6 shadow">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Taşıyıcı Cari Hesapları</h1>

          <button
            onClick={() => setShowPassive(!showPassive)}
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            {showPassive ? 'Pasifleri Gizle' : 'Pasifleri Göster'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Taşıyıcı</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Durum</th>
                <th className="p-3">Toplam İş</th>
                <th className="p-3">Hakediş</th>
                <th className="p-3">Ödenen</th>
                <th className="p-3">Kalan</th>
                <th className="p-3">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {reports.map(report => (
                <tr key={report.carrier_id} className="border-b">
                  <td className="p-3 font-bold">{report.full_name}</td>
                  <td className="p-3">{report.phone || '-'}</td>
                  <td className="p-3">
                    {report.is_active ? (
                      <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-3 py-1 text-red-700">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="p-3">{report.total_shipments}</td>
                  <td className="p-3">{report.total_amount} TL</td>
                  <td className="p-3 text-green-700">{report.total_paid} TL</td>
                  <td className="p-3 font-bold text-red-700">
                    {report.remaining} TL
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/tasiyicilar/${report.carrier_id}`}
                        className="rounded bg-black px-3 py-2 text-white"
                      >
                        Detay Gör
                      </a>

                      {report.is_active ? (
                        <button
                          onClick={() => setCarrierActive(report.carrier_id, false)}
                          className="rounded bg-red-600 px-3 py-2 text-white"
                        >
                          Pasife Al
                        </button>
                      ) : (
                        <button
                          onClick={() => setCarrierActive(report.carrier_id, true)}
                          className="rounded bg-green-600 px-3 py-2 text-white"
                        >
                          Aktif Et
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}