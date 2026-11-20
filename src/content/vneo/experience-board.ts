/**
 * The flight-strip board as the page renders it: each role's projects and
 * writing looked up (only public ones), its review and keep state settled.
 * Server-side, so the project records stay out of the browser's bundle.
 */

import { getArticle, getProject } from '@/content/authority'
import { includeReviewRoutes } from '@/content/authority/visibility'
import { projectImages } from '@/content/v2/record'
import { plain } from '@/content/v3/work'

import { kindLabel, roles, type Role } from './experience'
import { VN, racePhoto, workHref, writingHref } from './site'

export interface BoardLink {
  title: string
  href: string
  image?: { src: string; position?: string }
}

export interface BoardRole
  extends Omit<Role, 'projects' | 'writing' | 'state' | 'keep'> {
  kindName: string
  /** not public yet: renders only in development or a review preview */
  pending: boolean
  /** on the board (in production, only kept roles are sent at all) */
  kept: boolean
  projects: BoardLink[]
  writing: BoardLink[]
}

const projectLink = (slug: string): BoardLink | undefined => {
  const p = getProject(slug)
  if (!p || p.state !== 'ready') return undefined
  const raw =
    plain[slug]?.image ??
    projectImages(p).find((m) => !/\.(gif|svg)$/.test(m.src))
  const img = raw ? racePhoto(raw) : undefined
  return {
    title: p.title.split(' — ')[0],
    href: workHref(slug, VN),
    image: img
      ? { src: img.src, position: plain[slug]?.image?.position }
      : undefined,
  }
}

const articleLink = (slug: string): BoardLink | undefined => {
  const a = getArticle(slug)
  return a && a.state === 'ready'
    ? { title: a.title, href: writingHref(slug) }
    : undefined
}

const isLink = (l: BoardLink | undefined): l is BoardLink => !!l

/** Every role that may render here, kept or not, in the record's order. */
export function experienceBoard(): BoardRole[] {
  const dev = process.env.NODE_ENV === 'development'
  return roles
    .filter((r) => r.state === 'ready' || (r.state === 'review' && includeReviewRoutes))
    .filter((r) => dev || r.keep !== false)
    .map(({ projects, writing, state, keep, ...r }) => ({
      ...r,
      kindName: kindLabel[r.kind],
      pending: state === 'review',
      kept: keep !== false,
      projects: (projects ?? []).map(projectLink).filter(isLink),
      writing: (writing ?? []).map(articleLink).filter(isLink),
    }))
}

/** Now, as a decimal year, for the timeline's right edge (the build's date on a static page). */
export function nowYear(): number {
  const d = new Date()
  return d.getFullYear() + (d.getMonth() + 0.5) / 12
}
