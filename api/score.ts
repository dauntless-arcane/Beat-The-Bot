import { addScore, getScores } from "./lib/scoresStore";

export default async function handler(req: { method?: string; body?: unknown }, res: { json: (b: unknown) => void; status: (n: number) => { json: (b: unknown) => void } }) {
  // POST — save a new score
  if (req.method === "POST") {
    const scores = await addScore(req.body as never);
    return res.json({ ok: true, scores });
  }

  // GET — return all scores
  if (req.method === "GET") {
    const scores = await getScores();
    return res.json(scores);
  }

  return res.status(405).json({ error: "Method not allowed" });
}