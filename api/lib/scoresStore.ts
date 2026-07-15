import { Redis } from "@upstash/redis";

// Vercel's Redis (Upstash) integration injects one of these pairs
// depending on when/how the store was created. Support both.
const url =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const isConfigured = Boolean(url && token);

if (!isConfigured) {
  console.warn(
    "[scoresStore] No Redis env vars found (KV_REST_API_URL/TOKEN or " +
      "UPSTASH_REDIS_REST_URL/TOKEN). Add a Redis store in the Vercel " +
      "dashboard's Storage tab, connect it to this project's Development " +
      "environment, then run `vercel env pull .env.local`. Scores will not " +
      "persist until this is configured — falling back to empty/no-op."
  );
}

const redis = isConfigured ? new Redis({ url: url!, token: token! }) : null;

const SCORES_KEY = "beat-the-bot:scores";

export type Score = {
  name: string;
  score: number;
  questionsUsed: number;
  hintsUsed: number;
};

export async function getScores(): Promise<Score[]> {
  if (!redis) return [];
  try {
    const scores = await redis.get<Score[]>(SCORES_KEY);
    return scores ?? [];
  } catch (err) {
    console.error("[scoresStore] getScores failed:", (err as Error).message);
    return [];
  }
}

export async function addScore(entry: Score): Promise<Score[]> {
  if (!redis) {
    console.warn("[scoresStore] Redis not configured — score was NOT saved:", entry);
    return [entry];
  }
  try {
    const scores = await getScores();
    scores.push(entry);
    await redis.set(SCORES_KEY, scores);
    return scores;
  } catch (err) {
    console.error("[scoresStore] addScore failed:", (err as Error).message);
    return [entry];
  }
}

export async function resetScores(): Promise<void> {
  if (!redis) {
    console.warn("[scoresStore] Redis not configured — reset was a no-op.");
    return;
  }
  try {
    await redis.set(SCORES_KEY, []);
  } catch (err) {
    console.error("[scoresStore] resetScores failed:", (err as Error).message);
  }
}
