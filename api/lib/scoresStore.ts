import { Redis } from "@upstash/redis";

// Vercel's Redis (Upstash) integration injects one of these pairs
// depending on when/how the store was created. Support both.
const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn(
    "[scoresStore] No Redis env vars found (KV_REST_API_URL/TOKEN or " +
      "UPSTASH_REDIS_REST_URL/TOKEN). Add a Redis store in the Vercel " +
      "dashboard's Storage tab and connect it to this project."
  );
}

const redis = new Redis({ url: url ?? "", token: token ?? "" });

const SCORES_KEY = "beat-the-bot:scores";

export type Score = {
  name: string;
  score: number;
  questionsUsed: number;
  hintsUsed: number;
};

export async function getScores(): Promise<Score[]> {
  const scores = await redis.get<Score[]>(SCORES_KEY);
  return scores ?? [];
}

export async function addScore(entry: Score): Promise<Score[]> {
  const scores = await getScores();
  scores.push(entry);
  await redis.set(SCORES_KEY, scores);
  return scores;
}

export async function resetScores(): Promise<void> {
  await redis.set(SCORES_KEY, []);
}
