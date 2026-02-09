import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Msg = {
  role: "user" | "bot";
  text: string;
};

const API = import.meta.env.DEV ? "http://localhost:3000" : "";

type GameState = {
  messages: Msg[];
  history: string[];
  input: string;
  questionsLeft: number;
  startTime: number;
  killer: string;
  weapon: string;
  location: string;
  timeGuess: string;
  hintsUsed: number; // ⭐ added
  motive: string; // ⭐ added
};

const STORAGE_KEY = "beatTheBotGameState";

export default function App() {
  const navigate = useNavigate();

  /* ---------------- State ---------------- */

  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const [input, setInput] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(20);
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  const [showGuess, setShowGuess] = useState(false);

  const [killer, setKiller] = useState("");
  const [weapon, setWeapon] = useState("");
  const [location, setLocation] = useState("");
  const [timeGuess, setTimeGuess] = useState("");

  const [hintsUsed, setHintsUsed] = useState(0); // ⭐ added
  const [motive, setMotive] = useState(""); // ⭐ added
  const chatRef = useRef<HTMLDivElement>(null);

  /* ---------------- Timer ---------------- */

  const timeLeft = Math.max(
    0,
    600 - Math.floor((Date.now() - startTime) / 1000)
  );

  /* ================================================= */
  /* Load Game State */
  /* ================================================= */

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const state: GameState = JSON.parse(saved);

        setMessages(state.messages);
        setHistory(state.history);
        setInput(state.input);
        setQuestionsLeft(state.questionsLeft);
        setStartTime(state.startTime);
        setKiller(state.killer);
        setWeapon(state.weapon);
        setLocation(state.location);
        setTimeGuess(state.timeGuess);
        setHintsUsed(state.hintsUsed || 0); // ⭐ restore
        setMotive(state.motive || ""); // ⭐ restore
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      // first load → flashback
      fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "__flashback__",
          history: []
        })
      })
        .then((r) => r.json())
        .then((d) => {
          setMessages([{ role: "bot", text: d.msg }]);
        });
    }
  }, []);

  /* ================================================= */
  /* Save Game State */
  /* ================================================= */

  useEffect(() => {
    const state: GameState = {
      messages,
      history,
      input,
      questionsLeft,
      startTime,
      killer,
      weapon,
      location,
      timeGuess,
      hintsUsed, // ⭐ save
      motive // ⭐ save
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    messages,
    history,
    input,
    questionsLeft,
    startTime,
    killer,
    weapon,
    location,
    timeGuess,
    hintsUsed, // ⭐ dependency
    motive // ⭐ dependency
  ]);

  /* ================================================= */
  /* Timer tick */
  /* ================================================= */

  useEffect(() => {
    const t = setInterval(() => {
      setStartTime((p) => p);
    }, 1000);

    return () => clearInterval(t);
  }, []);

  /* ================================================= */
  /* Auto Scroll */
  /* ================================================= */

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  /* ================================================= */

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const gameOver = questionsLeft <= 0 || timeLeft <= 0;

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
        body: JSON.stringify({
          question: text,
          history
        }),
      });

      const data = await res.json();

      setMessages((m) => [...m, { role: "bot", text: data.msg }]);
      setHistory((h) => [...h, `User: ${text}`, `AI: ${data.msg}`]);

    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "My memory fades… try again." },
      ]);
    }

    setLoading(false);
  };

  /* ================================================= */
  /* Hint (⭐ UPDATED ONLY HERE) */
  /* ================================================= */

  const askHint = async () => {
    if (gameOver || loading) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/hint`, { method: "POST" });
      const data = await res.json();

      setMessages((m) => [...m, { role: "bot", text: data.msg }]);

      setHintsUsed((h) => h + 1); // ⭐ count hint
      setQuestionsLeft((q) => Math.max(0, q - 2)); // ⭐ deduct 2

    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Hint unavailable…" }
      ]);
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
    body: JSON.stringify({
      killer,
      weapon,
      location,
      time: timeGuess,
      motive // ⭐ IMPORTANT
    }),
  });

  const data = await res.json();

  await fetch(`${API}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      score: data.score,
      timeLeft,
      questionsUsed: 10 - questionsLeft,
      hintsUsed
    }),
  });

  localStorage.removeItem(STORAGE_KEY);

  navigate("/leaderboard");
};


  /* ================================================= */
  /* UI (UNCHANGED) */
  /* ================================================= */

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">

      <div className="w-full max-w-2xl h-[90vh] bg-zinc-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">

        <div className="p-4 border-b border-zinc-800 text-center">
          <h1 className="text-2xl font-bold">Beat the Bot</h1>

          <p className="text-sm text-zinc-400">
            Solve the mystery before time or questions run out
          </p>

          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }}
            className="mt-2 px-3 py-1 bg-red-600 rounded text-xs"
          >
            New Game
          </button>
        </div>

        <div className="flex justify-between items-center p-3 border-b border-zinc-800 text-sm">
          <span>Questions: {questionsLeft}</span>
          <span>{formatTime(timeLeft)}</span>

          <div className="space-x-2">
            <button
              onClick={askHint}
              disabled={gameOver}
              className="px-3 py-1 bg-indigo-600 rounded disabled:opacity-40"
            >
              Hint
            </button>

            <button
              onClick={() => setShowGuess(true)}
              className="px-3 py-1 bg-emerald-600 rounded"
            >
              Guess
            </button>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] px-3 py-2 rounded-xl ${
                m.role === "user"
                  ? "ml-auto bg-indigo-600"
                  : "bg-zinc-800"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800 flex gap-2">
          <input
            className="flex-1 bg-zinc-800 rounded px-3 py-2 outline-none"
            value={input}
            disabled={gameOver}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
            placeholder="Ask your question..."
          />

          <button
            onClick={sendQuestion}
            disabled={gameOver}
            className="px-4 bg-indigo-600 rounded disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>

      {showGuess && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-xl space-y-3 w-80">

            <h2 className="font-bold text-lg">Final Guess</h2>

            <input className="w-full bg-zinc-800 p-2 rounded" placeholder="Killer" value={killer} onChange={(e) => setKiller(e.target.value)} />
            <input className="w-full bg-zinc-800 p-2 rounded" placeholder="Weapon" value={weapon} onChange={(e) => setWeapon(e.target.value)} />
            <input className="w-full bg-zinc-800 p-2 rounded" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input className="w-full bg-zinc-800 p-2 rounded" placeholder="Motive" value={motive} onChange={(e) => setMotive(e.target.value)} />  {/* ⭐ added */}
            <input className="w-full bg-zinc-800 p-2 rounded" placeholder="Time" value={timeGuess} onChange={(e) => setTimeGuess(e.target.value)} />

            <div className="flex gap-2">
              <button onClick={submitGuess} className="flex-1 bg-emerald-600 py-2 rounded">
                Submit
              </button>

              <button onClick={() => setShowGuess(false)} className="flex-1 bg-zinc-700 py-2 rounded">
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
