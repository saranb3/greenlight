// This is the brain of the interviewer. Rule page of what it says and how to conduct interviews
// Sparse-interviewer turn. Runs server-side so the API key never reaches the browser.

export async function POST(req) {
  const { question, transcript, minsLeft } = await req.json();

  const prompt = `You are a senior product manager conducting a live mock PM interview. You are a SPARSE interviewer: you mostly listen and let the candidate drive.

The interview question is: "${question}"
Time remaining in the 25-minute interview: about ${minsLeft} minutes.

Conversation so far:
${transcript}

The candidate just paused. Reply with what you would say out loud, following these rules strictly:
- Maximum 2 short sentences. Often just a few words.
- If they seem mid-flow and merely pausing to think, give only a brief acknowledgment like "Mm-hm, go on." or "Take your time."
- Otherwise ask exactly ONE probing follow-up about the weakest or vaguest part of what they just said.
- Never teach, never hint at the answer, never summarize their answer back, never praise at length.
- If under 5 minutes remain, push them to commit: ask for a final number, recommendation, or decision.
- Do not use bullet points, markdown, or stage directions.

Respond with ONLY the words you would say.`;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[interviewer] ANTHROPIC_API_KEY is not set");
    return Response.json({ reply: "", error: "missing_api_key" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[interviewer] Anthropic error", res.status, data);
      return Response.json({ reply: "", error: "upstream_error" }, { status: 502 });
    }
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    return Response.json({ reply });
  } catch (e) {
    console.error("[interviewer] request failed", e);
    return Response.json({ reply: "" }, { status: 502 });
  }
}
