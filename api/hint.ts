import story from "./story.json";

export default function handler(req: any, res: any) {
  const hints = (story as any).hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];

  res.json({ msg: hint });
}
