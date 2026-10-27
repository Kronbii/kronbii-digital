'use client'

import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import { type ReactNode, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * StickyScroll — Aceternity UI `sticky-scroll-reveal`, adapted.
 *
 * Original: https://ui.aceternity.com/components/sticky-scroll-reveal
 * Installed via `npx shadcn@latest add @aceternity/sticky-scroll-reveal`.
 *
 * The mechanism is unchanged: one pinned pane whose contents swap as scroll
 * progress crosses each item's breakpoint, so every visual lands in the same
 * place instead of scrolling past. Edits made against the original:
 *
 *  1. Page scroll instead of a nested scroller. The original scrolls an inner
 *     `overflow-y-auto` box of fixed `h-[30rem]`, which would fight Lenis and
 *     trap the wheel. Switched to `target: ref` — the option its own comment
 *     points at — so the section is driven by the page.
 *  2. Media slides rather than swaps. The original replaces
 *     `content[activeCard].content` outright. Here every pane is stacked into
 *     one strip that translates inside a clipped frame, so the outgoing image
 *     is pushed up and out while the next one scrolls into the same rectangle.
 *     Motion is scroll-linked with a dwell plateau per item, so each image
 *     rests while its paragraph is read and only travels at the handover.
 *  3. Breakpoints centred: `(i + 0.5) / n` rather than `i / n`, so every item
 *     owns an equal share of the scroll instead of the first and last owning
 *     half a share each.
 *  4. Tokens instead of hardcoded slate/gradient values.
 *  5. Media on the left, text on the right, matching the supplied reference.
 *  6. Typed — the original used `any` for the ref and the content node.
 */

export interface StickyScrollItem {
  title: string
  description: string
  eyebrow?: string
  meta?: { label: string; value: string }[]
  content?: ReactNode
}

export function StickyScroll({
  content,
  contentClassName,
  className,
}: {
  content: StickyScrollItem[]
  contentClassName?: string
  className?: string
}) {
  const [activeCard, setActiveCard] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end center'],
  })

  const cardLength = content.length

  // The strip rests on each image, then travels one frame-height at the
  // handover. `MOVE` is the share of each item's scroll segment spent moving;
  // the rest is dwell. Stops and values are built as a matched pair so the
  // interpolation is a sequence of plateaus joined by slides.
  const MOVE = 0.35
  const stops: number[] = []
  const offsets: number[] = []
  for (let i = 0; i < cardLength; i += 1) {
    stops.push(i / cardLength)
    offsets.push(-i)
    if (i < cardLength - 1) {
      stops.push((i + 1) / cardLength - MOVE / cardLength)
      offsets.push(-i)
    }
  }
  stops.push(1)
  offsets.push(-(cardLength - 1))

  const stripOffset = useTransform(scrollYProgress, stops, offsets, {
    ease: cubicBezier(0.65, 0, 0.35, 1),
  })
  // Percentages resolve against the strip's own box, which is sized to the
  // frame — so -100% is exactly one image.
  const stripY = useTransform(stripOffset, (value) => `${value * 100}%`)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const cardsBreakpoints = content.map(
      (_, index) => (index + 0.5) / cardLength
    )
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint)
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index
        }
        return acc
      },
      0
    )
    setActiveCard(closestBreakpointIndex)
  })

  return (
    <div
      ref={ref}
      className={cn(
        'relative grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20',
        className
      )}
    >
      {/* LEFT — the pinned frame. Every pane occupies this exact rectangle. */}
      <div className="hidden lg:block">
        <div
          className={cn(
            'sticky top-24 h-[min(62svh,34rem)] w-full overflow-hidden rounded-sm border border-border bg-surface',
            contentClassName
          )}
        >
          <motion.div className="absolute inset-0" style={{ y: stripY }}>
            {content.map((item, index) => (
              <div
                key={item.title}
                className="absolute left-0 h-full w-full"
                style={{ top: `${index * 100}%` }}
                aria-hidden={activeCard !== index}
              >
                {item.content ?? null}
              </div>
            ))}
          </motion.div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-foreground/70 mix-blend-difference">
              {String(activeCard + 1).padStart(2, '0')} /{' '}
              {String(cardLength).padStart(2, '0')}
            </span>
            <span className="flex gap-1.5">
              {content.map((item, index) => (
                <span
                  key={item.title}
                  className={cn(
                    'h-px w-6 transition-colors duration-base',
                    activeCard === index ? 'bg-foreground' : 'bg-foreground/25'
                  )}
                />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT — the scrolling text. Inactive blocks dim, as in the original. */}
      <div>
        {content.map((item, index) => (
          <div key={item.title} className="py-[18vh] first:pt-0">
            <motion.div
              initial={false}
              animate={{ opacity: activeCard === index ? 1 : 0.3 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mobile has no pinned frame, so the visual rides inline. */}
              <div className="relative mb-8 h-[52svh] w-full overflow-hidden rounded-sm border border-border bg-surface lg:hidden">
                {item.content ?? null}
              </div>

              {item.eyebrow ? (
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.eyebrow}
                </p>
              ) : null}

              <h3 className="mt-4 text-4xl leading-[0.95] tracking-tight sm:text-5xl">
                {item.title}
              </h3>

              <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.description}
              </p>

              {item.meta?.length ? (
                <dl className="mt-10">
                  {item.meta.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[minmax(0,9rem)_1fr] gap-4 border-t border-border py-4"
                    >
                      <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="text-sm text-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
