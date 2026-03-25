// ── Voice Definitions ────────────────────────────────────────────────
// Each voice defines how to process an AudioBuffer offline
const VOICES = [
  {
    id: 'normal',
    name: 'Normal',
    emoji: '\ud83c\udfa4',
    desc: 'No effects',
    playbackRate: 1.0,
    apply(ctx, buffer) { return buffer; }
  },
  {
    id: 'deep',
    name: 'Deep Voice',
    emoji: '\ud83d\udcaa',
    desc: 'Low pitched & booming',
    playbackRate: 0.7,
    apply(ctx, buffer) { return buffer; }
  },
  {
    id: 'chipmunk',
    name: 'Chipmunk',
    emoji: '\ud83d\udc3f\ufe0f',
    desc: 'High pitched & squeaky',
    playbackRate: 1.7,
    apply(ctx, buffer) { return buffer; }
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '\ud83e\udd16',
    desc: 'Metallic & synthetic',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(100);
      for (let i = 0; i < data.length; i++) {
        const idx = Math.floor(((data[i] + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))];
        // Add ring modulation
        data[i] *= Math.sin(2 * Math.PI * 50 * i / buffer.sampleRate);
      }
      return buffer;
    }
  },
  {
    id: 'echo',
    name: 'Echo',
    emoji: '\ud83c\udfb5',
    desc: 'Repeating delay',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const delaySamples = Math.floor(0.25 * buffer.sampleRate);
      const feedback = 0.5;
      for (let rep = 0; rep < 4; rep++) {
        for (let i = data.length - 1; i >= delaySamples; i--) {
          data[i] += data[i - delaySamples] * feedback * Math.pow(0.6, rep);
        }
      }
      // Normalize
      let max = 0;
      for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
      if (max > 1) for (let i = 0; i < data.length; i++) data[i] /= max;
      return buffer;
    }
  },
  {
    id: 'alien',
    name: 'Alien',
    emoji: '\ud83d\udc7d',
    desc: 'Otherworldly vibrato',
    playbackRate: 1.2,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const vibrato = Math.sin(2 * Math.PI * 8 * i / buffer.sampleRate) * 0.3;
        data[i] = data[i] * (1 + vibrato);
      }
      return buffer;
    }
  },
  {
    id: 'underwater',
    name: 'Underwater',
    emoji: '\ud83c\udf0a',
    desc: 'Muffled & bubbly',
    playbackRate: 0.9,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      // Simple low-pass filter
      let prev = 0;
      const alpha = 0.05;
      for (let i = 0; i < data.length; i++) {
        prev = prev + alpha * (data[i] - prev);
        data[i] = prev;
        // Add bubble wobble
        data[i] *= 1 + 0.3 * Math.sin(2 * Math.PI * 2 * i / buffer.sampleRate);
      }
      return buffer;
    }
  },
  {
    id: 'megaphone',
    name: 'Megaphone',
    emoji: '\ud83d\udce2',
    desc: 'Loud & distorted',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(200);
      // Bandpass effect - remove lows and highs
      let prev = 0;
      let prev2 = 0;
      for (let i = 0; i < data.length; i++) {
        const hp = data[i] - prev;
        prev = data[i];
        const lp = prev2 + 0.15 * (hp - prev2);
        prev2 = lp;
        const idx = Math.floor(((lp * 3 + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))];
      }
      return buffer;
    }
  },
  {
    id: 'radio',
    name: 'Vintage Radio',
    emoji: '\ud83d\udcfb',
    desc: 'Old-time AM radio',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(50);
      let prevHP = 0;
      let prevLP = 0;
      for (let i = 0; i < data.length; i++) {
        // High-pass at ~300Hz
        const hp = data[i] - prevHP;
        prevHP = prevHP + 0.04 * (data[i] - prevHP);
        // Low-pass at ~3000Hz
        prevLP = prevLP + 0.4 * (hp - prevLP);
        const idx = Math.floor(((prevLP + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))] * 0.8;
      }
      return buffer;
    }
  },
  {
    id: 'vader',
    name: 'Dark Lord',
    emoji: '\u26ab',
    desc: 'Deep breathing villain',
    playbackRate: 0.55,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(80);
      for (let i = 0; i < data.length; i++) {
        const idx = Math.floor(((data[i] + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))];
      }
      // Add short echo
      const delaySamples = Math.floor(0.05 * buffer.sampleRate);
      for (let i = data.length - 1; i >= delaySamples; i--) {
        data[i] += data[i - delaySamples] * 0.3;
      }
      let max = 0;
      for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
      if (max > 1) for (let i = 0; i < data.length; i++) data[i] /= max;
      return buffer;
    }
  },
  {
    id: 'helium',
    name: 'Helium',
    emoji: '\ud83c\udf88',
    desc: 'Super high & funny',
    playbackRate: 2.0,
    apply(ctx, buffer) { return buffer; }
  },
  {
    id: 'demon',
    name: 'Demon',
    emoji: '\ud83d\udc79',
    desc: 'Deep, dark & scary',
    playbackRate: 0.45,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(150);
      for (let i = 0; i < data.length; i++) {
        const idx = Math.floor(((data[i] + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))];
      }
      const delaySamples = Math.floor(0.08 * buffer.sampleRate);
      for (let i = data.length - 1; i >= delaySamples; i--) {
        data[i] += data[i - delaySamples] * 0.4;
      }
      let max = 0;
      for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
      if (max > 1) for (let i = 0; i < data.length; i++) data[i] /= max;
      return buffer;
    }
  },
  {
    id: 'cave',
    name: 'Cave',
    emoji: '\ud83e\udea8',
    desc: 'Large reverberant space',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      // Multiple delay taps for reverb effect
      const taps = [
        { delay: 0.03, gain: 0.6 },
        { delay: 0.07, gain: 0.4 },
        { delay: 0.12, gain: 0.3 },
        { delay: 0.18, gain: 0.2 },
        { delay: 0.25, gain: 0.15 },
        { delay: 0.35, gain: 0.1 },
      ];
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) out[i] = data[i] * 0.5;
      for (const tap of taps) {
        const d = Math.floor(tap.delay * buffer.sampleRate);
        for (let i = d; i < data.length; i++) {
          out[i] += data[i - d] * tap.gain;
        }
      }
      let max = 0;
      for (let i = 0; i < out.length; i++) max = Math.max(max, Math.abs(out[i]));
      if (max > 1) for (let i = 0; i < out.length; i++) out[i] /= max;
      for (let i = 0; i < data.length; i++) data[i] = out[i];
      return buffer;
    }
  },
  {
    id: 'telephone',
    name: 'Telephone',
    emoji: '\ud83d\udcde',
    desc: 'Narrow band phone call',
    playbackRate: 1.0,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      const curve = makeDistortionCurve(30);
      let prevHP = 0;
      let prevLP = 0;
      for (let i = 0; i < data.length; i++) {
        prevHP = prevHP + 0.07 * (data[i] - prevHP);
        const hp = data[i] - prevHP;
        prevLP = prevLP + 0.35 * (hp - prevLP);
        const idx = Math.floor(((prevLP + 1) / 2) * (curve.length - 1));
        data[i] = curve[Math.max(0, Math.min(idx, curve.length - 1))] * 1.2;
      }
      return buffer;
    }
  },
  {
    id: 'feminine',
    name: 'Feminine',
    emoji: '\ud83d\udc69',
    desc: 'Higher pitch & softer',
    playbackRate: 1.35,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      // Boost highs, cut lows
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        const hp = data[i] - prev;
        prev = prev + 0.03 * (data[i] - prev);
        data[i] = data[i] * 0.4 + hp * 0.6;
      }
      return buffer;
    }
  },
  {
    id: 'soprano',
    name: 'Soprano',
    emoji: '\ud83c\udfb6',
    desc: 'High & bright singing voice',
    playbackRate: 1.5,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        const hp = data[i] - prev;
        prev = prev + 0.025 * (data[i] - prev);
        data[i] = hp;
      }
      return buffer;
    }
  },
  {
    id: 'soft-whisper',
    name: 'Soft Whisper',
    emoji: '\ud83e\uddd1\u200d\ud83e\uddb0',
    desc: 'Breathy & gentle',
    playbackRate: 1.25,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        // Add breathiness with noise
        const noise = (Math.random() * 2 - 1) * 0.12;
        data[i] = data[i] * 0.7 + noise;
      }
      return buffer;
    }
  },
  {
    id: 'anime-girl',
    name: 'Anime Girl',
    emoji: '\ud83c\udf80',
    desc: 'Cute & high pitched',
    playbackRate: 1.8,
    apply(ctx, buffer) {
      const data = buffer.getChannelData(0);
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        const hp = data[i] - prev;
        prev = prev + 0.02 * (data[i] - prev);
        data[i] = hp * 1.2;
      }
      return buffer;
    }
  }
];

