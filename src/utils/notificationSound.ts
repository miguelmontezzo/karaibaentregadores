let audioContext: AudioContext | null = null;
let audioElement: HTMLAudioElement | null = null;

const AUDIO_SOURCES: string[] = [
  "/ringtone-you-would-be-glad-to-know.mp3",
  "/ringtone-you-would-be-glad-to-know.m4r",
];

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  // @ts-ignore
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) audioContext = new Ctx();
  return audioContext;
};

const getAudioElement = (): HTMLAudioElement | null => {
  if (typeof window === "undefined") return null;
  if (audioElement) return audioElement;
  const candidate = new Audio();
  candidate.preload = "auto";
  candidate.crossOrigin = "anonymous";
  for (const src of AUDIO_SOURCES) {
    const can = candidate.canPlayType("audio/" + (src.endsWith(".mp3") ? "mpeg" : "mp4"));
    if (can) {
      candidate.src = src;
      break;
    }
  }
  candidate.volume = 1;
  audioElement = candidate;
  return audioElement;
};

const playBeepFallback = async () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    const durationSec = 0.4;
    const startTime = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startTime);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
    oscillator.start(startTime);
    oscillator.stop(startTime + durationSec + 0.01);
  } catch {
    /* noop */
  }
};

export const playNotificationSound = async () => {
  try {
    const audio = getAudioElement();
    if (!audio) return;
    audio.currentTime = 0;
    await audio.play().catch(async () => {
      await playBeepFallback();
    });
  } catch {
    await playBeepFallback();
  }
};

