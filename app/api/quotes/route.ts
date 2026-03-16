import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateLineAmount, calculateTotals } from "@/lib/pricing";
import { quoteSchema } from "@/lib/validations/quote";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select(`
      id,
      quote_number,
      quote_date,
      status,
      subtotal,
      tax_amount,
      discount_amount,
      grand_total,
      customers (
        id,
        company_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    customer_id,
    quote_date,
    reference,
    currency,
    tax_amount,
    discount_amount,
    notes,
    lines,
  } = parsed.data;

  const linePayload = lines.map((line) => ({
    ...line,
    amount: calculateLineAmount(line.quantity, line.unit_price),
  }));

  const totals = calculateTotals({
    lines: linePayload.map((line) => ({
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
    tax_amount,
    discount_amount,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      customer_id,
      quote_date,
      reference,
      currency,
      tax_amount: totals.tax_amount,
      discount_amount: totals.discount_amount,
      subtotal: totals.subtotal,
      grand_total: totals.grand_total,
      notes,
      status: "draft",
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  if (quoteError || !quote) {
    return NextResponse.json(
      { error: quoteError?.message ?? "Failed to create quote" },
      { status: 500 },
    );
  }

  const quoteLinesPayload = linePayload.map((line) => ({
    quote_id: quote.id,
    line_number: line.line_number,
    item_id: line.item_id ?? null,
    description: line.description,
    quantity: line.quantity,
    unit: line.unit,
    unit_price: line.unit_price,
    amount: line.amount,
  }));

  const { error: linesError } = await supabase
    .from("quote_lines")
    .insert(quoteLinesPayload);

  if (linesError) {
    await supabase.from("quotes").delete().eq("id", quote.id);
    return NextResponse.json({ error: linesError.message }, { status: 500 });
  }

  return NextResponse.json(
    { id: quote.id, quote_number: quote.quote_number },
    { status: 201 },
  );
}
