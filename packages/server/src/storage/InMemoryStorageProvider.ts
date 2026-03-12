import type {
  StorageProvider,
  ContentType,
  ContentEntry,
} from "@cms/shared";

/**
 * Stores everything in Maps. Data is lost when the process restarts.
 * Useful for development and testing.
 */
export class InMemoryStorageProvider implements StorageProvider {
  readonly name = "memory";

  private contentTypes = new Map<string, ContentType>();
  private entries = new Map<string, ContentEntry>();

  async init(): Promise<void> {
    // nothing to initialise
  }

  // ── Content Types ──────────────────────────────────────────────

  async listContentTypes(): Promise<ContentType[]> {
    return Array.from(this.contentTypes.values());
  }

  async getContentType(id: string): Promise<ContentType | null> {
    return this.contentTypes.get(id) ?? null;
  }

  async createContentType(ct: ContentType): Promise<ContentType> {
    this.contentTypes.set(ct.id, ct);
    return ct;
  }

  async updateContentType(
    id: string,
    data: Partial<ContentType>,
  ): Promise<ContentType | null> {
    const existing = this.contentTypes.get(id);
    if (!existing) return null;

    const updated: ContentType = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.contentTypes.set(id, updated);
    return updated;
  }

  async deleteContentType(id: string): Promise<void> {
    this.contentTypes.delete(id);
  }

  // ── Entries ────────────────────────────────────────────────────

  async listEntries(contentTypeId?: string): Promise<ContentEntry[]> {
    const all = Array.from(this.entries.values());
    if (contentTypeId) {
      return all.filter((e) => e.contentTypeId === contentTypeId);
    }
    return all;
  }

  async getEntry(id: string): Promise<ContentEntry | null> {
    return this.entries.get(id) ?? null;
  }

  async createEntry(entry: ContentEntry): Promise<ContentEntry> {
    this.entries.set(entry.id, entry);
    return entry;
  }

  async updateEntry(
    id: string,
    data: Partial<ContentEntry>,
  ): Promise<ContentEntry | null> {
    const existing = this.entries.get(id);
    if (!existing) return null;

    const updated: ContentEntry = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  async deleteEntry(id: string): Promise<void> {
    this.entries.delete(id);
  }
}
