import { useEffect, useState } from "react";

const API = import.meta.env.DEV ? "http://localhost:3000" : "";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0D0D0F;
    color: #E8E3D8;
  }

  .adm-page {
    min-height: 100vh;
    background: #0D0D0F;
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .adm-header {
    padding: 14px 28px 10px;
    border-bottom: 1px solid #C9952A;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .adm-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #C9952A;
  }
  .adm-case-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a4a6a;
    margin-top: 2px;
  }
  .adm-active-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #8A8A9A;
  }
  .adm-active-badge span {
    color: #C9952A;
    font-weight: 500;
  }

  /* ── Body ── */
  .adm-body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ── Section ── */
  .adm-section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a4a6a;
    margin-bottom: 12px;
  }

  /* ── Story controls ── */
  .adm-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .adm-select {
    background: #111114;
    border: 0.5px solid #2a2a2e;
    border-radius: 3px;
    padding: 9px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #E8E3D8;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
    appearance: none;
    padding-right: 28px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%234a4a6a'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .adm-select:focus { border-color: #4a4a6a; }

  .btn-primary {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 9px 18px;
    background: #C9952A;
    color: #0D0D0F;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-danger {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 9px 18px;
    border: 0.5px solid #7a2a2a;
    background: transparent;
    color: #9B4444;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .btn-danger:hover { border-color: #9B4444; color: #E8E3D8; }

  /* ── Feedback ── */
  .adm-feedback {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    padding: 8px 12px;
    border-radius: 3px;
    border-left: 2px solid;
  }
  .adm-feedback.ok {
    color: #5a9a6a;
    border-color: #5a9a6a;
    background: #0f1f14;
  }
  .adm-feedback.err {
    color: #9B4444;
    border-color: #7a2a2a;
    background: #1a0f0f;
  }

  /* ── Divider ── */
  .adm-divider {
    border: none;
    border-top: 0.5px solid #2a2a2e;
  }

  /* ── Table ── */
  .adm-table-wrap {
    border: 0.5px solid #2a2a2e;
    border-radius: 6px;
    overflow: hidden;
  }
  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
  }
  .adm-table thead {
    background: #111114;
  }
  .adm-table th {
    padding: 10px 14px;
    text-align: left;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #4a4a6a;
    font-weight: 500;
    border-bottom: 0.5px solid #2a2a2e;
  }
  .adm-table th.right { text-align: right; }
  .adm-table td {
    padding: 10px 14px;
    color: #C8C3B8;
    border-bottom: 0.5px solid #1a1a1e;
  }
  .adm-table td.right { text-align: right; }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover { background: #111114; }

  .adm-rank {
    color: #4a4a6a;
  }
  .adm-score {
    color: #C9952A;
    font-weight: 500;
  }
  .adm-name {
    color: #E8E3D8;
  }

  /* ── Empty state ── */
  .adm-empty {
    font-family: 'Crimson Pro', serif;
    font-size: 15px;
    font-style: italic;
    color: #4a4a6a;
    padding: 24px 0;
    text-align: center;
  }

  /* ── Live dot ── */
  .adm-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4a4a6a;
  }
  .adm-live-dot {
    width: 5px;
    height: 5px;
    background: #5a9a6a;
    border-radius: 50%;
    animation: adm-pulse 2s ease-in-out infinite;
  }
  @keyframes adm-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

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
  const [switchMsg, setSwitchMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* ---------- load stories + active ---------- */
  useEffect(() => {
    fetch(`${API}/api/admin/stories`)
      .then((r) => r.json())
      .then((list: string[]) => {
        setStories(list);
        if (list.length) setSelectedStory(list[0]);
      })
      .catch(() => {});

    fetch(`${API}/api/activeStory`)
      .then((r) => r.json())
      .then((data) => setActiveStory(data.id))
      .catch(() => {});
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
        setActiveStory(selectedStory);
        setSwitchMsg({ ok: true, text: `Active story set to "${selectedStory}"` });
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
      setSwitchMsg({ ok: true, text: "Leaderboard cleared" });
    } catch {
      setSwitchMsg({ ok: false, text: "Failed to reset scores" });
    }
  };

  const sorted = scores.slice().sort((a, b) => b.score - a.score);

  return (
    <>
      <style>{styles}</style>
      <div className="adm-page">

        {/* ── Header ── */}
        <div className="adm-header">
          <div>
            <div className="adm-title">Beat the Bot</div>
            <div className="adm-case-label">Admin Control Panel</div>
          </div>
          <div className="adm-active-badge">
            Active: <span>{activeStory || "—"}</span>
          </div>
        </div>

        <div className="adm-body">

          {/* ── Story switcher ── */}
          <div>
            <div className="adm-section-label">Story</div>
            <div className="adm-controls">
              <select
                className="adm-select"
                value={selectedStory}
                onChange={(e) => { setSelectedStory(e.target.value); setSwitchMsg(null); }}
              >
                {stories.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                className="btn-primary"
                onClick={changeStory}
                disabled={loading || selectedStory === activeStory}
              >
                {loading ? "Switching…" : "Switch Story"}
              </button>

              <button className="btn-danger" onClick={resetScores}>
                Reset Leaderboard
              </button>
            </div>

            {switchMsg && (
              <div className={`adm-feedback ${switchMsg.ok ? "ok" : "err"}`} style={{ marginTop: 12 }}>
                {switchMsg.text}
              </div>
            )}
          </div>

          <hr className="adm-divider" />

          {/* ── Leaderboard ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="adm-section-label" style={{ marginBottom: 0 }}>
                Live Submissions ({scores.length})
              </div>
              <div className="adm-live">
                <div className="adm-live-dot" />
                Live
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="adm-empty">No submissions yet.</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th className="right">Score</th>
                      <th className="right">Hints</th>
                      <th className="right">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s, i) => (
                      <tr key={i}>
                        <td className="adm-rank">#{i + 1}</td>
                        <td className="adm-name">{s.name}</td>
                        <td className="adm-score right">{s.score}</td>
                        <td className="right">{s.hintsUsed}</td>
                        <td className="right">{s.questionsUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}