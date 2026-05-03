export async function callGeminiJSON(apiKey: string, model: string, prompt: string, maxOutputTokens = 1500): Promise<any> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens, temperature: 0.6, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 401 || res.status === 403) throw new Error("Invalid API key");
    if (res.status === 429) throw new Error("Rate limit exceeded — try again shortly");
    throw new Error(`Gemini error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  // Strip code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { throw new Error("Gemini returned invalid JSON"); }
}

export async function testGeminiKey(apiKey: string, model = "gemini-2.0-flash"): Promise<boolean> {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 4 },
      }),
    });
    return res.ok;
  } catch { return false; }
}
