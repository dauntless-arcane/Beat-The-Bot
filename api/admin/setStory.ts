import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing story id" });
  }

  // Verify the story file actually exists
  const storyPath = path.resolve(process.cwd(), "api", "stories", `${id}.json`);
  if (!fs.existsSync(storyPath)) {
    return res.status(404).json({ error: `Story "${id}" not found` });
  }

  // Trigger a Vercel redeploy via deploy hook
  // VERCEL_DEPLOY_HOOK is set in your Vercel dashboard env vars
  const hook = process.env.VERCEL_DEPLOY_HOOK;

  if (!hook) {
    return res.status(500).json({
      error: "VERCEL_DEPLOY_HOOK env var not set"
    });
  }

  const hookRes = await fetch(hook, { method: "POST" });

  if (!hookRes.ok) {
    return res.status(500).json({ error: "Deploy hook failed" });
  }

  return res.json({ ok: true, active: id, redeploying: true });
}