import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNaira } from '@/features/catalog/ItemCard'
import { business } from '@/lib/constants'
import type { Order, OrderItem } from '@/types/database'

async function downloadReceipt(order: Order, items: OrderItem[]) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(business.name, 14, 20)
  doc.setFontSize(11)
  doc.text('Invoice / Receipt', 14, 28)

  doc.setFontSize(10)
  doc.text(`Order: ${order.display_id}`, 14, 40)
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-NG')}`, 14, 46)
  doc.text(`Payment: ${order.payment_method === 'paystack' ? 'Paystack' : 'Cash on Delivery'} (${order.payment_status})`, 14, 52)
  doc.text(`Delivery address: ${order.address}`, 14, 58)

  let y = 72
  doc.setFontSize(11)
  doc.text('Item', 14, y)
  doc.text('Tier', 100, y)
  doc.text('Qty', 140, y)
  doc.text('Total', 170, y)
  y += 4
  doc.line(14, y, 196, y)
  y += 6

  doc.setFontSize(10)
  items.forEach((line) => {
    doc.text(line.item_name, 14, y)
    doc.text(line.service_tier, 100, y)
    doc.text(String(line.quantity), 140, y)
    doc.text(formatNaira(line.line_total), 170, y)
    y += 7
  })

  y += 3
  doc.line(14, y, 196, y)
  y += 8
  doc.text(`Subtotal: ${formatNaira(order.subtotal)}`, 140, y)
  y += 6
  doc.text(`Delivery fee: ${formatNaira(order.delivery_fee)}`, 140, y)
  y += 6
  doc.setFontSize(12)
  doc.text(`Total: ${formatNaira(order.total)}`, 140, y)

  doc.save(`${order.display_id}-receipt.pdf`)
}

function ReceiptDownload({ order, items }: { order: Order; items: OrderItem[] }) {
  return (
    <Button variant="outline" size="sm" onClick={() => downloadReceipt(order, items)}>
      <Download className="h-4 w-4" />
      Download Receipt
    </Button>
  )
}

export { ReceiptDownload }
