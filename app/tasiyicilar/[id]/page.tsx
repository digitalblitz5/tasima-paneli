'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'

export default function TasiyiciDetayPage() {
  const params = useParams()
  const id = params.id as string

  const [carrier, setCarrier] = useState<any>(null)
  const [shipments, setShipments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  const fetchData = async () => {
    const { data: carrierData } = await supabase
      .from('carriers')
      .select('*')
      .eq('id', id)
      .single()

    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('*')
      .eq('carrier_id', id)
      .order('departure_date', { ascending: false })

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('carrier_id', id)
      .order('created_at', { ascending: false })

    setCarrier(carrierData)
    setShipments(shipmentData || [])
    setPayments(paymentData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!carrier) {
    return <main className="p-6">Yükleniyor...</main>
  }

  const paidForShipment = (shipmentId: number) => {
    return payments
      .filter(p => Number(p.shipment_id) === Number(shipmentId))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  }

  const totalAmount = shipments.reduce(
    (sum, s) => sum + Number(s.total_amount || 0),
    0
  )

  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )

  const remaining = totalAmount - totalPaid

  const openShipments = shipments.filter(s => {
    const paid = paidForShipment(s.id)
    return paid < Number(s.total_amount || 0) || s.status !== 'teslim_alindi'
  })

  const closedShipments = shipments.filter(s => {
    const paid = paidForShipment(s.id)
    return paid >= Number(s.total_amount || 0) && s.status === 'teslim_alindi'
  })

  const renderShipmentTable = (list: any[]) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Tarih</th>
            <th className="p-3">Makbuz</th>
            <th className="p-3">Toplam</th>
            <th className="p-3">Ödenen</th>
            <th className="p-3">Kalan</th>
            <th className="p-3">Teslim</th>
            <th className="p-3">Ödeme</th>
            <th className="p-3">İşlem</th>
          </tr>
        </thead>

        <tbody>
          {list.map(shipment => {
            const paid = paidForShipment(shipment.id)
            const kalan = Number(shipment.total_amount || 0) - paid

            return (
              <tr key={shipment.id} className="border-b">
                <td className="p-3">
                  {shipment.departure_date || '-'}<br />
                  <span className="text-sm text-gray-600">
                    {shipment.departure_time || ''}
                  </span>
                </td>

                <td className="p-3 font-bold">{shipment.receipt_no}</td>
                <td className="p-3">{shipment.total_amount} TL</td>
                <td className="p-3 text-green-700">{paid} TL</td>
                <td className="p-3 font-bold text-red-700">{kalan} TL</td>
                <td className="p-3">{shipment.status}</td>
                <td className="p-3">{shipment.payment_status}</td>

                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/sevkiyat/${shipment.id}`}
                      className="rounded bg-black px-3 py-2 text-white"
                    >
                      Detay
                    </a>

                    <a
                      href={`/sevkiyat/${shipment.id}/teslim`}
                      className="rounded bg-green-600 px-3 py-2 text-white"
                    >
                      Teslim
                    </a>

                    <a
                      href={`/sevkiyat/${shipment.id}/odeme`}
                      className="rounded bg-blue-600 px-3 py-2 text-white"
                    >
                      Ödeme
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}

          {list.length === 0 && (
            <tr>
              <td colSpan={8} className="p-6 text-center text-gray-500">
                Kayıt yok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-[#161a20] p-6 shadow">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{carrier.full_name}</h1>
            <p className="text-gray-600">{carrier.phone || '-'}</p>
          </div>

          <a
            href="/tasiyicilar"
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Taşıyıcılara Dön
          </a>
<button
  onClick={async () => {
    const confirmDelete = confirm(
      'Taşıyıcı pasife alınsın mı?'
    )

    if (!confirmDelete) return

    await supabase
      .from('carriers')
      .update({
        is_active: false,
      })
      .eq('id', carrier.id)

    alert('Taşıyıcı pasife alındı')
    window.location.href = '/tasiyicilar'
  }}
  className="rounded bg-red-600 px-4 py-2 text-white"
>
  Taşıyıcıyı Pasife Al
</button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-gray-100 p-5">
            <p>Toplam Sevkiyat</p>
            <p className="text-2xl font-bold">{shipments.length}</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <p>Toplam Hakediş</p>
            <p className="text-2xl font-bold">{totalAmount} TL</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <p>Toplam Ödenen</p>
            <p className="text-2xl font-bold text-green-700">{totalPaid} TL</p>
          </div>

          <div className="rounded-xl bg-gray-100 p-5">
            <p>Genel Kalan Cari</p>
            <p className="text-2xl font-bold text-red-700">{remaining} TL</p>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Açık Sevkiyatlar</h2>
        {renderShipmentTable(openShipments)}

        <h2 className="mb-4 mt-10 text-2xl font-bold">Kapanmış Sevkiyatlar</h2>
        {renderShipmentTable(closedShipments)}

        <h2 className="mb-4 mt-10 text-2xl font-bold">Ödeme Geçmişi</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Tarih</th>
                <th className="p-3">Sevkiyat</th>
                <th className="p-3">Tutar</th>
                <th className="p-3">Tip</th>
                <th className="p-3">Not</th>
              </tr>
            </thead>

            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="border-b">
                  <td className="p-3">{payment.created_at}</td>
                  <td className="p-3">{payment.shipment_id}</td>
                  <td className="p-3 font-bold">{payment.amount} TL</td>
                  <td className="p-3">{payment.payment_type}</td>
                  <td className="p-3">{payment.note || '-'}</td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Ödeme kaydı yok.
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