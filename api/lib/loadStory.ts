import fs from "fs";
import path from "path";

export default function loadActiveStory() {
  const root = process.cwd();

  // Build a priority list of candidate story IDs to try:
  // 1. ACTIVE_STORY env var (set in Vercel dashboard) — production source of truth
  // 2. api/lib/activeStory.json — local dev / admin-panel fallback
  const candidates: string[] = [];

  if (process.env.ACTIVE_STORY) {
    candidates.push(process.env.ACTIVE_STORY.trim());
  }

  try {
    const activePath = path.resolve(root, "api", "lib", "activeStory.json");
    const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));
    if (active?.id) candidates.push(active.id);
  } catch {
    // activeStory.json missing or unreadable — ignore, rely on other candidates
  }

  for (const id of candidates) {
    const storyPath = path.resolve(root, "api", "stories", `${id}.json`);
    if (fs.existsSync(storyPath)) {
      return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
    }
  }

  throw new Error(
    `No valid story file found. Tried: [${candidates.join(", ") || "none"}]. ` +
      `Check that ACTIVE_STORY (or activeStory.json) matches a real filename in api/stories/.`
  );
}