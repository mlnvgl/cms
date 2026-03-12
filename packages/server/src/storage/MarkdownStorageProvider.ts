import type {
  StorageProvider,
  ContentType,
  ContentEntry,
} from "@cms/shared";
import { createClient, type WebDAVClient } from "webdav";

// ─── Frontmatter helpers ─────────────────────────────────────────

/**
 * Serialise an object into a YAML-frontmatter markdown string.
 *
 * ```
 * ---
 * key: value
 * ---
 * <body>
 * ```
 */
function toMarkdown(
  meta: Record<string, unknown>,
  body: string = "",
): string {
  const yaml = Object.entries(meta)
    .map(([k, v]) => `${k}: ${formatYamlValue(v)}`)
    .join("\n");
  return `---\n${yaml}\n---\n${body}\n`;
}

function formatYamlValue(v: unknown): string {
  if (v === null || v === undefined) return '""';
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"')}"`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // arrays / objects → inline JSON (good enough for frontmatter)
  return `'${JSON.stringify(v)}'`;
}

/**
 * Parse a YAML-frontmatter markdown string back into { meta, body }.
 * Handles the simple subset we produce ourselves.
 */
function parseMarkdown(raw: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim();

    // Unwrap quoted strings
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = (value as string).slice(1, -1).replace(/\\"/g, '"');
    }
    // Unwrap single-quoted JSON
    else if (
      typeof value === "string" &&
      value.startsWith("'") &&
      value.endsWith("'")
    ) {
      try {
        value = JSON.parse((value as string).slice(1, -1));
      } catch {
        value = (value as string).slice(1, -1);
      }
    }
    // Booleans
    else if (value === "true") value = true;
    else if (value === "false") value = false;
    // Numbers
    else if (!isNaN(Number(value)) && value !== "") value = Number(value);

    meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

// ─── Provider ────────────────────────────────────────────────────

export interface MarkdownStorageOptions {
  /** Full WebDAV URL, e.g. https://cloud.example.com/remote.php/dav/files/user */
  url: string;
  /** WebDAV / Nextcloud username */
  username: string;
  /** WebDAV / Nextcloud password or app-token */
  password: string;
  /** Base directory inside the WebDAV root, e.g. "/cms-content" */
  basePath?: string;
}

/**
 * Persists ContentTypes and Entries as `.md` files over WebDAV.
 *
 * Directory layout on the remote:
 * ```
 * <basePath>/
 *   content-types/
 *     <id>.md          # frontmatter = ContentType fields
 *   entries/
 *     <id>.md          # frontmatter = entry metadata, body = richtext body (if any)
 * ```
 */
export class MarkdownStorageProvider implements StorageProvider {
  readonly name = "markdown-webdav";

  private client: WebDAVClient;
  private basePath: string;

  constructor(opts: MarkdownStorageOptions) {
    this.client = createClient(opts.url, {
      username: opts.username,
      password: opts.password,
    });
    this.basePath = (opts.basePath ?? "/cms-content").replace(/\/+$/, "");
  }

  async init(): Promise<void> {
    // Ensure base directories exist (WebDAV MKCOL)
    await this.ensureDir(this.basePath);
    await this.ensureDir(`${this.basePath}/content-types`);
    await this.ensureDir(`${this.basePath}/entries`);
  }

  // ── Content Types ──────────────────────────────────────────────

  async listContentTypes(): Promise<ContentType[]> {
    return this.listMarkdownFiles<ContentType>(
      `${this.basePath}/content-types`,
      this.parseContentType,
    );
  }

  async getContentType(id: string): Promise<ContentType | null> {
    return this.readFile<ContentType>(
      `${this.basePath}/content-types/${id}.md`,
      this.parseContentType,
    );
  }

  async createContentType(ct: ContentType): Promise<ContentType> {
    const md = toMarkdown({
      id: ct.id,
      name: ct.name,
      slug: ct.slug,
      fields: ct.fields,
      createdAt: ct.createdAt,
      updatedAt: ct.updatedAt,
    });
    await this.client.putFileContents(
      `${this.basePath}/content-types/${ct.id}.md`,
      md,
      { overwrite: true },
    );
    return ct;
  }

  async updateContentType(
    id: string,
    data: Partial<ContentType>,
  ): Promise<ContentType | null> {
    const existing = await this.getContentType(id);
    if (!existing) return null;

    const updated: ContentType = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    await this.createContentType(updated);
    return updated;
  }

  async deleteContentType(id: string): Promise<void> {
    await this.deleteFile(`${this.basePath}/content-types/${id}.md`);
  }

  // ── Entries ────────────────────────────────────────────────────

  async listEntries(contentTypeId?: string): Promise<ContentEntry[]> {
    const all = await this.listMarkdownFiles<ContentEntry>(
      `${this.basePath}/entries`,
      this.parseEntry,
    );
    if (contentTypeId) {
      return all.filter((e) => e.contentTypeId === contentTypeId);
    }
    return all;
  }

  async getEntry(id: string): Promise<ContentEntry | null> {
    return this.readFile<ContentEntry>(
      `${this.basePath}/entries/${id}.md`,
      this.parseEntry,
    );
  }

  async createEntry(entry: ContentEntry): Promise<ContentEntry> {
    // If there's a richtext/body field, put it in the markdown body
    const body =
      typeof entry.fields.body === "string" ? entry.fields.body : "";
    const fieldsWithoutBody = { ...entry.fields };
    delete fieldsWithoutBody.body;

    const md = toMarkdown(
      {
        id: entry.id,
        contentTypeId: entry.contentTypeId,
        status: entry.status,
        fields: fieldsWithoutBody,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
      body,
    );
    await this.client.putFileContents(
      `${this.basePath}/entries/${entry.id}.md`,
      md,
      { overwrite: true },
    );
    return entry;
  }

  async updateEntry(
    id: string,
    data: Partial<ContentEntry>,
  ): Promise<ContentEntry | null> {
    const existing = await this.getEntry(id);
    if (!existing) return null;

    const updated: ContentEntry = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    await this.createEntry(updated);
    return updated;
  }

  async deleteEntry(id: string): Promise<void> {
    await this.deleteFile(`${this.basePath}/entries/${id}.md`);
  }

  // ── Private helpers ────────────────────────────────────────────

  private parseContentType(meta: Record<string, unknown>): ContentType {
    return {
      id: String(meta.id ?? ""),
      name: String(meta.name ?? ""),
      slug: String(meta.slug ?? ""),
      fields: Array.isArray(meta.fields) ? meta.fields : [],
      createdAt: String(meta.createdAt ?? ""),
      updatedAt: String(meta.updatedAt ?? ""),
    };
  }

  private parseEntry(
    meta: Record<string, unknown>,
    body: string,
  ): ContentEntry {
    const fields =
      typeof meta.fields === "object" && meta.fields !== null
        ? (meta.fields as Record<string, unknown>)
        : {};
    if (body) fields.body = body;

    return {
      id: String(meta.id ?? ""),
      contentTypeId: String(meta.contentTypeId ?? ""),
      status: (meta.status as ContentEntry["status"]) ?? "draft",
      fields,
      createdAt: String(meta.createdAt ?? ""),
      updatedAt: String(meta.updatedAt ?? ""),
    };
  }

  private async ensureDir(path: string): Promise<void> {
    try {
      const exists = await this.client.exists(path);
      if (!exists) {
        await this.client.createDirectory(path);
      }
    } catch {
      // Best-effort: directory may already exist
      await this.client.createDirectory(path).catch(() => {});
    }
  }

  private async readFile<T>(
    path: string,
    parser: (meta: Record<string, unknown>, body: string) => T,
  ): Promise<T | null> {
    try {
      const exists = await this.client.exists(path);
      if (!exists) return null;

      const raw = (await this.client.getFileContents(path, {
        format: "text",
      })) as string;
      const { meta, body } = parseMarkdown(raw);
      return parser(meta, body);
    } catch {
      return null;
    }
  }

  private async listMarkdownFiles<T>(
    dirPath: string,
    parser: (meta: Record<string, unknown>, body: string) => T,
  ): Promise<T[]> {
    try {
      const items = await this.client.getDirectoryContents(dirPath, {
        deep: false,
      });
      const files = (Array.isArray(items) ? items : items.data).filter(
        (item: any) => item.basename.endsWith(".md"),
      );

      const results: T[] = [];
      for (const file of files) {
        const raw = (await this.client.getFileContents(file.filename, {
          format: "text",
        })) as string;
        const { meta, body } = parseMarkdown(raw);
        results.push(parser(meta, body));
      }
      return results;
    } catch {
      return [];
    }
  }

  private async deleteFile(path: string): Promise<void> {
    try {
      const exists = await this.client.exists(path);
      if (exists) {
        await this.client.deleteFile(path);
      }
    } catch {
      // already gone or never existed — fine
    }
  }
}
