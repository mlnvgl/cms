const express = require('express')
const path = require('path')
const fs = require('fs')
const matter = require('gray-matter')
const { marked } = require('marked')

const app = express()
const PORT = process.env.PORT || 3000
const CONTENT_DIR = path.join(__dirname, 'content')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

/**
 * Read all .md files and return an array of { slug, title }.
 * Used to build the navigation on every page.
 */
function getAllPages() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8')
    const { data } = matter(raw)
    const filename = file.replace('.md', '')
    return {
      slug: data.slug || filename,
      title: data.title || filename,
    }
  })
}

/**
 * Read a single .md file by slug and return { title, slug, html }.
 * Returns null if the file doesn't exist.
 */
function getPageBySlug(slug) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const html = marked(content)

  return {
    slug: data.slug || slug,
    title: data.title || slug,
    html,
  }
}

// Redirect root to /home
app.get('/', (req, res) => {
  res.redirect('/home')
})

// Render a page by slug
app.get('/:slug', (req, res) => {
  const page = getPageBySlug(req.params.slug)
  if (!page) {
    return res.status(404).render('page', {
      nav: getAllPages(),
      title: '404',
      content: '<h1>404</h1><p>Page not found.</p>',
    })
  }

  res.render('page', {
    nav: getAllPages(),
    title: page.title,
    content: page.html,
  })
})

app.listen(PORT, () => {
  console.log(`SSR CMS running at http://localhost:${PORT}`)
})
