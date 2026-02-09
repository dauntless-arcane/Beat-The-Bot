import fs from "fs";
import path from "path";

function loadActiveStory() {
  const root = process.cwd();

  // activeStory.json
  const activePath = path.resolve(root, "api", "lib", "activeStory.json");

  const active = JSON.parse(
    fs.readFileSync(activePath, "utf-8")
  );

  // story files
  const storyPath = path.resolve(
    root,
    "api",
    "stories",
    `${active.id}.json`
  );

  return JSON.parse(
    fs.readFileSync(storyPath, "utf-8")
  );
}

export default function handler(_req: any, res: any) {

  const story = loadActiveStory();
  const hints = (story as any).hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];

  res.json({ msg: hint });
}
