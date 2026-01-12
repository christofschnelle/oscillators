<template>
  <div class="oscilloscope">
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  waveformData: {
    type: Array,
    required: true
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 300
  },
  color: {
    type: String,
    default: '#00ff88'
  },
  backgroundColor: {
    type: String,
    default: '#0a0a0a'
  },
  gridColor: {
    type: String,
    default: '#1a1a1a'
  }
})

const canvas = ref(null)
let ctx = null
let animationId = null

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  startAnimation()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

watch(() => props.waveformData, () => {
  // Data will be drawn on next animation frame
})

const drawGrid = () => {
  ctx.strokeStyle = props.gridColor
  ctx.lineWidth = 1

  // Vertical lines
  const verticalSpacing = props.width / 10
  for (let i = 0; i <= 10; i++) {
    const x = i * verticalSpacing
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, props.height)
    ctx.stroke()
  }

  // Horizontal lines
  const horizontalSpacing = props.height / 8
  for (let i = 0; i <= 8; i++) {
    const y = i * horizontalSpacing
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(props.width, y)
    ctx.stroke()
  }

  // Center line (brighter)
  ctx.strokeStyle = '#2a2a2a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, props.height / 2)
  ctx.lineTo(props.width, props.height / 2)
  ctx.stroke()
}

const drawWaveform = () => {
  if (!props.waveformData || props.waveformData.length === 0) return

  const data = props.waveformData
  const centerY = props.height / 2
  const scaleY = props.height / 3 // Scale factor for amplitude

  ctx.strokeStyle = props.color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Add glow effect
  ctx.shadowBlur = 8
  ctx.shadowColor = props.color

  ctx.beginPath()

  for (let i = 0; i < data.length; i++) {
    const x = (i / data.length) * props.width
    const y = centerY - data[i] * scaleY

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()

  // Reset shadow
  ctx.shadowBlur = 0
}

const draw = () => {
  // Clear canvas
  ctx.fillStyle = props.backgroundColor
  ctx.fillRect(0, 0, props.width, props.height)

  // Draw grid
  drawGrid()

  // Draw waveform
  drawWaveform()
}

const startAnimation = () => {
  const animate = () => {
    draw()
    animationId = requestAnimationFrame(animate)
  }
  animate()
}
</script>

<style scoped>
.oscilloscope {
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

canvas {
  display: block;
}
</style>
