import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DialogOverlay, DialogContent } from '@/components/ui/dialog'
import { useIsDesktop } from '@/hooks/use-media-query'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

/** Slide-up sheet — the mobile counterpart to Dialog, anchored to the bottom of the viewport. */
function SheetContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[88svh] overflow-y-auto rounded-t-xl border-t border-outline-variant/40 bg-surface-container-lowest p-stack-lg shadow-soft-lift data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-300',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-stack-md h-1.5 w-10 rounded-full bg-outline-variant" aria-hidden />
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 mb-stack-md', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-headline-md text-on-surface', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-body-md text-on-surface-variant', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-stack-lg flex flex-col gap-2', className)} {...props} />
}

/**
 * Responsive wrapper: renders a Sheet (slide-up) below `md`, a Dialog (centered modal) at `md` and up.
 * Used for item-selection and other flows the spec calls out as "modals over pages".
 *
 * Only one Radix Dialog Root is ever mounted — both primitives portal to `document.body`,
 * so mounting both and hiding one with CSS would still show two overlays at once.
 * `content` is the inner Title/Description/body/footer JSX (not pre-wrapped in *Content).
 */
function ResponsiveDialog({
  open,
  onOpenChange,
  content,
  contentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: React.ReactNode
  contentClassName?: string
}) {
  const isDesktop = useIsDesktop()

  if (isDesktop) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogContent className={contentClassName}>{content}</DialogContent>
      </DialogPrimitive.Root>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={contentClassName}>{content}</SheetContent>
    </Sheet>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  ResponsiveDialog,
}
