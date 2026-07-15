import fs from "fs";
import path from "path";

// Statically imported so Vercel's serverless bundler traces and includes
// these files at build time. Reading them via fs.readFileSync at runtime
// is unreliable on Vercel — its file tracer can miss dynamically-resolved
// paths, silently leaving these JSON files out of the deployed function.
import story from "../stories/story.json";
import story2 from "../stories/story2.json";
import story3 from "../stories/story3.json";
import story4 from "../stories/story4.json";
import story5 from "../stories/story5.json";
import story6 from "../stories/story6.json";

export type Story = {
  flashback: string;
  narrator: { persona: string };
  solution: Record<string, string>;
  facts: Record<string, string[]>;
  misleading: Record<string, string[]>;
  hints: string[];
};

const STORIES: Record<string, Story> = {
  story: story as Story,
  story2: story2 as Story,
  story3: story3 as Story,
  story4: story4 as Story,
  story5: story5 as Story,
  story6: story6 as Story,
};

export function listStoryIds(): string[] {
  return Object.keys(STORIES).sort();
}

export default function loadActiveStory(): Story {
  const candidates: string[] = [];

  if (process.env.ACTIVE_STORY) {
    candidates.push(process.env.ACTIVE_STORY.trim());
  }

  // activeStory.json is still read via fs — fine for local dev, and
  // wrapped so a failure here (e.g. on Vercel) just falls through
  // instead of crashing.
  try {
    const activePath = path.resolve(process.cwd(), "api", "lib", "activeStory.json");
    const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));
    if (active?.id) candidates.push(active.id);
  } catch {
    // ignore — rely on other candidates
  }

  // Hard fallback so the game never fully breaks even if both the env
  // var and activeStory.json are missing, unset, or misconfigured.
  candidates.push("story5");

  for (const id of candidates) {
    if (STORIES[id]) return STORIES[id];
  }

  throw new Error(
    `No valid story found. Tried: [${candidates.join(", ")}]. ` +
      `Known stories: [${listStoryIds().join(", ")}]`
  );
}