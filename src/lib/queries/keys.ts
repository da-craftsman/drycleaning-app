export const queryKeys = {
  categories: ['categories'] as const,
  items: ['items'] as const,
  allItems: ['items', 'all'] as const,
  item: (id: string) => ['items', id] as const,
  zones: ['zones'] as const,
  promoBanner: ['promoBanner'] as const,

  ordersForUser: (userId: string) => ['orders', 'user', userId] as const,
  allOrders: ['orders', 'all'] as const,
  order: (id: string) => ['orders', id] as const,
  orderByDisplayId: (displayId: string) => ['orders', 'display', displayId] as const,
  orderItems: (orderId: string) => ['orders', orderId, 'items'] as const,
  orderImages: (orderId: string) => ['orders', orderId, 'images'] as const,
  orderStatusHistory: (orderId: string) => ['orders', orderId, 'statusHistory'] as const,

  ticketsForUser: (userId: string) => ['tickets', 'user', userId] as const,
  allTickets: ['tickets', 'all'] as const,
  ticket: (id: string) => ['tickets', id] as const,
  ticketMessages: (ticketId: string) => ['tickets', ticketId, 'messages'] as const,

  publishedBlogPosts: ['blog', 'published'] as const,
  allBlogPosts: ['blog', 'all'] as const,
  blogPostBySlug: (slug: string) => ['blog', 'slug', slug] as const,
  blogPost: (id: string) => ['blog', id] as const,

  profile: (userId: string) => ['profile', userId] as const,
  session: ['session'] as const,

  allCustomers: ['customers', 'all'] as const,
} as const
