# Greenlight

**Live, voice-driven mock PM interviews — graded by AI.**

I built this because every PM interview prep tool I tried felt like flashcards. You read a question, type an answer in a text box, maybe get some generic feedback. But real PM interviews are conversations — an interviewer listens, pushes back, asks you to go deeper. That dynamic is what actually makes interviews hard, and nothing on the market simulated it.

Greenlight does. You pick a question, start a 25-minute session, and talk through your answer out loud. When you pause for a couple seconds, a sparse AI interviewer jumps in — sometimes just a "go on," sometimes a pointed follow-up like "okay, but how would you actually size that market?" You can talk over it and it stops, just like a real person. When the timer runs out, you get scored across five PM competencies (Communication, Product Vision, Prioritization, Business Strategy, Data Literacy) with specific coaching on what to improve.

## Why I built it this way

The core product decision was making the interviewer *sparse*. Early versions responded after every sentence, which felt like talking to someone who wouldn't stop interrupting. Real interviewers mostly listen. They interject when something is vague or when you need a nudge. Getting that cadence right — silence detection, turn-taking, barge-in — turned out to be the actual product problem, not the grading.

The grading evaluates the full conversation, not just the opening answer. How you handle a follow-up question matters more than a polished opening monologue, and the rubric reflects that.

## How it works

- **Voice capture:** Web Speech API (Chrome) streams your mic continuously. A 2.5-second silence window hands the floor to the interviewer.
- **Interviewer brain:** Claude (Sonnet) with a tightly constrained prompt — max 2 sentences, never teaches, never hints, pushes for commitment in the final 5 minutes.
- **Barge-in:** If you start talking while the interviewer is speaking, it cuts off immediately.
- **Grading:** When the 25 minutes end, the full transcript goes to Claude for scoring across 5 dimensions with written feedback.
- **API keys stay server-side.** The browser talks to Next.js API routes, never directly to Anthropic.

## Run it locally

```bash
git clone https://github.com/saranb3/greenlight.git
cd greenlight
npm install
```

Create a `.env.local` file and add your Anthropic API key (grab one from [console.anthropic.com](https://console.anthropic.com)):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Then:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) in Chrome and allow mic access.

## Project structure

```
app/
  page.jsx                     → UI + turn-taking state machine (idle → live → grading → report)
  api/interviewer/route.js     → sparse follow-up generation (server-side)
  api/grade/route.js           → full-conversation grading (server-side)
lib/
  questions.js                 → 48 questions across 5 categories + scoring rubric
```

## Deploy

Push to GitHub → import into [Vercel](https://vercel.com) → add `ANTHROPIC_API_KEY` in project environment variables. That's it.

## What's next

Things I'm actively working on or thinking about:

- **Session history** — Supabase auth + a sessions table so you can track your scores over time and see which question types you're weakest on. This is the retention hook.
- **Better voice** — Swap Web Speech API for Deepgram streaming (cross-browser, smarter endpointing) and browser TTS for ElevenLabs so the interviewer sounds like a person.
- **Question-type-aware grading** — A behavioral question should weight leadership and storytelling differently than an estimation question weights data literacy.
- **Payments** — Stripe once people are practicing regularly. Free tier: 2 sessions/day. Paid: unlimited.

## Built with

Next.js · React · Tailwind CSS · Claude API (Anthropic)
