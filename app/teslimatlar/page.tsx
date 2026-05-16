'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Shipment = {
  id: number
  receipt_no: string
  total_amount: number
  status: string
  payment_status: string
  departure_date: string
  departure_time: string
  delivery_date: string
  delivery_time: string
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

    if (error) {
      console.error(error)
      return
    }

    setShipments(data || [])
  }

  useEffect(() => {
    fetchShipments()
  }, [])

  const markDelivered = async (id: number) => {
    const now = new Date()
    const deliveryDate = now.toISOString().split('T')[0]
    const deliveryTime = now.toTimeString().split(' ')[0]

    await supabase
      .from('shipments')
      .update({
        status: 'teslim_alindi',
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
      })
      .eq('id', id)

    fetchShipments()
  }

  const markPaid = async (id: number) => {
    await supabase
      .from('shipments')
      .update({
        payment_status: 'odendi',
      })
      .eq('id', id)

    fetchShipments()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">Kilis Teslim Paneli</h1>

        <div className="mb-4 rounded-xl bg-yellow-100 p-4 text-sm">
          Bu ekrandan sevkiyat detayını görebilir, teslim alabilir ve ödeme durumunu güncelleyebilirsin.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Makbuz</th>
                <th className="p-3">Taşıyıcı</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Toplam</th>
                <th className="p-3">Çıkış</th>
                <th className="p-3">Teslim</th>
                <th className="p-3">Teslim Durumu</th>
                <th className="p-3">Ödeme Durumu</th>
                <th className="p-3">İşlemler</th>
              </tr>
            </thead>

            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b">
                  <td className="p-3 font-bold">{shipment.receipt_no}</td>
                  <td className="p-3">{shipment.carriers?.full_name}</td>
                  <td className="p-3">{shipment.carriers?.phone}</td>
                  <td className="p-3 font-semibold">{shipment.total_amount} TL</td>

                  <td className="p-3">
                    {shipment.departure_date || '-'}<br />
                    <span className="text-sm text-gray-600">
                      {shipment.departure_time || ''}
                    </span>
                  </td>

                  <td className="p-3">
                    {shipment.delivery_date || '-'}<br />
                    <span className="text-sm text-gray-600">
                      {shipment.delivery_time || ''}
                    </span>
                  </td>

                  <td className="p-3">{shipment.status}</td>
                  <td className="p-3">{shipment.payment_status}</td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
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
                        Teslim Al
                      </button>

                      <button
                        onClick={() => markPaid(shipment.id)}
                        className="rounded bg-blue-600 px-3 py-2 text-white"
                      >
                        Ödeme Yapıldı
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {shipments.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={9}>
                    Henüz sevkiyat yok.
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