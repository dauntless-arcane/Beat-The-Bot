import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing story id" });
  }

  // Verify the story file actually exists before switching
  const storyPath = path.resolve(process.cwd(), "api", "stories", `${id}.json`);
  if (!fs.existsSync(storyPath)) {
    return res.status(404).json({ error: `Story "${id}" not found` });
  }

  // Write the new active story id to the JSON file (persists across serverless calls)
  const activePath = path.resolve(process.cwd(), "api", "lib", "activeStory.json");
  fs.writeFileSync(activePath, JSON.stringify({ id }, null, 2));

  return res.json({ ok: true, active: id });
}