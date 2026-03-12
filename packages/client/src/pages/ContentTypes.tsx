import type { ContentType } from "@cms/shared";
import { useFetch } from "../hooks/useFetch";

export function ContentTypes() {
  const { data, loading, error } = useFetch<ContentType[]>("/content-types");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Content Types</h2>
        <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          + New Type
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && data.length === 0 && (
        <p className="text-gray-500">
          No content types yet. Create one to get started.
        </p>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fields
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((ct) => (
                <tr key={ct.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{ct.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ct.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ct.fields.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
