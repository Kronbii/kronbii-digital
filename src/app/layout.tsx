import type { Metadata, Viewport } from 'next'

import { StructuredData } from '@/components/structured-data'
import { siteConfig } from '@/lib/site'
import '@/styles/globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d0c',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: '/images/vneo/rami-kronbi-card.jpg',
        width: 1200,
        height: 630,
        alt: 'Rami Kronbi, robotics, vision & embedded systems engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/images/vneo/rami-kronbi-card.jpg'],
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      { rel: 'icon', url: '/icons/icon-192.png', sizes: '192x192' },
      { rel: 'icon', url: '/icons/icon-512.png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  // let search show a large preview image (the portrait), not just a thumbnail
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'NYZnC5C68zUWoECvjepE8pdOfwlGSfp6V1siItS1Ss4',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StructuredData />
        <div className="min-h-svh bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
