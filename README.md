# 8-Oscillator Synthesizer

A real-time harmonic synthesizer built with Vue 3 + Vite featuring 8 sinus oscillators with an oscilloscope display.

## Features

- 8 independent sinus wave oscillators
- Real-time oscilloscope visualization
- Interactive round dials with drag control
- Editable number inputs for precise value entry
- Harmonic frequency quantization (44 Hz fundamental)
- Web Audio API for high-quality audio synthesis
- Compact, responsive layout

## Controls

- **Drag dials vertically**: Change frequency or amplitude smoothly
- **Click number inputs**: Type exact values
- **Play/Stop button**: Toggle audio output
- **Frequency range**: 44 Hz to 1980 Hz (quantized to harmonics of 44 Hz)
- **Amplitude range**: 0.0 to 1.0

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g., `vue-demo`)

2. Update the deploy script in `deploy.sh` and `package.json` with your GitHub username

3. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/vue-demo.git
git push -u origin main
```

4. Deploy to GitHub Pages:
```bash
./deploy.sh
```

Or use npm:
```bash
npm run deploy
```

5. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages / (root)
   - Save

Your app will be live at: `https://YOUR_USERNAME.github.io/vue-demo/`

## Technologies

- Vue 3
- Vite
- Web Audio API
- Canvas API
