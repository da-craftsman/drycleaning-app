import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckoutStepper, steps, type CheckoutStepKey } from '@/features/order/CheckoutStepper'
import { LogisticsStep } from '@/features/order/LogisticsStep'
import { DetailsStep, type DetailsFormValues } from '@/features/order/DetailsStep'
import { PaymentStep } from '@/features/order/PaymentStep'
import { useCartStore } from '@/store/useCartStore'
import { useCheckoutStore } from '@/store/useCheckoutStore'
import { useDeliveryZones } from '@/lib/queries/useDeliveryZones'
import { useSession } from '@/lib/queries/useSession'
import { useCreateOrder } from '@/lib/queries/useCreateOrder'
import { sendOrderConfirmationEmail } from '@/lib/data/orders'
import { paths } from '@/routes/paths'
import type { Order, PaymentMethod } from '@/types/database'

export default function CheckoutPage() {
  const { step } = useParams<{ step: string }>()
  const navigate = useNavigate()
  const [detailsValid, setDetailsValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const cartItems = useCartStore((s) => s.items)
  const cartTotal = useCartStore((s) => s.cartTotal())
  const clearCart = useCartStore((s) => s.clearCart)

  const logisticsType = useCheckoutStore((s) => s.logisticsType)
  const zoneId = useCheckoutStore((s) => s.zoneId)
  const details = useCheckoutStore((s) => s.details)
  const imageDataUrls = useCheckoutStore((s) => s.imageDataUrls)
  const resetCheckout = useCheckoutStore((s) => s.reset)

  const { data: zones } = useDeliveryZones()
  // Guaranteed non-null: this route is behind ProtectedRoute, which only renders once authenticated.
  const { data: session } = useSession()

  const createOrder = useCreateOrder()

  // Created once per checkout attempt and reused across Paystack retries (e.g. the user closes the
  // popup and clicks Pay again) so a single attempt never produces duplicate order rows.
  const pendingOrderRef = useRef<Order | null>(null)

  const deliveryFee = useMemo(() => {
    if (!logisticsType || logisticsType === 'self_dropoff') return 0
    const zone = zones?.find((z) => z.id === zoneId)
    if (!zone) return 0
    if (logisticsType === 'pickup_only') return zone.pickup_fee
    if (logisticsType === 'delivery_only') return zone.delivery_fee
    return zone.pickup_fee + zone.delivery_fee // pickup_and_delivery
  }, [logisticsType, zoneId, zones])

  const total = cartTotal + deliveryFee

  if (cartItems.length === 0 && step !== 'payment') {
    return <Navigate to={paths.order} replace />
  }

  if (!session) return null

  const currentStep = (steps.some((s) => s.key === step) ? step : 'logistics') as CheckoutStepKey
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  const canProceedFromLogistics = Boolean(logisticsType) && (logisticsType === 'self_dropoff' || Boolean(zoneId))

  const goToStep = (key: CheckoutStepKey) => navigate(paths.checkout(key))
  const goBack = () => {
    if (currentIndex === 0) navigate(paths.order)
    else goToStep(steps[currentIndex - 1].key)
  }

  const handleDetailsValidChange = (valid: boolean, values: DetailsFormValues) => {
    setDetailsValid(valid)
    void values
  }

  const ensureOrder = async (paymentMethod: PaymentMethod): Promise<Order> => {
    if (pendingOrderRef.current) return pendingOrderRef.current
    const order = await createOrder.mutateAsync({
      userId: session.id,
      items: cartItems,
      logisticsType: logisticsType!,
      zoneId: logisticsType === 'self_dropoff' ? null : zoneId,
      deliveryFee,
      details,
      imageDataUrls,
      paymentMethod,
    })
    pendingOrderRef.current = order
    return order
  }

  const finishOrder = (order: Order) => {
    clearCart()
    resetCheckout()
    navigate(paths.confirmation(order.display_id))
    // Best-effort: the order is already placed at this point, so a mailer hiccup shouldn't affect
    // checkout — it's just a confirmation email, not something to block or retry on the customer's behalf.
    sendOrderConfirmationEmail(order.id).catch((err) => console.error('Failed to send order confirmation email', err))
  }

  const handleCashOnDelivery = async () => {
    setSubmitting(true)
    try {
      finishOrder(await ensureOrder('cash_on_delivery'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <button
        type="button"
        onClick={goBack}
        className="mb-stack-md flex items-center gap-1 text-label-md text-on-surface-variant hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-stack-lg">
        <CheckoutStepper current={currentStep} />
      </div>

      {currentStep === 'logistics' && (
        <div className="flex flex-col gap-stack-lg">
          <LogisticsStep />
          <Button size="lg" disabled={!canProceedFromLogistics} onClick={() => goToStep('details')}>
            Continue to Details
          </Button>
        </div>
      )}

      {currentStep === 'details' && (
        <div className="flex flex-col gap-stack-lg">
          <DetailsStep onValidChange={handleDetailsValidChange} />
          <Button size="lg" disabled={!detailsValid} onClick={() => goToStep('payment')}>
            Continue to Payment
          </Button>
        </div>
      )}

      {currentStep === 'payment' && (
        <PaymentStep
          total={total}
          email={session.email}
          ensureOrder={ensureOrder}
          onCashOnDelivery={handleCashOnDelivery}
          onPaystackVerified={finishOrder}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}
    </div>
  )
}
