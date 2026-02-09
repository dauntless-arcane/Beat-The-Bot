import fs from "fs";
import path from "path";

export default function handler(_req: any, res: any) {
  const dir = path.join(process.cwd(), "api", "stories");

  const files = fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));

  res.json(files);
}
