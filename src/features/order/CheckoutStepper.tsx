import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { key: 'logistics', label: 'Logistics' },
  { key: 'details', label: 'Details' },
  { key: 'payment', label: 'Payment' },
] as const

export type CheckoutStepKey = (typeof steps)[number]['key']

function CheckoutStepper({ current }: { current: CheckoutStepKey }) {
  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming'
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold',
                state === 'done' && 'bg-success-green text-white',
                state === 'active' && 'bg-primary text-on-primary ring-4 ring-primary/20',
                state === 'upcoming' && 'bg-surface-container-high text-on-surface-variant',
              )}
            >
              {state === 'done' ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'hidden text-label-md sm:inline',
                state === 'upcoming' ? 'text-on-surface-variant' : 'text-on-surface',
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && <div className={cn('h-px flex-1', state === 'done' ? 'bg-success-green' : 'bg-outline-variant')} />}
          </li>
        )
      })}
    </ol>
  )
}

export { CheckoutStepper, steps }
