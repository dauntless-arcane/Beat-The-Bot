import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const file = path.join(process.cwd(), "api", "scores.json");

  const newScore = req.body;

  let scores: any[] = [];

  if (fs.existsSync(file)) {
    scores = JSON.parse(fs.readFileSync(file, "utf-8"));
  }

  scores.push(newScore);

  fs.writeFileSync(file, JSON.stringify(scores, null, 2));

  res.json({ ok: true });
}
