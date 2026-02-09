import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "api/scores.json");

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  fs.writeFileSync(filePath, "[]");

  res.json({ ok: true });
}
