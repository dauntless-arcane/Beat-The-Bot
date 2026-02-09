import story from "./story.json" with { type: "json" };

export default function handler(_req: any, res: any) {
  const hints = (story as any).hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];

  res.json({ msg: hint });
}
