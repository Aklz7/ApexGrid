# Apex Grid

Premium F1 fan experience with team dossiers, the 2026 race atlas, an interactive hero car, and an AI admin chat.

## Run locally

In one terminal:

```bash
npm run api
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173/`.

## Enable live AI replies

Copy `.env.example` to `.env` and add a server-side key:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=8787
```

The key is read only by `server.mjs`; it is never exposed to the browser. If no key is configured, `/api/chat` uses the built-in F1-aware fallback assistant.

## API

- `GET /api/health` — API status and whether live AI is configured.
- `POST /api/chat` — accepts `{ "message": "...", "history": [] }` and returns `{ "reply": "..." }`.