# Product

## Register

product

## Platform

web

## Users

Aspiring PMs trying to break into the field — new grads and career-switchers
targeting their first product-management role. They arrive anxious: interviews
are high-stakes, unfamiliar, and hard to rehearse alone. Their context is
solo, self-directed prep, usually at a desk in Chrome with a mic, fitting reps
around a job hunt or a full-time job. The job to be done: get enough realistic,
low-stakes practice that the real interview stops feeling like a wall — build
fluency and calm through repetition, and learn where they're weak before it
counts.

## Product Purpose

Greenlight is a live, voice-driven mock PM interview room. The user picks a
question, runs a timed 25-minute session with a sparse AI interviewer that
follows up whenever they pause, and gets graded feedback across five PM
competencies (Communication, Product vision, Prioritization, Business strategy,
Data literacy). It exists because PM interviews reward practiced reasoning-out-
loud, and there's no cheap way to rehearse that live. Success is a user who
walks away from a session feeling more confident and less anxious than when
they sat down — the real interview should feel routine because they've done it
here a dozen times.

## Brand Personality

A clean, concise coaching tool. Calm and composed, never stressful — the
interface should lower the user's heart rate, not raise it. Encouraging but
honest: a good coach, not a cheerleader and not an examiner. Voice is plain and
direct, no literary flourish. The whole product should read as one coherent
system — a consistent, cohesive typographic and color language across every
surface, so the tool feels considered and trustworthy and disappears into the
task.

Three words: **clean, calm, coaching.**

## Anti-references

- **Editorial / magazine.** No big serif display type, no literary voice, no
  decorative whitespace-as-statement. The current build's Fraunces-serif,
  editorial feel is explicitly not the target — future work should converge on
  one well-tuned type system, not a display/body pairing.
- **Generic SaaS dashboard.** No purple-gradient-on-white, no Inter-everywhere
  default, no hero-metric cards or identical feature-tile grids. The AI-slop
  look is the thing to avoid even while staying clean and familiar.
- **Cold enterprise / exam-simulator energy.** Nothing grey, joyless, or
  proctored-test-like. Timers and controls must never scream for attention;
  pressure is the interview's job, not the UI's.

## Design Principles

- **Calm under pressure.** The interview supplies the stakes; the interface
  absorbs them. Every screen should make a nervous user feel steadier, not more
  watched. Quiet defaults, forgiving states, no jarring feedback.
- **One coherent system.** Cohesion is the brand. A single type family and a
  disciplined palette carry every surface — headings, labels, data, feedback —
  so nothing feels bolted on and the tool reads as considered end to end.
- **Coach, not judge.** Grading and follow-ups exist to help the candidate
  improve, not to rank or intimidate them. Feedback is specific, honest, and
  constructive — pointed at the weakness and the fix, never at the person.
- **Reps over lectures.** The product's value is volume of realistic practice.
  Keep the friction from "I want to practice" to "I'm mid-interview" near zero;
  make starting the next rep effortless.
- **Concise over expressive.** Say the necessary thing plainly and stop. Clean,
  direct, uncluttered — clarity is the aesthetic, not decoration.

## Accessibility & Inclusion

Baseline for now, not a formal certification target: maintain ≥4.5:1 contrast
on body text, keep the app keyboard-navigable with visible focus, and honor
`prefers-reduced-motion` (already handled). Because voice capture is Chrome-only
(Web Speech API), the typed-answer fallback must always be present and usable so
non-Chrome and mic-blocked users can still complete a full session. Given the
anxious audience, avoid surprise sounds and keep escape hatches (pause mic, end
early) obvious.
