import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  const active = JSON.parse(
    fs.readFileSync(
      path.join(root, "public", "activeStory.json"), // ✅ moved
      "utf-8"
    )
  );

  return JSON.parse(
    fs.readFileSync(
      path.join(root, "api/stories", `${active.id}.json`),
      "utf-8"
    )
  );
}

const story = loadActiveStory();

const MODEL = "google/gemma-2-9b-it";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const PASS_MARK = 50; // always /100 now

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const guess = req.body;
    const solution = (story as any).solution;

    const fields = Object.keys(solution);

    /* ================= LLM grading ================= */

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `
You are grading a mystery game.

Score EACH field from 0–25:

25 = exact or clearly correct
20 = strong match
15 = partial
10 = weak
0  = wrong

Return ONLY JSON using the SAME KEYS as the solution.
`
          },
          {
            role: "user",
            content: `
SOLUTION:
${JSON.stringify(solution, null, 2)}

PLAYER GUESS:
${JSON.stringify(guess, null, 2)}
`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed (${response.status})`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";

    /* ================= SAFE PARSE ================= */

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : {};

    /* ================= NORMALIZED SCORING ================= */

    const safe = (n: any) =>
      typeof n === "number" && n >= 0 && n <= 25 ? n : 0;

    let rawScore = 0;

    for (const key of fields) {
      rawScore += safe(result[key]);
    }

    const maxScore = fields.length * 25;

    const score = Math.round((rawScore / maxScore) * 100);

    /* ================= RESPONSE ================= */

    return res.json({
      score,
      total: 100,        // ⭐ always 100 now
      success: score >= PASS_MARK
    });

  } catch (err) {
    console.error("Guess scoring failed:", (err as Error).message);

    return res.json({
      score: 0,
      total: 100,
      success: false
    });
  }
}
