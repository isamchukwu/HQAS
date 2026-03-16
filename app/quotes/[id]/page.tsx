import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

type QuotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailPage({ params }: QuotePageProps) {
  await requireUser();
  const { id } = await params;

  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(`
      *,
      customers (
        company_name,
        contact_person,
        email,
        phone,
        address
      ),
      quote_lines (
        id,
        line_number,
        description,
        quantity,
        unit,
        unit_price,
        amount
      )
    `)
    .eq("id", id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const lines = [...(quote.quote_lines ?? [])].sort(
    (a, b) => a.line_number - b.line_number,
  );

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{quote.quote_number}</h1>
            <p className="text-sm text-gray-600">Status: {quote.status}</p>
          </div>

          <div className="text-sm text-gray-700">
            <p>Date: {quote.quote_date}</p>
            <p>Currency: {quote.currency}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Customer</h2>
        <div className="space-y-1 text-sm">
          <p>{quote.customers?.company_name}</p>
          {quote.customers?.contact_person ? (
            <p>Contact: {quote.customers.contact_person}</p>
          ) : null}
          {quote.customers?.email ? <p>Email: {quote.customers.email}</p> : null}
          {quote.customers?.phone ? <p>Phone: {quote.customers.phone}</p> : null}
          {quote.customers?.address ? (
            <p>Address: {quote.customers.address}</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Line Items</h2>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-3 py-3">S/N</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Unit Price</th>
                <th className="px-3 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b">
                  <td className="px-3 py-3">{line.line_number}</td>
                  <td className="px-3 py-3">{line.description}</td>
                  <td className="px-3 py-3">{line.quantity}</td>
                  <td className="px-3 py-3">{line.unit}</td>
                  <td className="px-3 py-3">{formatCurrency(Number(line.unit_price))}</td>
                  <td className="px-3 py-3 font-medium">{formatCurrency(Number(line.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm md:max-w-md">
        <h2 className="mb-4 text-lg font-semibold">Totals</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Subtotal</span>
            <span>{formatCurrency(Number(quote.subtotal))}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Tax</span>
            <span>{formatCurrency(Number(quote.tax_amount))}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Discount</span>
            <span>{formatCurrency(Number(quote.discount_amount))}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border px-4 py-4 text-base font-semibold">
            <span>Grand Total</span>
            <span>{formatCurrency(Number(quote.grand_total))}</span>
          </div>
        </div>
      </section>

      {quote.notes ? (
        <section className="rounded-2xl border p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
        </section>
      ) : null}
    </main>
  );
}
