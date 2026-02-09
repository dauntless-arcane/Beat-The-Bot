import { useEffect, useState } from "react";

const API = import.meta.env.DEV ? "http://localhost:3000" : "";

type Score = {
  name: string;
  score: number;
  timeLeft: number;
  hintsUsed: number;
  questionsUsed: number;
};

export default function Admin() {
  const [stories, setStories] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- load stories list ---------- */
  useEffect(() => {
    fetch(`${API}/api/admin/stories`)
      .then(r => r.json())
      .then(list => {
        setStories(list);
        if (list.length) setStory(list[0]);
      });
  }, []);

  /* ---------- live leaderboard ---------- */
  useEffect(() => {
  const load = () => {
    fetch(`${API}/api/score`)   // ✅ correct endpoint
      .then(r => r.json())
      .then(setScores)
      .catch(() => setScores([]));
  };

  load(); // initial load
  const i = setInterval(load, 2000); // refresh
  return () => clearInterval(i);
}, []);


  /* ---------- switch story ---------- */
  const changeStory = async () => {
    setLoading(true);

    await fetch(`${API}/api/admin/setStory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: story })
    });

    setLoading(false);
    alert(`✅ Switched to ${story}`);
  };

  /* ---------- reset leaderboard ---------- */
  const resetScores = async () => {
    if (!confirm("Reset all scores?")) return;

    await fetch(`${API}/api/admin/resetScore`, {
      method: "POST"
    });

    setScores([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10 space-y-8">

      <h1 className="text-3xl font-bold">Admin Control Panel</h1>

      {/* ===== Story Controls ===== */}
      <div className="flex items-center gap-4">

        <select
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="bg-zinc-800 px-4 py-2 rounded"
        >
          {stories.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={changeStory}
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Switching..." : "Switch Story"}
        </button>

        <button
          onClick={resetScores}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Reset Leaderboard
        </button>
      </div>

      {/* ===== Leaderboard ===== */}
      <div>
        <h2 className="text-xl mb-3">Live Submissions</h2>

        <table className="w-full text-sm border border-zinc-800">
          <thead className="bg-zinc-800">
            <tr>
              <th className="p-2">Name</th>
              <th>Score</th>
              <th>Time</th>
              <th>Hints</th>
              <th>Questions</th>
            </tr>
          </thead>

          <tbody>
            {scores.map((s, i) => (
              <tr key={i} className="border-t border-zinc-800 text-center">
                <td className="p-2">{s.name}</td>
                <td>{s.score}</td>
                <td>{s.timeLeft}</td>
                <td>{s.hintsUsed}</td>
                <td>{s.questionsUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {scores.length === 0 && (
          <p className="text-zinc-500 mt-4">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
