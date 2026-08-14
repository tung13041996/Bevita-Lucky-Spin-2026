import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, bad, isOptions } from "./_res";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });
  if (event.httpMethod !== "POST") return bad("Method not allowed", 405);

  const body = JSON.parse(event.body || "{}") as {
    name?: string;
    phone?: string;
    spunPrizeIds?: number[];
    selectedPrizeIds?: number[];
  };

  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  const spunPrizeIds = body.spunPrizeIds ?? [];
  const selectedPrizeIds = body.selectedPrizeIds ?? [];

  if (!name) return bad("Thiếu tên");
  if (!phoneRegex.test(phone)) return bad("SĐT không hợp lệ");
  if (!Array.isArray(spunPrizeIds) || spunPrizeIds.length !== 3) return bad("Cần đúng 3 lượt quay");
  if (!Array.isArray(selectedPrizeIds) || selectedPrizeIds.length === 0) return bad("Thiếu phần quà chọn");

  // Kiểm tra SĐT chưa nhận thưởng
  const { data: existing, error: exErr } = await supabase
      .from("participants")
      .select("phone,is_claimed")
      .eq("phone", phone)
      .maybeSingle();

  if (exErr) return json(500, { ok: false, message: exErr.message });
  if (existing?.is_claimed) return bad("Số điện thoại này đã nhận thưởng", 409);

  // Xác minh tất cả prizes tồn tại trong DB
  const { data: validPrizes, error: pErr } = await supabase
      .from("prizes")
      .select("id")
      .in("id", spunPrizeIds);

  if (pErr) return json(500, { ok: false, message: pErr.message });
  if (!validPrizes || validPrizes.length !== 3) return bad("Phần quà không hợp lệ", 400);

  // Xác minh selectedPrizeIds ⊆ spunPrizeIds
  const spunSet = new Set(spunPrizeIds);
  if (!selectedPrizeIds.every(id => spunSet.has(id))) return bad("Phần quà chọn không hợp lệ", 400);

  // Upsert participant
  const { error: upErr } = await supabase
      .from("participants")
      .upsert(
          { phone, name, updated_at: new Date().toISOString() },
          { onConflict: "phone" }
      );
  if (upErr) return json(500, { ok: false, message: upErr.message });

  // Insert 3 spins
  const { error: spinErr } = await supabase.from("spins").insert(
      spunPrizeIds.map((prizeId, idx) => ({
        phone,
        spin_index: idx + 1,
        prize_id: prizeId,
      }))
  );
  if (spinErr) return json(500, { ok: false, message: spinErr.message });

  // Đánh dấu đã nhận thưởng
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