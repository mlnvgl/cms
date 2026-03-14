---
title: About
slug: about
---

# About This Project

This is a minimal SSR CMS scaffold. Content is authored as Markdown files in the `content/` directory.

Each file uses **frontmatter** for metadata and standard Markdown for the body.

## How It Works

1. Express receives a request for `/:slug`
2. The server reads the matching `.md` file from disk
3. `gray-matter` parses frontmatter, `marked` converts body to HTML
4. EJS renders the final page with layout, nav, and content
5. Full HTML is sent to the client -- no client-side JS needed
