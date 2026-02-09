import fs from "fs";
import path from "path";
import getScoresFromJSON from "./lib/getScoresFromJSON.js";

const filePath = path.join(process.cwd(), "api/scores.json");

export default function handler(req: any, res: any) {
  /* ================= GET (read scores) ================= */
  if (req.method === "GET") {
    const scores = getScoresFromJSON();
    return res.json(scores);
  }

  /* ================= POST ================= */
    if (req.method === "POST") {
      const { name, score, hintsUsed, questionsUsed } = req.body;

      // 🔥 ALWAYS read fresh copy
      let scores: any[] = [];

      if (fs.existsSync(filePath)) {
        scores = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
      }

      // 🔥 push new entry
      scores.push({
        name,
        score,
        hintsUsed,
        questionsUsed,
        date: Date.now()
      });

      // 🔥 sort
      scores.sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : b.date - a.date
      );

      // 🔥 overwrite file
      fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

      return res.json({ ok: true });
  }

  /* ================= fallback ================= */
  res.status(405).json({ error: "Method not allowed" });
}
