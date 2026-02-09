import fs from "fs";
import path from "path";
import getScoresFromJSON from "./lib/getScoresFromJSON";

const filePath = path.join(process.cwd(), "api/scores.json");

export default function handler(req: any, res: any) {
  /* ================= GET (read scores) ================= */
  if (req.method === "GET") {
    const scores = getScoresFromJSON();
    return res.json(scores);
  }

  /* ================= POST (save score) ================= */
  if (req.method === "POST") {
    const { name, score, hintsUsed, questionsUsed } = req.body;

    const scores = getScoresFromJSON();

    scores.push({
      name,
      score,
      hintsUsed,
      questionsUsed,
      date: Date.now()
    });

    scores.sort((a: any, b: any) =>
      b.score !== a.score
        ? b.score - a.score
        : b.date - a.date
    );

    fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

    return res.json({ ok: true });
  }

  /* ================= fallback ================= */
  res.status(405).json({ error: "Method not allowed" });
}
