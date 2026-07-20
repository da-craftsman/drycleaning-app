import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Input, Textarea, FieldError } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/lib/queries/useProfile'
import { ChangePasswordForm } from '@/features/account/ChangePasswordForm'
import { paths } from '@/routes/paths'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  phone: z.string().min(10, 'Enter a valid phone number.'),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function AccountProfilePage() {
  const { profile, signOut } = useAuth()
  const updateProfile = useUpdateProfile()
  const { toast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name,
        phone: profile.phone,
        whatsapp: profile.whatsapp ?? '',
        address: profile.address ?? '',
      })
    }
  }, [profile, reset])

  if (!profile) return null

  const onSubmit = async (values: FormValues) => {
    await updateProfile.mutateAsync({
      userId: profile.id,
      patch: { full_name: values.fullName, phone: values.phone, whatsapp: values.whatsapp || null, address: values.address || null },
    })
    toast({ title: 'Profile updated', variant: 'success' })
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(paths.home)
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-margin-mobile py-stack-lg md:px-gutter">
      <h1 className="mb-stack-md text-headline-lg-mobile font-display text-laundry-blue-deep md:text-headline-lg">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-md">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile.email} disabled className="mt-1" />
        </div>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" className="mt-1" error={Boolean(errors.fullName)} {...register('fullName')} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" className="mt-1" error={Boolean(errors.phone)} {...register('phone')} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" className="mt-1" {...register('whatsapp')} />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" className="mt-1" {...register('address')} />
        </div>
        <Button type="submit" disabled={updateProfile.isPending} className="self-start">
          {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      <div className="mt-stack-lg border-t border-outline-variant/40 pt-stack-lg">
        <h2 className="mb-stack-md text-headline-md font-display text-on-surface">Password</h2>
        <ChangePasswordForm />
      </div>

      <div className="mt-stack-lg border-t border-outline-variant/40 pt-stack-md">
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  )
}
