import loadActiveStory from "./lib/loadStory";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const story = loadActiveStory() as any;
    console.log("Story loaded:", !!story);
    console.log("Hints:", story.hints);

    if (!story.hints || story.hints.length === 0) {
      return res.status(404).json({ msg: "No hints available." });
    }

    const hint = story.hints[Math.floor(Math.random() * story.hints.length)];
    return res.json({ msg: hint });

  } catch (err) {
    console.error("Hint handler failed:", (err as Error).message);
    return res.status(500).json({ msg: "Hint unavailable…" });
  }
}