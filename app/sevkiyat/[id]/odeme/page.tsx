'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function OdemePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [shipment, setShipment] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('nakit')
  const [note, setNote] = useState('')

  const fetchData = async () => {
    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('*, carriers(full_name, phone)')
      .eq('id', id)
      .single()

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('shipment_id', id)
      .order('id', { ascending: false })

    setShipment(shipmentData)
    setPayments(paymentData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const remaining = shipment ? Number(shipment.total_amount || 0) - totalPaid : 0

  const savePayment = async () => {
    const paymentAmount = Number(amount)

    if (!paymentAmount || paymentAmount === 0) {
  alert('Ödeme veya düzeltme tutarı gir')
  return
}

    

    const { error } = await supabase.from('payments').insert({
      shipment_id: shipment.id,
      carrier_id: shipment.carrier_id,
      amount: paymentAmount,
      payment_type: paymentType,
      note: note || null,
    })

    if (error) {
      alert('Ödeme kaydedilemedi')
      console.error(error)
      return
    }

    const newPaid = totalPaid + paymentAmount
    const newStatus =
      newPaid >= Number(shipment.total_amount)
        ? 'odendi'
        : 'kismi_odendi'

    await supabase
      .from('shipments')
      .update({
        payment_status: newStatus,
      })
      .eq('id', shipment.id)

    alert('Ödeme kaydedildi')
    router.push(`/sevkiyat/${id}`)
  }

  if (!shipment) {
    return <main className="p-6">Yükleniyor...</main>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-3xl font-bold">Ödeme Yap</h1>
        <p className="mb-6 text-gray-600">
          Makbuz: <b>{shipment.receipt_no}</b> — Taşıyıcı: <b>{shipment.carriers?.full_name}</b>
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-gray-100 p-5">
            <p>Toplam Hakediş</p>
            <p className="text-2xl font-bold">{shipment.total_amount} TL</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <p>Ödenen</p>
            <p className="text-2xl font-bold text-green-700">{totalPaid} TL</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <p>Kalan</p>
            <p className="text-2xl font-bold text-red-700">{remaining} TL</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border p-5">
          <h2 className="mb-4 text-xl font-bold">Yeni Ödeme</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="number"
              className="rounded border p-3"
              placeholder="Ödeme tutarı / düzeltme için eksi gir"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            <select
              className="rounded border p-3"
              value={paymentType}
              onChange={e => setPaymentType(e.target.value)}
            >
              <option value="nakit">Nakit</option>
              <option value="havale">Havale</option>
              <option value="cari">Cari</option>
<option value="duzeltme">Düzeltme</option>
            </select>

            <input
              className="rounded border p-3"
              placeholder="Açıklama / Not"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button
            onClick={savePayment}
            className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-4 text-white"
          >
            Ödemeyi Kaydet
          </button>
        </div>

        <h2 className="mb-4 text-xl font-bold">Bu Sevkiyatın Ödeme Geçmişi</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Tarih</th>
              <th className="p-3">Tutar</th>
              <th className="p-3">Tip</th>
              <th className="p-3">Not</th>
            </tr>
          </thead>

          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-b">
                <td className="p-3">{payment.created_at}</td>
                <td className="p-3 font-bold">{payment.amount} TL</td>
                <td className="p-3">{payment.payment_type}</td>
                <td className="p-3">{payment.note || '-'}</td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Henüz ödeme yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}