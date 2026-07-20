import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/navigation/Header'
import { Footer } from '@/components/navigation/Footer'
import { BottomNav } from '@/components/navigation/BottomNav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

const NO_FOOTER_PREFIXES = ['/order', '/account']

// Pages with a full-bleed hero image at the top: the hero should fill in behind the fixed,
// transparent header instead of leaving a page-background gap above it.
const FULL_BLEED_HERO_PATHS = ['/', '/about']

/** Public + customer shell: header, routed content, mobile bottom nav, marketing footer. */
function AppLayout() {
  const location = useLocation()
  const showFooter = !NO_FOOTER_PREFIXES.some((p) => location.pathname.startsWith(p))
  const isFullBleedHero = FULL_BLEED_HERO_PATHS.includes(location.pathname)

  return (
    <TooltipProvider>
      <div className="flex min-h-svh w-full min-w-0 flex-col">
        <Header />
        <main className={cn('w-full min-w-0 flex-1 pb-20 md:pb-0', !isFullBleedHero && 'pt-18 md:pt-19')}>
          <Outlet />
        </main>
        {showFooter && <Footer />}
        <BottomNav />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export { AppLayout }
