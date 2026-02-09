import fs from "fs";
import path from "path";

export default function getStory() {
  const root = process.cwd();

  const active = JSON.parse(
    fs.readFileSync(
      path.resolve(root, "api", "lib", "activeStory.json"),
      "utf-8"
    )
  );

  const storyPath = path.resolve(
    root,
    "api",
    "stories",
    `${active.id}.json`
  );

  return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
}
