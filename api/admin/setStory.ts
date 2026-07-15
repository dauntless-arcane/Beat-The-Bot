import { listStoryIds } from "../lib/loadStory";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing story id" });
  }

  if (!listStoryIds().includes(id)) {
    return res.status(404).json({ error: `Story "${id}" not found` });
  }

  // Update activeStory.json — best-effort only. This is a no-op on
  // Vercel in production (read-only filesystem); the real production
  // mechanism is the ACTIVE_STORY env var + the deploy hook below.
  // Useful for local dev, so we still try, but a failure here must
  // not block triggering the redeploy.
  try {
    const fs = await import("fs");
    const path = await import("path");
    const activePath = path.resolve(process.cwd(), "api", "lib", "activeStory.json");
    fs.writeFileSync(activePath, JSON.stringify({ id }, null, 2));
  } catch (err) {
    console.warn("Could not write activeStory.json (expected on Vercel prod):", (err as Error).message);
  }

  // Trigger a Vercel redeploy via deploy hook
  // VERCEL_DEPLOY_HOOK is set in your Vercel dashboard env vars
  const hook = process.env.VERCEL_DEPLOY_HOOK;

  if (!hook) {
    return res.status(500).json({
      error: "VERCEL_DEPLOY_HOOK env var not set"
    });
  }

  try {
    const hookRes = await fetch(hook, { method: "POST" });
    if (!hookRes.ok) {
      return res.status(500).json({ error: "Deploy hook failed" });
    }
  } catch (err) {
    console.error("Deploy hook request failed:", (err as Error).message);
    return res.status(500).json({ error: "Deploy hook request failed" });
  }

  return res.json({ ok: true, active: id, redeploying: true });
}