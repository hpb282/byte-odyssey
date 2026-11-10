let audio: AudioContext | undefined;
export function playSound(correct: boolean, enabled: boolean) {
  if (!enabled) return;
  try {
    audio ||= new AudioContext();
    void audio.resume();
    const context = audio,
      t = context.currentTime;
    for (const [i, f] of (correct ? [523, 659, 784] : [294, 247]).entries()) {
      const o = context.createOscillator(),
        g = context.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.1, t + i * 0.07 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.16);
      o.connect(g);
      g.connect(context.destination);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.17);
    }
  } catch {
    /* Âm thanh không ảnh hưởng chấm bài hoặc lưu kết quả. */
  }
}
