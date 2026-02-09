import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "api/scores.json");
const MAX_ENTRIES = 50;

export default function handler(req: any, res: any) {
  try {
    /* ---------- POST only ---------- */
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      name,
      score,
      timeLeft,
      hintsUsed,
      questionsUsed
    } = req.body;

    /* ---------- sanitize ---------- */

    const safeName = String(name || "Anonymous").slice(0, 30);

    const safeScore = Math.min(100, Math.max(0, Number(score) || 0));

    const safeTime = Number(timeLeft) || 0;

    const safeHints = Number(hintsUsed) || 0;

    const safeQuestions = Number(questionsUsed) || 0;

    /* ---------- ensure file ---------- */

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
    }

    /* ---------- safe read ---------- */

    let scores: any[] = [];
    try {
      scores = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      scores = [];
    }

    /* ---------- add entry ---------- */

    scores.push({
      name: safeName,
      score: safeScore,
      timeLeft: safeTime,
      hintsUsed: safeHints,
      questionsUsed: safeQuestions,
      date: Date.now()
    });

    /* ================================================= */
    /* SMART SORTING (gameplay logic)                    */
    /* ================================================= */

    scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;                // higher score
      if (a.hintsUsed !== b.hintsUsed) return a.hintsUsed - b.hintsUsed; // fewer hints
      if (a.questionsUsed !== b.questionsUsed) return a.questionsUsed - b.questionsUsed; // fewer questions
      return b.timeLeft - a.timeLeft;                                   // more time
    });

    /* ---------- keep top ---------- */

    scores = scores.slice(0, MAX_ENTRIES);

    /* ---------- save ---------- */

    fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

    res.json({ ok: true });

  } catch (err) {
    console.error("Score save failed:", (err as Error).message);
    res.status(500).json({ ok: false });
  }
}
