import { requireUser } from "@/lib/auth";
import QuoteForm from "@/components/quotes/quote-form";

export default async function NewQuotePage() {
  await requireUser();

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Quote</h1>
        <p className="text-sm text-gray-600">
          Create a new quotation for a customer.
        </p>
      </div>

      <QuoteForm />
    </main>
  );
}
