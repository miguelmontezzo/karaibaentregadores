const DELIVERY_SUPABASE_URL = "https://fikhhcdxsutcdtvqbqkm.supabase.co";
const DELIVERY_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2hoY2R4c3V0Y2R0dnFicWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTgzODIsImV4cCI6MjA2ODQzNDM4Mn0.q-EUHCawjpRrKS0oVhnEcEcNYIqAg-jSxktpv3ckek0";

export const deliveryApiCall = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
) => {
  const url = `${DELIVERY_SUPABASE_URL}/rest/v1${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': DELIVERY_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${DELIVERY_SUPABASE_ANON_KEY}`,
  };

  const resp = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `HTTP ${resp.status}`);
  }

  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

