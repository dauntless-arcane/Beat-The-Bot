import fs from "fs";
import path from "path";

export default function handler(_req: any, res: any) {
  try {
    const dir = path.resolve(process.cwd(), "api", "stories");

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort();

    return res.json(files);
  } catch (err) {
    console.error("Failed to read stories dir:", err);
    return res.status(500).json({ error: "Could not load stories" });
  }
}