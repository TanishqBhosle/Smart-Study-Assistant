# Study Assistant

A simple full‑stack app to generate study material (summary, quiz, tips) for any topic. The backend fetches Wikipedia context and uses an AI provider (Gemini/OpenAI) or a built‑in mock mode. The frontend is a React app (Vite).

## Vercel Link - https://smart-study-assistant-gs8m.vercel.app/

## Project Structure
- **backend/**: Express server, routes, AI and Wiki helpers
- **frontend/vite-project/**: React app powered by Vite

## Prerequisites
- Node.js 18+ and npm

## Setup
- **Backend**
  1. Open a terminal in `backend`.
  2. Install deps: `npm install`
  3. Create a `.env` file (see Environment Variables below).
  4. Start server: `node server.js`
     - Server runs on `http://localhost:5000`

- **Frontend**
  1. Open a terminal in `frontend/vite-project`.
  2. Install deps: `npm install`
  3. Start dev server: `npm run dev`
     - Vite runs on `http://localhost:5173` by default

## Environment Variables (backend/.env)
The app works in mock mode by default (no API keys needed). To use real AI providers, set:

```
# Select provider: mock | gemini | openai
AI_PROVIDER=mock

# Gemini (if AI_PROVIDER=gemini)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# OpenAI (if AI_PROVIDER=openai)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-3.5-turbo
```

Notes:
- If keys are missing for the selected provider, the backend falls back to mock output.

## API
- **GET** `/study?topic=<string>&mode=<string|optional>`
  - `topic` is required.
  - `mode` can be `math` to include a simple math problem.
  - Response shape (when successful):
    ```json
    {
      "status": "ok",
      "data": {
        "topic": "...",
        "source": "https://en.wikipedia.org/...",
        "summary": ["..."],
        "quiz": [{"question": "...", "options": ["A","B","C","D"], "answerIndex": 0}],
        "tip": "...",
        "math": {"question": "...", "answer": "...", "explanation": "..."}
      }
    }
    ```

## Development Tips
- Backend entry: `backend/server.js` (port 5000)
- Frontend dev server: Vite (default port 5173)
- Wiki helper: `backend/lib/wiki.js`
- AI helper and provider selection: `backend/lib/ai.js`

## Scripts
- Backend currently uses `node server.js` (no npm start script defined).
- Frontend scripts (run from `frontend/vite-project`):
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

## License
MIT (see individual package licenses in dependencies).
