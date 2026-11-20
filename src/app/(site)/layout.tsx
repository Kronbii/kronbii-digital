import {
  Bricolage_Grotesque,
  Newsreader,
  Spline_Sans_Mono,
} from 'next/font/google'
import Link from 'next/link'

import '@/components/v6/scenes.css'
import '@/components/v7/v7.css'
import { NavTrail } from '@/components/vneo/back'
import { Cursor } from '@/components/vneo/cursor'
import { RaMark } from '@/components/vneo/emblem'
import { Lens } from '@/components/vneo/lens'
import { Menu } from '@/components/vneo/menu'
import { Sound } from '@/components/vneo/sound'
import '@/components/vneo/vneo.css'
import { HOME, vneoChrome } from '@/content/vneo/site'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-v7-display',
  axes: ['opsz'],
})
const serif = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-v7-serif',
  style: ['italic'],
  // its first words are below the fold: no preload, so the first screen's downloads go first
  preload: false,
})
const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-v7-mono',
})

/**
 * The site (Vneo): v7's Sage system (data-v7) carrying what every version
 * contributed (data-vneo), around every page at the root.
 */
export default function VneoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      data-v7=""
      data-vneo=""
      data-lenis-prevent=""
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
    >
      <a className="v7-skip" href="#v7-main">
        {vneoChrome.skip}
      </a>
      <header className="v7-top">
        <Link
          href={HOME}
          className="v7-brand vn-brand"
          aria-label={`${vneoChrome.brand}, home`}
        >
          <RaMark />
        </Link>
        <nav className="v7-nav" aria-label="Primary">
          {vneoChrome.nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Sound />
        <Menu />
      </header>
      <main id="v7-main">{children}</main>
      <footer className="v7-footer">
        <nav className="vn-footer-nav" aria-label="Site">
          {vneoChrome.footer.links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <p>{vneoChrome.footer.copyright}</p>
      </footer>
      <NavTrail />
      <Lens />
      <Cursor />
    </div>
  )
}
