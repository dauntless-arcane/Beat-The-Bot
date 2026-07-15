import { getScores } from "./lib/scoresStore";

export default async function handler(_req: unknown, res: { json: (b: unknown) => void }) {
  const scores = await getScores();
  res.json(scores);
}
