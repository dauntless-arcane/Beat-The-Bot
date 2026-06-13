import fs from "fs";
import path from "path";

export default function handler(_req: any, res: any) {
  try {
    const file = path.resolve(process.cwd(), "api", "lib", "activeStory.json");
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    return res.json(data);
  } catch (err) {
    console.error("Failed to read activeStory:", err);
    return res.status(500).json({ error: "Could not load active story" });
  }
}