let scores: any[] = []; // ⭐ memory only

export default function handler(req: any, res: any) {

  /* ===== GET scores ===== */
  if (req.method === "GET") {
    return res.json(scores);
  }

  /* ===== SAVE score ===== */
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

  res.status(405).json({ error: "Method not allowed" });
}
