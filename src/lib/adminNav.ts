import {
  LayoutDashboard,
  ClipboardList,
  History,
  Users,
  Tags,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Bell,
  Plus,
} from 'lucide-react'
import { paths } from '@/routes/paths'
import type { AdminPermission, NotificationType } from '@/types/database'

export interface AdminNavLink {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end: boolean
  dotType?: NotificationType
  permission?: AdminPermission
  superAdminOnly?: boolean
}

export interface AdminNavSection {
  /** Omitted for the top-level Dashboard link, which sits above every labeled group. */
  title?: string
  links: AdminNavLink[]
}

/** Single source of truth for admin navigation — shared by the desktop sidebar and the mobile menu
 * sheet so the two never drift out of sync with each other. */
export const adminNavSections: AdminNavSection[] = [
  { links: [{ to: paths.admin, label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    title: 'Operations',
    links: [
      { to: paths.adminWalkIn, label: 'Walk-in Order', icon: Plus, end: false, permission: 'walkin' },
      { to: paths.adminOrders, label: 'Orders', icon: ClipboardList, end: false, dotType: 'new_order', permission: 'orders' },
      { to: paths.adminOrderHistory, label: 'Order History', icon: History, end: false, permission: 'orders' },
    ],
  },
  {
    title: 'Customers & Support',
    links: [
      { to: paths.adminCustomers, label: 'Customers', icon: Users, end: false, permission: 'customers' },
      { to: paths.adminTickets, label: 'Tickets', icon: MessageSquare, end: false, dotType: 'new_ticket', permission: 'tickets' },
    ],
  },
  {
    title: 'Store',
    links: [
      { to: paths.adminCatalog, label: 'Catalog & Pricing', icon: Tags, end: false, permission: 'catalog' },
      { to: paths.adminZones, label: 'Delivery Zones', icon: MapPin, end: false, permission: 'zones' },
      { to: paths.adminBanner, label: 'Promo Banner', icon: ImageIcon, end: false, permission: 'banner' },
      { to: paths.adminBlog, label: 'Blog', icon: Newspaper, end: false, permission: 'blog' },
    ],
  },
  {
    title: 'Administration',
    links: [
      { to: paths.adminAdmins, label: 'Admins', icon: ShieldCheck, end: false, superAdminOnly: true },
      { to: paths.adminNotifications, label: 'Manage Notifications', icon: Bell, end: false, superAdminOnly: true },
      { to: paths.adminSettings, label: 'Settings', icon: Settings, end: false },
    ],
  },
]

/** The nav sections the signed-in admin can see — links they lack permission for are dropped, and so is any section left empty. */
export function visibleAdminNavSections(canSee: (link: AdminNavLink) => boolean): AdminNavSection[] {
  return adminNavSections
    .map((section) => ({ ...section, links: section.links.filter(canSee) }))
    .filter((section) => section.links.length > 0)
}
