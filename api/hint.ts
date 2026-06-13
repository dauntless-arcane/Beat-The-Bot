import loadActiveStory from "./lib/loadStory";

export default function handler(_req: any, res: any) {
  const story = loadActiveStory();
  const hints = (story as any).hints;
  const hint = hints[Math.floor(Math.random() * hints.length)];
  res.json({ msg: hint });
}