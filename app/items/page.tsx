import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ItemsPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("items_master")
    .select("*")
    .eq("is_active", true)
    .order("item_name", { ascending: true });

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Items</h1>
        <p className="text-sm text-gray-600">Reusable quotation items.</p>
      </div>

      <div className="rounded-2xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Default Price</th>
                <th className="px-3 py-3">Category</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-3 py-3">{item.item_code || "-"}</td>
                  <td className="px-3 py-3">{item.item_name}</td>
                  <td className="px-3 py-3">{item.unit}</td>
                  <td className="px-3 py-3">
                    {formatCurrency(Number(item.default_price))}
                  </td>
                  <td className="px-3 py-3">{item.category || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
