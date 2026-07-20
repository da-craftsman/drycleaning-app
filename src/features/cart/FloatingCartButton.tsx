import { useState } from 'react'
import { ShoppingBasket } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CartSummary } from '@/features/cart/CartSummary'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useCartStore } from '@/store/useCartStore'

/** Mobile-only floating "View Cart" pill — opens a bottom sheet with the full cart. Hidden on `lg` and up (SplitView takes over). */
function FloatingCartButton({ onProceed }: { onProceed: () => void }) {
  const [open, setOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const subtotal = useCartStore((s) => s.cartTotal())

  if (itemCount === 0) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-margin-mobile lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full max-w-sm items-center justify-between rounded-full bg-primary px-5 py-3 text-on-primary shadow-soft-lift"
        >
          <span className="flex items-center gap-2 text-label-md font-bold">
            <ShoppingBasket className="h-5 w-5" />
            View Cart ({itemCount})
          </span>
          <span className="text-label-md font-bold">{formatNaira(subtotal)}</span>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetTitle className="sr-only">Your Cart</SheetTitle>
          <CartSummary
            onProceed={() => {
              setOpen(false)
              onProceed()
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

export { FloatingCartButton }
