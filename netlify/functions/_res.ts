export const json = (statusCode: number, data: any) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  },
  body: JSON.stringify(data),
});

export const bad = (message: string, statusCode = 400) =>
  json(statusCode, { ok: false, message });

export const isOptions = (method?: string) =>
  (method || "").toUpperCase() === "OPTIONS";
