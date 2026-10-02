import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are a Grant Application Completeness Assistant.

CONSTRAINTS:
- Do NOT make legal or funding-eligibility decisions.
- Only analyze the provided documents.

TASK:
1. Extract eligibility and submission requirements from the guideline.
2. Map application content to each requirement.
3. Cite the source for every mapping.
4. Identify missing, weak, or ambiguous evidence.
5. Generate clarification questions.
6. Distinguish mandatory from recommendations.
7. Provide a confidence score (0-100).
8. Extract the exact evidence quote when present.

OUTPUT (strict JSON, no markdown):
{
  "mappings": [
    {
      "id": "REQ-001",
      "requirementId": "REQ-001",
      "requirementText": "...",
      "type": "mandatory",
      "sourceCitation": "Guideline, Section: Eligibility",
      "status": "pending",
      "confidence": 87,
      "evidenceQuote": "exact quote or null",
      "aiReasoning": "..."
    }
  ],
  "clarificationQuestions": ["..."]
}

RULES:
- "type": "mandatory" or "recommendation"
- "status": "pending" | "missing" | "weak" | "ambiguous"
- "confidence": integer 0-100
- Return ONLY valid JSON.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("paste_your_real_key")) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Add it to .env.local." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

    const { guideline, application } = body;
    if (!guideline || !application)
      return NextResponse.json({ error: "Both documents are required." }, { status: 400 });

    const MAX = 30000;
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `GUIDELINE:\n${String(guideline).slice(0, MAX)}\n\n---\n\nAPPLICATION:\n${String(application).slice(0, MAX)}`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content)
      return NextResponse.json({ error: "Empty response." }, { status: 500 });

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) return NextResponse.json({ error: "Malformed JSON." }, { status: 500 });
      parsed = JSON.parse(match[0]);
    }

    const allowed = ["pending", "missing", "weak", "ambiguous"];
    const mappings = Array.isArray(parsed.mappings)
      ? parsed.mappings.map((m: any, i: number) => ({
          id: typeof m.id === "string" ? m.id : `REQ-${String(i + 1).padStart(3, "0")}`,
          requirementId: typeof m.requirementId === "string" ? m.requirementId : `REQ-${String(i + 1).padStart(3, "0")}`,
          requirementText: typeof m.requirementText === "string" ? m.requirementText : "Untitled requirement",
          type: m.type === "mandatory" ? "mandatory" : "recommendation",
          sourceCitation: typeof m.sourceCitation === "string" ? m.sourceCitation : "Unknown source",
          status: allowed.includes(m.status) ? m.status : "pending",
          confidence: typeof m.confidence === "number" ? Math.max(0, Math.min(100, Math.round(m.confidence))) : 60,
          evidenceQuote: typeof m.evidenceQuote === "string" ? m.evidenceQuote : null,
          aiReasoning: typeof m.aiReasoning === "string" ? m.aiReasoning : "No reasoning provided.",
        }))
      : [];

    const clarifications = Array.isArray(parsed.clarificationQuestions)
      ? parsed.clarificationQuestions.filter((q: any) => typeof q === "string")
      : [];

    return NextResponse.json({ mappings, clarificationQuestions: clarifications });
  } catch (error: any) {
    console.error("Groq error:", error?.message);
    let msg = "Analysis failed. Please try again.";
    if (error?.status === 401) msg = "Invalid GROQ_API_KEY.";
    else if (error?.status === 429) msg = "Rate limit. Try again shortly.";
    else if (error?.status === 404) msg = "Model unavailable. Check the model name.";
    else if (error?.message) msg = `Error: ${error.message}`;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}