const SUPABASE_URL = "https://dbepscombakzdvruuxav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZXBzY29tYmFremR2cnV1eGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODg5OTEsImV4cCI6MjA2Njk2NDk5MX0.vahd7AyhmuJ22EzpapV237jPQPh4UjL-gt6QMvVRozs";

export const karaibaApiCall = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
) => {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_PUBLISHABLE_KEY,
    'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
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

