import type { StorageProvider } from "@cms/shared";
import { InMemoryStorageProvider } from "./InMemoryStorageProvider.js";
import { MarkdownStorageProvider } from "./MarkdownStorageProvider.js";

// ─── Provider registry ───────────────────────────────────────────

/**
 * Create a StorageProvider based on environment configuration.
 *
 * Set `STORAGE_PROVIDER` to choose the backend:
 *   - "memory"           → in-memory (default, data lost on restart)
 *   - "markdown-webdav"  → .md files on a WebDAV server (e.g. Nextcloud)
 */
export function createStorageProvider(): StorageProvider {
  const kind = process.env.STORAGE_PROVIDER ?? "memory";

  switch (kind) {
    case "memory":
      return new InMemoryStorageProvider();

    case "markdown-webdav":
      return new MarkdownStorageProvider({
        url: requireEnv("WEBDAV_URL"),
        username: requireEnv("WEBDAV_USERNAME"),
        password: requireEnv("WEBDAV_PASSWORD"),
        basePath: process.env.WEBDAV_BASE_PATH,
      });

    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${kind}". ` +
          `Valid options: memory, markdown-webdav`,
      );
  }
}

// ─── Singleton ───────────────────────────────────────────────────

let _provider: StorageProvider | null = null;

/** Get the current (already-initialised) storage provider. */
export function getStorage(): StorageProvider {
  if (!_provider) {
    throw new Error(
      "Storage provider not initialised. Call initStorage() first.",
    );
  }
  return _provider;
}

/** Create and initialise the storage provider. Call once at startup. */
export async function initStorage(): Promise<StorageProvider> {
  _provider = createStorageProvider();
  await _provider.init();
  console.log(`[storage] using provider: ${_provider.name}`);
  return _provider;
}

// ─── Helpers ─────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `Environment variable ${name} is required for the selected storage provider.`,
    );
  }
  return val;
}
