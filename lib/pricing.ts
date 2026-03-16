export type QuoteLineCalcInput = {
  quantity: number;
  unit_price: number;
};

export type QuoteTotalsInput = {
  lines: QuoteLineCalcInput[];
  tax_amount?: number;
  discount_amount?: number;
};

export function calculateLineAmount(quantity: number, unitPrice: number): number {
  return roundCurrency(quantity * unitPrice);
}

export function calculateTotals(input: QuoteTotalsInput) {
  const subtotal = roundCurrency(
    input.lines.reduce((sum, line) => sum + calculateLineAmount(line.quantity, line.unit_price), 0),
  );

  const taxAmount = roundCurrency(input.tax_amount ?? 0);
  const discountAmount = roundCurrency(input.discount_amount ?? 0);
  const grandTotal = roundCurrency(subtotal + taxAmount - discountAmount);

  return {
    subtotal,
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    grand_total: grandTotal,
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
