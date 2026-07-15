import fs from "fs";
import path from "path";

export default function handler(_req: unknown, res: { json: (body: unknown) => void }) {
  let id = process.env.ACTIVE_STORY?.trim();

  if (!id) {
    try {
      const activePath = path.resolve(process.cwd(), "api", "lib", "activeStory.json");
      const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));
      id = active.id;
    } catch {
      // no fallback available — id stays undefined
    }
  }

  return res.json({ id });
}