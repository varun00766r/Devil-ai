const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createDevilIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  // If maskable, safe zone is 80%, so scale inner content by 0.8
  const scale = isMaskable ? 0.78 : 0.95;
  const maxRadius = (size / 2) * scale;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep dark background #050505
      let r = 5;
      let g = 5;
      let b = 5;
      let a = 255;

      // Subtle radial dark cyan gradient background
      if (dist < center * 0.98) {
        const bgFactor = Math.max(0, 1 - dist / (center * 0.95));
        r = Math.min(255, Math.floor(r + 10 * bgFactor));
        g = Math.min(255, Math.floor(g + 30 * bgFactor));
        b = Math.min(255, Math.floor(b + 45 * bgFactor));
      }

      // Outer Arc Ring
      const outerRingR = maxRadius * 0.88;
      const outerRingWidth = Math.max(2, size * 0.015);
      if (Math.abs(dist - outerRingR) < outerRingWidth) {
        // Cyan ring #06b6d4
        const glow = 1 - Math.abs(dist - outerRingR) / outerRingWidth;
        r = Math.floor(6 * glow + r * (1 - glow));
        g = Math.floor(182 * glow + g * (1 - glow));
        b = Math.floor(212 * glow + b * (1 - glow));
      }

      // Middle Tactical Ring
      const midRingR = maxRadius * 0.68;
      const midRingWidth = Math.max(2, size * 0.018);
      if (Math.abs(dist - midRingR) < midRingWidth) {
        const angle = Math.atan2(dy, dx);
        // Dash pattern in angle
        if (Math.sin(angle * 8) > -0.2) {
          const glow = 1 - Math.abs(dist - midRingR) / midRingWidth;
          r = Math.floor(34 * glow + r * (1 - glow));
          g = Math.floor(211 * glow + g * (1 - glow));
          b = Math.floor(238 * glow + b * (1 - glow));
        }
      }

      // Inner Core Glow
      const coreR = maxRadius * 0.45;
      if (dist < coreR) {
        const coreFactor = 1 - dist / coreR;
        // Glowing red / cyan core mix
        r = Math.min(255, Math.floor(r + 160 * coreFactor));
        g = Math.min(255, Math.floor(g + 60 * coreFactor));
        b = Math.min(255, Math.floor(b + 80 * coreFactor));
      }

      // Center bright core
      const centerR = maxRadius * 0.18;
      if (dist < centerR) {
        const cFactor = 1 - dist / centerR;
        r = Math.min(255, Math.floor(240 * cFactor + r * (1 - cFactor)));
        g = Math.min(255, Math.floor(250 * cFactor + g * (1 - cFactor)));
        b = Math.min(255, Math.floor(255 * cFactor + b * (1 - cFactor)));
      }

      // Crosshairs along horizontal and vertical axes
      const crossThickness = Math.max(1.5, size * 0.008);
      if ((Math.abs(dx) < crossThickness || Math.abs(dy) < crossThickness) && dist > maxRadius * 0.25 && dist < maxRadius * 0.95) {
        r = Math.min(255, r + 80);
        g = Math.min(255, g + 180);
        b = Math.min(255, b + 210);
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }
  return png;
}

const publicDir = path.join(__dirname, '..', 'public');

const targets = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
  { file: 'favicon.ico', size: 64, maskable: false },
];

targets.forEach(({ file, size, maskable }) => {
  const png = createDevilIcon(size, maskable);
  const outPath = path.join(publicDir, file);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`Generated ${file} (${size}x${size})`);
});
