export const hexToRgb = (hex) => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6 && sanitized.length !== 3) return { r: 0, g: 0, b: 0 };
  let fullHex = sanitized.length === 3 ? sanitized.split('').map(c => c + c).join('') : sanitized;
  const bigint = parseInt(fullHex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

export const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');

export const generateShades = (baseHex, steps = 4) => {
  try {
    const { r, g, b } = hexToRgb(baseHex);
    let shades = [];
    for (let i = steps; i > 0; i--) {
      const factor = i / (steps + 1);
      shades.push({
        hex: rgbToHex(Math.round(r + (255 - r) * factor), Math.round(g + (255 - g) * factor), Math.round(b + (255 - b) * factor)),
        label: `TINT ${i * 20}%`
      });
    }
    shades.push({ hex: baseHex, label: 'BASE CORE' });
    for (let i = 1; i <= steps; i++) {
      const factor = 1 - (i / (steps + 1));
      shades.push({
        hex: rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor)),
        label: `SHADE ${i * 20}%`
      });
    }
    return shades;
  } catch {
    return [];
  }
};

export const getContrastYIQ = (hexcolor) => {
  const { r, g, b } = hexToRgb(hexcolor);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

// --- New Features ---

// Convert RGB to HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
};

// Convert HSL to RGB
export const hslToRgb = (h, s, l) => {
  let r, g, b;
  h /= 360;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// Generate Harmonies (Supports Hex and Gradient strings)
export const getHarmonies = (value) => {
  if (value.includes('gradient')) {
    const hexes = value.match(/#[a-fA-F0-9]{3,6}/gi) || [];
    const uniqueHexes = [...new Set(hexes)];
    if (uniqueHexes.length === 0) return null;
    
    const hexHarmoniesMap = {};
    uniqueHexes.forEach(hex => {
      hexHarmoniesMap[hex] = getHarmoniesHex(hex);
    });

    const result = {
      complementary: [],
      analogous: [],
      triadic: [],
      splitComplementary: []
    };

    ['complementary', 'analogous', 'triadic', 'splitComplementary'].forEach(harmonyType => {
      const length = hexHarmoniesMap[uniqueHexes[0]][harmonyType].length;
      for (let i = 0; i < length; i++) {
        let currentGrad = value;
        uniqueHexes.forEach(hex => {
          const replacement = hexHarmoniesMap[hex][harmonyType][i];
          const regex = new RegExp(hex + '(?![a-fA-F0-9])', 'gi');
          currentGrad = currentGrad.replace(regex, replacement);
        });
        result[harmonyType].push(currentGrad);
      }
    });

    return result;
  } else {
    return getHarmoniesHex(value);
  }
};

const getHarmoniesHex = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  
  const toHex = (hue) => {
    const { r: nr, g: ng, b: nb } = hslToRgb((hue + 360) % 360, s, l);
    return rgbToHex(nr, ng, nb);
  };

  return {
    complementary: [hex, toHex(h + 180)],
    analogous: [toHex(h - 30), hex, toHex(h + 30)],
    triadic: [hex, toHex(h + 120), toHex(h + 240)],
    splitComplementary: [hex, toHex(h + 150), toHex(h + 210)]
  };
};

// Simulate Color Blindness (Supports Hex and Gradient strings)
export const simulateColorBlindness = (value) => {
  if (value.includes('gradient')) {
    let protanopiaValue = value;
    let deuteranopiaValue = value;
    let achromatopsiaValue = value;

    const hexes = value.match(/#[a-fA-F0-9]{3,6}/gi) || [];
    const uniqueHexes = [...new Set(hexes)];
    
    uniqueHexes.forEach(hex => {
      const { protanopia, deuteranopia, achromatopsia } = simulateColorBlindnessHex(hex);
      const regex = new RegExp(hex + '(?![a-fA-F0-9])', 'gi');
      protanopiaValue = protanopiaValue.replace(regex, protanopia);
      deuteranopiaValue = deuteranopiaValue.replace(regex, deuteranopia);
      achromatopsiaValue = achromatopsiaValue.replace(regex, achromatopsia);
    });

    return {
      protanopia: protanopiaValue,
      deuteranopia: deuteranopiaValue,
      achromatopsia: achromatopsiaValue
    };
  } else {
    return simulateColorBlindnessHex(value);
  }
};

const simulateColorBlindnessHex = (hex) => {
  const { r, g, b } = hexToRgb(hex);

  // Protanopia (Red-blind)
  const pr = Math.min(255, Math.max(0, 0.567 * r + 0.433 * g + 0 * b));
  const pg = Math.min(255, Math.max(0, 0.558 * r + 0.442 * g + 0 * b));
  const pb = Math.min(255, Math.max(0, 0 * r + 0.242 * g + 0.758 * b));

  // Deuteranopia (Green-blind)
  const dr = Math.min(255, Math.max(0, 0.625 * r + 0.375 * g + 0 * b));
  const dg = Math.min(255, Math.max(0, 0.700 * r + 0.300 * g + 0 * b));
  const db = Math.min(255, Math.max(0, 0 * r + 0.300 * g + 0.700 * b));

  // Achromatopsia (Total color blindness)
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const ar = y, ag = y, ab = y;

  return {
    protanopia: rgbToHex(Math.round(pr), Math.round(pg), Math.round(pb)),
    deuteranopia: rgbToHex(Math.round(dr), Math.round(dg), Math.round(db)),
    achromatopsia: rgbToHex(Math.round(ar), Math.round(ag), Math.round(ab))
  };
};
