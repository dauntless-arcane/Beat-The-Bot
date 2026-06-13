import { useEffect, useState } from "react";

const API = import.meta.env.DEV ? "http://localhost:3000" : "";

type Score = {
  name: string;
  score: number;
  hintsUsed: number;
  questionsUsed: number;
};

export default function Admin() {
  const [stories, setStories] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState("");
  const [activeStory, setActiveStory] = useState("");
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeploying, setRedeploying] = useState(false);
  const [switchMsg, setSwitchMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* ---------- load stories list + current active ---------- */
  useEffect(() => {
    fetch(`${API}/api/admin/stories`)
      .then((r) => r.json())
      .then((list: string[]) => {
        setStories(list);
        if (list.length) setSelectedStory(list[0]);
      })
      .catch(() => console.error("Failed to load stories"));

    fetch(`${API}/api/activeStory`)
      .then((r) => r.json())
      .then((data) => setActiveStory(data.id))
      .catch(() => console.error("Failed to load active story"));
  }, []);

  /* ---------- live leaderboard ---------- */
  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/score`)
        .then((r) => r.json())
        .then((data) => setScores(Array.isArray(data) ? data : []))
        .catch(() => setScores([]));
    };
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, []);

  /* ---------- switch story ---------- */
  const changeStory = async () => {
    if (!selectedStory) return;
    setLoading(true);
    setSwitchMsg(null);

    try {
      const res = await fetch(`${API}/api/admin/setStory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedStory }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSwitchMsg({ ok: false, text: data.error || "Failed to switch story" });
      } else {
        setRedeploying(true);
        setSwitchMsg({
          ok: true,
          text: `Switched to "${selectedStory}" — Vercel is redeploying (~30s). Refresh after.`,
        });
        // After 35s assume redeploy is done and refresh active story
        setTimeout(() => {
          setRedeploying(false);
          setActiveStory(selectedStory);
        }, 35000);
      }
    } catch {
      setSwitchMsg({ ok: false, text: "Network error — could not switch story" });
    }

    setLoading(false);
  };

  /* ---------- reset leaderboard ---------- */
  const resetScores = async () => {
    if (!confirm("Reset all scores? This cannot be undone.")) return;
    try {
      await fetch(`${API}/api/admin/resetScore`, { method: "POST" });
      setScores([]);
    } catch {
      alert("Failed to reset scores");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10 space-y-8">
      <h1 className="text-3xl font-bold">Admin Control Panel</h1>

      {/* ===== Active Story Badge ===== */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">Currently active:</span>
        <span className="text-indigo-400 font-semibold">{activeStory || "loading…"}</span>
        {redeploying && (
          <span className="text-xs text-amber-400 animate-pulse">⟳ Redeploying…</span>
        )}
      </div>

      {/* ===== Story Controls ===== */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={selectedStory}
          onChange={(e) => { setSelectedStory(e.target.value); setSwitchMsg(null); }}
          className="bg-zinc-800 px-4 py-2 rounded"
        >
          {stories.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={changeStory}
          disabled={loading || redeploying || selectedStory === activeStory}
          className={`px-4 py-2 rounded transition-colors ${
            loading || redeploying || selectedStory === activeStory
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Switching…" : redeploying ? "Redeploying…" : "Switch Story"}
        </button>

        <button
          onClick={resetScores}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Reset Leaderboard
        </button>
      </div>

      {/* ===== Switch feedback ===== */}
      {switchMsg && (
        <p className={`text-sm ${switchMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
          {switchMsg.ok ? "✅" : "❌"} {switchMsg.text}
        </p>
      )}

      {/* ===== Setup reminder ===== */}
      <div className="text-xs text-zinc-600 border border-zinc-800 rounded p-3 max-w-lg">
        <p className="font-semibold text-zinc-500 mb-1">Vercel setup required:</p>
        <p>1. Vercel dashboard → Your project → Settings → Git → Deploy Hooks</p>
        <p>2. Create a hook, copy the URL</p>
        <p>3. Add it as env var: <code className="text-zinc-400">VERCEL_DEPLOY_HOOK</code></p>
        <p>4. Add env var: <code className="text-zinc-400">ACTIVE_STORY=story3</code> (change to switch)</p>
      </div>

      {/* ===== Leaderboard ===== */}
      <div>
        <h2 className="text-xl mb-3">
          Live Submissions{" "}
          <span className="text-sm text-zinc-500 font-normal">({scores.length} total)</span>
        </h2>

        {scores.length === 0 ? (
          <p className="text-zinc-500">No submissions yet.</p>
        ) : (
          <table className="w-full text-sm border border-zinc-800">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-2 text-left">Rank</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2">Score</th>
                <th className="p-2">Hints Used</th>
                <th className="p-2">Questions Used</th>
              </tr>
            </thead>
            <tbody>
              {scores
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((s, i) => (
                  <tr key={i} className="border-t border-zinc-800 text-center">
                    <td className="p-2 text-left text-zinc-400">#{i + 1}</td>
                    <td className="p-2 text-left">{s.name}</td>
                    <td className="p-2">{s.score}</td>
                    <td className="p-2">{s.hintsUsed}</td>
                    <td className="p-2">{s.questionsUsed}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}