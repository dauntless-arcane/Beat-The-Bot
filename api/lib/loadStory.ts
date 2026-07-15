import fs from "fs";
import path from "path";

export default function loadActiveStory() {
  const root = process.cwd();

  const activePath = path.resolve(root, "api", "lib", "activeStory.json");
  const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));

  const storyPath = path.resolve(root, "api", "stories", `${active.id}.json`);
  return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
}