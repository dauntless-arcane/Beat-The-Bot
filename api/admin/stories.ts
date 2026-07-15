import { listStoryIds } from "../lib/loadStory";

export default function handler(_req: any, res: any) {
  try {
    return res.json(listStoryIds());
  } catch (err) {
    console.error("Failed to list stories:", err);
    return res.status(500).json({ error: "Could not load stories" });
  }
}