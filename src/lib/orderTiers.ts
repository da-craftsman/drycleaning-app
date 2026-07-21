import type { ServiceTier } from '@/types/database'

/**
 * True when a set of order/cart lines mixes 'express' with a non-express tier (regular/white).
 * False if every line is express, or none are, since express only needs special priority
 * handling when it's racing alongside slower items in the same order.
 */
export function isMixedExpress(tiers: ServiceTier[]): boolean {
  return tiers.includes('express') && tiers.some((t) => t !== 'express')
}
