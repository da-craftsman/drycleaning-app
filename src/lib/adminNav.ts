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

/** Single source of truth for admin navigation — shared by the desktop sidebar and the mobile menu
 * sheet so the two never drift out of sync with each other. */
export const adminSidebarLinks: AdminNavLink[] = [
  { to: paths.admin, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: paths.adminWalkIn, label: 'Walk-in Order', icon: Plus, end: false, permission: 'walkin' },
  { to: paths.adminOrders, label: 'Orders', icon: ClipboardList, end: false, dotType: 'new_order', permission: 'orders' },
  { to: paths.adminOrderHistory, label: 'Order History', icon: History, end: false, permission: 'orders' },
  { to: paths.adminCustomers, label: 'Customers', icon: Users, end: false, permission: 'customers' },
  { to: paths.adminCatalog, label: 'Catalog & Pricing', icon: Tags, end: false, permission: 'catalog' },
  { to: paths.adminZones, label: 'Zones', icon: MapPin, end: false, permission: 'zones' },
  { to: paths.adminBanner, label: 'Banner', icon: ImageIcon, end: false, permission: 'banner' },
  { to: paths.adminTickets, label: 'Tickets', icon: MessageSquare, end: false, dotType: 'new_ticket', permission: 'tickets' },
  { to: paths.adminBlog, label: 'Blog', icon: Newspaper, end: false, permission: 'blog' },
  { to: paths.adminAdmins, label: 'Admins', icon: ShieldCheck, end: false, superAdminOnly: true },
  { to: paths.adminNotifications, label: 'Manage Notifications', icon: Bell, end: false, superAdminOnly: true },
  { to: paths.adminSettings, label: 'Settings', icon: Settings, end: false },
]
