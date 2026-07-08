// Grades the full interview conversation. Runs server-side.

export async function POST(req) {
  const { question, transcript } = await req.json();

  const prompt = `You are an expert product management interview coach. Below is the full transcript of a live mock interview, including the interviewer's follow-up questions and the candidate's responses.

Interview question: "${question}"

Transcript:
"""${transcript}"""

Grade the CANDIDATE only. Weigh how they handled the interviewer's follow-ups and pushback, not just their opening structure. Respond with ONLY a JSON object, no markdown fences, no preamble, in exactly this shape:
{"summary": "<4-6 sentence coaching summary: what they did well, how they handled follow-ups, what a stronger performance includes>", "scores": [{"dimension": "Communication", "score": <1-5 integer>, "comment": "<1-2 sentences>"}, {"dimension": "Product vision", "score": <1-5>, "comment": "..."}, {"dimension": "Prioritization", "score": <1-5>, "comment": "..."}, {"dimension": "Business strategy", "score": <1-5>, "comment": "..."}, {"dimension": "Data literacy", "score": <1-5>, "comment": "..."}]}`;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[grade] ANTHROPIC_API_KEY is not set");
    return Response.json({ error: "missing_api_key" }, { status: 500 });
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
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[grade] Anthropic error", res.status, data);
      return Response.json({ error: "upstream_error" }, { status: 502 });
    }
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    return Response.json(JSON.parse(clean));
  } catch (e) {
    console.error("[grade] request failed", e);
    return Response.json({ error: "grading_failed" }, { status: 502 });
  }
}
