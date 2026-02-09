import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Entry = {
  name: string;
  score: number;
  timeLeft: number;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<Entry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setScores);
  }, []);

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="w-full max-w-xl space-y-3">
        {scores.map((s, i) => (
          <div
            key={i}
            className="flex justify-between bg-zinc-900 p-3 rounded-xl"
          >
            <span>{i + 1}. {s.name}</span>
            <span>Score: {s.score} | Time: {s.timeLeft}s</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-8 px-6 py-2 bg-indigo-600 rounded"
      >
        Play Again
      </button>
    </div>
  );
}
