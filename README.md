# CMS

A headless content management system built as an npm-workspaces monorepo.

## Tech Stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router |
| Backend  | Express 5, Node.js                      |
| Storage  | Pluggable — in-memory or Markdown/WebDAV (Nextcloud) |
| Language | TypeScript throughout                   |
| Monorepo | npm workspaces                          |

## Project Structure

```
packages/
  shared/     # Shared TypeScript types + StorageProvider interface
  server/     # Express REST API
  │ src/
  │   storage/
  │     index.ts                     # Factory + singleton
  │     InMemoryStorageProvider.ts    # Maps-based (dev/test)
  │     MarkdownStorageProvider.ts    # .md files over WebDAV
  │   controllers/                   # Use getStorage() — never touch a DB directly
  │   routes/
  client/     # React + Vite admin UI (pages, components, hooks)
```

## Getting Started

```bash
# Install all dependencies
npm install

# Start both server (port 4000) and client (port 5173)
npm run dev
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

By default the server uses the **in-memory** storage provider. To switch to **Markdown + WebDAV** (e.g. Nextcloud):

```bash
cp .env.example .env
# Then edit .env:
STORAGE_PROVIDER=markdown-webdav
WEBDAV_URL=https://your-nextcloud.example.com/remote.php/dav/files/username
WEBDAV_USERNAME=your-username
WEBDAV_PASSWORD=your-app-password
WEBDAV_BASE_PATH=/cms-content
```

## Storage Providers

The server uses a **strategy pattern** — all data access goes through the `StorageProvider` interface (`packages/shared/src/index.ts`). Switch providers via `STORAGE_PROVIDER` env var.

| Provider          | Env value          | Description                                                    |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| In-memory         | `memory`           | Default. Data lost on restart. Good for dev/test.              |
| Markdown + WebDAV | `markdown-webdav`  | `.md` files with YAML frontmatter stored on a WebDAV server.   |

To add a new provider (e.g. Postgres), implement `StorageProvider` and register it in `packages/server/src/storage/index.ts`.

### Markdown file layout on WebDAV

```
<WEBDAV_BASE_PATH>/
  content-types/
    <id>.md       # frontmatter: id, name, slug, fields, timestamps
  entries/
    <id>.md       # frontmatter: id, contentTypeId, status, fields, timestamps
                  # body: richtext "body" field (if present)
```

## API Endpoints

| Method | Path                      | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/health`             | Health check            |
| GET    | `/api/content-types`      | List content types      |
| POST   | `/api/content-types`      | Create a content type   |
| GET    | `/api/content-types/:id`  | Get a content type      |
| PUT    | `/api/content-types/:id`  | Update a content type   |
| DELETE | `/api/content-types/:id`  | Delete a content type   |
| GET    | `/api/entries`            | List entries            |
| POST   | `/api/entries`            | Create an entry         |
| GET    | `/api/entries/:id`        | Get an entry            |
| PUT    | `/api/entries/:id`        | Update an entry         |
| DELETE | `/api/entries/:id`        | Delete an entry         |
| POST   | `/api/auth/login`         | Login (stub)            |
| GET    | `/api/auth/me`            | Current user (stub)     |

## What's Stubbed / Next Steps

- **Database provider**: Implement `StorageProvider` backed by Postgres/SQLite/MongoDB.
- **Auth**: Login and `/me` return hardcoded data. Add JWT or session-based auth.
- **Validation**: Add request validation (e.g. Zod) on the server.
- **Rich UI**: Wire up the "New Type" / "New Entry" buttons to forms.
- **Media uploads**: Add a `/api/media` endpoint and file storage.
