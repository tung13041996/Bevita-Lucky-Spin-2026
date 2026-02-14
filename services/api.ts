import { Prize, SpinResult, ClaimRecord } from "../types";

const BASE = "/.netlify/functions";

export interface ParticipantData {
  name: string;
  spins: SpinResult[];
  isClaimed: boolean;
  selectedPrizeId?: number | null;
}

async function getJSON(url: string) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) throw new Error(data?.message || "Request failed");
  return data;
}

async function postJSON(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) throw new Error(data?.message || "Request failed");
  return data;
}

export const api = {
  async getPrizes(): Promise<Prize[]> {
    const data = await getJSON(`${BASE}/prizes`);
    return data.prizes as Prize[];
  },

  async getParticipant(phone: string): Promise<ParticipantData | null> {
    const data = await getJSON(`${BASE}/state?phone=${encodeURIComponent(phone)}`);
    return data.participant as ParticipantData | null;
  },

  async spin(name: string, phone: string): Promise<SpinResult> {
    const data = await postJSON(`${BASE}/spin`, { name, phone });
    return data.result as SpinResult;
  },

  async claim(record: ClaimRecord): Promise<boolean> {
    await postJSON(`${BASE}/claim`, {
      phone: record.phone,
      selectedPrizeId: record.selectedPrizeId,
    });
    return true;
  },
};
