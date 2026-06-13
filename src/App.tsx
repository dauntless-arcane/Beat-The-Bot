import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "user" | "bot";
  text: string;
};

const API = import.meta.env.DEV ? "http://localhost:3000" : "";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0D0D0F;
    color: #E8E3D8;
  }

  .btb-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #0D0D0F;
  }

  .btb-shell {
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
  .btb-header {
    padding: 14px 20px 10px;
    border-bottom: 1px solid #C9952A;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .btb-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #C9952A;
  }
  .btb-case-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4a4a6a;
    margin-top: 2px;
  }
  .btb-subtitle {
    font-family: 'Crimson Pro', serif;
    font-size: 17px;
    font-style: italic;
    color: #E8E3D8;
    opacity: 0.6;
  }

  /* ── Toolbar ── */
  .btb-toolbar {
    background: #111114;
    border-bottom: 0.5px solid #2a2a2e;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .btb-counter {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #8A8A9A;
    letter-spacing: 0.06em;
  }
  .btb-counter-num {
    color: #C9952A;
    font-weight: 500;
  }
  .btb-actions {
    display: flex;
    gap: 8px;
  }

  /* ── Buttons ── */
  .btn-hint {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 14px;
    border: 0.5px solid #4a4a6a;
    background: transparent;
    color: #8A8A9A;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .btn-hint:hover:not(:disabled) { border-color: #8A8A9A; color: #E8E3D8; }
  .btn-hint:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-guess {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 14px;
    border: 0.5px solid #C9952A;
    background: transparent;
    color: #C9952A;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-guess:hover { background: #C9952A; color: #0D0D0F; }

  /* ── Chat ── */
  .btb-chat {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    scrollbar-width: thin;
    scrollbar-color: #2a2a2e transparent;
  }

  .msg-bot-wrap {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    max-width: 82%;
  }
  .msg-bot-avatar {
    width: 22px;
    height: 22px;
    border: 0.5px solid #C9952A;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 3px;
  }
  .msg-bot-dot {
    width: 6px;
    height: 6px;
    background: #C9952A;
    border-radius: 50%;
  }
  .msg-bot-text {
    font-family: 'Crimson Pro', serif;
    font-size: 16px;
    line-height: 1.7;
    color: #C8C3B8;
    border-left: 2px solid #2a2a2e;
    padding-left: 12px;
  }

  .msg-user-wrap {
    align-self: flex-end;
    max-width: 75%;
  }
  .msg-user-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4a4a6a;
    text-align: right;
    margin-bottom: 4px;
  }
  .msg-user-text {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    line-height: 1.7;
    color: #E8E3D8;
    background: #1a1a20;
    border: 0.5px solid #3a3a48;
    border-radius: 3px;
    padding: 10px 14px;
  }

  /* ── Input row ── */
  .btb-input-row {
    border-top: 0.5px solid #2a2a2e;
    padding: 12px 16px;
    display: flex;
    gap: 10px;
    align-items: center;
    background: #0D0D0F;
  }
  .btb-input {
    flex: 1;
    background: #111114;
    border: 0.5px solid #2a2a2e;
    border-radius: 3px;
    padding: 9px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #E8E3D8;
    outline: none;
    transition: border-color 0.15s;
  }
  .btb-input::placeholder { color: #4a4a6a; }
  .btb-input:focus { border-color: #4a4a6a; }
  .btb-input:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-send {
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
  .btn-send:hover:not(:disabled) { opacity: 0.85; }
  .btn-send:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Guess modal ── */
  .btb-modal-page {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0D0D0F;
    padding: 16px;
  }
  .btb-modal {
    width: 100%;
    max-width: 420px;
    background: #111114;
    border: 0.5px solid #2a2a2e;
    border-radius: 12px;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .btb-modal-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #C9952A;
    text-align: center;
    margin-bottom: 4px;
  }
  .btb-modal-input {
    width: 100%;
    background: #0D0D0F;
    border: 0.5px solid #2a2a2e;
    border-radius: 3px;
    padding: 9px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #E8E3D8;
    outline: none;
    transition: border-color 0.15s;
  }
  .btb-modal-input::placeholder { color: #4a4a6a; }
  .btb-modal-input:focus { border-color: #4a4a6a; }

  .btb-modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }
  .btn-cancel {
    flex: 1;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 9px;
    border: 0.5px solid #4a4a6a;
    background: transparent;
    color: #8A8A9A;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .btn-cancel:hover { border-color: #8A8A9A; color: #E8E3D8; }

  .btn-submit {
    flex: 1;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 9px;
    background: #C9952A;
    color: #0D0D0F;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .btn-submit:hover { opacity: 0.85; }

  /* ── Waiting screen ── */
  .btb-waiting {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0D0D0F;
    text-align: center;
    flex-direction: column;
    gap: 10px;
  }
  .btb-waiting-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #C9952A;
  }
  .btb-waiting-sub {
    font-family: 'Crimson Pro', serif;
    font-size: 16px;
    font-style: italic;
    color: #4a4a6a;
  }

  @keyframes btb-fade {
    0%   { opacity: 0; transform: translateY(3px); }
    15%  { opacity: 0.5; transform: translateY(0); }
    85%  { opacity: 0.5; }
    100% { opacity: 0; }
  }
  .msg-loading {
    animation: btb-fade 1.8s ease-in-out infinite;
  }
`;

export default function App() {

  /* ---------------- State ---------------- */

  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const [input, setInput] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(20);
  const [loading, setLoading] = useState(false);

  const [showGuess, setShowGuess] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [killer, setKiller] = useState("");
  const [weapon, setWeapon] = useState("");
  const [location, setLocation] = useState("");
  const [timeGuess, setTimeGuess] = useState("");

  const [hintsUsed, setHintsUsed] = useState(0);
  const [motive, setMotive] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  const loadingPhrases = [
    "Consulting the case files…",
    "Cross-referencing alibis…",
    "Retrieving witness testimony…",
    "Reviewing the evidence…",
    "Checking the timeline…",
  ];
  const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0]);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================================================= */
  /* Load Game State */
  /* ================================================= */

  useEffect(() => {
    fetch(`${API}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "__flashback__", history: [] })
    })
      .then((r) => r.json())
      .then((d) => {
        setMessages([{ role: "bot", text: d.msg }]);
      });
  }, []);

  /* ================================================= */
  /* Story change auto reset */
  /* ================================================= */

  useEffect(() => {
    const i = setInterval(() => {
      fetch("/api/activeStory", { cache: "no-store" })
        .then(r => r.json())
        .then(data => {
          const saved = localStorage.getItem("storyId");
          if (!saved) { localStorage.setItem("storyId", data.id); return; }
          if (data.id !== saved) { localStorage.setItem("storyId", data.id); window.location.reload(); }
        });
    }, 5000);
    return () => clearInterval(i);
  }, []);

  /* ================================================= */
  /* Loading phrase cycling */
  /* ================================================= */

  useEffect(() => {
    if (loading) {
      let idx = 0;
      setLoadingPhrase(loadingPhrases[0]);
      loadingIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % loadingPhrases.length;
        setLoadingPhrase(loadingPhrases[idx]);
      }, 1800);
    } else {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    }
    return () => { if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current); };
  }, [loading]);

  /* ================================================= */
  /* Auto Scroll */
  /* ================================================= */

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const gameOver = questionsLeft <= 0;

  /* ================================================= */
  /* Ask Question */
  /* ================================================= */

  const sendQuestion = async () => {
    if (!input.trim() || gameOver || loading) return;
    const text = input;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setQuestionsLeft((q) => q - 1);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.msg }]);
      setHistory((h) => [...h, `User: ${text}`, `AI: ${data.msg}`]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "My memory fades… try again." }]);
    }
    setLoading(false);
  };

  /* ================================================= */
  /* Hint */
  /* ================================================= */

  const askHint = async () => {
    if (gameOver || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/hint`, { method: "POST" });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.msg }]);
      setHintsUsed((h) => h + 1);
      setQuestionsLeft((q) => Math.max(0, q - 2));
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Hint unavailable…" }]);
    }
    setLoading(false);
  };

  /* ================================================= */
  /* Submit Guess */
  /* ================================================= */

  const submitGuess = async () => {
    const name = prompt("Enter team name") || "Anonymous";
    const res = await fetch(`${API}/api/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ killer, weapon, location, time: timeGuess, motive }),
    });
    const data = await res.json();
    await fetch(`${API}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score: data.score, questionsUsed: 20 - questionsLeft, hintsUsed }),
    });
    setWaiting(true);
  };

  /* ================================================= */
  /* GUESS FORM MODAL */
  /* ================================================= */

  if (showGuess) {
    return (
      <>
        <style>{styles}</style>
        <div className="btb-modal-page">
          <div className="btb-modal">
            <div className="btb-modal-title">File Your Accusation</div>

            <input className="btb-modal-input" placeholder="Killer" value={killer} onChange={(e) => setKiller(e.target.value)} />
            <input className="btb-modal-input" placeholder="Weapon" value={weapon} onChange={(e) => setWeapon(e.target.value)} />
            <input className="btb-modal-input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input className="btb-modal-input" placeholder="Time" value={timeGuess} onChange={(e) => setTimeGuess(e.target.value)} />
            <input className="btb-modal-input" placeholder="Motive" value={motive} onChange={(e) => setMotive(e.target.value)} />

            <div className="btb-modal-actions">
              <button onClick={() => setShowGuess(false)} className="btn-cancel">Cancel</button>
              <button onClick={submitGuess} className="btn-submit">Submit</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================================================= */
  /* WAITING SCREEN */
  /* ================================================= */

  if (waiting) {
    return (
      <>
        <style>{styles}</style>
        <div className="btb-waiting">
          <div className="btb-waiting-title">Accusation Filed</div>
          <div className="btb-waiting-sub">Waiting for the next round to begin…</div>
        </div>
      </>
    );
  }

  /* ================================================= */
  /* UI */
  /* ================================================= */

  let userMsgCount = 0;

  return (
    <>
      <style>{styles}</style>
      <div className="btb-page">
        <div className="btb-shell">

          <div className="btb-header">
            <div>
              <div className="btb-title">Beat the Bot</div>
              <div className="btb-case-label">Evidence Room · Active Case</div>
            </div>
          </div>

          <div className="btb-toolbar">
            <div className="btb-counter">
              Questions: <span className="btb-counter-num">{questionsLeft}</span> / 20
            </div>
            <div className="btb-actions">
              <button onClick={askHint} disabled={gameOver} className="btn-hint">
                Hint −2
              </button>
              <button onClick={() => setShowGuess(true)} className="btn-guess">
                Guess
              </button>
            </div>
          </div>

          <div ref={chatRef} className="btb-chat">
            {messages.map((m, i) => {
              if (m.role === "user") {
                userMsgCount++;
                const qNum = userMsgCount;
                return (
                  <div key={i} className="msg-user-wrap">
                    <div className="msg-user-label">You · Q{qNum}</div>
                    <div className="msg-user-text">{m.text}</div>
                  </div>
                );
              }
              return (
                <div key={i} className="msg-bot-wrap">
                  <div className="msg-bot-avatar"><div className="msg-bot-dot" /></div>
                  <div className="msg-bot-text">{m.text}</div>
                </div>
              );
            })}
            {loading && (
              <div className="msg-bot-wrap">
                <div className="msg-bot-avatar"><div className="msg-bot-dot" /></div>
                <div className="msg-bot-text msg-loading">{loadingPhrase}</div>
              </div>
            )}
          </div>

          <div className="btb-input-row">
            <input
              className="btb-input"
              value={input}
              disabled={gameOver}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
              placeholder="Ask your next question…"
            />
            <button onClick={sendQuestion} disabled={gameOver || loading} className="btn-send">
              Send
            </button>
          </div>

        </div>
      </div>
    </>
  );
}