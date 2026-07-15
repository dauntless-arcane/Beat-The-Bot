import { resetScores } from "../lib/scoresStore";

export default async function handler(req: { method?: string }, res: { json: (b: unknown) => void; status: (n: number) => { json: (b: unknown) => void } }) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await resetScores();

  return res.json({ ok: true });
}