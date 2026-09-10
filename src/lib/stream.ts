const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("access_token") || "";
}

async function streamPost(
  endpoint: string,
  payload: unknown,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    if (res.status === 429) throw Object.assign(new Error("quota"), { status: 429 });
    if (res.status === 503) throw Object.assign(new Error("unavailable"), { status: 503 });
    throw new Error(`Erreur ${res.status}`);
  }

  if (!res.body) throw new Error("Pas de flux");

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let acc = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += dec.decode(value, { stream: true });
    onChunk(acc);
  }

  return acc;
}

export interface StepPayload {
  classe: string;
  notions: string[];
  step: string;
  parts: Record<string, string>;
  instruction?: string;
}

export async function streamPremiumStep(
  payload: StepPayload,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  return streamPost("/premium/step", payload, onChunk, signal);
}

export async function streamPremiumCorrige(
  payload: { classe: string; parts: Record<string, string> },
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  return streamPost("/premium/corrige", payload, onChunk, signal);
}

export async function finalizePremiumExam(data: {
  title: string;
  classe: string;
  notions: string[];
  markdown: string;
  duration_minutes?: number | null;
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/premium/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Échec de la sauvegarde");
  return res.json();
}
