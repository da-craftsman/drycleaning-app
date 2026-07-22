import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { PhotoUpload } from '@/features/order/PhotoUpload'
import { useCheckoutStore } from '@/store/useCheckoutStore'
import { useSession } from '@/lib/queries/useSession'
import { useOrdersForUser } from '@/lib/queries/useOrders'

const detailsSchema = z
  .object({
    address: z.string().min(8, 'Enter a full address so we can find you.'),
    phone: z.string().min(10, 'Enter a valid phone number.'),
    hasStainOrDamage: z.boolean(),
    specialInstructions: z.string().optional(),
  })
  .refine((data) => !data.hasStainOrDamage || Boolean(data.specialInstructions?.trim()), {
    message: 'Describe the stain or damage so we know what to look out for.',
    path: ['specialInstructions'],
  })

export type DetailsFormValues = z.infer<typeof detailsSchema>

function DetailsStep({ onValidChange }: { onValidChange: (valid: boolean, values: DetailsFormValues) => void }) {
  const details = useCheckoutStore((s) => s.details)
  const setDetails = useCheckoutStore((s) => s.setDetails)
  const imageDataUrls = useCheckoutStore((s) => s.imageDataUrls)
  const addImage = useCheckoutStore((s) => s.addImage)
  const removeImage = useCheckoutStore((s) => s.removeImage)

  const { data: session } = useSession()
  const { data: pastOrders } = useOrdersForUser(session?.id)

  // Most recent distinct delivery/pickup addresses this customer has used, newest first — lets
  // them tap one instead of retyping the same address every order.
  const recentAddresses = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const order of pastOrders ?? []) {
      const address = order.address.trim()
      if (!address || seen.has(address)) continue
      seen.add(address)
      result.push(address)
      if (result.length === 3) break
    }
    return result
  }, [pastOrders])

  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    mode: 'onChange',
    defaultValues: {
      address: details.address,
      phone: details.phone,
      specialInstructions: details.specialInstructions,
      hasStainOrDamage: imageDataUrls.length > 0,
    },
  })

  const values = watch()

  useEffect(() => {
    // WhatsApp is no longer collected separately — it's assumed to be the same as the phone number.
    setDetails({ address: values.address, phone: values.phone, whatsapp: values.phone, specialInstructions: values.specialInstructions })
    onValidChange(isValid, values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.address, values.phone, values.specialInstructions, values.hasStainOrDamage, isValid])

  return (
    <div className="flex flex-col gap-stack-md">
      <div>
        <h2 className="font-display text-headline-md text-on-surface">Details & Photos</h2>
        <p className="text-body-md text-on-surface-variant">Where should we pick up / deliver, and how do we reach you?</p>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          className="mt-1"
          placeholder="House number, street, area, Enugu"
          error={Boolean(errors.address)}
          {...register('address')}
        />
        <FieldError>{errors.address?.message}</FieldError>
        {recentAddresses.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {recentAddresses.map((address) => (
              <button
                key={address}
                type="button"
                onClick={() => setValue('address', address, { shouldValidate: true, shouldDirty: true })}
                className="flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant/40 px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone (also used for WhatsApp)</Label>
        <Input id="phone" className="mt-1" placeholder="080X XXX XXXX" error={Boolean(errors.phone)} {...register('phone')} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="hasStainOrDamage"
            render={({ field }) => <Checkbox id="hasStainOrDamage" checked={field.value} onCheckedChange={field.onChange} />}
          />
          <Label htmlFor="hasStainOrDamage" className="normal-case text-body-md">
            This order has stained or damaged items
          </Label>
        </div>
        {values.hasStainOrDamage && (
          <div className="mt-stack-sm">
            <PhotoUpload images={imageDataUrls} onAdd={addImage} onRemove={removeImage} />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="instructions">Special instructions{values.hasStainOrDamage ? '' : ' (optional)'}</Label>
        <Textarea
          id="instructions"
          className="mt-1"
          placeholder={
            values.hasStainOrDamage
              ? 'Describe the stain or damage on each affected item.'
              : 'Fragile items, fragrance-free detergent, gate code, etc.'
          }
          error={Boolean(errors.specialInstructions)}
          {...register('specialInstructions')}
        />
        <FieldError>{errors.specialInstructions?.message}</FieldError>
      </div>
    </div>
  )
}

export { DetailsStep, detailsSchema }
