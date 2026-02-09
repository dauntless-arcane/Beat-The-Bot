import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "user" | "bot";
  text: string;
};

const API = import.meta.env.DEV ? "http://localhost:3000" : "";


export default function App() {
  

  /* ---------------- State ---------------- */

  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const [input, setInput] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(20);
  const [loading, setLoading] = useState(false);

  const [showGuess, setShowGuess] = useState(false);
  const [waiting, setWaiting] = useState(false); // ⭐ added

  const [killer, setKiller] = useState("");
  const [weapon, setWeapon] = useState("");
  const [location, setLocation] = useState("");
  const [timeGuess, setTimeGuess] = useState("");

  const [hintsUsed, setHintsUsed] = useState(0);
  const [motive, setMotive] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  /* ================================================= */
  /* Load Game State */
  /* ================================================= */

  useEffect(() => {
    // Always start fresh on refresh - remove localStorage loading
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
  }, []);

  /* ================================================= */
  /* Story change auto reset */
  /* ================================================= */

  useEffect(() => {
    const i = setInterval(() => {
      fetch("/api/activeStory.json", {
        cache: "no-store"
      })

        .then(r => r.json())
        .then(data => {
          if (data.id !== localStorage.getItem("storyId")) {
            localStorage.clear();
            window.location.reload();
          }
        });
    }, 5000);

    return () => clearInterval(i);
  }, []);


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
        motive
      }),
    });

    const data = await res.json();

    await fetch(`${API}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        score: data.score,
        questionsUsed: 20 - questionsLeft,
        hintsUsed
      }),
    });

    setWaiting(true); // ⭐ only change after submit
  };

  /* ================================================= */
  /* GUESS FORM MODAL */
  /* ================================================= */

  if (showGuess) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-center">Make Your Guess</h2>

          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 outline-none"
            placeholder="Killer"
            value={killer}
            onChange={(e) => setKiller(e.target.value)}
          />

          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 outline-none"
            placeholder="Weapon"
            value={weapon}
            onChange={(e) => setWeapon(e.target.value)}
          />

          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 outline-none"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 outline-none"
            placeholder="Time"
            value={timeGuess}
            onChange={(e) => setTimeGuess(e.target.value)}
          />

          <input
            className="w-full bg-zinc-800 rounded px-3 py-2 outline-none"
            placeholder="Motive"
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowGuess(false)}
              className="flex-1 px-4 py-2 bg-zinc-700 rounded"
            >
              Cancel
            </button>

            <button
              onClick={submitGuess}
              className="flex-1 px-4 py-2 bg-emerald-600 rounded"
            >
              Submit Guess
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================= */
  /* WAITING SCREEN */
  /* ================================================= */

  if (waiting) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white text-center">
        <div>
          <h1 className="text-2xl font-bold">Submitted</h1>
          <p className="text-zinc-400">Waiting for admin to start next round…</p>
        </div>
      </div>
    );
  }

  /* ================================================= */
  /* UI */
  /* ================================================= */

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">

      <div className="w-full max-w-2xl h-[90vh] bg-zinc-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">

        <div className="p-4 border-b border-zinc-800 text-center">
          <h1 className="text-2xl font-bold">Beat the Bot</h1>
        </div>

        <div className="flex justify-between items-center p-3 border-b border-zinc-800 text-sm">
          <span>Questions: {questionsLeft}</span>

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
    </div>
  );
}
