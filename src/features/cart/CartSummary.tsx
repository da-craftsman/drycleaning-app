import { ShoppingBasket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CartLineItem } from '@/features/cart/CartLineItem'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useCartStore } from '@/store/useCartStore'

function CartSummary({ onProceed }: { onProceed: () => void }) {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.cartTotal())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-stack-sm">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-stack-lg text-center">
            <ShoppingBasket className="h-8 w-8 text-outline" strokeWidth={1.5} />
            <p className="text-body-md text-on-surface-variant">Your cart is empty. Add items from the catalog to get started.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {items.map((line) => (
                <CartLineItem key={line.cartItemId} line={line} />
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/40 pt-stack-sm">
              <span className="text-body-md text-on-surface-variant">Subtotal</span>
              <span className="text-body-lg font-bold text-on-surface">{formatNaira(subtotal)}</span>
            </div>
            <Button size="lg" onClick={onProceed} className="w-full">
              Continue to Logistics
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { CartSummary }
