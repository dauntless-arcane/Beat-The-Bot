import getScoresFromJSON from "./lib/getScoresFromJSON.js";
let scores: any[] = []; // ⭐ memory store (no file)

export default function handler(req: any, res: any) {
  /* ================= GET (read scores) ================= */
  if (req.method === "GET") {
    const scores = getScoresFromJSON();
    return res.json(scores);
  }

  /* ========= POST save score ========= */
  if (req.method === "POST") {
    const { name, score, hintsUsed, questionsUsed } = req.body;

    scores.push({
      name,
      score,
      hintsUsed,
      questionsUsed,
      date: Date.now()
    });

    scores.sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : b.date - a.date
    );

    return res.json({ ok: true });
  }

  /* ========= RESET (admin) ========= */
  if (req.method === "DELETE") {
    scores = [];
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
