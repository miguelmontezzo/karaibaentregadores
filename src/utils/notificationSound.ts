let audioContext: (AudioContext | null) = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  // @ts-ignore
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioContext) {
    audioContext = new Ctx();
  }
  return audioContext;
};

export const playNotificationSound = async () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    // Some browsers require a resume after user interaction
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const durationSec = 0.35;
    const startTime = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, startTime);
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    oscillator.start(startTime);
    oscillator.stop(startTime + durationSec + 0.01);
  } catch {
    // Silenciar falhas de autoplay
  }
};

