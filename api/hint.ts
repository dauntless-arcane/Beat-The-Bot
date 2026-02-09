import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  const active = JSON.parse(
    fs.readFileSync(path.join(root, "api/activeStory.json"), "utf-8")
  );

  return JSON.parse(
    fs.readFileSync(
      path.join(root, "api/stories", `${active.id}.json`),
      "utf-8"
    )
  );
}

const story = loadActiveStory();

export default function handler(_req: any, res: any) {
  const hints = (story as any).hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];

  res.json({ msg: hint });
}
