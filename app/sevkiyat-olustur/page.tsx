'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Item = {
  product_name: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

export default function Home() {
  const today = new Date().toISOString().split('T')[0]
  const nowTime = new Date().toTimeString().slice(0, 5)

  const [carrierName, setCarrierName] = useState('')
  const [carrierPhone, setCarrierPhone] = useState('')
  const [senderName, setSenderName] = useState('Mahmut')
  const [departureDate, setDepartureDate] = useState(today)
  const [departureTime, setDepartureTime] = useState(nowTime)

  const [items, setItems] = useState<Item[]>([
    { product_name: '', quantity: 0, unit: 'kg', unit_price: 0, total_price: 0 },
  ])

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0)

  const updateItem = (index: number, field: keyof Item, value: string) => {
  const newItems = [...items]
  const item = { ...newItems[index] }

  if (field === 'product_name' || field === 'unit') {
    item[field] = value
  } else {
    item[field] = Number(value)
  }

  item.total_price = Number(item.quantity || 0) * Number(item.unit_price || 0)

  newItems[index] = item
  setItems(newItems)
}
    

  const addItem = () => {
    setItems([
      ...items,
      { product_name: '', quantity: 0, unit: 'kg', unit_price: 0, total_price: 0 },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const createReceiptNo = () => {
    const now = new Date()
    return `SVK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${String(now.getTime()).slice(-5)}`
  }

  const saveShipment = async () => {
    if (!carrierName) {
      alert('Taşıyıcı adı zorunlu')
      return
    }

    if (!departureDate || !departureTime) {
      alert('Çıkış tarihi ve saati zorunlu')
      return
    }

    if (items.some(item => !item.product_name || item.quantity <= 0 || item.unit_price <= 0)) {
      alert('Ürün adı, miktar ve fiyat eksiksiz olmalı')
      return
    }

    const receiptNo = createReceiptNo()

    const { data: carrier, error: carrierError } = await supabase
      .from('carriers')
      .insert({ full_name: carrierName, phone: carrierPhone })
      .select()
      .single()

    if (carrierError) {
      alert('Taşıyıcı kaydedilemedi')
      console.error(carrierError)
      return
    }

    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        receipt_no: receiptNo,
        carrier_id: carrier.id,
        origin: 'Azez',
        destination: 'Kilis',
        sender_name: senderName,
        status: 'hazirlandi',
        payment_status: 'odenmedi',
        total_amount: totalAmount,
        departure_date: departureDate,
        departure_time: departureTime,
      })
      .select()
      .single()

    if (shipmentError) {
      alert('Sevkiyat kaydedilemedi')
      console.error(shipmentError)
      return
    }

    const shipmentItems = items.map(item => ({
      shipment_id: shipment.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      total_price: item.total_price,
      received_quantity: 0,
      item_status: 'bekliyor',
    }))

    const { error: itemsError } = await supabase
      .from('shipment_items')
      .insert(shipmentItems)

    if (itemsError) {
      alert('Ürünler kaydedilemedi')
      console.error(itemsError)
      return
    }

    alert(`Sevkiyat oluşturuldu. Makbuz No: ${receiptNo}`)

    setCarrierName('')
    setCarrierPhone('')
    setItems([
      { product_name: '', quantity: 0, unit: 'kg', unit_price: 0, total_price: 0 },
    ])
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Yeni Sevkiyat Oluştur</h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="rounded border p-3" placeholder="Taşıyıcı adı" value={carrierName} onChange={e => setCarrierName(e.target.value)} />
          <input className="rounded border p-3" placeholder="Taşıyıcı telefon" value={carrierPhone} onChange={e => setCarrierPhone(e.target.value)} />
          <input className="rounded border p-3" placeholder="Teslim eden" value={senderName} onChange={e => setSenderName(e.target.value)} />
          <input className="rounded border p-3 bg-gray-100" value="Azez → Kilis" disabled />

          <div>
            <label className="mb-1 block font-medium">Çıkış Tarihi</label>
            <input type="date" className="w-full rounded border p-3" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block font-medium">Çıkış Saati</label>
            <input type="time" className="w-full rounded border p-3" value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
          </div>
        </div>

        <h2 className="mt-8 mb-4 text-xl font-semibold">Ürünler</h2>

        {items.map((item, index) => (
          <div key={index} className="mb-4 grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-6">
            <input className="rounded border p-3 md:col-span-2" placeholder="Ürün adı" value={item.product_name} onChange={e => updateItem(index, 'product_name', e.target.value)} />
            <input className="rounded border p-3" type="number" placeholder="Miktar" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
            <select className="rounded border p-3" value={item.unit} onChange={e => updateItem(index, 'unit', e.target.value)}>
              <option value="kg">kg</option>
              <option value="adet">adet</option>
              <option value="takım">takım</option>
              <option value="koli">koli</option>
            </select>
            <input className="rounded border p-3" type="number" placeholder="Birim fiyat" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} />

            <div className="flex items-center justify-between rounded bg-gray-100 p-3">
              <span>{item.total_price} TL</span>
              <button onClick={() => removeItem(index)} className="text-red-600">Sil</button>
            </div>
          </div>
        ))}

        <button onClick={addItem} className="rounded bg-gray-700 px-4 py-3 text-white">
          + Ürün Ekle
        </button>

        <div className="mt-8 rounded-xl bg-gray-100 p-5 text-right">
          <p className="text-lg">Genel Toplam</p>
          <p className="text-3xl font-bold">{totalAmount} TL</p>
        </div>

        <button onClick={saveShipment} className="mt-6 w-full rounded-xl bg-black px-6 py-4 text-lg font-bold text-white">
          Sevkiyatı Kaydet
        </button>
      </div>
    </main>
  )
}