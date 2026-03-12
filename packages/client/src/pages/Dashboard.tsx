import type { ContentType, ContentEntry } from "@cms/shared";
import { useFetch } from "../hooks/useFetch";

export function Dashboard() {
  const { data: contentTypes } = useFetch<ContentType[]>("/content-types");
  const { data: entries } = useFetch<ContentEntry[]>("/entries");

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Content Types" value={contentTypes?.length ?? 0} />
        <StatCard label="Entries" value={entries?.length ?? 0} />
        <StatCard
          label="Published"
          value={entries?.filter((e) => e.status === "published").length ?? 0}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
