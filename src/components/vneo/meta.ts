import type { Metadata } from 'next'

import { mediaSize } from '@/content/v2/media-size'
import { siteConfig } from '@/lib/site'

/** The site's sharing card: Rami's portrait beside the emblem and his name, in Sage. */
export const CARD = {
  src: '/images/vneo/rami-kronbi-card.jpg',
  alt: 'Rami Kronbi in profile beside his name and the Rā’ emblem: robotics, vision & embedded systems engineer.',
}

/**
 * Sharing crops: a page whose picture is a poor shape (portrait, a thin
 * panorama, a small square) or format (WebP) for a large link preview shares
 * a 1200×630 JPG made from it instead, kept beside the original.
 */
const OG_CROP: Record<string, string> = {
  '/images/authority/fpv-drone/build.jpg': '/images/authority/fpv-drone/og.jpg',
  '/images/authority/spherical-panorama/pano-on-band.jpg':
    '/images/authority/spherical-panorama/og.jpg',
  '/images/authority/smart-desk/night-pic.jpeg':
    '/images/authority/smart-desk/og.jpg',
  '/images/authority/thermal-super-resolution/x2-showcase.webp':
    '/images/authority/thermal-super-resolution/og.jpg',
  '/images/authority/thermal-super-resolution/x3-showcase.webp':
    '/images/authority/thermal-super-resolution/og-x3.jpg',
}

/** The image a page shares, with its size wherever it is known. */
function shareImage(image?: { src: string; alt: string }) {
  if (!image) return { ...CARD, width: 1200, height: 630 }
  const crop = OG_CROP[image.src]
  if (crop) return { src: crop, alt: image.alt, width: 1200, height: 630 }
  const size = mediaSize[image.src]
  return size ? { ...image, width: size[0], height: size[1] } : image
}

/**
 * A page's metadata: its own title and description, its canonical URL on
 * ramikronbi.com, and the same for sharing cards, whose image is the site's
 * card unless the page has its own.
 */
export function pageMeta({
  path,
  title,
  description,
  type = 'website',
  image,
  keywords,
}: {
  path: string
  title: string
  description: string
  type?: 'website' | 'article'
  image?: { src: string; alt: string }
  keywords?: string[]
}): Metadata {
  const url = `${siteConfig.url}${path === '/' ? '' : path}`
  const { src, ...card } = shareImage(image)
  const images = [{ url: `${siteConfig.url}${src}`, ...card }]
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      types: {
        'application/rss+xml': [
          { url: '/feed.xml', title: `Writing — ${siteConfig.name}` },
        ],
      },
    },
    keywords,
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: siteConfig.name,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
  }
}
