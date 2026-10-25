const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 21; // 20s film + 1s safety buffer
const totalSamples = Math.floor(sampleRate * durationSeconds);
const numChannels = 2;
const bytesPerSample = 2; // 16-bit

const bpm = 124; // Energetic tech-house tempo
const beatDuration = 60 / bpm; // ~0.483s
const samplesPerBeat = Math.floor(sampleRate * beatDuration);

const buffer = Buffer.alloc(44 + totalSamples * numChannels * bytesPerSample);

// ── WAV Header ─────────────────────────────────────────────────────────────
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + totalSamples * numChannels * bytesPerSample, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
buffer.writeUInt16LE(16, 34); // BitsPerSample
buffer.write('data', 36);
buffer.writeUInt32LE(totalSamples * numChannels * bytesPerSample, 40);

// ── Synthesizer ────────────────────────────────────────────────────────────
// Notes in Hz (F minor pentatonic groove: F1=43.65, Ab1=51.91, Bb1=58.27, C2=65.41, Eb2=77.78)
const bassNotes = [43.65, 43.65, 51.91, 58.27, 43.65, 43.65, 77.78, 65.41];

let offset = 44;
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const beatIndex = Math.floor(t / beatDuration);
  const beatTime = (t % beatDuration) / beatDuration; // 0 to 1 within the beat
  const sixteenth = Math.floor(beatTime * 4); // 0, 1, 2, 3

  let left = 0;
  let right = 0;

  // Global Volume Envelope (fade in 0.5s, fade out last 1.5s)
  let masterGain = 1.0;
  if (t < 0.5) masterGain = t / 0.5;
  if (t > 19.5) masterGain = Math.max(0, (21 - t) / 1.5);

  // 1. Kick Drum (on every beat 1, 2, 3, 4 after 3.5s hook, or lighter before)
  const isPostHook = t >= 3.5;
  if (isPostHook || beatIndex % 2 === 0) {
    const kickTime = t % beatDuration;
    if (kickTime < 0.25) {
      const freq = 140 * Math.exp(-kickTime * 24) + 45;
      const kickEnv = Math.exp(-kickTime * 14);
      const kickWave = Math.sin(2 * Math.PI * freq * kickTime) * kickEnv * 0.75;
      left += kickWave;
      right += kickWave;
    }
  }

  // 2. Snare / Clap (on beats 2 and 4, starting at t >= 3.5s)
  if (isPostHook && (beatIndex % 2 === 1)) {
    const snareTime = t % beatDuration;
    if (snareTime < 0.22) {
      const snareNoise = (Math.random() * 2 - 1) * Math.exp(-snareTime * 18);
      const snareTone = Math.sin(2 * Math.PI * 180 * snareTime) * Math.exp(-snareTime * 25);
      const snareWave = (snareNoise * 0.4 + snareTone * 0.25);
      left += snareWave;
      right += snareWave;
    }
  }

  // 3. Hi-Hat (8th note offbeat on 16th = 2)
  if (isPostHook) {
    const hatTime = (t % (beatDuration / 2));
    if (sixteenth === 2 && hatTime < 0.08) {
      const hatEnv = Math.exp(-hatTime * 50);
      const hatNoise = (Math.random() * 2 - 1) * hatEnv * 0.18;
      left += hatNoise * 0.8;
      right += hatNoise * 1.2;
    }
  }

  // 4. Synth Sub-Bass Groove (16th-note plucks)
  if (isPostHook) {
    const note = bassNotes[(beatIndex * 2 + Math.floor(sixteenth / 2)) % bassNotes.length];
    const noteTime = (t % (beatDuration / 2));
    if (noteTime < 0.2) {
      const bassEnv = Math.exp(-noteTime * 10);
      const bassWave = (
        Math.sin(2 * Math.PI * note * noteTime) * 0.5 +
        Math.sin(2 * Math.PI * (note * 2) * noteTime) * 0.2
      ) * bassEnv * 0.5;
      left += bassWave;
      right += bassWave;
    }
  }

  // 5. Ambient Chords / Tech pad in intro (t < 3.5s)
  if (t < 4.0) {
    const padFreq = 174.61; // F3
    const padWave = Math.sin(2 * Math.PI * padFreq * t) * 0.12 * (1 + 0.3 * Math.sin(2 * Math.PI * 2 * t));
    left += padWave;
    right += padWave;
  }

  // Final clip & scale to 16-bit PCM
  const finalL = Math.max(-1, Math.min(1, left * masterGain * 0.85));
  const finalR = Math.max(-1, Math.min(1, right * masterGain * 0.85));

  buffer.writeInt16LE(Math.floor(finalL * 32767), offset);
  buffer.writeInt16LE(Math.floor(finalR * 32767), offset + 2);
  offset += 4;
}

const outputPath = path.join(__dirname, 'public', 'audio', 'deep-urban.wav');
fs.writeFileSync(outputPath, buffer);
console.log(`Successfully generated high-energy beat at: ${outputPath} (${buffer.length} bytes)`);
