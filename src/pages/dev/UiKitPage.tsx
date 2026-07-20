import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, SelectionCard } from '@/components/ui/card'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { ResponsiveDialog } from '@/components/ui/sheet'
import { useToast } from '@/hooks/use-toast'
import { Logo, LogoMark } from '@/components/brand/Logo'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-stack-md">
      <h2 className="text-headline-md font-display text-laundry-blue-deep">{title}</h2>
      {children}
    </section>
  )
}

export default function UiKitPage() {
  const [tier, setTier] = useState<'regular' | 'white' | 'express'>('regular')
  const [respOpen, setRespOpen] = useState(false)
  const { toast } = useToast()

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full min-w-0 max-w-shell flex-col gap-stack-lg p-stack-lg">
        <h1 className="text-display-lg font-display text-laundry-blue-deep">UI Kit — Pristine Efficiency</h1>

        <Section title="Brand">
          <div className="flex flex-wrap items-center gap-stack-md">
            <Logo />
            <LogoMark />
            <div className="rounded bg-primary p-stack-md">
              <Logo inverted />
            </div>
          </div>
        </Section>

        <Section title="Typography">
          <div className="flex flex-col gap-2">
            <p className="text-display-lg font-display">Display Large</p>
            <p className="text-headline-lg font-display">Headline Large</p>
            <p className="text-headline-lg-mobile font-display md:hidden">Headline Large (mobile)</p>
            <p className="text-headline-md font-display">Headline Medium</p>
            <p className="text-body-lg">Body Large — Hanken Grotesk for dense lists of 80+ items.</p>
            <p className="text-body-md">Body Medium — the workhorse copy size.</p>
            <p className="text-label-md font-semibold uppercase">Label Medium</p>
            <p className="text-label-sm font-bold uppercase">Label Small</p>
          </div>
        </Section>

        <Section title="Colors">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-primary" />
              <span className="text-label-sm text-on-surface-variant">primary</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-primary-container" />
              <span className="text-label-sm text-on-surface-variant">primary-container</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-secondary" />
              <span className="text-label-sm text-on-surface-variant">secondary</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-secondary-container" />
              <span className="text-label-sm text-on-surface-variant">secondary-container</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-tertiary" />
              <span className="text-label-sm text-on-surface-variant">tertiary</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-laundry-blue-deep" />
              <span className="text-label-sm text-on-surface-variant">laundry-blue-deep</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-success-green" />
              <span className="text-label-sm text-on-surface-variant">success-green</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-urgent-express" />
              <span className="text-label-sm text-on-surface-variant">urgent-express</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-error" />
              <span className="text-label-sm text-on-surface-variant">error</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-surface-container" />
              <span className="text-label-sm text-on-surface-variant">surface-container</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-outline" />
              <span className="text-label-sm text-on-surface-variant">outline</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-16 rounded border border-outline-variant/40 bg-clean-white" />
              <span className="text-label-sm text-on-surface-variant">clean-white</span>
            </div>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Add to Order</Button>
            <Button variant="express">Pay Now</Button>
            <Button variant="ghost">Add more items</Button>
            <Button variant="outline">Edit</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="link">Link action</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Regular</Badge>
            <Badge variant="express">Express</Badge>
            <Badge variant="success">Completed</Badge>
            <Badge variant="urgent">24h</Badge>
            <Badge variant="error">Damaged</Badge>
          </div>
        </Section>

        <Section title="Cards & Selection">
          <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>T-Shirt</CardTitle>
                <CardDescription>Starting from ₦800</CardDescription>
              </CardHeader>
              <CardContent>3 tiers available</CardContent>
            </Card>
            {(['regular', 'white', 'express'] as const).map((t) => (
              <SelectionCard key={t} selected={tier === t} onClick={() => setTier(t)}>
                <p className="text-label-md font-bold capitalize text-on-surface">{t}</p>
                <p className="text-body-md text-on-surface-variant">
                  {t === 'regular' ? '₦800 · Ready in 3-4 days' : t === 'white' ? '₦1,000 · Ready in 2 days' : '₦1,600 · Ready in 24h'}
                </p>
              </SelectionCard>
            ))}
          </div>
        </Section>

        <Section title="Inputs & Selects">
          <div className="grid max-w-md gap-stack-md">
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" placeholder="080X XXX XXXX" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="err">Address (error state)</Label>
              <Input id="err" error placeholder="Required" className="mt-1" />
              <FieldError>Address is required</FieldError>
            </div>
            <div>
              <Label htmlFor="notes">Special instructions</Label>
              <Textarea id="notes" placeholder="Stains, delicate fabric, etc." className="mt-1" />
            </div>
            <div>
              <Label>Delivery zone</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independence-layout">Independence Layout — ₦500</SelectItem>
                  <SelectItem value="new-haven">New Haven — ₦700</SelectItem>
                  <SelectItem value="trans-ekulu">Trans-Ekulu — ₦600</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <RadioGroup defaultValue="pickup-delivery" className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="self-dropoff" id="self-dropoff" />
                <Label htmlFor="self-dropoff" className="normal-case text-body-md">Self Drop-off</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pickup-delivery" id="pickup-delivery" />
                <Label htmlFor="pickup-delivery" className="normal-case text-body-md">Pickup &amp; Delivery</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="normal-case text-body-md">I agree to the terms</Label>
            </div>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="everyday">
            <TabsList>
              <TabsTrigger value="everyday">Everyday Wear</TabsTrigger>
              <TabsTrigger value="corporate">Corporate</TabsTrigger>
              <TabsTrigger value="native">Native Wear</TabsTrigger>
              <TabsTrigger value="bedding">Bedding</TabsTrigger>
            </TabsList>
            <TabsContent value="everyday" className="pt-stack-md text-body-md">T-Shirts, Jeans, Socks…</TabsContent>
            <TabsContent value="corporate" className="pt-stack-md text-body-md">Suits, Shirts, Ties…</TabsContent>
            <TabsContent value="native" className="pt-stack-md text-body-md">Agbada, Isiagu…</TabsContent>
            <TabsContent value="bedding" className="pt-stack-md text-body-md">Duvets, Bedsheets…</TabsContent>
          </Tabs>
        </Section>

        <Section title="Overlays">
          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">Open Modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>T-Shirt</DialogTitle>
                  <DialogDescription>Choose a service tier and quantity.</DialogDescription>
                </DialogHeader>
                <p className="text-body-md">Modal body content goes here.</p>
                <DialogFooter>
                  <Button variant="express">Add to Order</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" onClick={() => setRespOpen(true)}>
              Open Responsive Sheet/Modal
            </Button>
            <ResponsiveDialog
              open={respOpen}
              onOpenChange={setRespOpen}
              content={
                <>
                  <p className="font-display text-headline-md">Responsive item picker</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Sheet on mobile, centered modal on desktop — same content.
                  </p>
                </>
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Reorder</DropdownMenuItem>
                <DropdownMenuItem>View receipt</DropdownMenuItem>
                <DropdownMenuItem>Cancel order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="subtle">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>

            <Button
              variant="subtle"
              onClick={() => toast({ title: 'Added to cart', description: '1 × T-Shirt (Express)', variant: 'success' })}
            >
              Fire toast
            </Button>
          </div>
        </Section>

        <Section title="Avatar & Skeleton">
          <div className="flex items-center gap-stack-md">
            <Avatar>
              <AvatarImage src="" alt="" />
              <AvatarFallback>SR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Section>
      </div>
    </TooltipProvider>
  )
}
