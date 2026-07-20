import logoColoured from '@/assets/brand/logo-coloured.png'
import logoWhite from '@/assets/brand/logo-white.png'
import favicon from '@/assets/brand/favicon.png'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Use on primary/dark-colored backgrounds where the coloured wordmark would lose contrast. */
  inverted?: boolean
}

/** Full wordmark lockup. Use on light surfaces by default; pass `inverted` on colored/dark section backgrounds. */
function Logo({ className, inverted = false }: LogoProps) {
  return (
    <img
      src={inverted ? logoWhite : logoColoured}
      alt="Shalah Rex Laundry"
      className={cn('h-8 w-auto object-contain', className)}
    />
  )
}

/** Basket mark only, no wordmark — for tight spaces (PWA splash, compact nav). */
function LogoMark({ className }: { className?: string }) {
  return <img src={favicon} alt="Shalah Rex Laundry" className={cn('h-8 w-8 object-contain', className)} />
}

export { Logo, LogoMark }
