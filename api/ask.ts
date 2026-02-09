import story from "./story.json" with { type: "json" };

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-2-9b-it";

export default async function handler(req: any, res: any) {
  try {
    const { question, history = [] } = req.body;

    /* ---------- Flashback ---------- */
    if (question === "__flashback__") {
      return res.json({ msg: story.flashback });
    }

    /* ---------- Build memory text ---------- */
    const facts = [
      ...Object.values(story.facts).flat()
    ].join("\n");
    const misleading = [
      ...Object.values(story.misleading).flat()
    ].join("\n");

    const solutions = [
      ...Object.values(story.solution).flat()
    ].join("\n");

    /* ---------- Call LLM ---------- */
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

              Here are all remembered facts
              ${facts}

              Here are some misleading details
              ${misleading}

              The Solution is
              ${solutions}
              Use the facts to make up a story-based answer to the questions.
              Never reveal the solution directly, but try to reference them in the story.
              Start slow with all the background and build up to the solution by giving more and more information like you are recovering your memory.
              When answering, only use the facts provided.make up new information if needed but keep it consistent with the facts.
              give a 3 to 4 lines long answers like you are telling a story.
              Answer naturally using only these memories like your persona.

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

    const data = await response.json();

    const msg =
      data?.choices?.[0]?.message?.content ||
      "My memory is unclear…";

    return res.json({ msg });

  } catch (err) {
    // minimal production-safe logging
    console.error("LLM error:", (err as Error).message);
    return res.json({ msg: "My memory falters…" });
  }
}
