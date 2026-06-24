import Image from "next/image";
import { getOrganization } from "@/lib/assoconnect";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function testDatabase(): Promise<{ ok: boolean; tables: string[] }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_tables");
    if (error) throw error;
    return { ok: true, tables: data?.map((r: { table_name: string }) => r.table_name) ?? [] };
  } catch {
    return { ok: false, tables: [] };
  }
}

async function testApi(): Promise<{ ok: boolean; platformName: string | null }> {
  try {
    const org = await getOrganization();
    return { ok: true, platformName: org.name };
  } catch {
    return { ok: false, platformName: null };
  }
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: "#e6f9f2", color: "#00875a" }}
    >
      <span className="text-base leading-none">✓</span> Connecté
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
    >
      <span className="text-base leading-none">✗</span> Erreur
    </span>
  );
}

export default async function Home() {
  const [db, api] = await Promise.all([testDatabase(), testApi()]);

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center gap-4">
        <Image src="/mascot.png" alt="Mascot" width={48} height={48} priority className="rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Padawan Delphine is ready</h1>
          <p className="text-gray-500 text-sm mt-0.5">Tableau de bord de l&apos;atelier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Base de données</p>
            <p className="font-semibold text-gray-900">Connexion Supabase</p>
            {db.ok && (
              <p className="text-sm text-gray-500 mt-1">
                {db.tables.length} table{db.tables.length > 1 ? "s" : ""}
                {db.tables.length > 0 && (
                  <span className="ml-1 opacity-70">
                    ({db.tables.slice(0, 3).join(", ")}{db.tables.length > 3 ? "…" : ""})
                  </span>
                )}
              </p>
            )}
          </div>
          <StatusBadge ok={db.ok} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">API</p>
            <p className="font-semibold text-gray-900">Connexion AssoConnect</p>
            {api.ok && api.platformName && (
              <p className="text-sm text-gray-500 mt-1">{api.platformName}</p>
            )}
          </div>
          <StatusBadge ok={api.ok} />
        </div>
      </div>
    </main>
  );
}
