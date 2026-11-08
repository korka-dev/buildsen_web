"use client";

// Enregistrement du micro en WAV 16 kHz mono (format accepté par Soynade ; MediaRecorder produit du WebM ou du MP4).

const RATE = 16000;

export type Recording = { stop: () => Promise<Blob>; cancel: () => void; level: () => number; heardSpeech: () => boolean };

type Options = {
  maxSeconds?: number;
  /** Silence (ms) qui termine la réponse une fois que la personne a parlé */
  silenceMs?: number;
  /** Délai (ms) sans aucune parole avant d'abandonner */
  noSpeechMs?: number;
  /** Appelé quand l'enregistrement s'arrête seul (silence, aucune parole ou durée maximale) */
  onAutoStop?: (wav: Blob, heardSpeech: boolean) => void;
};

/** Enregistre le micro ; avec onAutoStop, s'arrête seul quand la personne a fini de parler (détection du silence). */
export async function startRecording({ maxSeconds = 25, silenceMs = 1300, noSpeechMs = 8000, onAutoStop }: Options = {}): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessor : simple et pris en charge partout (AudioWorklet demanderait un fichier séparé)
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  const started = performance.now();
  let rms = 0, floor = 0, floorN = 0, speech = false, lastVoice = 0, done = false;

  const release = () => {
    done = true;
    proc.disconnect();
    source.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };
  const finish = () => encodeWav(downsample(concat(chunks), ctx.sampleRate, RATE), RATE);
  const autoStop = () => {
    if (done) return;
    release();
    onAutoStop?.(finish(), speech);
  };

  proc.onaudioprocess = (e) => {
    if (done) return;
    const data = e.inputBuffer.getChannelData(0);
    chunks.push(new Float32Array(data));
    let sum = 0;
    for (let i = 0; i < data.length; i += 16) sum += data[i]! * data[i]!;
    rms = Math.sqrt(sum / (data.length / 16));
    const t = performance.now() - started;
    // Bruit de fond mesuré pendant les 300 premières ms, puis seuil de parole au-dessus
    if (t < 300) {
      floor = (floor * floorN + rms) / ++floorN;
      return;
    }
    const threshold = Math.max(0.015, floor * 3);
    if (rms > threshold) {
      speech = true;
      lastVoice = t;
    }
    if (!onAutoStop) return;
    if (speech && t - lastVoice > silenceMs) autoStop();
    else if (!speech && t > noSpeechMs) autoStop();
    else if (t > maxSeconds * 1000) autoStop();
  };
  source.connect(proc);
  proc.connect(ctx.destination);

  return {
    stop: async () => {
      if (!done) release();
      return finish();
    },
    cancel: () => {
      if (!done) release();
    },
    level: () => Math.min(1, rms * 4),
    heardSpeech: () => speech,
  };
}

function concat(chunks: Float32Array[]): Float32Array {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

function downsample(data: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return data;
  const ratio = from / to;
  const out = new Float32Array(Math.floor(data.length / ratio));
  for (let i = 0; i < out.length; i++) {
    // Moyenne des échantillons couverts (filtre passe-bas sommaire)
    const start = Math.floor(i * ratio), end = Math.min(data.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += data[j]!;
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}
