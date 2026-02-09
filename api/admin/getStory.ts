import fs from "fs";
import path from "path";

export default function handler(_req: any, res: any) {
  try {
    const activePath = path.join(process.cwd(), "api", "activeStory.json");
    const { id } = JSON.parse(fs.readFileSync(activePath, "utf-8"));

    const storyPath = path.join(process.cwd(), "api", "stories", `${id}.json`);
    const story = JSON.parse(fs.readFileSync(storyPath, "utf-8"));

    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Story load failed" });
  }
}
