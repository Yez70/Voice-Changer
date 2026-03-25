// ── Voice Definitions ────────────────────────────────────────────────
const VOICES = [
  {
    id: 'normal',
    name: 'Normal',
    emoji: '\ud83c\udfa4',
    desc: 'No effects',
    apply(ctx, source) {
      return source;
    }
  },
  {
    id: 'deep',
    name: 'Deep Voice',
    emoji: '\ud83d\udcaa',
    desc: 'Low pitched & booming',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 0.6);
      source.connect(pitch.input);
      return pitch.output;
    }
  },
  {
    id: 'chipmunk',
    name: 'Chipmunk',
    emoji: '\ud83d\udc3f\ufe0f',
    desc: 'High pitched & squeaky',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 1.8);
      source.connect(pitch.input);
      return pitch.output;
    }
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '\ud83e\udd16',
    desc: 'Metallic & synthetic',
    apply(ctx, source) {
      const waveShaper = ctx.createWaveShaper();
      waveShaper.curve = makeDistortionCurve(100);
      waveShaper.oversample = '4x';
      const biquad = ctx.createBiquadFilter();
      biquad.type = 'bandpass';
      biquad.frequency.value = 1200;
      biquad.Q.value = 5;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 50;
      osc.start();
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.3;
      osc.connect(oscGain);
      const ringMod = ctx.createGain();
      ringMod.gain.value = 0;
      oscGain.connect(ringMod.gain);
      source.connect(ringMod);
      source.connect(biquad);
      biquad.connect(waveShaper);
      const merger = ctx.createGain();
      waveShaper.connect(merger);
      ringMod.connect(merger);
      merger.gain.value = 0.7;
      return merger;
    }
  },
  {
    id: 'echo',
    name: 'Echo',
    emoji: '\ud83c\udfb5',
    desc: 'Repeating delay',
    apply(ctx, source) {
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.5;
      const mix = ctx.createGain();
      source.connect(mix);
      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(mix);
      return mix;
    }
  },
  {
    id: 'alien',
    name: 'Alien',
    emoji: '\ud83d\udc7d',
    desc: 'Otherworldly vibrato',
    apply(ctx, source) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 8;
      osc.start();
      const oscGain = ctx.createGain();
      oscGain.gain.value = 30;
      osc.connect(oscGain);
      const biquad = ctx.createBiquadFilter();
      biquad.type = 'bandpass';
      biquad.frequency.value = 800;
      biquad.Q.value = 10;
      oscGain.connect(biquad.frequency);
      source.connect(biquad);
      const pitch = createPitchShifter(ctx, 1.3);
      biquad.connect(pitch.input);
      return pitch.output;
    }
  },
  {
    id: 'underwater',
    name: 'Underwater',
    emoji: '\ud83c\udf0a',
    desc: 'Muffled & bubbly',
    apply(ctx, source) {
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 500;
      lowpass.Q.value = 5;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2;
      osc.start();
      const oscGain = ctx.createGain();
      oscGain.gain.value = 200;
      osc.connect(oscGain);
      oscGain.connect(lowpass.frequency);
      source.connect(lowpass);
      return lowpass;
    }
  },
  {
    id: 'megaphone',
    name: 'Megaphone',
    emoji: '\ud83d\udce2',
    desc: 'Loud & distorted',
    apply(ctx, source) {
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 2000;
      bandpass.Q.value = 2;
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(200);
      distortion.oversample = '4x';
      const gain = ctx.createGain();
      gain.gain.value = 1.5;
      source.connect(bandpass);
      bandpass.connect(distortion);
      distortion.connect(gain);
      return gain;
    }
  },
  {
    id: 'radio',
    name: 'Vintage Radio',
    emoji: '\ud83d\udcfb',
    desc: 'Old-time AM radio',
    apply(ctx, source) {
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 300;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 3000;
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(50);
      const gain = ctx.createGain();
      gain.gain.value = 0.8;
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(distortion);
      distortion.connect(gain);
      return gain;
    }
  },
  {
    id: 'vader',
    name: 'Dark Lord',
    emoji: '\u26ab',
    desc: 'Deep breathing villain',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 0.5);
      source.connect(pitch.input);
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(80);
      distortion.oversample = '4x';
      const biquad = ctx.createBiquadFilter();
      biquad.type = 'lowpass';
      biquad.frequency.value = 1500;
      pitch.output.connect(distortion);
      distortion.connect(biquad);
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.05;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      biquad.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      const mix = ctx.createGain();
      biquad.connect(mix);
      delay.connect(mix);
      mix.gain.value = 0.8;
      return mix;
    }
  },
  {
    id: 'helium',
    name: 'Helium',
    emoji: '\ud83c\udf88',
    desc: 'Super high & funny',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 2.2);
      source.connect(pitch.input);
      return pitch.output;
    }
  },
  {
    id: 'demon',
    name: 'Demon',
    emoji: '\ud83d\udc79',
    desc: 'Deep, dark & scary',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 0.4);
      source.connect(pitch.input);
      const distortion = ctx.createWaveShaper();
      distortion.curve = makeDistortionCurve(150);
      distortion.oversample = '4x';
      pitch.output.connect(distortion);
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.1;
      const fb = ctx.createGain();
      fb.gain.value = 0.4;
      distortion.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      const mix = ctx.createGain();
      distortion.connect(mix);
      delay.connect(mix);
      mix.gain.value = 0.6;
      return mix;
    }
  },
  {
    id: 'cave',
    name: 'Cave',
    emoji: '\ud83e\udea8',
    desc: 'Large reverberant space',
    apply(ctx, source) {
      const convolver = ctx.createConvolver();
      convolver.buffer = generateReverbIR(ctx, 3.0, 0.8);
      const wet = ctx.createGain();
      wet.gain.value = 0.6;
      const dry = ctx.createGain();
      dry.gain.value = 0.4;
      source.connect(convolver);
      convolver.connect(wet);
      source.connect(dry);
      const mix = ctx.createGain();
      wet.connect(mix);
      dry.connect(mix);
      return mix;
    }
  },
  {
    id: 'telephone',
    name: 'Telephone',
    emoji: '\ud83d\udcde',
    desc: 'Narrow band phone call',
    apply(ctx, source) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 500;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2500;
      const dist = ctx.createWaveShaper();
      dist.curve = makeDistortionCurve(30);
      const gain = ctx.createGain();
      gain.gain.value = 1.2;
      source.connect(hp);
      hp.connect(lp);
      lp.connect(dist);
      dist.connect(gain);
      return gain;
    }
  },
  {
    id: 'feminine',
    name: 'Feminine',
    emoji: '\ud83d\udc69',
    desc: 'Higher pitch & softer',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 1.4);
      source.connect(pitch.input);
      const highShelf = ctx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 3000;
      highShelf.gain.value = 4;
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 300;
      lowShelf.gain.value = -6;
      pitch.output.connect(highShelf);
      highShelf.connect(lowShelf);
      return lowShelf;
    }
  },
  {
    id: 'soprano',
    name: 'Soprano',
    emoji: '\ud83c\udfb6',
    desc: 'High & bright singing voice',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 1.6);
      source.connect(pitch.input);
      const peak = ctx.createBiquadFilter();
      peak.type = 'peaking';
      peak.frequency.value = 4000;
      peak.Q.value = 1;
      peak.gain.value = 6;
      const lowcut = ctx.createBiquadFilter();
      lowcut.type = 'highpass';
      lowcut.frequency.value = 250;
      pitch.output.connect(lowcut);
      lowcut.connect(peak);
      return peak;
    }
  },
  {
    id: 'soft-whisper',
    name: 'Soft Whisper',
    emoji: '\ud83e\uddd1\u200d\ud83e\uddb0',
    desc: 'Breathy & gentle',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 1.3);
      source.connect(pitch.input);
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 2500;
      bandpass.Q.value = 0.8;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.15;
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      noise.start();
      noise.connect(noiseGain);
      const mix = ctx.createGain();
      pitch.output.connect(bandpass);
      bandpass.connect(mix);
      noiseGain.connect(mix);
      mix.gain.value = 0.9;
      return mix;
    }
  },
  {
    id: 'anime-girl',
    name: 'Anime Girl',
    emoji: '\ud83c\udf80',
    desc: 'Cute & high pitched',
    apply(ctx, source) {
      const pitch = createPitchShifter(ctx, 1.7);
      source.connect(pitch.input);
      const peak1 = ctx.createBiquadFilter();
      peak1.type = 'peaking';
      peak1.frequency.value = 3500;
      peak1.Q.value = 2;
      peak1.gain.value = 8;
      const peak2 = ctx.createBiquadFilter();
      peak2.type = 'peaking';
      peak2.frequency.value = 5000;
      peak2.Q.value = 2;
      peak2.gain.value = 5;
      const lowcut = ctx.createBiquadFilter();
      lowcut.type = 'highpass';
      lowcut.frequency.value = 300;
      pitch.output.connect(lowcut);
      lowcut.connect(peak1);
      peak1.connect(peak2);
      return peak2;
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

function generateReverbIR(ctx, duration, decay) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

// Pitch shifter using granular delay modulation (no ScriptProcessor, no ctx.destination)
function createPitchShifter(ctx, pitchRatio) {
  const input = ctx.createGain();
  const output = ctx.createGain();

  const grainSize = 0.1; // seconds
  const overlap = 2;

  for (let i = 0; i < overlap; i++) {
    const delay = ctx.createDelay(grainSize);
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const grain = ctx.createGain();
    const fadeMod = ctx.createOscillator();
    const fadeGain = ctx.createGain();

    // Modulate delay time with a sawtooth to create pitch shift
    mod.type = 'sawtooth';
    // For pitch up: positive rate, for pitch down: negative rate
    const rate = (pitchRatio - 1) / grainSize;
    mod.frequency.value = Math.abs(rate) > 0 ? Math.abs(1 / grainSize) : 0.001;
    modGain.gain.value = grainSize / 2;
    delay.delayTime.value = grainSize / 2;

    // Smooth crossfade between grains
    fadeMod.type = 'sine';
    fadeMod.frequency.value = mod.frequency.value;
    fadeGain.gain.value = 0;

    mod.connect(modGain);
    modGain.connect(delay.delayTime);
    mod.start(ctx.currentTime + (i * grainSize) / overlap);

    fadeMod.connect(fadeGain.gain);
    fadeMod.start(ctx.currentTime + (i * grainSize) / overlap);

    input.connect(delay);
    delay.connect(grain);
    grain.gain.value = 1 / overlap;
    grain.connect(output);
  }

  // Apply formant correction via EQ to make pitch shift sound more natural
  if (pitchRatio > 1) {
    // Shifting up - boost highs to compensate
    const eq = ctx.createBiquadFilter();
    eq.type = 'highshelf';
    eq.frequency.value = 2000;
    eq.gain.value = Math.min((pitchRatio - 1) * 4, 6);
    const finalOut = ctx.createGain();
    output.connect(eq);
    eq.connect(finalOut);
    return { input, output: finalOut };
  } else {
    // Shifting down - boost lows
    const eq = ctx.createBiquadFilter();
    eq.type = 'lowshelf';
    eq.frequency.value = 500;
    eq.gain.value = Math.min((1 - pitchRatio) * 6, 8);
    const finalOut = ctx.createGain();
    output.connect(eq);
    eq.connect(finalOut);
    return { input, output: finalOut };
  }
}

// ── App State ────────────────────────────────────────────────────────

let audioCtx = null;
let micStream = null;
let micSource = null;
let currentVoiceId = 'normal';
let analyserNode = null;
let outputNode = null;
let isRunning = false;
let monitorEnabled = false;
let mediaRecorder = null;
let recordedChunks = [];
let recordingCount = 0;

const startBtn = document.getElementById('startBtn');
const recordBtn = document.getElementById('recordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const voiceGrid = document.getElementById('voiceGrid');
const visualizer = document.getElementById('visualizer');
const canvasCtx = visualizer.getContext('2d');
const monitorBtn = document.getElementById('monitorBtn');
const playbackSection = document.getElementById('playbackSection');
const recordingsDiv = document.getElementById('recordings');

// ── Build Voice Grid ─────────────────────────────────────────────────

VOICES.forEach((voice) => {
  const card = document.createElement('div');
  card.className = 'voice-card' + (voice.id === currentVoiceId ? ' active' : '');
  card.dataset.voiceId = voice.id;
  card.innerHTML = `
    <span class="emoji">${voice.emoji}</span>
    <div class="name">${voice.name}</div>
    <div class="desc">${voice.desc}</div>
  `;
  card.addEventListener('click', () => selectVoice(voice.id));
  voiceGrid.appendChild(card);
});

// ── Voice Selection ──────────────────────────────────────────────────

function selectVoice(id) {
  currentVoiceId = id;
  document.querySelectorAll('.voice-card').forEach((c) => {
    c.classList.toggle('active', c.dataset.voiceId === id);
  });
  if (isRunning) {
    rebuildAudioGraph();
  }
}

// ── Audio Graph ──────────────────────────────────────────────────────

function rebuildAudioGraph() {
  if (!audioCtx || !micSource) return;

  // Disconnect everything from mic source
  micSource.disconnect();

  const voice = VOICES.find((v) => v.id === currentVoiceId);
  const processed = voice.apply(audioCtx, micSource);

  // Analyser for visualization
  analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2048;

  // Output destination
  outputNode = audioCtx.createMediaStreamDestination();

  if (processed === micSource) {
    micSource.connect(analyserNode);
    micSource.connect(outputNode);
  } else {
    processed.connect(analyserNode);
    processed.connect(outputNode);
  }

  // Only play through speakers if monitor is on (use headphones!)
  if (monitorEnabled) {
    analyserNode.connect(audioCtx.destination);
  }
}

// ── Start / Stop Microphone ──────────────────────────────────────────

startBtn.addEventListener('click', async () => {
  if (isRunning) {
    stopMic();
    return;
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    micSource = audioCtx.createMediaStreamSource(micStream);

    rebuildAudioGraph();

    isRunning = true;
    startBtn.innerHTML = '<span class="icon">&#9632;</span> Stop Microphone';
    startBtn.classList.add('active');
    recordBtn.disabled = false;
    monitorBtn.disabled = false;

    drawVisualizer();
  } catch (err) {
    alert('Could not access microphone: ' + err.message);
  }
});

function stopMic() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
  }

  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }

  micSource = null;
  isRunning = false;
  startBtn.innerHTML = '<span class="icon">&#9679;</span> Start Microphone';
  startBtn.classList.remove('active');
  recordBtn.disabled = true;
  monitorBtn.disabled = true;
  monitorEnabled = false;
  monitorBtn.classList.remove('active');
  monitorBtn.textContent = '\ud83c\udfa7 Monitor (Headphones)';
  stopRecordBtn.style.display = 'none';
  recordBtn.style.display = '';
}

