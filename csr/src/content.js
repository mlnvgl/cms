/**
 * Loads all .md files from /content and parses frontmatter.
 * Returns an array of { slug, title, body } objects.
 */

const modules = import.meta.glob('/content/*.md', { eager: true })

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta = {}
  match[1].split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':')
    if (key) meta[key.trim()] = rest.join(':').trim()
  })

  return { meta, body: match[2].trim() }
}

const pages = Object.entries(modules).map(([path, mod]) => {
  const raw = mod.default
  const { meta, body } = parseFrontmatter(raw)
  const filename = path.split('/').pop().replace('.md', '')

  return {
    slug: meta.slug || filename,
    title: meta.title || filename,
    body,
  }
})

export function getPages() {
  return pages
}

export function getPageBySlug(slug) {
  return pages.find((p) => p.slug === slug) || null
}
