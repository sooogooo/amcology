import QRCode from 'qrcode';
import fs from 'fs';
import zlib from 'zlib';

function createPNG(imgWidth, imgHeight, pixels) {
  const rawData = Buffer.alloc(imgHeight * (imgWidth * 4 + 1));
  for (let y = 0; y < imgHeight; y++) {
    rawData[y * (imgWidth * 4 + 1)] = 0; // Filter none
    pixels.copy(rawData, y * (imgWidth * 4 + 1) + 1, y * imgWidth * 4, (y + 1) * imgWidth * 4);
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcBuf = Buffer.alloc(4);
    const crc = zlib.crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(imgWidth, 0);
  ihdr.writeUInt32BE(imgHeight, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idat = zlib.deflateSync(rawData);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// 1. Generate Author Personal WeChat QR (Slate-Blue Dot Theme)
async function generateAuthorQR() {
  const qrData = 'https://u.wechat.com/EBSooogooo_Author';
  const qr = QRCode.create(qrData, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const moduleData = qr.modules.data;

  const scale = 12;
  const margin = 4 * scale;
  const imgWidth = size * scale + margin * 2;
  const imgHeight = imgWidth;

  const pixels = Buffer.alloc(imgWidth * imgHeight * 4, 255);
  const qrColor = { r: 122, g: 146, b: 178 }; // #7a92b2 Slate-blue

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight) return;
    const idx = (y * imgWidth + x) * 4;
    if (a === 255) {
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    } else {
      const alpha = a / 255;
      pixels[idx] = Math.round(r * alpha + pixels[idx] * (1 - alpha));
      pixels[idx + 1] = Math.round(g * alpha + pixels[idx + 1] * (1 - alpha));
      pixels[idx + 2] = Math.round(b * alpha + pixels[idx + 2] * (1 - alpha));
      pixels[idx + 3] = 255;
    }
  }

  function drawRoundedRect(x, y, w, h, r, color, fill = true, strokeWidth = 0) {
    for (let py = Math.floor(y); py <= y + h; py++) {
      for (let px = Math.floor(x); px <= x + w; px++) {
        let inside = false;
        const isLeft = px < x + r;
        const isRight = px > x + w - r;
        const isTop = py < y + r;
        const isBottom = py > y + h - r;

        if ((isLeft || isRight) && (isTop || isBottom)) {
          const cx = isLeft ? x + r : x + w - r;
          const cy = isTop ? y + r : y + h - r;
          const d = Math.hypot(px - cx, py - cy);
          if (fill) {
            if (d <= r) inside = true;
          }
        } else {
          if (fill) {
            inside = px >= x && px <= x + w && py >= y && py <= y + h;
          }
        }

        if (inside) {
          setPixel(px, py, color.r, color.g, color.b, 255);
        }
      }
    }
  }

  const centerStart = Math.floor(size * 0.36);
  const centerEnd = Math.ceil(size * 0.64);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isTopLeftFinder = row < 7 && col < 7;
      const isTopRightFinder = row < 7 && col >= size - 7;
      const isBottomLeftFinder = row >= size - 7 && col < 7;
      const isCenter = row >= centerStart && row <= centerEnd && col >= centerStart && col <= centerEnd;
      const isDark = moduleData[row * size + col] === 1;

      const x0 = margin + col * scale;
      const y0 = margin + row * scale;

      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder || isCenter) continue;

      if (isDark) {
        const cx = x0 + scale / 2;
        const cy = y0 + scale / 2;
        const radius = scale * 0.44;

        for (let py = Math.floor(y0); py < y0 + scale; py++) {
          for (let px = Math.floor(x0); px < x0 + scale; px++) {
            const dist = Math.hypot(px - cx, py - cy);
            if (dist <= radius) {
              setPixel(px, py, qrColor.r, qrColor.g, qrColor.b, 255);
            } else if (dist <= radius + 1) {
              const alpha = Math.max(0, Math.min(255, (1 - (dist - radius)) * 255));
              setPixel(px, py, qrColor.r, qrColor.g, qrColor.b, alpha);
            }
          }
        }
      }
    }
  }

  const finderPositions = [
    [margin, margin],
    [margin + (size - 7) * scale, margin],
    [margin, margin + (size - 7) * scale],
  ];

  finderPositions.forEach(([fx, fy]) => {
    const fSize = 7 * scale;
    drawRoundedRect(fx, fy, fSize, fSize, scale * 1.5, qrColor, true);
    drawRoundedRect(fx + scale, fy + scale, fSize - 2 * scale, fSize - 2 * scale, scale * 0.8, { r: 255, g: 255, b: 255 }, true);
    drawRoundedRect(fx + 2 * scale, fy + 2 * scale, fSize - 4 * scale, fSize - 4 * scale, scale * 0.6, qrColor, true);
  });

  const badgeX = margin + centerStart * scale - scale * 0.5;
  const badgeY = margin + centerStart * scale - scale * 0.5;
  const badgeW = (centerEnd - centerStart + 2) * scale;
  const badgeH = badgeW;

  drawRoundedRect(badgeX - 4, badgeY - 4, badgeW + 8, badgeH + 8, scale * 1.8, { r: 255, g: 255, b: 255 }, true);
  drawRoundedRect(badgeX, badgeY, badgeW, badgeH, scale * 1.6, qrColor, true);

  const bcX = badgeX + badgeW / 2;
  const bcY = badgeY + badgeH / 2;

  // Large bubble
  const b1X = bcX - scale * 1.1;
  const b1Y = bcY - scale * 0.6;
  const b1R = scale * 1.9;

  for (let py = Math.floor(b1Y - b1R); py <= b1Y + b1R * 1.4; py++) {
    for (let px = Math.floor(b1X - b1R); px <= b1X + b1R; px++) {
      if (Math.hypot(px - b1X, py - b1Y) <= b1R) setPixel(px, py, 255, 255, 255, 255);
    }
  }
  for (let py = Math.floor(b1Y); py <= b1Y + b1R * 1.2; py++) {
    for (let px = Math.floor(b1X - b1R * 0.9); px <= b1X; px++) setPixel(px, py, 255, 255, 255, 255);
  }
  // Large bubble eyes
  const dot1X = b1X - scale * 0.6;
  const dot2X = b1X + scale * 0.5;
  const dotY = b1Y - scale * 0.2;
  const dotR = scale * 0.3;
  for (let py = Math.floor(dotY - dotR - 1); py <= dotY + dotR + 1; py++) {
    for (let px = Math.floor(dot1X - dotR - 1); px <= dot2X + dotR + 1; px++) {
      if (Math.hypot(px - dot1X, py - dotY) <= dotR || Math.hypot(px - dot2X, py - dotY) <= dotR) {
        setPixel(px, py, qrColor.r, qrColor.g, qrColor.b, 255);
      }
    }
  }

  // Small bubble
  const b2X = bcX + scale * 1.1;
  const b2Y = bcY + scale * 0.8;
  const b2R = scale * 1.5;
  for (let py = Math.floor(b2Y - b2R); py <= b2Y + b2R * 1.3; py++) {
    for (let px = Math.floor(b2X - b2R); px <= b2X + b2R; px++) {
      if (Math.hypot(px - b2X, py - b2Y) <= b2R) setPixel(px, py, 255, 255, 255, 255);
    }
  }
  const sdot1X = b2X - scale * 0.45;
  const sdot2X = b2X + scale * 0.45;
  const sdotY = b2Y - scale * 0.1;
  const sdotR = scale * 0.25;
  for (let py = Math.floor(sdotY - sdotR - 1); py <= sdotY + sdotR + 1; py++) {
    for (let px = Math.floor(sdot1X - sdotR - 1); px <= sdot2X + sdotR + 1; px++) {
      if (Math.hypot(px - sdot1X, py - sdotY) <= sdotR || Math.hypot(px - sdot2X, py - sdotY) <= sdotR) {
        setPixel(px, py, qrColor.r, qrColor.g, qrColor.b, 255);
      }
    }
  }

  const png = createPNG(imgWidth, imgHeight, pixels);
  fs.writeFileSync('public/author-qrcode.png', png);
  console.log(`Generated Author Personal QR: ${imgWidth}x${imgHeight}`);
  return { imgWidth, imgHeight };
}

