const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'public');
const out = path.join(__dirname, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });
console.log('Built Blair Lair to dist/');
