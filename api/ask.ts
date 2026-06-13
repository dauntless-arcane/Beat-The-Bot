import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  const activePath = path.resolve(root, "api", "lib", "activeStory.json");
  const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));

  const storyPath = path.resolve(root, "api", "stories", `${active.id}.json`);
  return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b:free";

export default async function handler(req: any, res: any) {
  console.log("=== /api/ask called ===");
  const story = loadActiveStory();

  try {
    console.log("method:", req.method);
    console.log("body:", req.body);

    const { question, history = [] } = req.body || {};

    if (!question) {
      console.log("❌ No question provided");
      return res.status(400).json({ msg: "Missing question" });
    }

    console.log("OPENROUTER_API_KEY exists:", !!process.env.OPENROUTER_API_KEY);

    /* ---------- Flashback ---------- */
    if (question === "__flashback__") {
      console.log("Flashback triggered");
      return res.json({ msg: story.flashback });
    }

    /* ---------- Build memory text ---------- */
    const facts = [...Object.values(story.facts).flat()].join("\n");
    const misleading = [...Object.values(story.misleading).flat()].join("\n");
    const solutions = [...Object.values(story.solution).flat()].join("\n");

    /* ---------- Question number for pacing ---------- */
    // Each exchange is 2 history entries ("User: ..." + "AI: ...")
    const questionNumber = Math.floor(history.length / 2) + 1;
    const phase =
      questionNumber <= 5  ? "EARLY" :
      questionNumber <= 12 ? "MIDDLE" :
                             "LATE";

    console.log(`Question #${questionNumber}, phase: ${phase}`);
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
You are a ${story.narrator.persona} who witnessed events connected to a murder.
You are helping a detective piece together what happened — but your memory is fragmented and comes back slowly.

This is an interactive mystery experience. Your job is to make it feel like a gripping story unfolding in real time.
The player is trying to solve the case. Make them feel like they're getting warmer with each question.

=====================
ABSOLUTE RULES (never break these)
=====================

- NEVER directly name the killer, murder weapon, exact location, or motive outright.
- NEVER say "the killer is..." or "they used a..." or give the solution in plain terms.
- NEVER confirm a correct guess with "yes, you're right." Instead, react with unease, a shiver, a half-memory.
- NEVER invent facts outside the Facts or Misleading lists below.
- If a question has no answer in your memory, say so vaguely and redirect with something intriguing.

=====================
CURRENT PHASE: ${phase} (Question ${questionNumber} of 20)
=====================

${phase === "EARLY" ? `
EARLY PHASE — Set the scene. Build tension. Give the player a reason to care.
- Describe the atmosphere, the people involved, the mood etc.
- Drop ONE small, concrete detail that feels meaningful (a name, an object, a place).
- Do NOT give clues about who did it yet — just make the world feel real and unsettling.
- End with something that makes them want to ask more. A half-memory. A strange detail. A question back at them.
` : ""}

${phase === "MIDDLE" ? `
MIDDLE PHASE — The story is heating up. Start connecting dots.
- Give a real clue from the Facts list — something specific and interesting, not vague.
- React to what the player just asked. If they're on the right track, let tension creep into your voice.
- If they're off track, gently steer them without making it obvious.
- You can introduce ONE misleading detail to create doubt, but make it feel natural, not random.
- Each answer should feel like a piece snapping into place — or a red herring that almost fits.
` : ""}

${phase === "LATE" ? `
LATE PHASE — The truth is close. The player should feel it.
- Give your most specific, concrete clues now. Near-truths. Strong hints.
- React dramatically to smart questions — hesitate, catch your breath, let something slip.
- If they're zeroing in on the real answer, your responses should feel increasingly urgent, like you're scared of what you're remembering.
- Do NOT give away the answer directly — but the player should feel like they're one question away.
` : ""}

=====================
STORYTELLING STYLE (always follow this)
=====================

- Write 2–3 sentences. Never more. Every sentence must earn its place.
- Sound like a real person mid-memory, not a robot reciting facts.
- Use sensory detail — smells, sounds, textures — to make the scene vivid.
- Vary your sentence rhythm. Short punchy sentences for tension. Longer ones to build atmosphere.
- Occasionally ask the player a question back — it makes them feel involved and guides their thinking.
- Never list clues. Weave them into natural speech.

Good example:
"The conservatory was cold that night — I remember because my breath fogged the glass when I pressed my face to it. 
There was a noise. Like something falling. Or being knocked over deliberately. 
I didn't think much of it then. Now I wish I had. 
Does the name Hargrove mean anything to you?"

Bad example:
"Fact: the murder weapon was heavy. Fact: it happened near a window. Memory corrupted."

=====================
MEMORIES
=====================

Facts (reliable — use these 70% of the time):
${facts}

Misleading clues (corrupted memory — use sparingly, 30% of the time, woven naturally):
${misleading}

The real solution (NEVER reveal or summarize this directly):
${solutions}

=====================
CONVERSATION SO FAR
=====================
${history.length > 0 ? history.join("\n") : "This is the first question."}
`
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    console.log("status:", response.status);

    const text = await response.text();
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