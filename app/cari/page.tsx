'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type CarrierReport = {
  carrier_id: number
  full_name: string
  total_shipments: number
  total_amount: number
  total_paid: number
  remaining: number
}

export default function CariPage() {
  const [reports, setReports] = useState<CarrierReport[]>([])

  const fetchReports = async () => {
    const { data: carriers } = await supabase
      .from('carriers')
      .select('*')

    const { data: shipments } = await supabase
      .from('shipments')
      .select('*')

    const { data: payments } = await supabase
      .from('payments')
      .select('*')

    const result: CarrierReport[] = []

    for (const carrier of carriers || []) {
      const carrierShipments =
        shipments?.filter(
          s => s.carrier_id === carrier.id
        ) || []

      const totalAmount = carrierShipments.reduce(
        (sum, s) => sum + Number(s.total_amount),
        0
      )

      const carrierPayments =
        payments?.filter(
          p => p.carrier_id === carrier.id
        ) || []

      const totalPaid = carrierPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      )

      result.push({
        carrier_id: carrier.id,
        full_name: carrier.full_name,
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
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          Taşıyıcı Cari Hesapları
        </h1>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Taşıyıcı</th>
              <th className="p-3">Toplam İş</th>
              <th className="p-3">Hakediş</th>
              <th className="p-3">Ödenen</th>
              <th className="p-3">Kalan</th>
            </tr>
          </thead>

          <tbody>
            {reports.map(report => (
              <tr key={report.carrier_id} className="border-b">
                <td className="p-3 font-bold">
                  {report.full_name}
                </td>

                <td className="p-3">
                  {report.total_shipments}
                </td>

                <td className="p-3">
                  {report.total_amount} TL
                </td>

                <td className="p-3 text-green-700">
                  {report.total_paid} TL
                </td>

                <td className="p-3 text-red-700 font-bold">
                  {report.remaining} TL
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}