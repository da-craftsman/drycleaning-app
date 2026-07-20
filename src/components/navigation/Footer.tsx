import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { paths } from '@/routes/paths'
import { business, whatsappLink } from '@/lib/constants'

const columns = [
  {
    title: 'Company',
    links: [
      { to: paths.about, label: 'About' },
      { to: paths.services, label: 'Services & Pricing' },
      { to: paths.blog, label: 'Blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: paths.support, label: 'FAQ & Contact' },
      { to: paths.trackLookup, label: 'Track an Order' },
    ],
  },
]

/** Public marketing footer — links, WhatsApp contact, socials. Not shown inside the authenticated order/account/admin flows. */
function Footer() {
  return (
    <footer className="bg-laundry-blue-deep">
      <div className="mx-auto w-full min-w-0 max-w-shell px-margin-mobile py-stack-lg md:px-gutter">
        <div className="flex flex-col items-start gap-stack-lg md:flex-row md:justify-between">
          <div className="flex w-fit flex-col items-start gap-stack-sm">
            <Logo inverted />
            <p className="max-w-xs text-body-md text-clean-white/70">
              Premium wash, iron, pickup and delivery for {business.city}.
            </p>
            <div className="flex flex-col gap-1 pt-2">
              <a
                href={whatsappLink("Hi Shalah Rex, I'd like to ask about your laundry service.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-body-md text-clean-white/70 hover:text-[#25D366]"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 text-body-md text-clean-white/70 hover:text-clean-white"
              >
                <Mail className="h-4 w-4" /> {business.email}
              </a>
              <p className="flex items-center gap-2 text-body-md text-clean-white/70">
                <MapPin className="h-4 w-4" /> {business.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-stack-lg sm:grid-cols-2">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
                <p className="text-label-sm uppercase text-clean-white/50">{col.title}</p>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-body-md text-clean-white/70 hover:text-clean-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-stack-lg border-t border-clean-white/10 pt-stack-md text-label-sm text-clean-white/50">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export { Footer }
