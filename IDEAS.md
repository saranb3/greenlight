# Greenlight — feature ideas

Deferred candidates, not scheduled work. Add ideas here before building them.

- **Pre-synthesized quick acknowledgments** — cache a handful of short filler
  lines ("Mm-hm.", "Go on.", "Take your time.") as ready-to-play audio clips so
  filler-style interviewer responses play with literally zero delay, even when
  speculative generation misses. (Deferred 2026-07-09 during the Kokoro TTS swap.)
- **Move Kokoro synthesis into a Web Worker** — generation currently runs on the
  main thread; a worker would keep the UI perfectly smooth on slower machines.
