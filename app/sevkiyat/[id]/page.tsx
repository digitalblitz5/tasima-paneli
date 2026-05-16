'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode'

export default function SevkiyatDetayPage() {
  const params = useParams()
  const id = params.id as string

  const [shipment, setShipment] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [qrCode, setQrCode] = useState('')

  const fetchData = async () => {
    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('*, carriers(full_name, phone)')
      .eq('id', id)
      .single()

    const { data: itemData } = await supabase
      .from('shipment_items')
      .select('*')
      .eq('shipment_id', id)
      .order('id', { ascending: true })

    setShipment(shipmentData)
    setItems(itemData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const makeQr = async () => {
      const qr = await QRCode.toDataURL(window.location.href)
      setQrCode(qr)
    }

    makeQr()
  }, [])

  if (!shipment) {
    return <main className="p-6">Yükleniyor...</main>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 print:bg-[#161a20]">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#161a20] p-6 shadow print:shadow-none">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sevkiyat Detayı</h1>
            <p className="text-gray-600">Makbuz: {shipment.receipt_no}</p>
          </div>

          {qrCode && <img src={qrCode} alt="QR Kod" className="h-28 w-28" />}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-100 p-4">
            <p><b>Taşıyıcı:</b> {shipment.carriers?.full_name}</p>
            <p><b>Telefon:</b> {shipment.carriers?.phone}</p>
            <p><b>Toplam:</b> {shipment.total_amount} TL</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-4">
            <p><b>Çıkış:</b> {shipment.departure_date || '-'} {shipment.departure_time || ''}</p>
            <p><b>Teslim:</b> {shipment.delivery_date || '-'} {shipment.delivery_time || ''}</p>
            <p><b>Teslim Durumu:</b> {shipment.status}</p>
            <p><b>Ödeme Durumu:</b> {shipment.payment_status}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 print:hidden">
          <a
            href={`/sevkiyat/${shipment.id}/teslim`}
            className="rounded bg-green-600 px-5 py-3 text-white"
          >
            Teslim Al
          </a>

          <a
            href={`/sevkiyat/${shipment.id}/odeme`}
            className="rounded bg-blue-600 px-5 py-3 text-white"
          >
            Ödeme Yap
          </a>

          <button
            onClick={() => window.print()}
            className="rounded bg-black px-5 py-3 text-white"
          >
            Yazdır / PDF
          </button>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Ürünler</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Ürün</th>
              <th className="p-3">Gönderilen</th>
              <th className="p-3">Teslim Alınan</th>
              <th className="p-3">Eksik</th>
              <th className="p-3">Hasarlı</th>
              <th className="p-3">Birim</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Not</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-3 font-bold">{item.product_name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.received_quantity || 0}</td>
                <td className="p-3 text-red-700 font-bold">{item.missing_quantity || 0}</td>
                <td className="p-3 text-orange-700 font-bold">{item.damaged_quantity || 0}</td>
                <td className="p-3">{item.unit}</td>
                <td className="p-3">{item.item_status}</td>
                <td className="p-3">{item.receiver_note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}