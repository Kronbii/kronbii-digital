import { Diagram, hasDiagram } from '@/components/authority/diagrams'

import './figures.css'

/*
 * A project with no photograph and no scene of its own opens on its
 * architecture: the record's diagram, set in Sage on the dark page, its
 * steps coming into focus one after another.
 */

export function HeroDiagram({
  id,
  caption,
  alt,
}: {
  id: string
  caption: string
  alt: string
}) {
  if (!hasDiagram(id)) return null
  return (
    <div className="vn-diagram-plate">
      <Diagram id={id} caption={caption} alt={alt} />
    </div>
  )
}

export { hasDiagram }
