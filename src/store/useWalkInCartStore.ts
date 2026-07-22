import { createCartStore } from '@/store/useCartStore'

/** Separate cart for the admin "New Walk-in Order" flow — same shape as the customer-facing cart,
 * but persisted under its own key so it never collides with an admin's own personal cart. */
export const useWalkInCartStore = createCartStore('srl-walkin-cart')
