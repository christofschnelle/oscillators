<template>
  <div class="dial-container" :style="{ '--dial-color': color }">
    <div class="dial-label">{{ label }}</div>
    <svg
      class="dial"
      :width="size"
      :height="size"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <!-- Background circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="size / 2 - 4"
        fill="#1a1a1a"
        stroke="#333"
        stroke-width="2"
      />

      <!-- Value arc -->
      <path
        :d="arcPath"
        fill="none"
        :stroke="color"
        stroke-width="4"
        stroke-linecap="round"
      />

      <!-- Center dot -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        r="4"
        :fill="color"
      />

      <!-- Indicator line -->
      <line
        :x1="size / 2"
        :y1="size / 2"
        :x2="indicatorX"
        :y2="indicatorY"
        :stroke="color"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Notch at indicator end -->
      <circle
        :cx="indicatorX"
        :cy="indicatorY"
        r="3"
        :fill="color"
      />
    </svg>
    <input
      type="number"
      class="dial-input"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :min="min"
      :max="max"
      :step="step"
    />
    <div v-if="quantize && step > 1" class="dial-harmonic">{{ harmonicLabel }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  label: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 80
  },
  color: {
    type: String,
    default: '#00ff88'
  },
  step: {
    type: Number,
    default: 1
  },
  quantize: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartValue = ref(0)

// Normalize value to 0-1 range
const normalizedValue = computed(() => {
  return (props.modelValue - props.min) / (props.max - props.min)
})

// Angle in degrees (starting from bottom, going clockwise)
// -135 to +135 degrees (270 degree range)
const angle = computed(() => {
  return -135 + normalizedValue.value * 270
})

// Convert angle to radians
const angleRad = computed(() => {
  return (angle.value - 90) * Math.PI / 180
})

// Indicator position
const indicatorX = computed(() => {
  const radius = props.size / 2 - 12
  return props.size / 2 + radius * Math.cos(angleRad.value)
})

const indicatorY = computed(() => {
  const radius = props.size / 2 - 12
  return props.size / 2 + radius * Math.sin(angleRad.value)
})

// Arc path for value visualization
const arcPath = computed(() => {
  const centerX = props.size / 2
  const centerY = props.size / 2
  const radius = props.size / 2 - 8

  const startAngle = -135 - 90 // Start at -135 degrees, adjusted for SVG coordinates
  const endAngle = angle.value - 90

  const startX = centerX + radius * Math.cos(startAngle * Math.PI / 180)
  const startY = centerY + radius * Math.sin(startAngle * Math.PI / 180)
  const endX = centerX + radius * Math.cos(endAngle * Math.PI / 180)
  const endY = centerY + radius * Math.sin(endAngle * Math.PI / 180)

  const largeArc = normalizedValue.value > 0.75 ? 1 : 0

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
})

const displayValue = computed(() => {
  const val = props.modelValue.toFixed(props.step < 1 ? 2 : 0)
  return `${val}${props.unit}`
})

const harmonicLabel = computed(() => {
  if (props.quantize && props.min > 0) {
    const harmonic = Math.round(props.modelValue / props.min)
    return `H${harmonic}`
  }
  return ''
})

const startDrag = (event) => {
  event.preventDefault()
  isDragging.value = true

  const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY
  dragStartY.value = clientY
  dragStartValue.value = props.modelValue

  const handleMove = (e) => {
    if (isDragging.value) {
      updateValue(e)
    }
  }

  const handleEnd = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

const updateValue = (event) => {
  const clientY = event.type.startsWith('touch') ? event.touches[0].clientY : event.clientY

  // Calculate vertical drag distance
  const deltaY = dragStartY.value - clientY // Inverted: drag up = increase value

  // Sensitivity: pixels to drag for full range
  // Lower = more sensitive, higher = less sensitive
  const sensitivity = 200

  // Calculate change in value based on drag distance
  const valueRange = props.max - props.min
  const valueChange = (deltaY / sensitivity) * valueRange

  // Calculate new value
  let newValue = dragStartValue.value + valueChange

  // Apply step
  newValue = Math.round(newValue / props.step) * props.step

  // Clamp to range
  newValue = Math.max(props.min, Math.min(props.max, newValue))

  emit('update:modelValue', newValue)
}

const handleInput = (event) => {
  let value = parseFloat(event.target.value)

  if (isNaN(value)) {
    return
  }

  // Apply step quantization
  value = Math.round(value / props.step) * props.step

  // Clamp to range
  value = Math.max(props.min, Math.min(props.max, value))

  emit('update:modelValue', value)
}

const handleFocus = (event) => {
  event.target.select()
}

const handleBlur = (event) => {
  // Ensure value is valid on blur
  let value = parseFloat(event.target.value)

  if (isNaN(value)) {
    event.target.value = props.modelValue
    return
  }

  // Apply step quantization
  value = Math.round(value / props.step) * props.step

  // Clamp to range
  value = Math.max(props.min, Math.min(props.max, value))

  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.dial-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.dial {
  cursor: ns-resize;
  touch-action: none;
}

.dial:active {
  cursor: ns-resize;
}

.dial-label {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dial-input {
  font-size: 12px;
  color: #fff;
  font-weight: 600;
  width: 60px;
  text-align: center;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 4px 6px;
  outline: none;
  transition: all 0.2s ease;
  -moz-appearance: textfield;
}

.dial-input::-webkit-outer-spin-button,
.dial-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dial-input:hover {
  border-color: #555;
}

.dial-input:focus {
  border-color: var(--dial-color, #00ff88);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.1);
}

.dial-harmonic {
  font-size: 9px;
  color: #666;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
