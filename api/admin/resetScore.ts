import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const file = path.join(process.cwd(), "api", "scores.json");

  fs.writeFileSync(file, JSON.stringify([], null, 2));

  res.json({ ok: true });
}
