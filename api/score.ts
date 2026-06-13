import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  // POST — save a new score
  if (req.method === "POST") {
    const filePath = path.resolve(process.cwd(), "api", "scores.json");

    let scores: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        scores = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
      } catch {
        scores = [];
      }
    }

    scores.push(req.body);
    fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

    return res.json({ ok: true });
  }

  // GET — return all scores
  if (req.method === "GET") {
    const filePath = path.resolve(process.cwd(), "api", "scores.json");

    if (!fs.existsSync(filePath)) return res.json([]);

    try {
      const scores = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
      return res.json(scores);
    } catch {
      return res.json([]);
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}