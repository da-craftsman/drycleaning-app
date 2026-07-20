export interface ServiceOffering {
  slug: string
  title: string
  description: string
  image: string
}

/** The 6 marketing services offered — shown on Home and the Services page. */
export const services: ServiceOffering[] = [
  {
    slug: 'pickup-dropoff',
    title: 'Pickup & Drop-off',
    description: 'A convenient service that brings laundry care directly to your doorstep.',
    image: '/images/services/pickup-dropoff.jpg',
  },
  {
    slug: 'clothing-care',
    title: 'Clothing Care',
    description: 'Specialized care for a variety of items, including shirts, dresses, jeans, and traditional attire.',
    image: '/images/services/clothing-care.jpg',
  },
  {
    slug: 'home-textiles',
    title: 'Home Textiles Cleaning',
    description: 'Cleaning services for home fabrics like curtains.',
    image: '/images/services/home-textiles.jpg',
  },
  {
    slug: 'dry-cleaning-ironing',
    title: 'Dry Cleaning & Ironing',
    description: 'Thorough cleaning services designed for delicate or high-value fabrics.',
    image: '/images/services/dry-cleaning-ironing.jpg',
  },
  {
    slug: 'stain-removal',
    title: 'Stain Removal',
    description: 'Expert treatments designed to safely remove stubborn stains.',
    image: '/images/services/stain-removal.jpg',
  },
  {
    slug: 'repairs-alterations',
    title: 'Repairs & Alterations',
    description: 'Repair and alteration services to help maintain and extend the life of your garments.',
    image: '/images/services/repairs-alterations.jpg',
  },
]

export const heroImage = '/images/services/hero-laundromat.jpg'
