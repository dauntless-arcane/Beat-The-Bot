import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Admin from "./admin";
import App from "./App";
import "./index.css";
import Leaderboard from "./Leaderboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  </Router>
);
