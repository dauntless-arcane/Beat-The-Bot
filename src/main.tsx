import ReactDOM from "react-dom/client";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import App from "./App";
import Leaderboard from "./Leaderboard";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      {<Route path="/leaderboard" element={<Leaderboard />} />}
    </Routes>
  </Router>
);
