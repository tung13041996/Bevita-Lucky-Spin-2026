import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, bad, isOptions } from "./_res";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

function pickWeighted(prizes: any[]) {
  const total = prizes.reduce((a, p) => a + (Number(p.qty) || 0), 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= Number(p.qty) || 0;
    if (r < 0) return p;
  }
  return prizes[0];
}

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });
  if (event.httpMethod !== "POST") return bad("Method not allowed", 405);

  const body = JSON.parse(event.body || "{}") as { name?: string; phone?: string };
  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();

  if (!name) return bad("Thiếu tên");
  if (!phoneRegex.test(phone)) return bad("SĐT không hợp lệ");

  // read participant
  const { data: existing, error: exErr } = await supabase
    .from("participants")
    .select("phone,name,is_claimed")
    .eq("phone", phone)
    .maybeSingle();

  if (exErr) return json(500, { ok: false, message: exErr.message });
  if (existing?.is_claimed) return bad("Số điện thoại này đã nhận thưởng", 409);

  // upsert participant (keep name updated)
  const { error: upErr } = await supabase
    .from("participants")
    .upsert({
      phone,
      name,
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone" });

  if (upErr) return json(500, { ok: false, message: upErr.message });

  // load existing spins
  const { data: spins, error: sErr } = await supabase
    .from("spins")
    .select("spin_index, prize_id")
    .eq("phone", phone)
    .order("spin_index", { ascending: true });

  if (sErr) return json(500, { ok: false, message: sErr.message });

  const spinIndex = (spins?.length || 0) + 1;
  if (spinIndex > 3) return bad("SĐT này đã quay đủ 3 lần", 409);

  const prevPrizeIds = new Set((spins || []).map((x: any) => x.prize_id));

  // retry to avoid race with qty
  for (let attempt = 0; attempt < 6; attempt++) {
    const { data: allPrizes, error: pErr } = await supabase
      .from("prizes")
      .select("id,name,image,qty")
      .gt("qty", 0)
      .order("id", { ascending: true });

    if (pErr) return json(500, { ok: false, message: pErr.message });

    const pool = (allPrizes || []).filter((p: any) => !prevPrizeIds.has(p.id));
    if (pool.length === 0) return bad("Hết quà tặng!", 409);

    const chosen = pickWeighted(pool);

    const { error: decErr } = await supabase.rpc("decrement_prize", { p_id: chosen.id });
    if (decErr) {
      // If out of stock (race), retry.
      if ((decErr.message || "").toUpperCase().includes("OUT_OF_STOCK")) continue;
      return json(500, { ok: false, message: decErr.message });
    }

    // write spin record
    const { error: insErr } = await supabase.from("spins").insert({
      phone,
      spin_index: spinIndex,
      prize_id: chosen.id,
    });

    if (insErr) {
      // rollback reserved stock
      await supabase.rpc("increment_prize", { p_id: chosen.id });
      return json(500, { ok: false, message: insErr.message });
    }

    return json(200, {
      ok: true,
      result: { prizeId: chosen.id, prizeName: chosen.name, imagePath: chosen.image ?? null },
    });
  }

  return bad("Hết quà tặng!", 409);
};
