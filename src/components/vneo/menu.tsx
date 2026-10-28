'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { HOME, vneoChrome } from '@/content/vneo/site'

import { PHONE } from './use-phone'

/*
 * The top bar's links on a phone, where they don't fit across: two lines that
 * cross into an ×, and a sheet under the bar with every link set large, each
 * numbered like a slate. A link, the ×, or Escape closes it; while it is open
 * the page behind holds still and can't be reached. Above phone width neither
 * is drawn, and the bar is the one it always was.
 */
export function Menu() {
  const path = usePathname()
  // the page it was opened on: moving to another page closes it
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === path
  const button = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const behind = [
      document.getElementById('v7-main'),
      document.querySelector<HTMLElement>('.v7-footer'),
    ]
    root.style.overflow = 'hidden'
    behind.forEach((el) => el && (el.inert = true))
    sheet.current?.querySelector('a')?.focus({ preventScroll: true })
    const close = () => setOpenOn(null)
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      button.current?.focus()
    }
    // turned to a width that has the full bar
    const mq = matchMedia(PHONE)
    const wide = () => !mq.matches && close()
    document.addEventListener('keydown', key)
    mq.addEventListener('change', wide)
    return () => {
      root.style.overflow = ''
      behind.forEach((el) => el && (el.inert = false))
      document.removeEventListener('keydown', key)
      mq.removeEventListener('change', wide)
    }
  }, [open])

  return (
    <>
      <button
        ref={button}
        type="button"
        className="vn-burger"
        aria-expanded={open}
        aria-controls="vn-menu"
        aria-label={open ? vneoChrome.menu.close : vneoChrome.menu.open}
        onClick={() => setOpenOn(open ? null : path)}
      >
        <i />
        <i />
      </button>
      <div
        ref={sheet}
        id="vn-menu"
        className="vn-menu"
        data-open={open ? '' : undefined}
      >
        <nav aria-label="Primary">
          <ol>
            {vneoChrome.nav.map((n, i) => (
              <li key={n.href} style={{ '--i': i } as React.CSSProperties}>
                <Link
                  href={n.href}
                  aria-current={
                    !n.href.includes('#') &&
                    n.href !== HOME &&
                    (path === n.href || path.startsWith(`${n.href}/`))
                      ? 'page'
                      : undefined
                  }
                  onClick={() => setOpenOn(null)}
                >
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {n.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <p className="vn-menu-foot">{vneoChrome.footer.copyright}</p>
      </div>
    </>
  )
}
