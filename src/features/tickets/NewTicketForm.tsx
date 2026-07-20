import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PhotoUpload } from '@/features/order/PhotoUpload'
import { useCreateTicket } from '@/lib/queries/useTickets'
import { useOrdersForUser } from '@/lib/queries/useOrders'
import type { TicketCategory, TicketPriority } from '@/types/database'

const schema = z.object({
  subject: z.string().min(4, 'Give your ticket a short subject.'),
  description: z.string().min(10, 'Add a few more details so we can help.'),
  category: z.enum(['damaged_item', 'missing_item', 'delay', 'billing', 'quality', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  orderId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const categoryLabels: Record<TicketCategory, string> = {
  damaged_item: 'Damaged Item',
  missing_item: 'Missing Item',
  delay: 'Delay',
  billing: 'Billing',
  quality: 'Quality Issue',
  other: 'Other',
}

const priorityLabels: Record<TicketPriority, string> = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

function NewTicketForm({ userId, authorName, onCreated }: { userId: string; authorName: string; onCreated: () => void }) {
  const { data: orders } = useOrdersForUser(userId)
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'other', priority: 'normal' },
  })
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)

  const onSubmit = async (values: FormValues) => {
    await createTicket.mutateAsync({
      userId,
      authorName,
      input: {
        orderId: values.orderId ?? null,
        subject: values.subject,
        description: values.description,
        category: values.category,
        priority: values.priority,
        photoDataUrl,
      },
    })
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(categoryLabels) as TicketCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabels[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="priority" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityLabels) as TicketPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {orders && orders.length > 0 && (
        <div>
          <Label htmlFor="orderId">Related order (optional)</Label>
          <Controller
            control={control}
            name="orderId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="orderId" className="mt-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.display_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" className="mt-1" error={Boolean(errors.subject)} {...register('subject')} />
        <FieldError>{errors.subject?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" className="mt-1" error={Boolean(errors.description)} {...register('description')} />
        <FieldError>{errors.description?.message}</FieldError>
      </div>

      <div>
        <Label>Photo (optional)</Label>
        <div className="mt-1">
          <PhotoUpload
            images={photoDataUrl ? [photoDataUrl] : []}
            onAdd={setPhotoDataUrl}
            onRemove={() => setPhotoDataUrl(null)}
            label="Upload a photo of the damaged item"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={createTicket.isPending}>
        {createTicket.isPending ? 'Submitting…' : 'Submit Ticket'}
      </Button>
    </form>
  )
}

export { NewTicketForm }
