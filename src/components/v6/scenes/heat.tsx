'use client'

import { B, driver, type Impact } from '../armed'
import { Shot, type Rect } from '../shot'

/* 06 HEAT: the real thermal input, enhanced ×3 on the beat. */

const IMPACTS: Impact[] = [
  { t: 0, k: 0.6, flash: 0.4, ghost: 0.8 },
  { t: B, k: 0.45, flash: 0.2 },
  { t: 2 * B, k: 0.3 },
]
const CROP: Rect = [800, 120, 1040, 840]

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const tag = root.querySelector<HTMLElement>('.s06-tag')!
  // the raw sensor frame slams in, blocky
  tl.fromTo(
    '.s06-plate',
    { scale: 1.22, filter: 'blur(16px)' },
    { scale: 1, filter: 'blur(0px)', duration: 0.16, ease: 'expo.out' },
    0
  )
  tl.fromTo(
    '.s06-no',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.2, ease: 'expo.out' },
    0.02
  )
  tl.fromTo(
    '.s06-title .w',
    { yPercent: 115 },
    { yPercent: 0, duration: 0.28, ease: 'expo.out', stagger: 0.05 },
    0.03
  )
  // enhance: a scan sweeps the ×3 output across the input
  tl.fromTo(
    '.s06-hi',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.2, ease: 'power2.inOut' },
    B
  )
  tl.fromTo(
    '.s06-scan',
    { x: 0, opacity: 1 },
    { x: 996, duration: 0.2, ease: 'power2.inOut' },
    B
  )
  tl.to('.s06-scan', { opacity: 0, duration: 0.05, ease: 'none' }, B + 0.2)
  tl.fromTo(
    '.s06-x',
    { opacity: 0, scale: 1.8, filter: 'blur(20px)' },
    {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.18,
      ease: 'expo.out',
    },
    B
  )
  tl.fromTo(
    '.s06-r3',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.22, ease: 'expo.out' },
    B + 0.08
  )
  // the ladder, on eighths; the plate splits input against output
  tl.fromTo(
    '.s06-r2',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.2, ease: 'expo.out' },
    2 * B
  )
  tl.fromTo(
    '.s06-r4',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.2, ease: 'expo.out' },
    2.5 * B
  )
  tl.fromTo(
    '.s06-hi',
    { clipPath: 'inset(0 0% 0 0%)' },
    {
      clipPath: 'inset(0 0% 0 50%)',
      duration: 0.18,
      ease: 'power3.out',
      immediateRender: false,
    },
    2 * B
  )
  tl.fromTo(
    '.s06-scan',
    { x: 996, opacity: 0 },
    {
      x: 498,
      opacity: 1,
      duration: 0.18,
      ease: 'power3.out',
      immediateRender: false,
    },
    2 * B
  )
  // the deployment, and the output takes the whole plate back
  tl.fromTo(
    '.s06-how',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.22, ease: 'expo.out' },
    3 * B
  )
  tl.to(
    '.s06-hi',
    { clipPath: 'inset(0 0% 0 0%)', duration: 0.2, ease: 'power3.inOut' },
    3 * B
  )
  tl.to('.s06-scan', { x: 0, duration: 0.2, ease: 'power3.inOut' }, 3 * B)
  tl.to('.s06-scan', { opacity: 0, duration: 0.05, ease: 'none' }, 3 * B + 0.2)
  const swap = driver((l) => {
    const enhanced = l >= B
    const split = l >= 2 * B && l < 3 * B
    tag.innerHTML = split
      ? '<b>IN</b> input · <b>×3</b> output'
      : enhanced
        ? '<b>×3</b> Enhanced output'
        : '<b>IN</b> Low-res input'
  })
  tl.fromTo(swap, { p: 0 }, { p: 4 * B, duration: 4 * B, ease: 'none' }, 0)
  tl.fromTo(
    '.s06-tag',
    { scale: 1.35 },
    { scale: 1, duration: 0.2, ease: 'back.out(2.4)', immediateRender: false },
    B
  )
}

export function HeatShot({
  label,
  replay,
}: {
  label: string
  replay?: string
}) {
  return (
    <Shot
      scene="s06"
      label={label}
      impacts={IMPACTS}
      build={build}
      crop={CROP}
      replay={replay}
    >
      <div className="m s06-no">06 · Heat</div>
      <div className="s06-title">
        <span className="ln">
          <span className="w">Thermal</span>
        </span>
        <span className="ln">
          <span className="w">
            <em>super</em>-resolution
          </span>
        </span>
      </div>
      <div className="fig s06-x">×3</div>
      <div className="m s06-row s06-r2">
        <b>×2</b>34.2 dB · 0.840
      </div>
      <div className="m s06-row on s06-r3">
        <b>×3</b>31.0 dB PSNR · 0.757 SSIM
      </div>
      <div className="m s06-row s06-r4">
        <b>×4</b>29.6 dB · 0.713
      </div>
      <div className="m s06-how">
        IMDN · single channel
        <br />
        FP16 · INT8 on NVIDIA Jetson
      </div>
      <div className="s06-plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          className="s06-low"
          src="/images/v6/thermal-low.webp"
          alt=""
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          className="s06-hi"
          src="/images/v6/thermal-x3.webp"
          alt=""
        />
        <div className="s06-scan" />
        <div className="s06-tag">
          <b>IN</b> Low-res input
        </div>
      </div>
    </Shot>
  )
}
