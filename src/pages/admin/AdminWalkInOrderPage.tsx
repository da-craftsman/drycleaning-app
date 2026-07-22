import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Store, PackageCheck, ShoppingBasket, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectionCard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryPills, ALL_CATEGORIES } from '@/features/catalog/CategoryPills'
import { ItemCard } from '@/features/catalog/ItemCard'
import { ItemModal } from '@/features/catalog/ItemModal'
import { CartLineItem } from '@/features/cart/CartLineItem'
import { formatNaira } from '@/features/catalog/ItemCard'
import { useCategories } from '@/lib/queries/useCategories'
import { useClothingItems } from '@/lib/queries/useClothingItems'
import { useAllCustomers } from '@/lib/queries/useCustomers'
import { useDeliveryZones } from '@/lib/queries/useDeliveryZones'
import { useCreateWalkInCustomer } from '@/lib/queries/useWalkIn'
import { useCreateOrder, useMarkOrderPaid } from '@/lib/queries/useCreateOrder'
import { useWalkInCartStore } from '@/store/useWalkInCartStore'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { ClothingItem, DeliveryZone } from '@/types/database'
import type { CustomerSummary } from '@/types/domain'

type WalkInLogistics = 'self_dropoff' | 'delivery_only'

function feeFor(type: WalkInLogistics, zone: DeliveryZone | undefined): number | null {
  if (type === 'self_dropoff') return 0
  if (!zone) return null
  return zone.delivery_fee
}

