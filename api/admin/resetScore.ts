import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = path.resolve(process.cwd(), "api", "scores.json");
  fs.writeFileSync(filePath, "[]");

  return res.json({ ok: true });
}