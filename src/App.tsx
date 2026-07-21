import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/layouts/AppLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ProtectedRoute, AdminRoute, RequirePermission, RequireSuperAdmin } from '@/components/auth/ProtectedRoute'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queries/keys'
import { paths } from '@/routes/paths'

import HomePage from '@/pages/public/HomePage'
import AboutPage from '@/pages/public/AboutPage'
import ServicesPage from '@/pages/public/ServicesPage'
import ServiceDetailPage from '@/pages/public/ServiceDetailPage'
import BlogListPage from '@/pages/public/BlogListPage'
import BlogPostPage from '@/pages/public/BlogPostPage'
import SupportPage from '@/pages/public/SupportPage'
import TrackOrderPage from '@/pages/public/TrackOrderPage'
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/public/TermsOfServicePage'
import NotFoundPage from '@/pages/public/NotFoundPage'

import NewOrderPage from '@/pages/order/NewOrderPage'
import CheckoutPage from '@/pages/order/CheckoutPage'
import ConfirmationPage from '@/pages/order/ConfirmationPage'

import AccountHomePage from '@/pages/account/AccountHomePage'
import AccountOrdersPage from '@/pages/account/AccountOrdersPage'
import AccountOrderDetailPage from '@/pages/account/AccountOrderDetailPage'
import AccountTicketsPage from '@/pages/account/AccountTicketsPage'
import AccountTicketDetailPage from '@/pages/account/AccountTicketDetailPage'
import AccountProfilePage from '@/pages/account/AccountProfilePage'

// Auth and Admin are natural code-split boundaries — most visitors never touch either,
// and Admin pulls in jsPDF (receipt/invoice generation), so keep both out of the main bundle.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'))
const AdminCatalogPage = lazy(() => import('@/pages/admin/AdminCatalogPage'))
const AdminZonesPage = lazy(() => import('@/pages/admin/AdminZonesPage'))
const AdminBannerPage = lazy(() => import('@/pages/admin/AdminBannerPage'))
const AdminTicketsPage = lazy(() => import('@/pages/admin/AdminTicketsPage'))
const AdminTicketDetailPage = lazy(() => import('@/pages/admin/AdminTicketDetailPage'))
const AdminBlogPage = lazy(() => import('@/pages/admin/AdminBlogPage'))
const AdminBlogPostPage = lazy(() => import('@/pages/admin/AdminBlogPostPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminAdminsPage = lazy(() => import('@/pages/admin/AdminAdminsPage'))

// Lazy-loaded (and only routed to in dev) so the dev-only kit page is excluded from production bundles.
const UiKitPage = import.meta.env.DEV ? lazy(() => import('@/pages/dev/UiKitPage')) : null

function DevUiKitRoute() {
  if (!UiKitPage) return null
  return (
    <Suspense fallback={null}>
      <UiKitPage />
    </Suspense>
  )
}

function App() {
  const queryClient = useQueryClient()

  // Supabase can establish/change a session outside any of our own signIn/signUp calls — most
  // notably, clicking the emailed verification link silently sets a session from the URL fragment
  // on page load. Without this, our cached session query never learns about it, so a freshly
  // verified user can be stuck looking logged out until an unrelated refetch happens to occur.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return (
    <Routes>
      {/* Public + customer shell */}
      <Route element={<AppLayout />}>
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.about} element={<AboutPage />} />
        <Route path={paths.services} element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path={paths.blog} element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path={paths.support} element={<SupportPage />} />
        <Route path={paths.privacyPolicy} element={<PrivacyPolicyPage />} />
        <Route path={paths.termsOfService} element={<TermsOfServicePage />} />
        <Route path={paths.trackLookup} element={<TrackOrderPage />} />
        <Route path="/track/:orderId" element={<TrackOrderPage />} />

        <Route path={paths.order} element={<NewOrderPage />} />

        <Route element={<ProtectedRoute />}>
          {/* Orders need a real authenticated user_id (RLS requires user_id = auth.uid()), so
              checkout requires login. Email verification is intentionally not required anywhere
              right now (see use/Things to do.md) — a brand-new signup gets full access immediately. */}
          <Route path="/order/checkout/:step" element={<CheckoutPage />} />
          <Route path="/order/confirmation/:orderId" element={<ConfirmationPage />} />

          <Route path={paths.account} element={<AccountHomePage />} />
          <Route path={paths.accountOrders} element={<AccountOrdersPage />} />
          <Route path="/account/orders/:id" element={<AccountOrderDetailPage />} />
          <Route path={paths.accountTickets} element={<AccountTicketsPage />} />
          <Route path="/account/tickets/:id" element={<AccountTicketDetailPage />} />
          <Route path={paths.accountProfile} element={<AccountProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.signup} element={<SignupPage />} />
        <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.resetPassword} element={<ResetPasswordPage />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.admin} element={<AdminDashboardPage />} />
          <Route path={paths.adminSettings} element={<AdminSettingsPage />} />

          <Route element={<RequirePermission feature="orders" />}>
            <Route path={paths.adminOrders} element={<AdminOrdersPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          </Route>
          <Route element={<RequirePermission feature="customers" />}>
            <Route path={paths.adminCustomers} element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
          </Route>
          <Route element={<RequirePermission feature="catalog" />}>
            <Route path={paths.adminCatalog} element={<AdminCatalogPage />} />
          </Route>
          <Route element={<RequirePermission feature="zones" />}>
            <Route path={paths.adminZones} element={<AdminZonesPage />} />
          </Route>
          <Route element={<RequirePermission feature="banner" />}>
            <Route path={paths.adminBanner} element={<AdminBannerPage />} />
          </Route>
          <Route element={<RequirePermission feature="tickets" />}>
            <Route path={paths.adminTickets} element={<AdminTicketsPage />} />
            <Route path="/admin/tickets/:id" element={<AdminTicketDetailPage />} />
          </Route>
          <Route element={<RequirePermission feature="blog" />}>
            <Route path={paths.adminBlog} element={<AdminBlogPage />} />
            <Route path="/admin/blog/:id" element={<AdminBlogPostPage />} />
          </Route>

          <Route element={<RequireSuperAdmin />}>
            <Route path={paths.adminAdmins} element={<AdminAdminsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Dev-only design system reference — not bundled in production builds */}
      {import.meta.env.DEV && (
        <Route path="/dev/ui-kit" element={<DevUiKitRoute />} />
      )}
    </Routes>
  )
}

export default App
