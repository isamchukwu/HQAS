import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome, {user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/quotes/new" className="rounded-2xl border p-5 shadow-sm">
          <h2 className="font-semibold">New Quote</h2>
          <p className="mt-1 text-sm text-gray-600">Create a quotation.</p>
        </Link>

        <Link href="/customers" className="rounded-2xl border p-5 shadow-sm">
          <h2 className="font-semibold">Customers</h2>
          <p className="mt-1 text-sm text-gray-600">Manage customers.</p>
        </Link>

        <Link href="/items" className="rounded-2xl border p-5 shadow-sm">
          <h2 className="font-semibold">Items</h2>
          <p className="mt-1 text-sm text-gray-600">Manage reusable items.</p>
        </Link>
      </div>
    </main>
  );
}
