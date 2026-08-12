import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, bad, isOptions } from "./_res";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

// Pure weight-based random — no stock deduction needed
function pickWeighted(prizes: any[]) {
  const total = prizes.reduce((a: number, p: any) => a + (Number(p.weight) || 0), 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= Number(p.weight) || 0;
    if (r < 0) return p;
  }
  return prizes[prizes.length - 1];
}

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });
  if (event.httpMethod !== "POST") return bad("Method not allowed", 405);

  const body = JSON.parse(event.body || "{}") as { name?: string; phone?: string };
  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();

  if (!name) return bad("Thiếu tên");
  if (!phoneRegex.test(phone)) return bad("SĐT không hợp lệ");

  // Check if already claimed
  const { data: existing, error: exErr } = await supabase
    .from("participants")
    .select("phone,name,is_claimed")
    .eq("phone", phone)
    .maybeSingle();

  if (exErr) return json(500, { ok: false, message: exErr.message });
  if (existing?.is_claimed) return bad("Số điện thoại này đã nhận thưởng", 409);

  // Upsert participant
  const { error: upErr } = await supabase
    .from("participants")
    .upsert(
      { phone, name, updated_at: new Date().toISOString() },
      { onConflict: "phone" }
    );

  if (upErr) return json(500, { ok: false, message: upErr.message });

  // Load existing spins for this phone
  const { data: spins, error: sErr } = await supabase
    .from("spins")
    .select("spin_index, prize_id")
    .eq("phone", phone)
    .order("spin_index", { ascending: true });

  if (sErr) return json(500, { ok: false, message: sErr.message });

  const spinIndex = (spins?.length || 0) + 1;
  if (spinIndex > 3) return bad("SĐT này đã quay đủ 3 lần", 409);

  const prevPrizeIds = new Set((spins || []).map((x: any) => x.prize_id));

  // Load all prizes
  const { data: allPrizes, error: pErr } = await supabase
    .from("prizes")
    .select("id,name,condition,weight")
    .order("id", { ascending: true });

  if (pErr) return json(500, { ok: false, message: pErr.message });
  if (!allPrizes || allPrizes.length === 0) return bad("Không có phần quà nào", 500);

  // Exclude prizes already won in previous spins (so each spin gives a different prize)
  const pool = allPrizes.filter((p: any) => !prevPrizeIds.has(p.id));
  if (pool.length === 0) return bad("Không còn phần quà phù hợp", 409);

  const chosen = pickWeighted(pool);

  // Record the spin
  const { error: insErr } = await supabase.from("spins").insert({
    phone,
    spin_index: spinIndex,
    prize_id: chosen.id,
  });

  if (insErr) return json(500, { ok: false, message: insErr.message });

  return json(200, {
    ok: true,
    result: {
      prizeId: chosen.id,
      prizeName: chosen.name,
      condition: chosen.condition ?? "",
    },
  });
};
