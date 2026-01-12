<template>
  <div class="app">
    <header>
      <h1>8-Oscillator Synthesizer</h1>
      <button
        @click="handleToggleAudio"
        class="audio-button"
        :class="{ active: isPlaying }"
      >
        <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <span>{{ isPlaying ? 'Stop' : 'Play' }}</span>
      </button>
    </header>

    <main>
      <section class="oscilloscope-section">
        <Oscilloscope
          :waveform-data="waveformData"
          :width="800"
          :height="180"
          color="#00ff88"
        />
      </section>

      <section class="controls-section">
        <div
          v-for="(osc, index) in oscillators"
          :key="index"
          class="oscillator-controls"
        >
          <div class="oscillator-header">
            <h3>OSC {{ index + 1 }}</h3>
          </div>
          <div class="dials">
            <RoundDial
              :model-value="osc.frequency"
              @update:model-value="(val) => updateOscillator(index, 'frequency', val)"
              label="Freq"
              unit=" Hz"
              :min="44"
              :max="44 * 45"
              :step="44"
              :size="70"
              :color="getOscillatorColor(index)"
              :quantize="true"
            />
            <RoundDial
              :model-value="osc.amplitude"
              @update:model-value="(val) => updateOscillator(index, 'amplitude', val)"
              label="Amp"
              unit=""
              :min="0"
              :max="1"
              :step="0.01"
              :size="70"
              :color="getOscillatorColor(index)"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Oscilloscope from './components/Oscilloscope.vue'
import RoundDial from './components/RoundDial.vue'
import { useOscillators } from './composables/useOscillators.js'
import { useAudio } from './composables/useAudio.js'

const { oscillators, generateWaveform, updateOscillator: updateOscillatorData } = useOscillators()
const { isPlaying, toggleAudio, updateFrequency, updateAmplitude, stopAudio } = useAudio()

const waveformData = ref([])
let animationId = null

// Color palette for oscillators
const colors = [
  '#00ff88',
  '#ff0088',
  '#00ccff',
  '#ffaa00',
  '#aa00ff',
  '#ff5555',
  '#55ff55',
  '#5555ff'
]

const getOscillatorColor = (index) => {
  return colors[index % colors.length]
}

// Update oscillator with audio sync
const updateOscillator = (index, property, value) => {
  updateOscillatorData(index, property, value)

  // Update audio if playing
  if (isPlaying.value) {
    if (property === 'frequency') {
      updateFrequency(index, value)
    } else if (property === 'amplitude') {
      updateAmplitude(index, value)
    }
  }
}

// Handle audio toggle
const handleToggleAudio = () => {
  toggleAudio(oscillators.value)
}

// Update waveform data continuously
const updateWaveform = () => {
  waveformData.value = generateWaveform(1000, 0.02)
  animationId = requestAnimationFrame(updateWaveform)
}

onMounted(() => {
  updateWaveform()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  stopAudio()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #0a0a0a;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app {
  min-height: 100vh;
  padding: 12px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

header h1 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #00ff88, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

main {
  max-width: 1200px;
  margin: 0 auto;
}

.oscilloscope-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.audio-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #151515;
  border: 2px solid #333;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audio-button:hover {
  border-color: #00ff88;
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.3);
}

.audio-button.active {
  background: linear-gradient(135deg, #00ff88, #00ccff);
  border-color: #00ff88;
  color: #000;
}

.audio-button svg {
  fill: currentColor;
}

.controls-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0;
}

.oscillator-controls {
  background: #151515;
  border: 1px solid #252525;
  border-radius: 8px;
  padding: 12px 8px;
  transition: all 0.2s ease;
}

.oscillator-controls:hover {
  border-color: #333;
  box-shadow: 0 2px 12px rgba(0, 255, 136, 0.1);
}

.oscillator-header {
  text-align: center;
  margin-bottom: 8px;
}

.oscillator-header h3 {
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
  font-weight: 600;
}

.dials {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 1024px) {
  .controls-section {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .controls-section {
    grid-template-columns: repeat(2, 1fr);
  }

  header {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .controls-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
