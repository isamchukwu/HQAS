"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuoteLinesTable from "@/components/quotes/quote-lines-table";

type Customer = {
  id: string;
  company_name: string;
};

type ItemOption = {
  id: string;
  item_code: string | null;
  item_name: string;
  standard_description: string;
  unit: string;
  default_price: number;
};

type QuoteLine = {
  line_number: number;
  item_id?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

type QuoteFormState = {
  customer_id: string;
  quote_date: string;
  reference: string;
  currency: "NGN";
  tax_amount: number;
  discount_amount: number;
  notes: string;
  lines: QuoteLine[];
};

function createEmptyLine(lineNumber: number): QuoteLine {
  return {
    line_number: lineNumber,
    item_id: null,
    description: "",
    quantity: 0,
    unit: "",
    unit_price: 0,
  };
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function QuoteForm() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState<QuoteFormState>({
    customer_id: "",
    quote_date: new Date().toISOString().split("T")[0],
    reference: "",
    currency: "NGN",
    tax_amount: 0,
    discount_amount: 0,
    notes: "",
    lines: [createEmptyLine(1)],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/items"),
        ]);

        const customersData = await customersRes.json();
        const itemsData = await itemsRes.json();

        if (!customersRes.ok) {
          throw new Error(customersData.error ?? "Failed to load customers");
        }

        if (!itemsRes.ok) {
          throw new Error(itemsData.error ?? "Failed to load items");
        }

        setCustomers(customersData);
        setItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoadingData(false);
      }
    }

    void loadData();
  }, []);

  const subtotal = useMemo(() => {
    return roundCurrency(
      form.lines.reduce((sum, line) => {
        return sum + Number(line.quantity || 0) * Number(line.unit_price || 0);
      }, 0),
    );
  }, [form.lines]);

  const grandTotal = useMemo(() => {
    return roundCurrency(subtotal + Number(form.tax_amount || 0) - Number(form.discount_amount || 0));
  }, [subtotal, form.tax_amount, form.discount_amount]);

  function updateField<K extends keyof QuoteFormState>(
    field: K,
    value: QuoteFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleChangeLine(
    index: number,
    field: keyof QuoteLine,
    value: string | number | null,
  ) {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = {
        ...lines[index],
        [field]: value,
      } as QuoteLine;

      return {
        ...prev,
        lines,
      };
    });
  }

  function handleAddLine() {
    setForm((prev) => ({
      ...prev,
      lines: [...prev.lines, createEmptyLine(prev.lines.length + 1)],
    }));
  }

  function handleRemoveLine(index: number) {
    setForm((prev) => {
      const filtered = prev.lines.filter((_, i) => i !== index);
      const reindexed = filtered.map((line, i) => ({
        ...line,
        line_number: i + 1,
      }));

      return {
        ...prev,
        lines: reindexed.length > 0 ? reindexed : [createEmptyLine(1)],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        ...form,
        lines: form.lines.map((line, index) => ({
          ...line,
          line_number: index + 1,
        })),
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to create quote";
        throw new Error(message);
      }

      setSuccessMessage(`Quote created successfully: ${data.quote_number}`);
      router.push(`/quotes/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) {
    return <div className="rounded-2xl border p-6">Loading form...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Quote Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.customer_id}
              onChange={(e) => updateField("customer_id", e.target.value)}
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quote Date</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="date"
              value={form.quote_date}
              onChange={(e) => updateField("quote_date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reference</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.reference}
              onChange={(e) => updateField("reference", e.target.value)}
              placeholder="RFQ / reference"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <input
              className="w-full rounded-lg border bg-gray-50 px-3 py-2"
              value={form.currency}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tax Amount</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              min="0"
              step="0.01"
              value={form.tax_amount}
              onChange={(e) => updateField("tax_amount", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Amount</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              min="0"
              step="0.01"
              value={form.discount_amount}
              onChange={(e) =>
                updateField("discount_amount", Number(e.target.value))
              }
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            className="min-h-[96px] w-full rounded-lg border px-3 py-2"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Optional quotation notes"
          />
        </div>
      </section>

      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Line Items</h2>

        <QuoteLinesTable
          lines={form.lines}
          items={items}
          onChangeLine={handleChangeLine}
          onAddLine={handleAddLine}
          onRemoveLine={handleRemoveLine}
        />
      </section>

      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Totals</h2>

        <div className="grid gap-3 text-sm md:max-w-md">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Tax</span>
            <span className="font-medium">
              {formatCurrency(Number(form.tax_amount || 0))}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span>Discount</span>
            <span className="font-medium">
              {formatCurrency(Number(form.discount_amount || 0))}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border px-4 py-4 text-base font-semibold">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl border px-5 py-3 font-medium"
        >
          {submitting ? "Saving..." : "Create Quote"}
        </button>
      </div>
    </form>
  );
}