// ── Monitor Toggle ───────────────────────────────────────────────────

monitorBtn.addEventListener('click', () => {
  monitorEnabled = !monitorEnabled;
  monitorBtn.classList.toggle('active', monitorEnabled);
  monitorBtn.textContent = monitorEnabled
    ? '\ud83c\udfa7 Monitor ON'
    : '\ud83c\udfa7 Monitor (Headphones)';
  if (isRunning) {
    rebuildAudioGraph();
  }
});

// ── Recording ────────────────────────────────────────────────────────

recordBtn.addEventListener('click', () => {
  if (!outputNode) return;

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(outputNode.stream, {
    mimeType: getSupportedMimeType()
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
    addRecording(blob);
    stopRecordBtn.style.display = 'none';
    recordBtn.style.display = '';
  };

  mediaRecorder.start();
  recordBtn.style.display = 'none';
  stopRecordBtn.style.display = '';
  stopRecordBtn.disabled = false;
});

stopRecordBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
});

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

function addRecording(blob) {
  recordingCount++;
  const voiceName = VOICES.find((v) => v.id === currentVoiceId).name;
  const url = URL.createObjectURL(blob);

  const item = document.createElement('div');
  item.className = 'recording-item';
  item.innerHTML = `
    <span class="label">#${recordingCount} - ${voiceName}</span>
    <audio controls src="${url}"></audio>
    <a class="download-btn" href="${url}" download="voice_${currentVoiceId}_${recordingCount}.webm">Download</a>
  `;

  recordingsDiv.prepend(item);
  playbackSection.style.display = 'block';
}

// ── Visualizer ───────────────────────────────────────────────────────

function drawVisualizer() {
  if (!isRunning || !analyserNode) return;

  requestAnimationFrame(drawVisualizer);

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteTimeDomainData(dataArray);

  const width = visualizer.width;
  const height = visualizer.height;

  canvasCtx.fillStyle = '#1a1a2e';
  canvasCtx.fillRect(0, 0, width, height);

  canvasCtx.lineWidth = 2;

  const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  canvasCtx.strokeStyle = gradient;

  canvasCtx.beginPath();

  const sliceWidth = width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
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
