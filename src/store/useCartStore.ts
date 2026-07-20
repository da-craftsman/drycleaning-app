import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ServiceTier } from '@/types/database'
import type { CartItem } from '@/types/domain'

interface AddItemInput {
  itemId: string
  name: string
  thumbnailUrl: string | null
  categoryName: string
  tier: ServiceTier
  quantity: number
  unitPrice: number
  readyIn: string
}

interface CartState {
  items: CartItem[]
  addItem: (input: AddItemInput) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateTier: (cartItemId: string, tier: ServiceTier, unitPrice: number, readyIn: string) => void
  clearCart: () => void
  cartTotal: () => number
  itemCount: () => number
}

function cartItemId(itemId: string, tier: ServiceTier) {
  return `${itemId}::${tier}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) =>
        set((state) => {
          const key = cartItemId(input.itemId, input.tier)
          const existing = state.items.find((i) => i.cartItemId === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartItemId === key ? { ...i, quantity: i.quantity + input.quantity } : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                cartItemId: key,
                itemId: input.itemId,
                name: input.name,
                thumbnailUrl: input.thumbnailUrl,
                categoryName: input.categoryName,
                tier: input.tier,
                quantity: input.quantity,
                unitPrice: input.unitPrice,
                readyIn: input.readyIn,
              },
            ],
          }
        }),

      removeItem: (cartItemId) => set((state) => ({ items: state.items.filter((i) => i.cartItemId !== cartItemId) })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.cartItemId !== cartItemId)
              : state.items.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i)),
        })),

      updateTier: (oldCartItemId, tier, unitPrice, readyIn) =>
        set((state) => {
          const existing = state.items.find((i) => i.cartItemId === oldCartItemId)
          if (!existing) return state
          const newKey = cartItemId(existing.itemId, tier)
          const collidesWith = state.items.find((i) => i.cartItemId === newKey && i.cartItemId !== oldCartItemId)

          if (collidesWith) {
            return {
              items: state.items
                .filter((i) => i.cartItemId !== oldCartItemId)
                .map((i) => (i.cartItemId === newKey ? { ...i, quantity: i.quantity + existing.quantity } : i)),
            }
          }

          return {
            items: state.items.map((i) =>
              i.cartItemId === oldCartItemId ? { ...i, cartItemId: newKey, tier, unitPrice, readyIn } : i,
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      cartTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'srl-cart' },
  ),
)
