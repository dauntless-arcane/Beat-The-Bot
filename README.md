# Beat The Bot

An interactive detective mystery experience built with React, TypeScript, Vite, and serverless API routes.

Players interrogate an AI narrator, request hints, and make a final accusation before their question budget runs out.

---

## Features

- Noir-themed chat UI for asking investigation questions
- 20-question limit per game
- Hint system that costs 2 questions
- Final accusation form with killer, weapon, location, time, and motive
- AI-based score grading against story solutions
- Public leaderboard storage in `api/scores.json`
- Admin panel for story switching and leaderboard resets
- Pluggable story files under `api/stories/`

---

## Setup

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Usage

### Play the game

- Open `/` in the browser to start the game
- Ask questions using the input field
- Use `Hint −2` to get a hint for 2 question points
- Click `Guess` to open the accusation form
- Submit the guess and see the result recorded on the leaderboard

### Visit the leaderboard

- Open `/leaderboard` to see saved score submissions

### Open the admin panel

- Visit `/admin` to manage story selection and leaderboard data

---

## Application Architecture

### Frontend

- `src/main.tsx` — routes the app using `react-router-dom`
- `src/App.tsx` — main gameplay UI and logic
- `src/admin.tsx` — story control and admin dashboard
- `src/Leaderboard.tsx` — leaderboard display
- `src/index.css` — global styling

### Backend API

- `api/ask.ts` — sends questions to OpenRouter and returns story-aware answers
- `api/hint.ts` — returns a random hint from the active story
- `api/guess.ts` — grades the player's accusation against the story solution
- `api/score.ts` — stores and returns score submissions
- `api/leaderboard.ts` — reads leaderboard data from `api/scores.json`
- `api/activeStory.ts` — exposes the currently active story ID
- `api/admin/stories.ts` — lists available story IDs
- `api/admin/setStory.ts` — triggers a story switch via Vercel deploy hook
- `api/admin/resetScore.ts` — clears leaderboard history

---

## Story Data

Stories are defined in `api/stories/*.json` and include:

- `flashback` — initial setup text shown at game start
- `facts` — reliable story clues for the AI prompt
- `misleading` — red herrings to add challenge
- `solution` — the correct accusation data used for scoring
- `hints` — extra hint messages

The active story is determined by the `ACTIVE_STORY` environment variable and served through `api/activeStory`.

---

## Environment Variables

The app uses these environment variables in production:

- `OPENROUTER_API_KEY` — API key for OpenRouter requests
- `ACTIVE_STORY` — current story ID, e.g. `story3`
- `VERCEL_DEPLOY_HOOK` — deploy hook URL used by the admin story switcher

> In development, front-end API calls are proxied to `http://localhost:3000`.

---

## Admin Panel Details

The admin page allows you to:

- view the currently active story
- select a different story from the available story files
- trigger a Vercel redeploy after story change
- reset the leaderboard history
- monitor recent submission scores live

**Note:** Admin story switching requires `VERCEL_DEPLOY_HOOK` to be configured.

---

## API Endpoints

### Game endpoints

- `POST /api/ask`
  - Request: `{ question: string, history: string[] }`
  - Response: `{ msg: string }`

- `POST /api/hint`
  - Response: `{ msg: string }`

- `POST /api/guess`
  - Request: `{ killer, weapon, location, time, motive }`
  - Response: `{ score, total, success }`

- `GET /api/score`
  - Returns saved score entries

- `POST /api/score`
  - Saves a score payload `{ name, score, questionsUsed, hintsUsed }`

- `GET /api/leaderboard`
  - Returns leaderboard entries

- `GET /api/activeStory`
  - Returns `{ id: string }`

### Admin endpoints

- `GET /api/admin/stories` — lists story IDs
- `POST /api/admin/setStory` — selects a new story and triggers deploy
- `POST /api/admin/resetScore` — resets scoreboard

---

## Notes

- `api/ask.ts` uses story-specific facts, misleading clues, and solution data to shape AI responses.
- `api/guess.ts` scores guesses by asking OpenRouter to compare the player input against the current story solution.
- Score persistence is file-based in `api/scores.json`.

---

## License

This repository is currently configured as a private application.