// ── Audio Utility Functions ──────────────────────────────────────────

function makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// ── App State ────────────────────────────────────────────────────────

let audioCtx = null;
let rawRecordingBuffer = null; // Original recorded AudioBuffer
let currentSource = null; // Currently playing source
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

const recordBtn = document.getElementById('recordBtn');
const status = document.getElementById('status');
const voiceGrid = document.getElementById('voiceGrid');
const visualizer = document.getElementById('visualizer');
const canvasCtx = visualizer.getContext('2d');
const playbackControls = document.getElementById('playbackControls');
const playOriginalBtn = document.getElementById('playOriginal');
const downloadBtn = document.getElementById('downloadBtn');

// ── Build Voice Grid ─────────────────────────────────────────────────

VOICES.forEach((voice) => {
  const card = document.createElement('div');
  card.className = 'voice-card';
  card.dataset.voiceId = voice.id;
  card.innerHTML = `
    <span class="emoji">${voice.emoji}</span>
    <div class="name">${voice.name}</div>
    <div class="desc">${voice.desc}</div>
  `;
  card.addEventListener('click', () => playWithVoice(voice.id));
  voiceGrid.appendChild(card);
});

// ── Recording ────────────────────────────────────────────────────────

recordBtn.addEventListener('mousedown', startRecording);
recordBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
recordBtn.addEventListener('mouseup', stopRecording);
recordBtn.addEventListener('mouseleave', stopRecording);
recordBtn.addEventListener('touchend', stopRecording);
recordBtn.addEventListener('touchcancel', stopRecording);

