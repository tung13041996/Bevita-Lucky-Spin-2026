import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, bad, isOptions } from "./_res";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });

  const phone = (event.queryStringParameters?.phone || "").trim();
  if (!phoneRegex.test(phone)) return bad("SĐT không hợp lệ");

  const { data: p, error: pErr } = await supabase
      .from("participants")
      .select("phone,name,is_claimed,selected_prize_ids")
      .eq("phone", phone)
      .maybeSingle();

  if (pErr) return json(500, { ok: false, message: pErr.message });
  if (!p) return json(200, { ok: true, participant: null });

  const { data: spins, error: sErr } = await supabase
      .from("spins")
      .select("spin_index, prize_id, prizes(name,condition)")
      .eq("phone", phone)
      .order("spin_index", { ascending: true });

  if (sErr) return json(500, { ok: false, message: sErr.message });

  return json(200, {
    ok: true,
    participant: {
      phone: p.phone,
      name: p.name,
      isClaimed: !!p.is_claimed,
      selectedPrizeIds: p.selected_prize_ids ?? [],
      spins: (spins ?? []).map((x: any) => ({
        prizeId: x.prize_id,
        prizeName: x.prizes?.name ?? "",
        condition: x.prizes?.condition ?? "",
      })),
    },
  });
};