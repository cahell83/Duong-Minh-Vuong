import fs from 'fs';
import zlib from 'zlib';

// Simple PNG encoder in pure Node using built-in zlib
function createPng(width, height, drawFn) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel + 1; // +1 for filter byte (0)
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const typeBuffer = Buffer.from(type, 'ascii');
    const crcBuffer = Buffer.alloc(4);

    const crcPayload = Buffer.concat([typeBuffer, data]);
    const crc = calcCrc(crcPayload);
    crcBuffer.writeUInt32BE(crc, 0);

    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  // Precompute CRC32
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function calcCrc(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing function for sporty Pickleball Cún Cưng icon
function drawDogPickleball(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const distSq = dx * dx + dy * dy;

  // Rounded squircle background
  const cornerR = 0.22;
  const qx = Math.max(0, Math.abs(dx) - (0.5 - cornerR));
  const qy = Math.max(0, Math.abs(dy) - (0.5 - cornerR));
  const isOutside = Math.sqrt(qx * qx + qy * qy) > cornerR;

  if (isOutside) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Gradient background: Dark slate (15, 23, 42) to Emerald (4, 120, 87)
  const grad = (nx + ny) * 0.5;
  let r = Math.round(15 * (1 - grad) + 4 * grad);
  let g = Math.round(23 * (1 - grad) + 120 * grad);
  let b = Math.round(42 * (1 - grad) + 87 * grad);

  // Outer border ring
  const ringDist = Math.abs(Math.sqrt(distSq) - 0.44);
  if (ringDist < 0.015) {
    return [16, 185, 129, 255]; // Bright emerald border
  }

  // Pickleball paddle on right/back (cx: 0.62, cy: 0.42, rx: 0.16, ry: 0.20)
  const pdx = (nx - 0.62) / 0.16;
  const pdy = (ny - 0.42) / 0.20;
  if (pdx * pdx + pdy * pdy <= 1.0) {
    // Paddle green face
    r = 16; g = 185; b = 129;
    if (pdx * pdx + pdy * pdy > 0.85) {
      r = 52; g = 211; b = 153; // rim
    }
  }

  // Dog Ears
  // Left ear: cx: 0.32, cy: 0.38, rx: 0.09, ry: 0.16
  const le_dx = (nx - 0.32) / 0.09;
  const le_dy = (ny - 0.38) / 0.16;
  if (le_dx * le_dx + le_dy * le_dy <= 1.0) {
    r = 180; g = 83; b = 9; // amber-700
  }

  // Right ear: cx: 0.66, cy: 0.38, rx: 0.09, ry: 0.16
  const re_dx = (nx - 0.66) / 0.09;
  const re_dy = (ny - 0.38) / 0.16;
  if (re_dx * re_dx + re_dy * re_dy <= 1.0) {
    r = 180; g = 83; b = 9;
  }

  // Puppy Head: center 0.48, 0.48, radius 0.22
  const hx = (nx - 0.48) / 0.21;
  const hy = (ny - 0.48) / 0.19;
  if (hx * hx + hy * hy <= 1.0) {
    r = 254; g = 243; b = 199; // amber-100 puppy skin

    // Sweatband: y between 0.35 and 0.40
    if (ny >= 0.36 && ny <= 0.41 && Math.abs(nx - 0.48) < 0.18) {
      if (ny >= 0.38 && ny <= 0.395) {
        r = 255; g = 255; b = 255; // White stripe
      } else {
        r = 239; g = 68; b = 68; // Red headband
      }
    }

    // Eyes: left (0.42, 0.46), right (0.54, 0.46)
    const el_dist = Math.sqrt((nx - 0.42) ** 2 + (ny - 0.46) ** 2);
    const er_dist = Math.sqrt((nx - 0.54) ** 2 + (ny - 0.46) ** 2);
    if (el_dist < 0.035 || er_dist < 0.035) {
      r = 30; g = 27; b = 75; // Dark pupil
      // sparkle
      if (Math.sqrt((nx - 0.41) ** 2 + (ny - 0.45) ** 2) < 0.012 ||
          Math.sqrt((nx - 0.53) ** 2 + (ny - 0.45) ** 2) < 0.012) {
        r = 255; g = 255; b = 255;
      }
    }

    // Snout / Nose: 0.48, 0.54
    const nose_dist = Math.sqrt((nx - 0.48) ** 2 + (ny - 0.54) ** 2);
    if (nose_dist < 0.022) {
      r = 24; g = 24; b = 27; // dark nose
    }

    // Blush: left (0.37, 0.50), right (0.59, 0.50)
    const bl_dist = Math.sqrt((nx - 0.37) ** 2 + (ny - 0.50) ** 2);
    const br_dist = Math.sqrt((nx - 0.59) ** 2 + (ny - 0.50) ** 2);
    if (bl_dist < 0.025 || br_dist < 0.025) {
      r = 251; g = 113; b = 133; // rose blush
    }
  }

  // Pickleball in front left: cx: 0.30, cy: 0.70, radius 0.12
  const ballDist = Math.sqrt((nx - 0.30) ** 2 + (ny - 0.70) ** 2);
  if (ballDist < 0.12) {
    r = 250; g = 204; b = 21; // Yellow-400 ball
    // Ball border
    if (ballDist > 0.11) {
      r = 202; g = 138; b = 4;
    }
    // Holes in ball
    const holes = [
      [0.30, 0.70], [0.26, 0.67], [0.34, 0.67],
      [0.26, 0.73], [0.34, 0.73], [0.30, 0.63], [0.30, 0.77]
    ];
    for (const [hx, hy] of holes) {
      if (Math.sqrt((nx - hx) ** 2 + (ny - hy) ** 2) < 0.016) {
        r = 161; g = 98; b = 7;
      }
    }
  }

  return [r, g, b, 255];
}

// Generate files in public/
fs.mkdirSync('public', { recursive: true });

const png192 = createPng(192, 192, drawDogPickleball);
fs.writeFileSync('public/pwa-192x192.png', png192);

const png512 = createPng(512, 512, drawDogPickleball);
fs.writeFileSync('public/pwa-512x512.png', png512);

const appleIcon = createPng(180, 180, drawDogPickleball);
fs.writeFileSync('public/apple-touch-icon.png', appleIcon);

console.log('Successfully generated pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png');
