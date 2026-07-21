import { useState } from 'react';
import { CreditCard, Wallet, Info, TriangleAlert } from 'lucide-react';
import { SelectionCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { formatNaira } from '@/features/catalog/ItemCard';
import { verifyPaystackPayment } from '@/lib/data/orders';
import { isMixedExpress } from '@/lib/orderTiers';
import { getErrorMessage } from '@/lib/utils';
import type { Order, PaymentMethod } from '@/types/database';

const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

function PaymentStep({
  total,
  email,
  ensureOrder,
  onCashOnDelivery,
  onPaystackVerified,
  submitting,
  setSubmitting,
}: {
  total: number;
  email: string;
  ensureOrder: (method: PaymentMethod) => Promise<Order>;
  onCashOnDelivery: () => void;
  onPaystackVerified: (order: Order) => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
}) {
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const logisticsType = useCheckoutStore((s) => s.logisticsType);
  const cartItems = useCartStore((s) => s.items);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [mixedExpressAcknowledged, setMixedExpressAcknowledged] =
    useState(false);

  const hasHomeDelivery =
    logisticsType === 'delivery_only' ||
    logisticsType === 'pickup_and_delivery';
  const showMixedExpressNotice =
    hasHomeDelivery && isMixedExpress(cartItems.map((i) => i.tier));

  const handlePaystack = async () => {
    setPaystackError(null);
    setSubmitting(true);
    try {
      const order = await ensureOrder('paystack');

      if (!paystackKey) {
        // No live key configured — skip the real Paystack UI so checkout stays click-through for
        // local development. verifyPaystackPayment's mock path marks this paid directly; against a
        // real (non-mock) backend with no key configured, verification correctly fails instead of
        // faking a paid order — a real Paystack key is required to actually mark orders paid.
        const result = await verifyPaystackPayment(order.id, 'simulated');
        if (!result.verified)
          throw new Error(result.error ?? 'Payment could not be verified.');
        onPaystackVerified(order);
        return;
      }

      const { default: PaystackPop } = await import('@paystack/inline-js');
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: paystackKey,
        email,
        amount: Math.round(order.total * 100),
        metadata: { order_id: order.id, display_id: order.display_id },
        onSuccess: async (transaction) => {
          try {
            const result = await verifyPaystackPayment(
              order.id,
              transaction.reference,
            );
            if (!result.verified)
              throw new Error(result.error ?? 'Payment could not be verified.');
            onPaystackVerified(order);
          } catch (err) {
            setPaystackError(
              getErrorMessage(
                err,
                'Payment could not be verified. If you were charged, contact support with your order reference.',
              ),
            );
            setSubmitting(false);
          }
        },
        onError: (err) => {
          setPaystackError(err.message);
          setSubmitting(false);
        },
        onCancel: () => setSubmitting(false),
      });
    } catch (err) {
      setPaystackError(
        getErrorMessage(err, 'Something went wrong starting payment.'),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-stack-md'>
      <div>
        <h2 className='font-display text-headline-md text-on-surface'>
          Payment
        </h2>
        <p className='text-body-md text-on-surface-variant'>
          Total due: {formatNaira(total)}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <SelectionCard
          selected={paymentMethod === 'paystack'}
          onClick={() => setPaymentMethod('paystack')}
        >
          <div className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5 text-primary' />
            <p className='text-label-md font-bold normal-case text-on-surface'>
              Pay with Paystack
            </p>
          </div>
          <p className='mt-1 text-label-sm text-on-surface-variant'>
            Card, bank transfer, or USSD
          </p>
        </SelectionCard>
        <SelectionCard
          selected={paymentMethod === 'cash_on_delivery'}
          onClick={() => setPaymentMethod('cash_on_delivery')}
        >
          <div className='flex items-center gap-2'>
            <Wallet className='h-5 w-5 text-primary' />
            <p className='text-label-md font-bold normal-case text-on-surface'>
              Cash on Delivery
            </p>
          </div>
          <p className='mt-1 text-label-sm text-on-surface-variant'>
            Pay when your order arrives
          </p>
        </SelectionCard>
      </div>

      {paystackError && (
        <p className='text-label-md text-error'>{paystackError}</p>
      )}

      {paymentMethod === 'paystack' && !paystackKey && (
        <p className='flex items-center gap-1.5 text-label-sm text-on-surface-variant'>
          <Info className='h-3.5 w-3.5' />
          No live Paystack key configured. This will simulate a successful
          payment.
        </p>
      )}

      {showMixedExpressNotice && (
        <div className='flex flex-col gap-stack-sm rounded-lg border border-urgent-express/30 bg-urgent-express/5 p-stack-sm'>
          <div className='flex gap-2'>
            <TriangleAlert className='mt-0.5 h-4 w-4 shrink-0 text-urgent-express' />
            <p className='text-body-md text-on-surface'>
              This order contains Express item(s). Your delivery fee covers the
              priority return of Express items within 24 hours only. Any
              non-Express items will be delivered separately once they are
              ready, and the delivery fee for that trip will be paid directly to
              our rider.
            </p>
          </div>
          <div className='flex items-start gap-2 pl-6'>
            <Checkbox
              id='mixed-express-ack'
              checked={mixedExpressAcknowledged}
              onCheckedChange={(v) => setMixedExpressAcknowledged(v === true)}
              className='mt-0.5'
            />
            <Label
              htmlFor='mixed-express-ack'
              className='normal-case text-body-md text-on-surface'
            >
              I understand and agree.
            </Label>
          </div>
        </div>
      )}

      {paymentMethod && (
        <Button
          variant={paymentMethod === 'paystack' ? 'express' : 'primary'}
          size='lg'
          disabled={
            submitting || (showMixedExpressNotice && !mixedExpressAcknowledged)
          }
          onClick={
            paymentMethod === 'paystack' ? handlePaystack : onCashOnDelivery
          }
          className='w-full'
        >
          {submitting
            ? 'Placing order…'
            : paymentMethod === 'paystack'
              ? paystackKey
                ? `Pay ${formatNaira(total)}`
                : 'Simulate Payment Success'
              : 'Place Order'}
        </Button>
      )}
    </div>
  );
}

export { PaymentStep };
