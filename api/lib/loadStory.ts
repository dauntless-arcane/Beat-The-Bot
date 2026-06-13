import fs from "fs";
import path from "path";

export default function loadActiveStory() {
  const root = process.cwd();

  // Read story ID from env var (set in Vercel dashboard)
  // Falls back to activeStory.json for local dev
  let id: string;

  if (process.env.ACTIVE_STORY) {
    id = process.env.ACTIVE_STORY;
  } else {
    const activePath = path.resolve(root, "api", "lib", "activeStory.json");
    const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));
    id = active.id;
  }

  const storyPath = path.resolve(root, "api", "stories", `${id}.json`);

  if (!fs.existsSync(storyPath)) {
    throw new Error(`Story file not found: ${id}.json`);
  }

  return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
}