import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { PhotoUpload } from '@/features/order/PhotoUpload'
import { useCheckoutStore } from '@/store/useCheckoutStore'

const detailsSchema = z.object({
  address: z.string().min(8, 'Enter a full address so we can find you.'),
  phone: z.string().min(10, 'Enter a valid phone number.'),
  whatsapp: z.string().optional(),
  specialInstructions: z.string().optional(),
})

export type DetailsFormValues = z.infer<typeof detailsSchema>

function DetailsStep({ onValidChange }: { onValidChange: (valid: boolean, values: DetailsFormValues) => void }) {
  const details = useCheckoutStore((s) => s.details)
  const setDetails = useCheckoutStore((s) => s.setDetails)
  const imageDataUrls = useCheckoutStore((s) => s.imageDataUrls)
  const addImage = useCheckoutStore((s) => s.addImage)
  const removeImage = useCheckoutStore((s) => s.removeImage)

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    mode: 'onChange',
    defaultValues: details,
  })

  const values = watch()

  useEffect(() => {
    setDetails(values)
    onValidChange(isValid, values as DetailsFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.address, values.phone, values.whatsapp, values.specialInstructions, isValid])

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
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" className="mt-1" placeholder="080X XXX XXXX" error={Boolean(errors.phone)} {...register('phone')} />
          <FieldError>{errors.phone?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
          <Input id="whatsapp" className="mt-1" placeholder="Same as phone if blank" {...register('whatsapp')} />
        </div>
      </div>

      <div>
        <Label htmlFor="instructions">Special instructions (optional)</Label>
        <Textarea
          id="instructions"
          className="mt-1"
          placeholder="Fragile items, fragrance-free detergent, gate code, etc."
          {...register('specialInstructions')}
        />
      </div>

      <div>
        <Label>Stained or damaged items</Label>
        <div className="mt-1">
          <PhotoUpload images={imageDataUrls} onAdd={addImage} onRemove={removeImage} />
        </div>
      </div>
    </div>
  )
}

export { DetailsStep, detailsSchema }
