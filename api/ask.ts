import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  const active = JSON.parse(
    fs.readFileSync(path.join(root, "api/activeStory.json"), "utf-8")
  );

  return JSON.parse(
    fs.readFileSync(
      path.join(root, "api/stories", `${active.id}.json`),
      "utf-8"
    )
  );
}

const story = loadActiveStory();


const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-2-9b-it";

export default async function handler(req: any, res: any) {
  console.log("=== /api/ask called ===");

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
${story.narrator.persona}

Facts:
${facts}

Misleading:
${misleading}

Solution:
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
