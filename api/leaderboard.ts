import { getScores } from "./lib/scoresStore";

export default async function handler(_req: unknown, res: { json: (b: unknown) => void; status: (n: number) => { json: (b: unknown) => void } }) {
  try {
    const scores = await getScores();
    res.json(scores);
  } catch (err) {
    console.error("[/api/leaderboard] unexpected error:", (err as Error).message);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
}
