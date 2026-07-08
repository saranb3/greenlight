# Greenlight — mock PM interviews

Live, voice-driven PM interview practice. A sparse AI interviewer follows up
whenever you pause; after a strict 25-minute session you get graded feedback
across five PM competencies.

## Run it locally

1. Install dependencies:

   npm install

2. Add your Anthropic API key (from https://console.anthropic.com):

   cp .env.local.example .env.local
   # then edit .env.local and paste your key

3. Start the dev server:

   npm run dev

4. Open http://localhost:3000 in **Chrome** (voice capture uses the Web
   Speech API, which is Chrome-only for now) and allow microphone access.

## How it works

- `app/page.jsx` — the whole UI + the turn-taking loop (idle → live → grading → report)
- `app/api/interviewer/route.js` — sparse-interviewer follow-ups (Claude, server-side)
- `app/api/grade/route.js` — grades the full conversation (Claude, server-side)
- `lib/questions.js` — question bank + rubric

The turn loop: mic streams into the Web Speech API → 2.5s of silence hands the
floor to the interviewer → its reply is spoken with browser TTS → barge-in cuts
it off if you start talking. Tune the pause with `SILENCE_MS` in `app/page.jsx`.

## Deploy

Push to GitHub, import into Vercel, set `ANTHROPIC_API_KEY` in the Vercel
project's environment variables. Done.

## Roadmap (in order)

1. Supabase: auth + save sessions (transcript, scores) for a progress view
2. Swap Web Speech → Deepgram streaming STT (cross-browser + smarter endpointing)
3. Swap browser TTS → ElevenLabs for a natural interviewer voice
4. Stripe once people are practicing repeatedly
