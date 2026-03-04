// Converts assets/icon.png → assets/icon.ico using png-to-ico.
// Sizes embedded: 16, 32, 48, 64, 128, 256

const pngToIco = require('png-to-ico');
const path     = require('path');
const fs       = require('fs');

const src = path.join(__dirname, '../assets/icon.png');
const out = path.join(__dirname, '../assets/icon.ico');

if (!fs.existsSync(src)) {
  console.error('❌ icon.png not found — run build:icons after icon.png is generated');
  process.exit(1);
}

pngToIco(src)
  .then((buf) => {
    fs.writeFileSync(out, buf);
    console.log('✅ icon.ico');
  })
  .catch((err) => {
    console.error('❌ ico generation failed:', err.message);
    process.exit(1);
  });
