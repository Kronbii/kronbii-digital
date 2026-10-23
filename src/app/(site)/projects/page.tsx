import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/v2/json-ld'
import { liveCrumbs, collectionJsonLd } from '@/components/v2/schema'
import { BackButton } from '@/components/vneo/back'
import { pageMeta } from '@/components/vneo/meta'
import { ProjectGrid, type GridItem } from '@/components/vneo/project-grid'
import { projectImages } from '@/content/v2/record'
import { fields } from '@/content/v3/work'
import {
  HOME,
  VN,
  racePhoto,
  workHref,
  works,
} from '@/content/vneo/site'

const copy = {
  title: 'Projects',
  description:
    'Every project Rami Kronbi has published: robots and drones, vision and AI, health, civic, open-source work, and tools, each in one plain sentence with one fact to check.',
  lede: (n: number) =>
    `${n} projects. Each in a sentence, with the one fact you can check; the whole story is a click away.`,
  all: 'All',
}

export const metadata: Metadata = pageMeta({
  path: '/projects',
  title: 'Projects — Rami Kronbi',
  description: copy.description,
})

export default function VneoProjects() {
  const items: GridItem[] = works
    .map(({ project: p, plain }) => {
      const raw =
        plain.image ?? projectImages(p).find((m) => !/\.(gif|svg)$/.test(m.src))
      const img = raw ? racePhoto(raw) : undefined
      return {
        slug: p.slug,
        title: p.title.split(' — ')[0],
        kind: plain.kind,
        line: plain.line,
        proof: plain.proof,
        field: plain.field,
        href: workHref(p.slug, VN),
        image: img
          ? {
              src: img.src,
              position: plain.image?.position,
              contain: /sign-|schematic|\.png$/.test(img.src),
            }
          : undefined,
      }
    })
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd({
            path: '/projects',
            name: 'Projects',
            description: copy.description,
            projects: works.map((w) => w.project),
          }),
          liveCrumbs([
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
          ]),
        ]}
      />
      <section className="v7-index vn-index">
        <div className="vn-backbar">
          <BackButton fallback={HOME} label="Back" />
          <nav className="v7-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={HOME}>Home</Link>
              </li>
              <li aria-current="page">{copy.title}</li>
            </ol>
          </nav>
        </div>
        <h1 className="v7-index-title" data-lens="">
          {copy.title}
        </h1>
        <p className="v7-more-lede">{copy.lede(works.length)}</p>
        <ProjectGrid items={items} fields={fields} all={copy.all} />
      </section>
    </>
  )
}
