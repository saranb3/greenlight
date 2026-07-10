// Neural text-to-speech via Kokoro-82M running entirely in the browser.
// The model downloads once (~90–300MB depending on device, cached by the
// browser after the first visit) and synthesis happens locally — no API key,
// no per-use cost, same voice on every browser.
//
// Design: createClip() starts synthesizing immediately and returns per-sentence
// audio promises, so a reply can be prepared *ahead* of playback (speculative
// generation during the silence window) and the first sentence can play while
// later ones are still generating.

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICE = "af_heart"; // calm, natural US-English voice — fixed for consistency

let modelPromise = null;
let status = "idle"; // idle | loading | ready | failed

export const getStatus = () => status;

export function preload() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("tts is browser-only"));
  }
  if (!modelPromise) {
    status = "loading";
    modelPromise = load().then(
      (tts) => {
        status = "ready";
        return tts;
      },
      (e) => {
        status = "failed";
        throw e;
      }
    );
  }
  return modelPromise;
}

// ONNX Runtime prints benign node-placement warnings via console.error, which
// Next's dev overlay surfaces as scary errors. Route just those lines to
// console.debug (kokoro-js doesn't let us pass per-session log options).
function muteOnnxWarnings() {
  if (window.__onnxWarningsMuted) return;
  window.__onnxWarningsMuted = true;
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("W:onnxruntime")) {
      console.debug(...args);
      return;
    }
    origError(...args);
  };
}

async function load() {
  muteOnnxWarnings();
  const { KokoroTTS } = await import("kokoro-js");
  if (navigator.gpu) {
    try {
      return await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "fp32",
        device: "webgpu",
      });
    } catch (_) {
      // WebGPU init can fail (driver, headless, etc.) — fall through to WASM.
    }
  }
  return KokoroTTS.from_pretrained(MODEL_ID, { dtype: "q8", device: "wasm" });
}

// -- synthesis --------------------------------------------------------------

// Sentence-ish chunks so playback can start on the first sentence while the
// rest are still generating.
function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks = parts.map((s) => s.trim()).filter(Boolean);
  return chunks.length ? chunks : [text];
}

// Kick off synthesis for `text` right now. Returns { text, chunks } where
// chunks are promises of RawAudio, generated sequentially. Safe to create
// speculatively — an unplayed clip is just garbage-collected.
export function createClip(text) {
  const modelP = preload();
  let gate = Promise.resolve();
  const chunks = splitSentences(text).map((sentence) => {
    const p = gate.then(async () => {
      const tts = await modelP;
      return tts.generate(sentence, { voice: VOICE });
    });
    gate = p.catch(() => {}); // one failed chunk shouldn't block the next
    return p;
  });
  return { text, chunks };
}

// -- playback ---------------------------------------------------------------

let audioCtx = null;
let current = null; // active playback session

function getCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

export const isSpeaking = () => !!current;

// Play a clip's chunks in order. Calls onDone after the last chunk finishes
// (or on synthesis failure) — but NOT when stop() cut it off, since stop()
// callers reset interview state themselves.
export async function playClip(clip, onDone) {
  stop();
  const session = { stopped: false, source: null };
  current = session;
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (_) {}
  }
  try {
    for (const chunkP of clip.chunks) {
      let raw;
      try {
        raw = await chunkP;
      } catch (e) {
        console.warn("[tts] synthesis failed:", e);
        break; // end playback gracefully
      }
      if (session.stopped) break;
      await playRaw(ctx, raw, session);
      if (session.stopped) break;
    }
  } finally {
    const wasStopped = session.stopped;
    if (current === session) current = null;
    if (!wasStopped && onDone) onDone();
  }
}

function playRaw(ctx, raw, session) {
  return new Promise((resolve) => {
    const data = raw.audio; // mono Float32Array
    const buf = ctx.createBuffer(1, data.length, raw.sampling_rate);
    buf.copyToChannel(data, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.onended = resolve;
    session.source = src;
    src.start();
  });
}

// Halt playback instantly (barge-in, end of session).
export function stop() {
  const session = current;
  if (!session) return;
  session.stopped = true;
  current = null;
  try {
    session.source && session.source.stop();
  } catch (_) {}
}
