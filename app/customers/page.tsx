import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("company_name", { ascending: true });

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-gray-600">Saved customer records.</p>
      </div>

      <div className="rounded-2xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Contact Person</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {(customers ?? []).map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="px-3 py-3">{customer.company_name}</td>
                  <td className="px-3 py-3">{customer.contact_person || "-"}</td>
                  <td className="px-3 py-3">{customer.email || "-"}</td>
                  <td className="px-3 py-3">{customer.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
