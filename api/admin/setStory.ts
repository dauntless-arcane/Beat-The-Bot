import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id } = req.body;

    if (!id)
      return res.status(400).json({ error: "Missing id" });

    const file = path.join(process.cwd(), "api", "activeStory.json");

    fs.writeFileSync(
      file,
      JSON.stringify({ id }, null, 2),
      "utf-8"
    );

    console.log("✅ activeStory.json updated →", id);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update story" });
  }
}
