/**
 * Review-state records render only outside production builds, or when the
 * AUTHORITY_INCLUDE_REVIEW flag is set for a private preview. Production
 * builds therefore contain no review route at all.
 */
export const includeReviewRoutes =
  process.env.NODE_ENV !== 'production' || process.env.AUTHORITY_INCLUDE_REVIEW === '1'

export function isRenderable(state: 'ready' | 'review' | 'hold'): boolean {
  return state === 'ready' || (state === 'review' && includeReviewRoutes)
}
