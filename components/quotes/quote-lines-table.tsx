"use client";

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

type QuoteLinesTableProps = {
  lines: QuoteLine[];
  items: ItemOption[];
  onChangeLine: (
    index: number,
    field: keyof QuoteLine,
    value: string | number | null,
  ) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function QuoteLinesTable({
  lines,
  items,
  onChangeLine,
  onAddLine,
  onRemoveLine,
}: QuoteLinesTableProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="px-3 py-3">S/N</th>
              <th className="px-3 py-3">Saved Item</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Unit</th>
              <th className="px-3 py-3">Unit Price</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {lines.map((line, index) => {
              const amount = Number(line.quantity || 0) * Number(line.unit_price || 0);

              return (
                <tr key={index} className="border-b align-top">
                  <td className="px-3 py-3">{line.line_number}</td>

                  <td className="px-3 py-3">
                    <select
                      className="w-56 rounded-lg border px-2 py-2"
                      value={line.item_id ?? ""}
                      onChange={(e) => {
                        const itemId = e.target.value || null;
                        onChangeLine(index, "item_id", itemId);

                        const selected = items.find((item) => item.id === itemId);
                        if (selected) {
                          onChangeLine(index, "description", selected.standard_description);
                          onChangeLine(index, "unit", selected.unit);
                          onChangeLine(index, "unit_price", Number(selected.default_price));
                        }
                      }}
                    >
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_name}
                          {item.item_code ? ` (${item.item_code})` : ""}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-3">
                    <textarea
                      className="min-h-[84px] w-72 rounded-lg border px-2 py-2"
                      value={line.description}
                      onChange={(e) =>
                        onChangeLine(index, "description", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-3 py-3">
                    <input
                      className="w-24 rounded-lg border px-2 py-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) =>
                        onChangeLine(index, "quantity", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="px-3 py-3">
                    <input
                      className="w-24 rounded-lg border px-2 py-2"
                      value={line.unit}
                      onChange={(e) => onChangeLine(index, "unit", e.target.value)}
                    />
                  </td>

                  <td className="px-3 py-3">
                    <input
                      className="w-32 rounded-lg border px-2 py-2"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) =>
                        onChangeLine(index, "unit_price", Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="px-3 py-3 font-medium">
                    {formatCurrency(amount)}
                  </td>

                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(index)}
                      className="rounded-lg border px-3 py-2"
                      disabled={lines.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={onAddLine}
        className="rounded-xl border px-4 py-2 font-medium"
      >
        Add Line
      </button>
    </div>
  );
}
