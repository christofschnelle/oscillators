import { ref } from 'vue'

export function useAudio() {
  const isPlaying = ref(false)
  const audioContext = ref(null)
  const masterGain = ref(null)
  const oscillatorNodes = ref([])

  const initAudio = () => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      masterGain.value = audioContext.value.createGain()
      masterGain.value.gain.value = 0.3 // Master volume to prevent clipping
      masterGain.value.connect(audioContext.value.destination)
    }
  }

  const startAudio = (oscillators) => {
    initAudio()

    // Resume audio context if suspended (required by browsers)
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }

    // Stop any existing oscillators
    stopAudio()

    // Create oscillator nodes for each oscillator
    oscillatorNodes.value = oscillators.map((osc, index) => {
      // Create oscillator
      const oscillator = audioContext.value.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = osc.frequency

      // Create gain node for this oscillator
      const gainNode = audioContext.value.createGain()
      gainNode.gain.value = osc.amplitude

      // Connect: oscillator -> gain -> master gain -> destination
      oscillator.connect(gainNode)
      gainNode.connect(masterGain.value)

      // Start the oscillator
      oscillator.start()

      return {
        oscillator,
        gainNode,
        index
      }
    })

    isPlaying.value = true
  }

  const stopAudio = () => {
    oscillatorNodes.value.forEach(node => {
      try {
        node.oscillator.stop()
        node.oscillator.disconnect()
        node.gainNode.disconnect()
      } catch (e) {
        // Oscillator may already be stopped
      }
    })
    oscillatorNodes.value = []
    isPlaying.value = false
  }

  const updateFrequency = (index, frequency) => {
    if (oscillatorNodes.value[index]) {
      oscillatorNodes.value[index].oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.value.currentTime
      )
    }
  }

  const updateAmplitude = (index, amplitude) => {
    if (oscillatorNodes.value[index]) {
      oscillatorNodes.value[index].gainNode.gain.setValueAtTime(
        amplitude,
        audioContext.value.currentTime
      )
    }
  }

  const toggleAudio = (oscillators) => {
    if (isPlaying.value) {
      stopAudio()
    } else {
      startAudio(oscillators)
    }
  }

  return {
    isPlaying,
    startAudio,
    stopAudio,
    toggleAudio,
    updateFrequency,
    updateAmplitude
  }
}
