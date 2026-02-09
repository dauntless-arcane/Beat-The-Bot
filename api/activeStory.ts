import fs from "fs";
import path from "path";

export default function handler(_req: any, res: { json: (arg0: any) => void; }) {
  const file = path.resolve(
    process.cwd(),
    "api",
    "lib",
    "activeStory.json"
  );

  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  res.json(data);
}
