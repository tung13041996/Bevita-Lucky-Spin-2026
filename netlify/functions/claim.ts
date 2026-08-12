import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, bad, isOptions } from "./_res";

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });
  if (event.httpMethod !== "POST") return bad("Method not allowed", 405);

  const body = JSON.parse(event.body || "{}") as {
    phone?: string;
    selectedPrizeIds?: number[];
  };

  const phone = (body.phone || "").trim();
  const selectedPrizeIds = body.selectedPrizeIds ?? [];

  if (!phone) return bad("Thiếu SĐT");
  if (!Array.isArray(selectedPrizeIds) || selectedPrizeIds.length === 0)
    return bad("Thiếu phần quà chọn");

  // Check participant exists and hasn't claimed
  const { data: p, error: pErr } = await supabase
    .from("participants")
    .select("phone,is_claimed")
    .eq("phone", phone)
    .maybeSingle();

  if (pErr) return json(500, { ok: false, message: pErr.message });
  if (!p) return bad("SĐT chưa tham gia", 404);
  if (p.is_claimed) return bad("Số điện thoại này đã nhận thưởng", 409);

  // Confirm all selected prizes are from their spun prizes
  const { data: spins, error: sErr } = await supabase
    .from("spins")
    .select("prize_id")
    .eq("phone", phone);

  if (sErr) return json(500, { ok: false, message: sErr.message });

  const spunIds = (spins || []).map((x: any) => x.prize_id);
  const allValid = selectedPrizeIds.every((id) => spunIds.includes(id));
  if (!allValid) return bad("Phần quà chọn không hợp lệ", 400);

  // Mark as claimed with array of selected prizes
  const { error: updErr } = await supabase
    .from("participants")
    .update({
      is_claimed: true,
      selected_prize_ids: selectedPrizeIds,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", phone);

  if (updErr) return json(500, { ok: false, message: updErr.message });

  return json(200, { ok: true });
};
