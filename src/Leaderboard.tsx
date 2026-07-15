import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Entry = {
  name: string;
  score: number;
  questionsUsed: number;
  hintsUsed: number;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0D0D0F;
    color: #E8E3D8;
  }

  .lb-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #0D0D0F;
  }

  .lb-shell {
    width: 100%;
    max-width: 680px;
    height: 90vh;
    background: #0D0D0F;
    border: 0.5px solid #2a2a2e;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .lb-header {
    padding: 14px 20px 10px;
    border-bottom: 1px solid #C9952A;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .lb-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #C9952A;
  }
  .lb-case-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a4a6a;
    margin-top: 2px;
  }
  .lb-subtitle {
    font-family: 'Crimson Pro', serif;
    font-size: 17px;
    font-style: italic;
    color: #E8E3D8;
    opacity: 0.6;
  }

  /* ── Entries ── */
  .lb-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: #2a2a2e transparent;
  }

  .lb-entry {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #111114;
    border: 0.5px solid #2a2a2e;
    border-radius: 3px;
    padding: 12px 16px;
    transition: border-color 0.15s;
  }
  .lb-entry:hover { border-color: #3a3a48; }

  .lb-entry.lb-entry--first  { border-color: #C9952A; }
  .lb-entry.lb-entry--second { border-color: #6a6a7a; }
  .lb-entry.lb-entry--third  { border-color: #7a4a2a; }

  .lb-rank {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: #4a4a6a;
    width: 22px;
    flex-shrink: 0;
    text-align: right;
  }
  .lb-entry--first  .lb-rank { color: #C9952A; }
  .lb-entry--second .lb-rank { color: #8A8A9A; }
  .lb-entry--third  .lb-rank { color: #9a6a4a; }

  .lb-name {
    font-family: 'Crimson Pro', serif;
    font-size: 16px;
    color: #E8E3D8;
    flex: 1;
  }

  .lb-meta {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  .lb-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .lb-stat-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #E8E3D8;
  }
  .lb-entry--first .lb-stat-val { color: #C9952A; }
  .lb-stat-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4a4a6a;
  }

  .lb-divider {
    width: 0.5px;
    height: 28px;
    background: #2a2a2e;
    flex-shrink: 0;
  }

  /* ── Empty state ── */
  .lb-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: #4a4a6a;
  }
  .lb-empty-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .lb-empty-sub {
    font-family: 'Crimson Pro', serif;
    font-size: 15px;
    font-style: italic;
  }

  /* ── Footer ── */
  .lb-footer {
    border-top: 0.5px solid #2a2a2e;
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
    background: #0D0D0F;
  }

  .btn-play-again {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 9px 18px;
    border: 0.5px solid #C9952A;
    background: transparent;
    color: #C9952A;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-play-again:hover { background: #C9952A; color: #0D0D0F; }
`;

const rankLabel = (i: number) => String(i + 1).padStart(2, "0");

const entryClass = (i: number) => {
  if (i === 0) return "lb-entry lb-entry--first";
  if (i === 1) return "lb-entry lb-entry--second";
  if (i === 2) return "lb-entry lb-entry--third";
  return "lb-entry";
};

export default function Leaderboard() {
  const [scores, setScores] = useState<Entry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/score")              // ✅ correct endpoint
      .then((r) => r.json())
      .then((data: Entry[]) => {
        // sort by score descending
        const sorted = [...data].sort((a, b) => b.score - a.score);
        setScores(sorted);
      })
      .catch(() => setScores([]));
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="lb-page">
        <div className="lb-shell">

          <div className="lb-header">
            <div>
              <div className="lb-title">Beat the Bot</div>
              <div className="lb-case-label">Evidence Room · Case Rankings</div>
            </div>
            <div className="lb-subtitle">The Detectives</div>
          </div>

          {scores.length === 0 ? (
            <div className="lb-empty">
              <div className="lb-empty-title">No cases solved yet</div>
              <div className="lb-empty-sub">Be the first to file an accusation.</div>
            </div>
          ) : (
            <div className="lb-list">
              {scores.map((s, i) => (
                <div key={i} className={entryClass(i)}>
                  <div className="lb-rank">{rankLabel(i)}</div>
                  <div className="lb-name">{s.name}</div>
                  <div className="lb-meta">
                    <div className="lb-stat">
                      <div className="lb-stat-val">{s.score}</div>
                      <div className="lb-stat-label">Score</div>
                    </div>
                    <div className="lb-divider" />
                    <div className="lb-stat">
                      <div className="lb-stat-val">{s.questionsUsed}</div>
                      <div className="lb-stat-label">Questions</div>
                    </div>
                    <div className="lb-divider" />
                    <div className="lb-stat">
                      <div className="lb-stat-val">{s.hintsUsed}</div>
                      <div className="lb-stat-label">Hints</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="lb-footer">
            <button onClick={() => navigate("/")} className="btn-play-again">
              New Case
            </button>
          </div>

        </div>
      </div>
    </>
  );
}