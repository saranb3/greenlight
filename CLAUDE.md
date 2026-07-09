# Greenlight

Live, voice-driven mock PM interview practice. Next.js (App Router) web app.
Pick a question → run a timed 25-min session with a sparse AI interviewer →
get graded feedback across five PM competencies.

## Design Context

This project has a `PRODUCT.md` at the root — read it before any design/UI work.

- **Register:** product · **Platform:** web
- **What:** a clean coaching *tool*; design serves the interview workflow, not a marketing site
- **Users:** aspiring PMs breaking in — anxious, self-directed prep; goal is confidence and less anxiety
- **Personality:** clean, calm, coaching. Cohesive type + color system across every surface.
- **Avoid (anti-references):** editorial/magazine styling (serif display type, literary voice — the current build's Fraunces direction is being retired), generic SaaS-dashboard slop (purple-gradient-on-white, Inter-everywhere, hero-metric cards), and cold enterprise/exam-simulator energy.
- **A11y:** baseline — ≥4.5:1 body contrast, keyboard-navigable, visible focus, honor `prefers-reduced-motion`. Voice is Chrome-only, so the typed-answer fallback must always work.

The full strategic doc (principles, purpose) is in `PRODUCT.md`.
