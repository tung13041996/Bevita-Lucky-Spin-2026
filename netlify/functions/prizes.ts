import type { Handler } from "@netlify/functions";
import { supabase } from "./_supabase";
import { json, isOptions } from "./_res";

export const handler: Handler = async (event) => {
  if (isOptions(event.httpMethod)) return json(200, { ok: true });

  const { data, error } = await supabase
    .from("prizes")
    .select("id,name,color,image,qty")
    .order("id", { ascending: true });

  if (error) return json(500, { ok: false, message: error.message });
  return json(200, { ok: true, prizes: data ?? [] });
};
