'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Shipment = {
  id: number
  receipt_no: string
  total_amount: number
  status: string
  payment_status: string
  carriers: {
    full_name: string
    phone: string
  }
}

export default function TeslimatlarPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])

  const fetchShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*, carriers(full_name, phone)')
      .order('id', { ascending: false })

    if (!error) setShipments(data || [])
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  const markDelivered = async (id: number) => {
    await supabase.from('shipments').update({ status: 'teslim_alindi' }).eq('id', id)
    fetchShipments()
  }

  const markPaid = async (id: number) => {
    await supabase.from('shipments').update({ payment_status: 'odendi' }).eq('id', id)
    fetchShipments()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">Kilis Teslim Paneli</h1>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Makbuz</th>
              <th className="p-3">Taşıyıcı</th>
              <th className="p-3">Telefon</th>
              <th className="p-3">Toplam</th>
              <th className="p-3">Teslim</th>
              <th className="p-3">Ödeme</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border-b">
                <td className="p-3 font-bold">{shipment.receipt_no}</td>
                <td className="p-3">{shipment.carriers?.full_name}</td>
                <td className="p-3">{shipment.carriers?.phone}</td>
                <td className="p-3">{shipment.total_amount} TL</td>
                <td className="p-3">{shipment.status}</td>
                <td className="p-3">{shipment.payment_status}</td>

                <td className="p-3 flex gap-2">
                  <a
                    href={`/sevkiyat/${shipment.id}`}
                    className="rounded bg-gray-800 px-3 py-2 text-white"
                  >
                    Detay Gör
                  </a>

                  <button
                    onClick={() => markDelivered(shipment.id)}
                    className="rounded bg-green-600 px-3 py-2 text-white"
                  >
                    Teslim Alındı
                  </button>

                  <button
                    onClick={() => markPaid(shipment.id)}
                    className="rounded bg-blue-600 px-3 py-2 text-white"
                  >
                    Ödeme Yapıldı
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}