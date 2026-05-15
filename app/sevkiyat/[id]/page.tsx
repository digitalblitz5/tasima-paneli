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

  const [paymentAmount, setPaymentAmount] = useState('')
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

    setShipment(shipmentData)
    setItems(itemData || [])
  }
const addPayment = async () => {
  const amount = Number(paymentAmount)

  if (!amount || amount <= 0) {
    alert('Ödeme tutarı gir')
    return
  }

  const { error } = await supabase.from('payments').insert({
    shipment_id: shipment.id,
    carrier_id: shipment.carrier_id,
    amount: amount,
    payment_type: 'nakit',
    note: 'Kısmi ödeme',
  })

  if (error) {
    alert('Ödeme kaydedilemedi')
    console.error(error)
    return
  }

  const paidTotalRes = await supabase
    .from('payments')
    .select('amount')
    .eq('shipment_id', shipment.id)

  const paidTotal =
    paidTotalRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  let newStatus = 'kismi_odendi'

  if (paidTotal >= Number(shipment.total_amount)) {
    newStatus = 'odendi'
  }

  await supabase
    .from('shipments')
    .update({ payment_status: newStatus })
    .eq('id', shipment.id)

  setPaymentAmount('')
  fetchData()

  alert('Ödeme kaydedildi')
}

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const makeQr = async () => {
      const url = window.location.href
      const qr = await QRCode.toDataURL(url)
      setQrCode(qr)
    }

    makeQr()
  }, [])

  if (!shipment) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 print:bg-white">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow print:shadow-none">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Taşıma Makbuzu</h1>
            <p className="text-gray-600">Azez → Kilis Sevkiyat</p>
          </div>

          {qrCode && (
            <img src={qrCode} alt="QR Kod" className="h-32 w-32" />
          )}
        </div>

        <div className="mb-6 rounded-xl bg-gray-100 p-4">
          <p><b>Makbuz No:</b> {shipment.receipt_no}</p>
          <p><b>Taşıyıcı:</b> {shipment.carriers?.full_name}</p>
          <p><b>Telefon:</b> {shipment.carriers?.phone}</p>
          <p><b>Güzergah:</b> {shipment.origin} → {shipment.destination}</p>
          <p><b>Teslim Durumu:</b> {shipment.status}</p>
          <p><b>Ödeme Durumu:</b> {shipment.payment_status}</p>
        </div>

        <h2 className="mb-4 text-xl font-semibold">Ürünler</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Ürün</th>
              <th className="p-3">Miktar</th>
              <th className="p-3">Birim</th>
              <th className="p-3">Birim Fiyat</th>
              <th className="p-3">Tutar</th>
            </tr>
          </thead>

          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.product_name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.unit}</td>
                <td className="p-3">{item.unit_price} TL</td>
                <td className="p-3 font-bold">{item.total_price} TL</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 rounded-xl bg-black p-5 text-right text-white">
<div className="mt-6 rounded-xl bg-gray-100 p-5 print:hidden">
  <h2 className="mb-4 text-xl font-bold">Ödeme Ekle</h2>

  <div className="flex gap-3">
    <input
      type="number"
      value={paymentAmount}
      onChange={(e) => setPaymentAmount(e.target.value)}
      placeholder="Ödeme tutarı"
      className="flex-1 rounded border p-3"
    />

    <button
      onClick={addPayment}
      className="rounded bg-blue-600 px-5 py-3 text-white"
    >
      Ödeme Kaydet
    </button>
  </div>
</div>
          <p>Genel Toplam</p>
          <p className="text-3xl font-bold">{shipment.total_amount} TL</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t pt-6">
          <div>
            <p className="font-bold">Teslim Eden</p>
            <p className="mt-12 border-t pt-2">İmza</p>
          </div>

          <div>
            <p className="font-bold">Teslim Alan</p>
            <p className="mt-12 border-t pt-2">İmza</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-8 w-full rounded-xl bg-black px-6 py-4 text-white print:hidden"
        >
          Makbuzu Yazdır / PDF Kaydet
        </button>
      </div>
    </main>
  )
}