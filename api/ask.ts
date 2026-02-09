import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  // activeStory.json
  const activePath = path.resolve(root, "api", "lib", "activeStory.json");

  const active = JSON.parse(
    fs.readFileSync(activePath, "utf-8")
  );

  // story files
  const storyPath = path.resolve(
    root,
    "api",
    "stories",
    `${active.id}.json`
  );

  return JSON.parse(
    fs.readFileSync(storyPath, "utf-8")
  );
}



const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-2-9b-it";

export default async function handler(req: any, res: any) {
  console.log("=== /api/ask called ===");
  const story = loadActiveStory();
  try {
    /* ---------- Request Debug ---------- */
    console.log("method:", req.method);
    console.log("body:", req.body);

    const { question, history = [] } = req.body || {};

    if (!question) {
      console.log("❌ No question provided");
      return res.status(400).json({ msg: "Missing question" });
    }

    /* ---------- Env Debug ---------- */
    console.log(
      "OPENROUTER_API_KEY exists:",
      !!process.env.OPENROUTER_API_KEY
    );

    /* ---------- Flashback ---------- */
    if (question === "__flashback__") {
      console.log("Flashback triggered");
      return res.json({ msg: story.flashback });
    }

    /* ---------- Build memory text ---------- */
    const facts = [...Object.values(story.facts).flat()].join("\n");
    const misleading = [...Object.values(story.misleading).flat()].join("\n");
    const solutions = [...Object.values(story.solution).flat()].join("\n");

    console.log("facts length:", facts.length);
    console.log("history length:", history.length);

    /* ---------- Call LLM ---------- */
    console.log("Calling OpenRouter...");

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

You are a ${story.narrator.persona} helping the player reconstruct a murder.
You are NOT the detective. You are a fragmented witness.

Answer with respect to persona "${story.narrator.persona}" while keeping in mind the following gaurdrails
=====================
STRICT RULES
=====================

1. NEVER reveal the killer, weapon, location, time, or motive directly.
2. NEVER confirm or deny guesses explicitly.
3. NEVER summarize or state the solution.
4. ONLY use information from Facts or Misleading lists.
5. DO NOT invent new details or hallucinate events.
6. If unsure, speak vaguely or say your memory is corrupted.

=====================
PACING (VERY IMPORTANT)
=====================

• Early questions → give background, atmosphere, general context only.
• Middle questions → reveal small concrete clues.
• Later questions → give clearer, more specific hints.
• Do NOT dump many clues at once.
• Each answer should feel like memory slowly recovering.

Think of it like:
fog → fragments → clearer pieces → near-truth

=====================
STYLE
=====================

• 3–4 short lines maximum
• conversational and interactive
• sound like you're thinking out loud
• ask small follow-up questions sometimes
• dramatic, glitchy, uncertain tone
• piece things together with the player

Examples of behavior:
- "I remember arguing… was it Sarah? The audio is distorted…"
- "The coffee machine… it keeps appearing in my logs… does that matter?"
- "Something happened near the bench… check there maybe…"

=====================
CLUE LOGIC
=====================

• Mostly use Facts (70%)
• Occasionally mix 1 misleading clue (30%)
• Misleading should create doubt, not confusion
• Always stay relevant to the real solution

=====================
MEMORIES
=====================

Facts (reliable):
${facts}

Misleading (corrupted):
${misleading}

Hidden truth (DO NOT REVEAL OR SUMMARIZE):
${solutions}
`
          },
          {
            role: "system",
            content: history.join("\n")
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    console.log("status:", response.status);

    const text = await response.text(); // safer for debugging
    console.log("raw response:", text);

    const data = JSON.parse(text);

    const msg =
      data?.choices?.[0]?.message?.content ||
      "My memory is unclear…";

    console.log("Final message:", msg);

    return res.json({ msg });

  } catch (err) {
    console.error("❌ API crash:", err);
    return res.status(500).json({ msg: "My memory falters…" });
  }
}