async function startRecording() {
  if (isRecording) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    });

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    isRecording = true;
    recordedChunks = [];
    recordBtn.classList.add('recording');
    recordBtn.innerHTML = '<span class="icon">&#9679;</span> Recording...';
    status.textContent = 'Recording... release to stop';

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType()
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      recordBtn.classList.remove('recording');
      recordBtn.innerHTML = '<span class="icon">&#9679;</span> Hold to Record';

      if (recordedChunks.length === 0) {
        status.textContent = 'No audio captured. Try again.';
        return;
      }

      status.textContent = 'Processing...';
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
      const arrayBuffer = await blob.arrayBuffer();
      try {
        rawRecordingBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        status.textContent = 'Done! Tap a voice below to hear the effect';
        playbackControls.style.display = 'block';
        drawWaveform(rawRecordingBuffer);
      } catch (err) {
        status.textContent = 'Error processing audio. Try recording again.';
      }
    };

    mediaRecorder.start();

    // Live visualizer while recording
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    // Do NOT connect to destination - no sound output
    drawLiveVisualizer(analyser);

  } catch (err) {
    status.textContent = 'Mic access denied: ' + err.message;
    isRecording = false;
  }
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

// ── Play with Voice Effect ───────────────────────────────────────────

async function playWithVoice(voiceId) {
  if (!rawRecordingBuffer) {
    status.textContent = 'Record your voice first!';
    return;
  }

  // Stop any currently playing audio
  if (currentSource) {
    try { currentSource.stop(); } catch(e) {}
    currentSource = null;
  }

  // Ensure audio context is running (mobile browsers suspend it)
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const voice = VOICES.find(v => v.id === voiceId);

  // Highlight active card
  document.querySelectorAll('.voice-card').forEach(c => {
    c.classList.remove('active', 'playing');
  });
  const card = document.querySelector(`[data-voice-id="${voiceId}"]`);
  card.classList.add('active', 'playing');

  // Render the effect offline first (guarantees download and playback match)
  const rendered = await renderVoice(voice);

  // Play the rendered buffer
  const source = audioCtx.createBufferSource();
  source.buffer = rendered;
  source.connect(audioCtx.destination);
  source.start();
  currentSource = source;
  lastRendered = { voiceId, buffer: rendered };

  status.textContent = `Playing: ${voice.name}`;

  source.onended = () => {
    card.classList.remove('playing');
    if (currentSource === source) {
      currentSource = null;
      status.textContent = 'Tap another voice or record again';
    }
  };
}

