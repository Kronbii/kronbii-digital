import {
  Bricolage_Grotesque,
  Newsreader,
  Spline_Sans_Mono,
} from 'next/font/google'
import Link from 'next/link'

import { Intro } from '@/components/v2/intro/intro'
import '@/components/v6/scenes.css'
import '@/components/v7/v7.css'
import { NavTrail } from '@/components/vneo/back'
import { Cursor } from '@/components/vneo/cursor'
import { RaMark } from '@/components/vneo/emblem'
import { Lens } from '@/components/vneo/lens'
import { Menu } from '@/components/vneo/menu'
import { Sound } from '@/components/vneo/sound'
import '@/components/vneo/vneo.css'
import { HOME, VN, vneoChrome } from '@/content/vneo/site'

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

const COOKIE = 'vneo-intro'

// The preflight, once per tab (its key in sessionStorage), landing on the hero's name (#vneo-name). The
// drone it flies is preloaded by the home page itself, from the top of the document.
const introScript = `(function(){try{var r=document.currentScript.parentElement;var q=/[?&]intro(?:[=&]|$)/.test(location.search);var home=location.pathname.replace(/\\/$/,'')==='${VN}';var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=false;try{seen=sessionStorage.getItem('${COOKIE}')==='seen'}catch(e){}r.dataset.intro=q||(home&&!rm&&!seen)?'on':'off'}catch(e){}})()`

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
      data-intro-root=""
      data-intro-path={VN}
      data-intro-cookie={COOKIE}
      data-intro-name="vneo-name"
      data-lenis-prevent=""
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <a className="v7-skip" href="#v7-main">
        {vneoChrome.skip}
      </a>
      <Intro />
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
