// ─── Content Types ───────────────────────────────────────────────

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldDefinition {
  name: string;
  key: string;
  type: FieldType;
  required: boolean;
  description?: string;
}

export type FieldType =
  | "text"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "image"
  | "reference";

// ─── Content Entries ─────────────────────────────────────────────

export interface ContentEntry {
  id: string;
  contentTypeId: string;
  fields: Record<string, unknown>;
  status: EntryStatus;
  createdAt: string;
  updatedAt: string;
}

export type EntryStatus = "draft" | "published" | "archived";

// ─── API Responses ───────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ─── Auth ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = "admin" | "editor" | "viewer";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// ─── Storage Provider ────────────────────────────────────────────

/**
 * Strategy interface for pluggable storage backends.
 *
 * Implementations must handle persistence for both ContentTypes and
 * ContentEntries. Each method is async to support I/O-bound backends
 * (filesystem, WebDAV, databases, etc.).
 */
export interface StorageProvider {
  /** Human-readable name shown in logs, e.g. "memory", "markdown-webdav" */
  readonly name: string;

  /** Called once at startup — create directories, connect to DB, etc. */
  init(): Promise<void>;

  // ── Content Types ────────────────────────────────────────────

  listContentTypes(): Promise<ContentType[]>;
  getContentType(id: string): Promise<ContentType | null>;
  createContentType(ct: ContentType): Promise<ContentType>;
  updateContentType(
    id: string,
    data: Partial<ContentType>,
  ): Promise<ContentType | null>;
  deleteContentType(id: string): Promise<void>;

  // ── Entries ──────────────────────────────────────────────────

  listEntries(contentTypeId?: string): Promise<ContentEntry[]>;
  getEntry(id: string): Promise<ContentEntry | null>;
  createEntry(entry: ContentEntry): Promise<ContentEntry>;
  updateEntry(
    id: string,
    data: Partial<ContentEntry>,
  ): Promise<ContentEntry | null>;
  deleteEntry(id: string): Promise<void>;
}