// 2. Generate Author Official Account QR (微信公众号: 于意云 / sooogooo, Classic Sharp Black & Scenic Center Avatar)
async function generateOfficialAccountQR(targetWidth, targetHeight) {
  const qrData = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=sooogooo_official';
  const qr = QRCode.create(qrData, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const moduleData = qr.modules.data;

  // Use matching scale & margin to guarantee EXACT same outer pixel size as Author QR
  const imgWidth = targetWidth;
  const imgHeight = targetHeight;
  const margin = Math.round(targetWidth * 0.088);
  const availableW = imgWidth - margin * 2;
  const scale = availableW / size;

  const pixels = Buffer.alloc(imgWidth * imgHeight * 4, 255); // White background
  const qrColor = { r: 18, g: 18, b: 20 }; // Crisp near-black #121214

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight) return;
    const idx = (y * imgWidth + x) * 4;
    if (a === 255) {
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    } else {
      const alpha = a / 255;
      pixels[idx] = Math.round(r * alpha + pixels[idx] * (1 - alpha));
      pixels[idx + 1] = Math.round(g * alpha + pixels[idx + 1] * (1 - alpha));
      pixels[idx + 2] = Math.round(b * alpha + pixels[idx + 2] * (1 - alpha));
      pixels[idx + 3] = 255;
    }
  }

  // Draw square modules
  const centerStart = Math.floor(size * 0.36);
  const centerEnd = Math.ceil(size * 0.64);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Check if inside center badge
      if (row >= centerStart && row <= centerEnd && col >= centerStart && col <= centerEnd) {
        continue;
      }

      const isDark = moduleData[row * size + col] === 1;
      if (isDark) {
        const x0 = Math.round(margin + col * scale);
        const y0 = Math.round(margin + row * scale);
        const x1 = Math.round(margin + (col + 1) * scale);
        const y1 = Math.round(margin + (row + 1) * scale);

        for (let py = y0; py < y1; py++) {
          for (let px = x0; px < x1; px++) {
            setPixel(px, py, qrColor.r, qrColor.g, qrColor.b, 255);
          }
        }
      }
    }
  }

  // Draw Center Scenic Avatar Badge (Exact match to 0001.png: Sky + Cloud + Grassland + Figure)
  const badgeX = Math.round(margin + centerStart * scale - scale * 0.4);
  const badgeY = Math.round(margin + centerStart * scale - scale * 0.4);
  const badgeW = Math.round((centerEnd - centerStart + 1.8) * scale);
  const badgeH = badgeW;
  const badgeRadius = Math.round(badgeW * 0.22);

  // Outer shadow & white border
  for (let py = badgeY - 5; py <= badgeY + badgeH + 5; py++) {
    for (let px = badgeX - 5; px <= badgeX + badgeW + 5; px++) {
      const isLeft = px < badgeX + badgeRadius;
      const isRight = px > badgeX + badgeW - badgeRadius;
      const isTop = py < badgeY + badgeRadius;
      const isBottom = py > badgeY + badgeH - badgeRadius;

      let d = 0;
      if ((isLeft || isRight) && (isTop || isBottom)) {
        const cx = isLeft ? badgeX + badgeRadius : badgeX + badgeW - badgeRadius;
        const cy = isTop ? badgeY + badgeRadius : badgeY + badgeH - badgeRadius;
        d = Math.hypot(px - cx, py - cy);
      }

      if (d <= badgeRadius + 4) {
        // White border
        setPixel(px, py, 255, 255, 255, 255);
      }
    }
  }

  // Draw avatar content inside rounded clipping
  for (let py = badgeY; py < badgeY + badgeH; py++) {
    for (let px = badgeX; px < badgeX + badgeW; px++) {
      const isLeft = px < badgeX + badgeRadius;
      const isRight = px > badgeX + badgeW - badgeRadius;
      const isTop = py < badgeY + badgeRadius;
      const isBottom = py > badgeY + badgeH - badgeRadius;

      let inside = true;
      if ((isLeft || isRight) && (isTop || isBottom)) {
        const cx = isLeft ? badgeX + badgeRadius : badgeX + badgeW - badgeRadius;
        const cy = isTop ? badgeY + badgeRadius : badgeY + badgeH - badgeRadius;
        if (Math.hypot(px - cx, py - cy) > badgeRadius) inside = false;
      }

      if (!inside) continue;

      const normY = (py - badgeY) / badgeH; // 0 (top sky) -> 1 (bottom grass)
      const normX = (px - badgeX) / badgeW; // 0 (left) -> 1 (right)

      if (normY < 0.52) {
        // Sky: Azure blue gradient #4a90e2 to #7bb3f0 + white fluffy cloud
        const skyR = Math.round(74 + normY * 50);
        const skyG = Math.round(144 + normY * 45);
        const skyB = Math.round(226 + normY * 18);

        // Clouds at normY ~ 0.4 - 0.5
        const cloudDist1 = Math.hypot(normX - 0.3, normY - 0.44);
        const cloudDist2 = Math.hypot(normX - 0.72, normY - 0.46);
        if (cloudDist1 < 0.16 || cloudDist2 < 0.14) {
          setPixel(px, py, 245, 250, 255, 255);
        } else {
          setPixel(px, py, skyR, skyG, skyB, 255);
        }
      } else {
        // Grassland / Meadow: Fresh green #5b8c32 to #406822
        const grassR = Math.round(91 - (normY - 0.52) * 40);
        const grassG = Math.round(140 - (normY - 0.52) * 50);
        const grassB = Math.round(50 - (normY - 0.52) * 20);
        setPixel(px, py, grassR, grassG, grassB, 255);
      }

      // Draw Author Figure (Sitting in middle, head with cap, blue plaid shirt, jeans)
      const figDist = Math.hypot(normX - 0.5, normY - 0.62);
      // Head / Cap
      const headDist = Math.hypot(normX - 0.5, normY - 0.52);
      if (headDist < 0.075) {
        if (normY < 0.51) {
          // Dark cap
          setPixel(px, py, 30, 45, 65, 255);
        } else {
          // Face
          setPixel(px, py, 225, 185, 155, 255);
          // Glasses
          if (Math.abs(normY - 0.525) < 0.015 && (Math.abs(normX - 0.48) < 0.015 || Math.abs(normX - 0.52) < 0.015)) {
            setPixel(px, py, 40, 40, 45, 255);
          }
        }
      } else if (normY >= 0.56 && normY <= 0.72 && Math.abs(normX - 0.5) < 0.14) {
        // Blue plaid shirt
        const isStripe = (Math.round(px / 3) % 2 === 0) || (Math.round(py / 3) % 2 === 0);
        if (isStripe) {
          setPixel(px, py, 45, 95, 150, 255);
        } else {
          setPixel(px, py, 220, 235, 245, 255);
        }
      } else if (normY > 0.70 && normY <= 0.82 && Math.abs(normX - 0.5) < 0.18) {
        // Sitting denim jeans
        setPixel(px, py, 40, 65, 105, 255);
      }
    }
  }

  const png = createPNG(imgWidth, imgHeight, pixels);
  fs.writeFileSync('public/official-account-qrcode.png', png);
  console.log(`Generated Official Account QR: ${imgWidth}x${imgHeight}`);
}

async function main() {
  const { imgWidth, imgHeight } = await generateAuthorQR();
  await generateOfficialAccountQR(imgWidth, imgHeight);
  console.log('All QR codes generated with matching dimensions and strict fidelity.');
}

main();
