import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOrderItems } from '@/lib/data/orders'
import { useCartStore } from '@/store/useCartStore'
import { paths } from '@/routes/paths'
import type { Order } from '@/types/database'

function ReorderButton({ order, variant = 'ghost' }: { order: Order; variant?: 'ghost' | 'primary' }) {
  const [loading, setLoading] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const navigate = useNavigate()

  const handleReorder = async () => {
    setLoading(true)
    try {
      const items = await getOrderItems(order.id)
      items.forEach((line) => {
        addItem({
          itemId: line.item_id,
          name: line.item_name,
          thumbnailUrl: null,
          categoryName: '',
          tier: line.service_tier,
          quantity: line.quantity,
          unitPrice: line.unit_price,
          readyIn: '',
        })
      })
      navigate(paths.order)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={handleReorder} disabled={loading}>
      <RotateCcw className="h-4 w-4" />
      {loading ? 'Adding…' : 'Reorder'}
    </Button>
  )
}

export { ReorderButton }
