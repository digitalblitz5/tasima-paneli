'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function TeslimAlPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [shipment, setShipment] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [deliveryNote, setDeliveryNote] = useState('')

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
    setItems(
      (itemData || []).map(item => ({
        ...item,
        received_quantity: item.received_quantity ?? item.quantity,
        damaged_quantity: item.damaged_quantity ?? 0,
        receiver_note: item.receiver_note ?? '',
      }))
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateLocalItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]:
        field === 'receiver_note'
          ? value
          : Number(value),
    }
    setItems(newItems)
  }

  const saveDelivery = async () => {
    let hasMissing = false
    let hasDamage = false

    for (const item of items) {
      const quantity = Number(item.quantity || 0)
      const received = Number(item.received_quantity || 0)
      const damaged = Number(item.damaged_quantity || 0)
      const missing = Math.max(quantity - received, 0)

      if (received > quantity) {
        alert(`${item.product_name} teslim alınan miktar gönderilenden fazla olamaz`)
        return
      }

      if (damaged > received) {
        alert(`${item.product_name} hasarlı miktar teslim alınandan fazla olamaz`)
        return
      }

      let itemStatus = 'teslim_alindi'

      if (missing > 0) {
        itemStatus = 'eksik'
        hasMissing = true
      }

      if (damaged > 0) {
        itemStatus = missing > 0 ? 'eksik_ve_hasarli' : 'hasarli'
        hasDamage = true
      }

      const { error } = await supabase
        .from('shipment_items')
        .update({
          received_quantity: received,
          missing_quantity: missing,
          damaged_quantity: damaged,
          item_status: itemStatus,
          receiver_note: item.receiver_note || null,
        })
        .eq('id', item.id)

      if (error) {
        alert('Ürün teslim bilgisi kaydedilemedi')
        console.error(error)
        return
      }
    }

    const now = new Date()
    const deliveryDate = now.toISOString().split('T')[0]
    const deliveryTime = now.toTimeString().split(' ')[0]

    let shipmentStatus = 'teslim_alindi'

    if (hasMissing && hasDamage) {
      shipmentStatus = 'eksik_ve_hasarli_teslim'
    } else if (hasMissing) {
      shipmentStatus = 'eksik_teslim'
    } else if (hasDamage) {
      shipmentStatus = 'hasarli_teslim'
    }

    const { error: shipmentError } = await supabase
      .from('shipments')
      .update({
        status: shipmentStatus,
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_note: deliveryNote || null,
      })
      .eq('id', id)

    if (shipmentError) {
      alert('Sevkiyat teslim durumu kaydedilemedi')
      console.error(shipmentError)
      return
    }

    alert('Teslim bilgileri kaydedildi')
    router.push(`/sevkiyat/${id}`)
  }

  if (!shipment) {
    return <main className="p-6">Yükleniyor...</main>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-3xl font-bold">Teslim Al</h1>
        <p className="mb-6 text-gray-600">
          Makbuz: <b>{shipment.receipt_no}</b> — Taşıyıcı: <b>{shipment.carriers?.full_name}</b>
        </p>

        <div className="mb-6 rounded-xl bg-yellow-100 p-4">
          Teslim aldığın gerçek miktarı yaz. Sistem eksik miktarı otomatik hesaplar.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Ürün</th>
                <th className="p-3">Gönderilen</th>
                <th className="p-3">Teslim Alınan</th>
                <th className="p-3">Eksik</th>
                <th className="p-3">Hasarlı</th>
                <th className="p-3">Birim</th>
                <th className="p-3">Not</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const quantity = Number(item.quantity || 0)
                const received = Number(item.received_quantity || 0)
                const missing = Math.max(quantity - received, 0)

                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3 font-bold">{item.product_name}</td>

                    <td className="p-3">
                      {quantity} {item.unit}
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        className="w-28 rounded border p-2"
                        value={item.received_quantity}
                        onChange={e => updateLocalItem(index, 'received_quantity', e.target.value)}
                      />
                    </td>

                    <td className="p-3 font-bold text-red-700">
                      {missing} {item.unit}
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        className="w-28 rounded border p-2"
                        value={item.damaged_quantity}
                        onChange={e => updateLocalItem(index, 'damaged_quantity', e.target.value)}
                      />
                    </td>

                    <td className="p-3">{item.unit}</td>

                    <td className="p-3">
                      <input
                        className="w-64 rounded border p-2"
                        placeholder="Eksik/hasar açıklaması"
                        value={item.receiver_note}
                        onChange={e => updateLocalItem(index, 'receiver_note', e.target.value)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <textarea
          className="mt-6 w-full rounded border p-3"
          placeholder="Genel teslim notu"
          value={deliveryNote}
          onChange={e => setDeliveryNote(e.target.value)}
        />

        <button
          onClick={saveDelivery}
          className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white"
        >
          Teslimatı Kaydet
        </button>
      </div>
    </main>
  )
}