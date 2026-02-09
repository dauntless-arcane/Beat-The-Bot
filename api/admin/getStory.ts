import fs from "fs";
import path from "path";

export default function getStory() {
  const activePath = path.join(process.cwd(), "api/activeStory.json");
  const active = JSON.parse(fs.readFileSync(activePath, "utf-8"));

  const storyPath = path.join(
    process.cwd(),
    "api/stories",
    `${active.id}.json`
  );

  return JSON.parse(fs.readFileSync(storyPath, "utf-8"));
}
