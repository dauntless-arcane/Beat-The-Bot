import fs from "fs";
import path from "path";

export default function handler(_req: any, res: any) {
  try {
    const file = path.join(process.cwd(), "api", "scores.json");

    if (!fs.existsSync(file)) return res.json([]);

    const scores = JSON.parse(fs.readFileSync(file, "utf-8"));

    res.json(scores);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
}
