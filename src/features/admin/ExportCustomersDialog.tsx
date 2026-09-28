import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { downloadCsv, toCsv } from '@/lib/csv'
import type { CustomerSummary } from '@/types/domain'

type ExportScope = 'all' | 'weekly' | 'monthly' | 'yearly'

const scopeLabels: Record<Exclude<ExportScope, 'all'>, string> = {
  weekly: 'Weekly — last 7 days',
  monthly: 'Monthly — last 30 days',
  yearly: 'Yearly — last 6 months (max)',
}

/** Signups from this many days back — exports are capped at 6 months regardless of scope. */
const scopeDays: Record<Exclude<ExportScope, 'all'>, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 182,
}

function customersInScope(customers: CustomerSummary[], scope: ExportScope): CustomerSummary[] {
  if (scope === 'all') return customers
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - scopeDays[scope])
  return customers.filter(({ profile }) => new Date(profile.created_at) >= cutoff)
}

function exportCustomers(customers: CustomerSummary[]) {
  const csv = toCsv(
    customers.map(({ profile, orderCount, totalSpend, lastOrderAt }) => ({
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      whatsapp: profile.whatsapp ?? '',
      address: profile.address ?? '',
      signedUpAt: new Date(profile.created_at).toLocaleDateString('en-NG'),
      orderCount,
      totalSpend,
      lastOrderAt: lastOrderAt ? new Date(lastOrderAt).toLocaleDateString('en-NG') : '',
    })),
    [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'address', label: 'Address' },
      { key: 'signedUpAt', label: 'Signed Up' },
      { key: 'orderCount', label: 'Order Count' },
      { key: 'totalSpend', label: 'Total Spend (NGN)' },
      { key: 'lastOrderAt', label: 'Last Order' },
    ],
  )
  downloadCsv(`customers-${new Date().toISOString().slice(0, 10)}.csv`, csv)
}

function ExportCustomersDialog({ customers }: { customers: CustomerSummary[] }) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<ExportScope>('all')
  const { toast } = useToast()

  const handleExport = () => {
    const rows = customersInScope(customers, scope)
    if (rows.length === 0) {
      toast({ title: 'No customers in that range', description: 'Try a wider export window.', variant: 'error' })
      return
    }
    exportCustomers(rows)
    setOpen(false)
    toast({ title: `Exported ${rows.length} customer${rows.length === 1 ? '' : 's'}`, variant: 'success' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Customers</DialogTitle>
          <DialogDescription>Download the customer list as a spreadsheet (.csv).</DialogDescription>
        </DialogHeader>

        <RadioGroup value={scope} onValueChange={(v) => setScope(v as ExportScope)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="scope-all" />
            <Label htmlFor="scope-all" className="font-normal normal-case">
              Export all customers
            </Label>
          </div>
          {(Object.keys(scopeLabels) as Exclude<ExportScope, 'all'>[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <RadioGroupItem value={s} id={`scope-${s}`} />
              <Label htmlFor={`scope-${s}`} className="font-normal normal-case">
                {scopeLabels[s]}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-label-sm text-on-surface-variant">
          Filtered exports go by sign-up date and are capped at 6 months of history.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export to CSV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ExportCustomersDialog }
