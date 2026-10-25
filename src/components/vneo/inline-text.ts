/*
 * Inline links in an article's paragraphs, written as [label](/path) or
 * [label](https://…). The reader shows them as links; everything else that
 * reads the text (metadata, JSON-LD, RSS descriptions, word counts) keeps
 * only the label.
 */

const LINK = /\[([^\]\n]+)\]\(((?:\/|https?:\/\/|mailto:)[^)\s]*)\)/g

export type InlinePart = string | { label: string; href: string }

/** The text split into plain runs and links. */
export function inlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = []
  let at = 0
  for (const m of text.matchAll(LINK)) {
    if (m.index > at) parts.push(text.slice(at, m.index))
    parts.push({ label: m[1], href: m[2] })
    at = m.index + m[0].length
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}

/** The text with every [label](href) reduced to its label. */
export const plainText = (text: string) => text.replace(LINK, '$1')