// Render a voice effect to a new AudioBuffer using OfflineAudioContext
async function renderVoice(voice) {
  const sampleRate = rawRecordingBuffer.sampleRate;
  const outputLength = Math.ceil(rawRecordingBuffer.length / voice.playbackRate);

  const offlineCtx = new OfflineAudioContext(1, outputLength, sampleRate);

  // Copy the raw buffer
  const bufferCopy = offlineCtx.createBuffer(
    rawRecordingBuffer.numberOfChannels,
    rawRecordingBuffer.length,
    sampleRate
  );
  for (let ch = 0; ch < rawRecordingBuffer.numberOfChannels; ch++) {
    bufferCopy.copyToChannel(rawRecordingBuffer.getChannelData(ch).slice(), ch);
  }

  // Apply DSP effects to the buffer data
  voice.apply(offlineCtx, bufferCopy);

  // Play through offline context with playback rate
  const source = offlineCtx.createBufferSource();
  source.buffer = bufferCopy;
  source.playbackRate.value = voice.playbackRate;
  source.connect(offlineCtx.destination);
  source.start();

  return offlineCtx.startRendering();
}

let lastRendered = null;

// ── Play Original ────────────────────────────────────────────────────

playOriginalBtn.addEventListener('click', () => playWithVoice('normal'));

// ── Download ─────────────────────────────────────────────────────────

downloadBtn.addEventListener('click', async () => {
  if (!rawRecordingBuffer) return;

  // Use the last rendered voice, or render normal
  let voiceId = 'normal';
  let rendered;

  if (lastRendered) {
    voiceId = lastRendered.voiceId;
    rendered = lastRendered.buffer;
  } else {
    const voice = VOICES.find(v => v.id === 'normal');
    rendered = await renderVoice(voice);
  }

  const wav = audioBufferToWav(rendered);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voice_${voiceId}.wav`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── WAV Encoder ──────────────────────────────────────────────────────

function audioBufferToWav(buffer) {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = data.length * 2;
  const bufferOut = new ArrayBuffer(44 + dataSize);
  const view = new DataView(bufferOut);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return bufferOut;
}

// ── Visualizer ───────────────────────────────────────────────────────

function drawWaveform(buffer) {
  const data = buffer.getChannelData(0);
  const width = visualizer.width;
  const height = visualizer.height;

  canvasCtx.fillStyle = '#1a1a2e';
  canvasCtx.fillRect(0, 0, width, height);

  const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  canvasCtx.strokeStyle = gradient;
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();

  const step = Math.ceil(data.length / width);
  for (let i = 0; i < width; i++) {
    const idx = i * step;
    const v = data[idx] || 0;
    const y = (1 - v) * height / 2;
    if (i === 0) canvasCtx.moveTo(i, y);
    else canvasCtx.lineTo(i, y);
  }
  canvasCtx.stroke();
}

let liveAnimId = null;
function drawLiveVisualizer(analyser) {
  if (!isRecording) {
    if (liveAnimId) cancelAnimationFrame(liveAnimId);
    return;
  }

  liveAnimId = requestAnimationFrame(() => drawLiveVisualizer(analyser));

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  const width = visualizer.width;
  const height = visualizer.height;

  canvasCtx.fillStyle = '#1a1a2e';
  canvasCtx.fillRect(0, 0, width, height);

  const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#e53e3e');
  gradient.addColorStop(1, '#fc8181');
  canvasCtx.strokeStyle = gradient;
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();

  const sliceWidth = width / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;
    if (i === 0) canvasCtx.moveTo(x, y);
    else canvasCtx.lineTo(x, y);
    x += sliceWidth;
  }
  canvasCtx.lineTo(width, height / 2);
  canvasCtx.stroke();
}

// Initial flat line
canvasCtx.fillStyle = '#1a1a2e';
canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
canvasCtx.strokeStyle = '#667eea';
canvasCtx.lineWidth = 2;
canvasCtx.beginPath();
canvasCtx.moveTo(0, visualizer.height / 2);
canvasCtx.lineTo(visualizer.width, visualizer.height / 2);
canvasCtx.stroke();
