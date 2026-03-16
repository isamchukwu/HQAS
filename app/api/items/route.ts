import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { itemSchema } from "@/lib/validations/item";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items_master")
    .select("*")
    .eq("is_active", true)
    .order("item_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...parsed.data,
    created_by: user?.id ?? null,
  };

  const { data, error } = await supabase
    .from("items_master")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
