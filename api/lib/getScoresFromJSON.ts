import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "api/scores.json");

export default function getScoresFromJSON() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
      return [];
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}
