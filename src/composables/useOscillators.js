import { ref, computed } from 'vue'

export function useOscillators() {
  const oscillators = ref([
    { frequency: 44, amplitude: 0.125, phase: 0 },      // 1st harmonic (fundamental)
    { frequency: 88, amplitude: 0.125, phase: 0 },      // 2nd harmonic
    { frequency: 132, amplitude: 0.125, phase: 0 },     // 3rd harmonic
    { frequency: 176, amplitude: 0.125, phase: 0 },     // 4th harmonic
    { frequency: 220, amplitude: 0.125, phase: 0 },     // 5th harmonic
    { frequency: 264, amplitude: 0.125, phase: 0 },     // 6th harmonic
    { frequency: 308, amplitude: 0.125, phase: 0 },     // 7th harmonic
    { frequency: 352, amplitude: 0.125, phase: 0 }      // 8th harmonic
  ])

  const sampleRate = 44100
  const bufferSize = 2048

  // Generate waveform data for display
  const generateWaveform = (numSamples = 1000, duration = 0.02) => {
    const samples = []
    const timeStep = duration / numSamples

    for (let i = 0; i < numSamples; i++) {
      const time = i * timeStep
      let sum = 0

      // Sum all oscillators
      oscillators.value.forEach(osc => {
        if (osc.amplitude > 0) {
          sum += osc.amplitude * Math.sin(2 * Math.PI * osc.frequency * time + osc.phase)
        }
      })

      samples.push(sum)
    }

    return samples
  }

  const updateOscillator = (index, property, value) => {
    oscillators.value[index][property] = value
  }

  return {
    oscillators,
    generateWaveform,
    updateOscillator
  }
}
