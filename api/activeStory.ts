export default function handler(_req: any, res: any) {
  const id = process.env.ACTIVE_STORY;
  return res.json({ id });
}