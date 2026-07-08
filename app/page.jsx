"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { QUESTION_BANK, RUBRIC } from "@/lib/questions";

// ---------------------------------------------------------------------------
// Greenlight — PM interview practice room (interactive interviewer)
// idle → live → grading → report
// Turn loop: user speaks → 2.5s silence → sparse AI follow-up (spoken) → repeat
// ---------------------------------------------------------------------------

const INK = "#171B26";
const SOFT = "#5D6470";
const PAPER = "#F6F7F4";
const PANEL = "#FFFFFF";
const LINE = "#E4E6E1";
const ACCENT = "#0E6E66";
const GOOD = "#2FA65A";
const MID = "#E0A93C";
const LOW = "#D9534F";

const SESSION_SECONDS = 25 * 60; // strict 25-minute interview
const SILENCE_MS = 2500; // pause length that hands the floor to the interviewer
const BARGE_RMS = 0.08; // mic loudness (0–1) that counts as the candidate cutting in

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const scoreColor = (n) => (n >= 4 ? GOOD : n === 3 ? MID : LOW);

function ScoreBar({ score }) {
  return (
    <div className="flex gap-1 flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{ background: i <= score ? scoreColor(score) : "#E8EAE6" }}
        />
      ))}
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color || "currentColor"} strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke={color || "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TranscriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 9h8M8 13h8M8 17h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chevron({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        flexShrink: 0,
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const WAVE_BARS = 7;

function Waveform({ active, color, analyser, synthetic }) {
  const barRefs = useRef([]);
  const rafRef = useRef(0);

  // Real-time mode: drive each bar's height from the live mic spectrum.
  // Only when we have an analyser, we're active, and we're not deliberately
  // showing the synthetic (interviewer-speaking / grading) animation.
  const realMode = active && !!analyser && !synthetic;

  useEffect(() => {
    if (!realMode) {
      // Hand control back to CSS (synthetic animation or flat idle bars).
      barRefs.current.forEach((el) => {
        if (el) el.style.height = "";
      });
      return;
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    const step = Math.max(1, Math.floor(data.length / WAVE_BARS));
    const render = () => {
      analyser.getByteFrequencyData(data);
      for (let i = 0; i < WAVE_BARS; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) sum += data[i * step + j] || 0;
        const avg = sum / step / 255; // 0..1
        const h = 6 + Math.pow(avg, 0.75) * 34; // 6..40px, eased for liveliness
        const el = barRefs.current[i];
        if (el) el.style.height = `${h}px`;
      }
      rafRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(rafRef.current);
  }, [realMode, analyser]);

  return (
    <div className="flex items-end gap-1 h-10" aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barRefs.current[i] = el)}
          className="w-1.5 rounded-full"
          style={{
            background: active ? color || ACCENT : "#C9CDC7",
            height: !active || realMode ? "8px" : undefined,
            transition: realMode ? "height 0.05s linear" : "none",
            animation:
              active && !realMode
                ? `gl-wave 0.9s ease-in-out ${i * 0.11}s infinite`
                : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState({
    category: QUESTION_BANK[2].category,
    question: QUESTION_BANK[2].questions[0],
  });
  const [phase, setPhase] = useState("idle"); // idle | live | grading | report
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [turns, setTurns] = useState([]); // {role: 'you'|'interviewer', t, text}
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [aiState, setAiState] = useState("idle"); // idle | thinking | speaking
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState(() => ({
    // Start with only the category of the pre-selected question expanded,
    // so the full bank doesn't overwhelm on first load.
    [QUESTION_BANK[2].category]: true,
  }));

  const toggleCategory = (category) =>
    setOpenCategories((s) => ({ ...s, [category]: !s[category] }));

  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const startedAtRef = useRef(null);
  const lastSpeechAtRef = useRef(0);
  const aiBusyRef = useRef(false);
  const turnsRef = useRef([]);
  const interimRef = useRef("");
  const timeLeftRef = useRef(SESSION_SECONDS);
  const phaseRef = useRef("idle");
  const transcriptBoxRef = useRef(null);

  // Live mic metering (Web Audio) — powers the real-time waveform and
  // frame-accurate barge-in.
  const [analyser, setAnalyser] = useState(null);
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const meterRafRef = useRef(0);
  const bargeFramesRef = useRef(0);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  useEffect(() => {
    interimRef.current = interim;
  }, [interim]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Detect browser capabilities after mount so the first client render matches
  // the server (both false) — otherwise these `typeof window` checks flip
  // between server and client and cause a hydration mismatch.
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  useEffect(() => {
    setSpeechSupported(
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
    setTtsSupported("speechSynthesis" in window);
  }, []);

  // -- timer ------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          endSession();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // -- autoscroll transcript ----------------------------------------------------
  useEffect(() => {
    const el = transcriptBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, interim, showTranscript]);

  const elapsedLabel = () => {
    if (!startedAtRef.current) return "00:00";
    return fmt(Math.floor((Date.now() - startedAtRef.current) / 1000));
  };

  const addTurn = (role, text) => {
    setTurns((s) => [...s, { role, t: elapsedLabel(), text }]);
  };

  // -- text to speech -----------------------------------------------------------
  const speak = (text, onDone) => {
    if (!ttsSupported) {
      onDone && onDone();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const v =
      voices.find(
        (x) => x.lang.startsWith("en") && /Google|Samantha|Daniel/.test(x.name)
      ) || voices.find((x) => x.lang.startsWith("en"));
    if (v) u.voice = v;
    u.rate = 1.0;
    u.onend = () => onDone && onDone();
    u.onerror = () => onDone && onDone();
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if (ttsSupported) window.speechSynthesis.cancel();
  };

  // -- live mic meter (real-time waveform + instant barge-in) -----------------------
  const startMicMeter = useCallback(async () => {
    if (analyserRef.current) return; // already running
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.6;
      src.connect(an);
      analyserRef.current = an;
      setAnalyser(an);

      const timeData = new Uint8Array(an.fftSize);
      const loop = () => {
        an.getByteTimeDomainData(timeData);
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / timeData.length);
        // Instant barge-in: the moment the candidate makes sustained sound,
        // cut the interviewer off — no waiting on speech recognition.
        if (
          aiBusyRef.current &&
          window.speechSynthesis?.speaking &&
          rms > BARGE_RMS
        ) {
          bargeFramesRef.current += 1;
          if (bargeFramesRef.current >= 2) {
            stopSpeaking();
            aiBusyRef.current = false;
            setAiState("idle");
            lastSpeechAtRef.current = Date.now();
            bargeFramesRef.current = 0;
          }
        } else {
          bargeFramesRef.current = 0;
        }
        meterRafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (_) {
      // Mic blocked — typing and the synthetic waveform still work.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopMicMeter = useCallback(() => {
    cancelAnimationFrame(meterRafRef.current);
    bargeFramesRef.current = 0;
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAnalyser(null);
  }, []);

  // -- speech recognition ---------------------------------------------------------
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      // Barge-in: the candidate started talking — cut the interviewer off.
      if (aiBusyRef.current && window.speechSynthesis?.speaking) {
        stopSpeaking();
        aiBusyRef.current = false;
        setAiState("idle");
      }
      lastSpeechAtRef.current = Date.now();
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          const text = res[0].transcript.trim();
          if (text) addTurn("you", text);
        } else {
          interimText += res[0].transcript;
        }
      }
      setInterim(interimText);
    };
    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch (_) {}
      } else {
        setListening(false);
      }
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") {
        setError(
          "Microphone access was blocked. You can type your answers below instead."
        );
        listeningRef.current = false;
        setListening(false);
      }
    };
    recRef.current = rec;
    listeningRef.current = true;
    setListening(true);
    try {
      rec.start();
    } catch (_) {}
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    try {
      recRef.current && recRef.current.stop();
    } catch (_) {}
  }, []);

  // -- the turn-taking loop --------------------------------------------------------
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => {
      if (aiBusyRef.current) return;
      if (interimRef.current) return; // still mid-utterance
      const t = turnsRef.current;
      if (t.length === 0) return;
      const last = t[t.length - 1];
      if (last.role !== "you") return; // nothing new since interviewer spoke
      if (Date.now() - lastSpeechAtRef.current < SILENCE_MS) return;
      runInterviewerTurn();
    }, 400);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const conversationText = (t) =>
    t
      .map((x) => `${x.role === "you" ? "CANDIDATE" : "INTERVIEWER"}: ${x.text}`)
      .join("\n");

  const runInterviewerTurn = async () => {
    aiBusyRef.current = true;
    setAiState("thinking");
    try {
      const res = await fetch("/api/interviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selected.question,
          transcript: conversationText(turnsRef.current),
          minsLeft: Math.ceil(timeLeftRef.current / 60),
        }),
      });
      const { reply } = await res.json();
      if (phaseRef.current !== "live" || !reply) {
        aiBusyRef.current = false;
        setAiState("idle");
        return;
      }
      addTurn("interviewer", reply);
      setAiState("speaking");
      speak(reply, () => {
        aiBusyRef.current = false;
        setAiState("idle");
        lastSpeechAtRef.current = Date.now(); // don't instantly re-trigger
      });
    } catch (e) {
      aiBusyRef.current = false;
      setAiState("idle");
    }
  };

  // -- session control ---------------------------------------------------------------
  const startSession = () => {
    setTurns([]);
    setInterim("");
    setFeedback(null);
    setError(null);
    setTimeLeft(SESSION_SECONDS);
    startedAtRef.current = Date.now();
    lastSpeechAtRef.current = Date.now();
    setPhase("live");
    if (speechSupported) {
      startListening();
      startMicMeter();
    }
    const opener = `Thanks for coming in. Here's your question: ${selected.question}`;
    aiBusyRef.current = true;
    setAiState("speaking");
    setTimeout(() => {
      addTurn("interviewer", opener);
      speak(opener, () => {
        aiBusyRef.current = false;
        setAiState("idle");
        lastSpeechAtRef.current = Date.now();
      });
    }, 400);
  };

  const endSession = async () => {
    stopListening();
    stopMicMeter();
    stopSpeaking();
    aiBusyRef.current = false;
    setAiState("idle");
    setPhase("grading");
    const userTurns = turnsRef.current.filter((x) => x.role === "you");
    if (userTurns.length === 0) {
      setFeedback({
        summary:
          "No answer was captured this session. Start a new session and speak (or type) your response — the interviewer will follow up whenever you pause.",
        scores: RUBRIC.map((dimension) => ({
          dimension,
          score: 1,
          comment: "No response to evaluate.",
        })),
      });
      setPhase("report");
      return;
    }
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selected.question,
          transcript: conversationText(turnsRef.current),
        }),
      });
      const fb = await res.json();
      if (fb.error) throw new Error(fb.error);
      setFeedback(fb);
      setPhase("report");
    } catch (e) {
      setError(
        "Couldn't reach the grading service. Your transcript is saved on screen — try ending again in a moment."
      );
      setPhase("live");
    }
  };

  const addTyped = () => {
    const t = typed.trim();
    if (!t) return;
    addTurn("you", t);
    lastSpeechAtRef.current = Date.now() - SILENCE_MS; // typed = finished thought
    setTyped("");
  };

  const resetToIdle = () => {
    stopListening();
    stopMicMeter();
    stopSpeaking();
    aiBusyRef.current = false;
    setAiState("idle");
    setPhase("idle");
    setFeedback(null);
    setTurns([]);
    setInterim("");
    setError(null);
    setTimeLeft(SESSION_SECONDS);
  };

  const pickQuestion = (category, question) => {
    if (phase === "live" || phase === "grading") return;
    setSelected({ category, question });
    resetToIdle();
  };

  const timerUrgent = phase === "live" && timeLeft <= 60;
  const elapsed = SESSION_SECONDS - timeLeft;

  const activeGroup = QUESTION_BANK.find((g) => g.category === selected.category);
  const qIndex = activeGroup ? activeGroup.questions.indexOf(selected.question) : -1;

  const liveStatus =
    aiState === "thinking"
      ? "Interviewer is thinking…"
      : aiState === "speaking"
      ? "Interviewer is speaking — feel free to jump in"
      : listening
      ? "Listening — pause for a moment to hand over"
      : "Mic is off";

  // -------------------------------------------------------------------------

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{
        background: `radial-gradient(1100px 700px at 75% -12%, #E9F0E8 0%, rgba(233,240,232,0) 60%), ${PAPER}`,
        color: INK,
        fontFamily: "'Archivo', ui-sans-serif, sans-serif",
      }}
    >
      {/* ------------------------------------------------ left: question bank */}
      <aside
        className="shrink-0 h-full overflow-y-auto flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: sidebarCollapsed ? "3.5rem" : "18rem",
          background: PANEL,
          borderRight: `1px solid ${LINE}`,
        }}
      >
        {sidebarCollapsed ? (
          /* -- collapsed rail: hamburger + logo only -- */
          <div className="flex flex-col items-center pt-5 gap-4">
            <button
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand question bank"
              title="Expand question bank"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: INK }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EEF0EC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <HamburgerIcon />
            </button>
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: ACCENT }}
            >
              <span className="text-white text-sm gl-display font-bold">G</span>
            </div>
          </div>
        ) : (
          <>
            <div
              className="px-5 pt-6 pb-4"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: ACCENT }}
                  >
                    <span className="text-white text-sm gl-display font-bold">
                      G
                    </span>
                  </div>
                  <span className="gl-display font-semibold text-lg tracking-tight">
                    Greenlight
                  </span>
                </div>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  aria-label="Collapse question bank"
                  title="Collapse question bank"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: SOFT }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#EEF0EC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <HamburgerIcon />
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: SOFT }}>
                Live mock PM interviews. 25 minutes, graded.
              </p>
            </div>

            <nav className="flex-1 px-3 py-4">
              {QUESTION_BANK.map((group) => {
                const open = !!openCategories[group.category];
                const count = group.questions.length;
                return (
                  <div key={group.category} className="mb-2">
                    <button
                      onClick={() => toggleCategory(group.category)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors"
                      style={{ color: SOFT }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F2F3F0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      aria-expanded={open}
                    >
                      <span className="flex items-center gap-1.5">
                        {group.category}
                        <span
                          className="text-[10px] font-semibold tabular-nums"
                          style={{ color: "#A5AAA3" }}
                        >
                          {count}
                        </span>
                      </span>
                      <Chevron open={open} />
                    </button>
                    {open && (
                      <div className="mt-1">
                        {group.questions.map((q) => {
                          const active = selected.question === q;
                          const locked =
                            phase === "live" || phase === "grading";
                          return (
                            <button
                              key={q}
                              onClick={() =>
                                pickQuestion(group.category, q)
                              }
                              className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors"
                              style={{
                                background: active ? "#E7F0EE" : "transparent",
                                color: active ? ACCENT : INK,
                                fontWeight: active ? 600 : 400,
                                opacity: locked && !active ? 0.45 : 1,
                                cursor:
                                  locked && !active
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              {q}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </>
        )}
      </aside>

      {/* ------------------------------------------------ center: the room */}
      <main className="flex-1 h-full relative flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-8 py-8">
        <div className="w-full max-w-2xl">
          <div className="gl-rise flex items-center gap-3 mb-5">
            <span
              className="gl-mono text-[11px] uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              {selected.category}
            </span>
            <span className="h-px flex-1" style={{ background: LINE }} />
            {qIndex >= 0 && (
              <span
                className="gl-mono text-[11px] tabular-nums uppercase tracking-[0.22em]"
                style={{ color: "#A5AAA3" }}
              >
                No. {String(qIndex + 1).padStart(2, "0")} / {activeGroup.questions.length}
              </span>
            )}
          </div>
          <h1
            className="gl-display gl-rise"
            style={{
              fontSize: "clamp(30px, 3.6vw, 44px)",
              lineHeight: 1.12,
              fontWeight: 560,
              letterSpacing: "-0.015em",
              animationDelay: "0.07s",
            }}
          >
            {selected.question}
          </h1>

          {phase === "idle" && (
            <div className="mt-14">
              <div
                className="gl-rise h-px w-full"
                style={{ background: LINE, animationDelay: "0.14s" }}
              />
              <div
                className="gl-rise flex flex-wrap items-end justify-between gap-x-12 gap-y-8 pt-8"
                style={{ animationDelay: "0.2s" }}
              >
                <div>
                  <div
                    className="gl-mono text-[11px] uppercase tracking-[0.22em] mb-2"
                    style={{ color: SOFT }}
                  >
                    Session
                  </div>
                  <div
                    className="gl-mono tabular-nums"
                    style={{
                      fontSize: "clamp(56px, 7vw, 84px)",
                      fontWeight: 500,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: INK,
                    }}
                  >
                    25:00
                  </div>
                </div>
                <div className="flex flex-col items-start gap-4 pb-1">
                  <button
                    onClick={startSession}
                    className="gl-display flex items-center gap-3 pl-5 pr-7 py-3.5 rounded-full text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                    style={{ background: ACCENT, fontSize: 17, fontWeight: 560 }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: "#7CE0A3",
                        animation: "gl-pulse 2s ease-in-out infinite",
                      }}
                    />
                    Begin interview
                  </button>
                  <div
                    className="gl-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "#A5AAA3" }}
                  >
                    {speechSupported
                      ? "Live voice · Follow-ups · Graded"
                      : "Typed answers · Follow-ups · Graded"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === "live" && (
            <div className="gl-rise mt-10 flex flex-col items-center text-center">
              <div
                className="flex items-center gap-2.5 gl-mono text-[11px] uppercase tracking-[0.28em]"
                style={{ color: timerUrgent ? LOW : ACCENT }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: timerUrgent ? LOW : GOOD,
                    animation: "gl-pulse 1.6s ease-in-out infinite",
                  }}
                />
                On air
              </div>
              <div
                className="gl-mono tabular-nums mt-4"
                style={{
                  fontSize: "clamp(64px, 9vw, 104px)",
                  fontWeight: 500,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                  color: timerUrgent ? LOW : INK,
                }}
              >
                {fmt(elapsed)}
              </div>
              <div
                className="gl-mono text-[11px] uppercase tracking-[0.22em] mt-3"
                style={{ color: timerUrgent ? LOW : "#A5AAA3" }}
              >
                {fmt(timeLeft)} remaining
              </div>
              <div
                className="relative mt-5 h-px"
                style={{ width: "min(280px, 100%)", background: LINE }}
              >
                <div
                  className="absolute left-0 top-0 h-px transition-all"
                  style={{
                    width: `${(elapsed / SESSION_SECONDS) * 100}%`,
                    background: timerUrgent ? LOW : ACCENT,
                  }}
                />
              </div>

              <div className="mt-9">
                <Waveform
                  active={listening || aiState === "speaking"}
                  color={
                    aiState === "speaking" || aiState === "thinking" ? INK : ACCENT
                  }
                  analyser={analyser}
                  synthetic={aiState === "speaking" || aiState === "thinking"}
                />
              </div>
              <p className="mt-4 text-sm font-medium">{liveStatus}</p>
              <p className="text-xs mt-1 mb-6" style={{ color: SOFT }}>
                {aiState === "idle" && listening
                  ? "Keep reasoning out loud. A 2–3 second pause hands the floor over."
                  : "\u00A0"}
              </p>
              <div className="flex gap-3 mb-6">
                {speechSupported && (
                  <button
                    onClick={listening ? stopListening : startListening}
                    className="px-5 py-2 rounded-full text-sm font-semibold"
                    style={{
                      border: `1px solid ${LINE}`,
                      color: INK,
                      background: "#fff",
                    }}
                  >
                    {listening ? "Pause mic" : "Resume mic"}
                  </button>
                )}
                <button
                  onClick={endSession}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: INK }}
                >
                  End interview early
                </button>
              </div>

              <div className="w-full max-w-md flex gap-2">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTyped()}
                  placeholder="Backup: type a point and press Enter…"
                  className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
                  style={{ border: `1px solid ${LINE}`, background: PANEL }}
                />
                <button
                  onClick={addTyped}
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ border: `1px solid ${LINE}`, background: PANEL }}
                >
                  Add
                </button>
              </div>
              {error && (
                <p className="text-xs mt-3" style={{ color: LOW }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {phase === "grading" && (
            <div className="gl-rise mt-20 flex flex-col items-center text-center">
              <Waveform active={true} />
              <p
                className="gl-display mt-7"
                style={{ fontSize: 26, fontWeight: 560 }}
              >
                Marking your interview
              </p>
              <p
                className="gl-mono text-[11px] uppercase tracking-[0.22em] mt-3"
                style={{ color: SOFT }}
              >
                Scoring {RUBRIC.length} PM competencies
              </p>
            </div>
          )}

          {phase === "report" && feedback && (
            <div
              className="gl-rise rounded-2xl overflow-hidden mt-8"
              style={{ background: PANEL, border: `1px solid ${LINE}` }}
            >
              <div className="p-6" style={{ borderBottom: `1px solid ${LINE}` }}>
                <h2
                  className="gl-display mb-2"
                  style={{ fontSize: 22, fontWeight: 560 }}
                >
                  Summary
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#3B404A" }}>
                  {feedback.summary}
                </p>
              </div>
              <div className="p-6 flex flex-col gap-5">
                {feedback.scores.map((s) => (
                  <div key={s.dimension}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="gl-display font-semibold text-sm">
                        {s.dimension}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: scoreColor(s.score) }}
                      >
                        {s.score}/5
                      </span>
                    </div>
                    <ScoreBar score={s.score} />
                    <p className="text-sm mt-1.5" style={{ color: SOFT }}>
                      {s.comment}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="px-6 py-4 flex gap-3"
                style={{ borderTop: `1px solid ${LINE}`, background: PAPER }}
              >
                <button
                  onClick={startSession}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: ACCENT }}
                >
                  Retry this question
                </button>
                <button
                  onClick={resetToIdle}
                  className="px-5 py-2 rounded-full text-sm font-semibold"
                  style={{ border: `1px solid ${LINE}`, background: "#fff" }}
                >
                  Back to practice room
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* --------------------------------------- bottom bar: timer + transcript */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-6 py-4"
          style={{ borderTop: `1px solid ${LINE}` }}
        >
          {/* timer pill (bottom-left) */}
          {phase === "live" || phase === "grading" ? (
            <div
              className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full"
              style={{
                background: PANEL,
                border: `1px solid ${timerUrgent ? LOW : LINE}`,
              }}
            >
              <ClockIcon color={timerUrgent ? LOW : phase === "live" ? ACCENT : SOFT} />
              <span
                className="gl-mono text-base font-medium tabular-nums"
                style={{ color: timerUrgent ? LOW : phase === "live" ? ACCENT : INK }}
              >
                {fmt(timeLeft)}
              </span>
            </div>
          ) : (
            <span
              className="gl-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "#A5AAA3" }}
            >
              25:00 session · graded
            </span>
          )}

          {/* transcript button (bottom-right) */}
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{
              border: `1px solid ${LINE}`,
              background: showTranscript ? INK : PANEL,
              color: showTranscript ? "#fff" : INK,
            }}
          >
            <TranscriptIcon />
            Transcript
            {turns.length > 0 && (
              <span
                className="text-[11px] font-semibold tabular-nums px-1.5 rounded-full"
                style={{
                  background: showTranscript ? "rgba(255,255,255,0.18)" : "#EEF0EC",
                  color: showTranscript ? "#fff" : SOFT,
                }}
              >
                {turns.length}
              </span>
            )}
          </button>
        </div>
      </main>

      {/* ------------------------------------------------ transcript drawer (overlay) */}
      {showTranscript && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTranscript(false)}
          style={{ background: "rgba(23,27,38,0.28)" }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full max-w-sm flex flex-col shadow-2xl"
            style={{ background: PANEL, borderLeft: `1px solid ${LINE}` }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: SOFT }}
              >
                Transcript{turns.length ? ` · ${turns.length}` : ""}
              </span>
              <button
                onClick={() => setShowTranscript(false)}
                aria-label="Close transcript"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: SOFT }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EEF0EC")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <CloseIcon />
              </button>
            </div>
            <div ref={transcriptBoxRef} className="flex-1 overflow-y-auto px-5 py-4">
              {turns.length === 0 && !interim && (
                <p className="text-sm mt-2" style={{ color: "#A5AAA3" }}>
                  The conversation will appear here — both of you. Everything is
                  captured even while this is closed.
                </p>
              )}
              {turns.map((s, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: s.role === "you" ? ACCENT : INK }}
                    >
                      {s.role === "you" ? "You" : "Interviewer"}
                    </span>
                    <span
                      className="text-[11px] tabular-nums"
                      style={{ color: "#A5AAA3" }}
                    >
                      {s.t}
                    </span>
                  </div>
                  <span className="text-sm leading-relaxed">{s.text}</span>
                </div>
              ))}
              {interim && (
                <p className="text-sm italic" style={{ color: SOFT }}>
                  {interim}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
