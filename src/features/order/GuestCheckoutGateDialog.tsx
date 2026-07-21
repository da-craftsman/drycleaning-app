import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { paths } from '@/routes/paths'

/**
 * Shown when a guest clicks "Continue to Logistics" with items in their cart. Orders need a real
 * authenticated user_id (RLS requires user_id = auth.uid()), so checkout requires login — but
 * bouncing straight to the login page with no explanation reads as a broken/dead-end flow. This
 * gives the reason and a clear path forward, and both buttons carry the checkout step as `from` so
 * LoginPage/SignupPage's existing redirect-back behavior resumes the order right after.
 */
function GuestCheckoutGateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const from = paths.checkout('logistics')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log in to continue</DialogTitle>
          <DialogDescription>
            To complete a cleaning order, you'll need to log in or create an account first. Your cart is saved, we'll
            bring you right back here afterward.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link to={paths.signup} state={{ from }}>
              Sign Up
            </Link>
          </Button>
          <Button asChild>
            <Link to={paths.login} state={{ from }}>
              Log In
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { GuestCheckoutGateDialog }