export default function AdminWalkInOrderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: categories } = useCategories()
  const { data: items, isLoading: itemsLoading } = useClothingItems()
  const { data: customers, isLoading: customersLoading } = useAllCustomers()
  const { data: zones, isLoading: zonesLoading } = useDeliveryZones()

  const cartItems = useWalkInCartStore((s) => s.items)
  const cartSubtotal = useWalkInCartStore((s) => s.cartTotal())
  const clearCart = useWalkInCartStore((s) => s.clearCart)

  const createWalkInCustomer = useCreateWalkInCustomer()
  const createOrder = useCreateOrder()
  const markOrderPaid = useMarkOrderPaid()

  // Customer
  const [customerMode, setCustomerMode] = useState<'search' | 'new'>('search')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)
  const [newFullName, setNewFullName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newWhatsapp, setNewWhatsapp] = useState('')
  const [newEmail, setNewEmail] = useState('')

  // Catalog
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES)
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)

  // Logistics & details
  const [logisticsType, setLogisticsType] = useState<WalkInLogistics>('self_dropoff')
  const [zoneId, setZoneId] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [markPaidNow, setMarkPaidNow] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const categoryName = categories?.find((c) => c.id === selectedItem?.category_id)?.name ?? ''

  const visibleItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase()
    return (items ?? []).filter((item) => {
      const matchesCategory = activeCategory === ALL_CATEGORIES || item.category_id === activeCategory
      const matchesQuery = !query || item.name.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [items, activeCategory, itemSearch])

  const matchingCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase()
    if (!q) return []
    return (customers ?? [])
      .filter(({ profile }) => profile.full_name.toLowerCase().includes(q) || profile.phone.includes(q) || profile.email.toLowerCase().includes(q))
      .slice(0, 8)
  }, [customers, customerSearch])

  const selectedZone = zones?.find((z) => z.id === zoneId)
  const deliveryFee = feeFor(logisticsType, selectedZone) ?? 0
  const total = cartSubtotal + deliveryFee

  const customerReady = customerMode === 'search' ? Boolean(selectedCustomer) : Boolean(newFullName.trim() && newPhone.trim())
  const logisticsReady = logisticsType === 'self_dropoff' || (Boolean(zoneId) && address.trim().length >= 8)
  const canSubmit = customerReady && cartItems.length > 0 && logisticsReady && !submitting

  const resolvedPhone = customerMode === 'search' ? selectedCustomer?.profile.phone ?? '' : newPhone

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const userId =
        customerMode === 'search' && selectedCustomer
          ? selectedCustomer.profile.id
          : (
              await createWalkInCustomer.mutateAsync({
                fullName: newFullName.trim(),
                phone: newPhone.trim(),
                whatsapp: newWhatsapp.trim() || null,
                email: newEmail.trim() || null,
              })
            ).id

      const order = await createOrder.mutateAsync({
        userId,
        items: cartItems,
        logisticsType,
        zoneId: logisticsType === 'delivery_only' ? zoneId : null,
        deliveryFee,
        details: {
          address: logisticsType === 'delivery_only' ? address.trim() : 'Self drop-off at the shop',
          phone: resolvedPhone,
          whatsapp: newWhatsapp.trim() || resolvedPhone,
          specialInstructions: notes.trim(),
        },
        imageDataUrls: [],
        paymentMethod: 'cash_on_delivery',
      })

      if (markPaidNow) {
        await markOrderPaid.mutateAsync(order.id)
      }

      clearCart()
      toast({ title: 'Walk-in order created', description: order.display_id, variant: 'success' })
      navigate(paths.adminOrder(order.id))
    } catch (err) {
      toast({ title: 'Failed to create order', description: getErrorMessage(err, 'Please try again.'), variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">New Walk-in Order</h1>

      <div className="flex flex-col gap-stack-lg">
        {/* Customer */}
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <div className="grid grid-cols-2 gap-2">
              <SelectionCard
                selected={customerMode === 'search'}
                onClick={() => setCustomerMode('search')}
                className="flex flex-col items-center gap-1 text-center"
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-label-sm font-bold normal-case text-on-surface">Existing customer</span>
              </SelectionCard>
              <SelectionCard
                selected={customerMode === 'new'}
                onClick={() => setCustomerMode('new')}
                className="flex flex-col items-center gap-1 text-center"
              >
                <UserPlus className="h-5 w-5 text-primary" />
                <span className="text-label-sm font-bold normal-case text-on-surface">New customer</span>
              </SelectionCard>
            </div>

            {customerMode === 'search' ? (
              <div className="flex flex-col gap-stack-sm">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    placeholder="Search by name, phone, or email"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value)
                      setSelectedCustomer(null)
                    }}
                    className="pl-10"
                  />
                </div>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded border border-primary bg-primary/5 p-stack-sm">
                    <div>
                      <p className="text-label-md font-bold normal-case text-on-surface">{selectedCustomer.profile.full_name}</p>
                      <p className="text-label-sm text-on-surface-variant">{selectedCustomer.profile.phone}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                      Change
                    </Button>
                  </div>
                ) : customersLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : customerSearch.trim() ? (
                  matchingCustomers.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {matchingCustomers.map((c) => (
                        <button
                          key={c.profile.id}
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="flex items-center justify-between rounded border border-outline-variant/40 p-stack-sm text-left transition-colors hover:border-primary hover:bg-primary/5"
                        >
                          <span>
                            <span className="block text-label-md font-bold normal-case text-on-surface">{c.profile.full_name}</span>
                            <span className="block text-label-sm text-on-surface-variant">{c.profile.phone}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-md text-on-surface-variant">No matching customers, try "New customer" instead.</p>
                  )
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-stack-sm">
                <div>
                  <Label htmlFor="walkin-name">Full Name</Label>
                  <Input id="walkin-name" className="mt-1" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="walkin-phone">Phone</Label>
                    <Input id="walkin-phone" className="mt-1" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="walkin-whatsapp">WhatsApp (optional)</Label>
                    <Input id="walkin-whatsapp" className="mt-1" value={newWhatsapp} onChange={(e) => setNewWhatsapp(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="walkin-email">Email (optional)</Label>
                  <Input id="walkin-email" type="email" className="mt-1" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    Needed only if the customer wants to log in and track this order online later.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                placeholder="Search items (e.g., 'Shirt')"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <CategoryPills value={activeCategory} onChange={setActiveCategory} />

            {itemsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/5 w-full" />
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <p className="py-stack-lg text-center text-body-md text-on-surface-variant">No items match your search.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleItems.map((item) => (
                  <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-stack-lg text-center">
                <ShoppingBasket className="h-8 w-8 text-outline" strokeWidth={1.5} />
                <p className="text-body-md text-on-surface-variant">No items added yet, pick some from the catalog above.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  {cartItems.map((line) => (
                    <CartLineItem key={line.cartItemId} line={line} useStore={useWalkInCartStore} />
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/40 pt-stack-sm">
                  <span className="text-body-md text-on-surface-variant">Subtotal</span>
                  <span className="text-body-lg font-bold text-on-surface">{formatNaira(cartSubtotal)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Logistics */}
        <Card>
          <CardHeader>
            <CardTitle>Return to Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <div className="grid grid-cols-2 gap-2">
              <SelectionCard
                selected={logisticsType === 'self_dropoff'}
                onClick={() => setLogisticsType('self_dropoff')}
                className="flex flex-col items-center gap-2 text-center"
              >
                <Store className="h-5 w-5 text-primary" />
                <span className="text-label-sm font-bold normal-case text-on-surface">Customer picks up</span>
                <Badge variant="success">Free</Badge>
              </SelectionCard>
              <SelectionCard
                selected={logisticsType === 'delivery_only'}
                onClick={() => setLogisticsType('delivery_only')}
                className="flex flex-col items-center gap-2 text-center"
              >
                <PackageCheck className="h-5 w-5 text-primary" />
                <span className="text-label-sm font-bold normal-case text-on-surface">We deliver it back</span>
                {feeFor('delivery_only', selectedZone) !== null ? (
                  <Badge variant="primary">{formatNaira(feeFor('delivery_only', selectedZone)!)}</Badge>
                ) : (
                  <span className="text-label-sm normal-case text-on-surface-variant">Select a zone</span>
                )}
              </SelectionCard>
            </div>

            {logisticsType === 'delivery_only' && (
              <>
                <div className="max-w-sm">
                  <Label htmlFor="walkin-zone">Delivery zone</Label>
                  <Select value={zoneId ?? undefined} onValueChange={setZoneId} disabled={zonesLoading}>
                    <SelectTrigger id="walkin-zone" className="mt-1">
                      <SelectValue placeholder={zonesLoading ? 'Loading zones…' : 'Select a zone'} />
                    </SelectTrigger>
                    <SelectContent>
                      {zones?.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} (Delivery {formatNaira(zone.delivery_fee)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="walkin-address">Delivery address</Label>
                  <Textarea
                    id="walkin-address"
                    className="mt-1"
                    placeholder="House number, street, area, Enugu"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={address.trim().length > 0 && address.trim().length < 8}
                  />
                  <FieldError>{address.trim().length > 0 && address.trim().length < 8 ? 'Enter a full address.' : undefined}</FieldError>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="walkin-notes">Notes (optional)</Label>
              <Textarea
                id="walkin-notes"
                className="mt-1"
                placeholder="Stains, damage, fragile items, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-stack-sm pt-stack-md">
            <p className="text-body-md text-on-surface-variant">Walk-in orders are paid in cash.</p>
            <div className="flex items-center gap-2">
              <Checkbox id="walkin-paid" checked={markPaidNow} onCheckedChange={(v) => setMarkPaidNow(v === true)} />
              <Label htmlFor="walkin-paid" className="normal-case text-body-md text-on-surface">
                Customer has already paid in cash
              </Label>
            </div>
            {!markPaidNow && (
              <p className="text-label-sm text-on-surface-variant">
                The order will be recorded as unpaid, mark it paid from the order page once cash is collected.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-stack-md shadow-soft-lift md:bottom-4">
          <div className="flex items-center justify-between">
            <span className="text-body-md text-on-surface-variant">Total</span>
            <span className="text-headline-md font-display text-on-surface">{formatNaira(total)}</span>
          </div>
          <Button size="lg" onClick={handleSubmit} disabled={!canSubmit} className="w-full">
            {submitting ? 'Creating order…' : 'Create Walk-in Order'}
          </Button>
        </div>
      </div>

      <ItemModal item={selectedItem} categoryName={categoryName} onClose={() => setSelectedItem(null)} useStore={useWalkInCartStore} />
    </div>
  )
}
