import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "api/scores.json");

export default function handler(req: any, res: any) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");

  const scores = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  res.json(scores);
}
