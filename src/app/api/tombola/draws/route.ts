import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tombola_draws")
    .select("*")
    .order("drawn_at", { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draws: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { prizes, winners, participant_count } = await req.json();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tombola_draws")
    .insert({ prizes_json: prizes, winners_json: winners, participant_count })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ draw: data });
}
