---
title: About
slug: about
---

# About This Project

This is a minimal CMS scaffold. Content is authored as Markdown files in the `content/` directory.

Each file uses **frontmatter** for metadata and standard Markdown for the body.

## How It Works

1. Markdown files are imported via Vite's `import.meta.glob`
2. Frontmatter is parsed for metadata (title, slug)
3. The body is rendered with `react-markdown`
4. `react-router-dom` handles client-side navigation
