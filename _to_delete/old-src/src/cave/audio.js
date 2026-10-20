/**
 * Procedural ambience (Web Audio) — no recordings, so nothing copyrighted: cave rumble, air, water drips,
 * fire crackle, crickets / birds near the cave mouths, rare bat flutters and a waterfall wash.
 * Never starts on its own: `start()` must be called from a user gesture.
 */
export function createAmbience() {
  let ctx, master, nodes = {}, timers = [], running = false, vol = 0.6, outside = 1

  const noiseBuf = (type) => {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, last = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 }
      else { b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11 }
    }
    return buf
  }
  const loop = (type, filterType, freq, q, gain) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(type); src.loop = true
    const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q
    const g = ctx.createGain(); g.gain.value = gain
    src.connect(f).connect(g).connect(master); src.start()
    return { src, f, g }
  }
  const later = (fn, min, max) => { const t = setTimeout(() => { if (running) fn(); later(fn, min, max) }, (min + Math.random() * (max - min)) * 1000); timers.push(t) }

  const drip = () => {
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), f = 1300 + Math.random() * 1100
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.12)
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.4)
  }
  const crackle = () => {
    const t = ctx.currentTime, src = ctx.createBufferSource(); src.buffer = noiseBuf('pink')
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800 + Math.random() * 2500
    const g = ctx.createGain(); g.gain.setValueAtTime(0.09 * (0.4 + Math.random()), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.06)
    src.connect(f).connect(g).connect(master); src.start(t, Math.random() * 2, 0.12)
  }
  const chirp = () => {
    if (outside < 0.25) return
    const t = ctx.currentTime, n = 2 + Math.floor(Math.random() * 3), base = 2600 + Math.random() * 1800
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.13
      o.frequency.setValueAtTime(base, s); o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.5), s + 0.09)
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.045 * outside, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.11)
      o.connect(g).connect(master); o.start(s); o.stop(s + 0.14)
    }
  }
  const flutter = () => {
    const t = ctx.currentTime, src = ctx.createBufferSource(); src.buffer = noiseBuf('pink')
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t)
    for (let i = 0; i < 6; i++) { g.gain.linearRampToValueAtTime(0.05, t + i * 0.09 + 0.03); g.gain.linearRampToValueAtTime(0.005, t + i * 0.09 + 0.08) }
    g.gain.linearRampToValueAtTime(0, t + 0.7)
    src.connect(f).connect(g).connect(master); src.start(t, Math.random(), 0.8)
  }

  return {
    get running() { return running },
    start() {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination)
        nodes.rumble = loop('brown', 'lowpass', 190, 0.7, 0.55)
        nodes.air = loop('pink', 'bandpass', 520, 0.8, 0.05)
        nodes.water = loop('pink', 'bandpass', 1500, 0.6, 0.0)
        // crickets: three detuned oscillators gated by a fast square LFO
        nodes.cricket = ctx.createGain(); nodes.cricket.gain.value = 0; nodes.cricket.connect(master)
        ;[4300, 4520, 4710].forEach((fr, i) => {
          const o = ctx.createOscillator(); o.frequency.value = fr
          const gate = ctx.createGain(); gate.gain.value = 0
          const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 7 + i * 1.3
          const lg = ctx.createGain(); lg.gain.value = 0.5
          lfo.connect(lg).connect(gate.gain)
          const off = ctx.createConstantSource ? ctx.createConstantSource() : null
          if (off) { off.offset.value = 0.5; off.connect(gate.gain); off.start() }
          o.connect(gate).connect(nodes.cricket); o.start(); lfo.start()
        })
        later(drip, 1.2, 4.5); later(crackle, 0.12, 0.7); later(chirp, 2, 6); later(flutter, 9, 22)
      }
      running = true
      ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 1.2)
    },
    stop() {
      running = false
      if (!ctx) return
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => { if (!running) ctx.suspend() }, 650)
    },
    setVolume(v) { vol = v; if (ctx && running) master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1) },
    /** p = scroll progress 0..1: more crickets/birds/waterfall near the two cave mouths. */
    setProgress(p) {
      outside = Math.max(1 - Math.min(1, p / 0.12), 1 - Math.min(1, (1 - p) / 0.1))
      if (!ctx) return
      const t = ctx.currentTime
      nodes.cricket.gain.linearRampToValueAtTime(0.012 * outside, t + 0.2)
      nodes.water.g.gain.linearRampToValueAtTime(0.06 * outside + 0.01, t + 0.3)
      nodes.rumble.g.gain.linearRampToValueAtTime(0.55 - 0.3 * outside, t + 0.3)
    },
    suspend() { if (ctx && running) ctx.suspend() },
    resume() { if (ctx && running) ctx.resume() },
    dispose() { timers.forEach(clearTimeout); running = false; try { ctx?.close() } catch { /* already closed */ } },
  }
}
