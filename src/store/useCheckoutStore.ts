import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LogisticsType, PaymentMethod } from '@/types/database'
import type { CheckoutDetails } from '@/types/domain'

const emptyDetails: CheckoutDetails = { address: '', phone: '', whatsapp: '', specialInstructions: '' }

interface CheckoutStoreState {
  logisticsType: LogisticsType | null
  zoneId: string | null
  details: CheckoutDetails
  imageDataUrls: string[]
  paymentMethod: PaymentMethod | null

  setLogistics: (logisticsType: LogisticsType, zoneId: string | null) => void
  setDetails: (details: Partial<CheckoutDetails>) => void
  addImage: (dataUrl: string) => void
  removeImage: (dataUrl: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  reset: () => void
}

/** Multi-step checkout wizard state — decoupled from the cart store so cart and checkout-flow concerns don't tangle. */
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set) => ({
      logisticsType: null,
      zoneId: null,
      details: emptyDetails,
      imageDataUrls: [],
      paymentMethod: null,

      setLogistics: (logisticsType, zoneId) => set({ logisticsType, zoneId }),
      setDetails: (details) => set((state) => ({ details: { ...state.details, ...details } })),
      addImage: (dataUrl) => set((state) => ({ imageDataUrls: [...state.imageDataUrls, dataUrl] })),
      removeImage: (dataUrl) => set((state) => ({ imageDataUrls: state.imageDataUrls.filter((u) => u !== dataUrl) })),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      reset: () => set({ logisticsType: null, zoneId: null, details: emptyDetails, imageDataUrls: [], paymentMethod: null }),
    }),
    { name: 'srl-checkout' },
  ),
)
