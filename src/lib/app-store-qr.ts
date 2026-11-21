// QR Version 3-L in byte mode fits up to 53 UTF-8 bytes in a single Reed–Solomon block.
const size = 29;
const dataLength = 55;
const parityLength = 15;

function multiply(a: number, b: number) {
  let product = 0;
  for (let bit = 7; bit >= 0; bit--) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d);
    product ^= ((b >>> bit) & 1) * a;
  }
  return product;
}

function encode(text: string) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 53) throw new RangeError("App Store URL exceeds QR capacity");

  const bits: number[] = [];
  function append(value: number, width: number) {
    for (let bit = width - 1; bit >= 0; bit--) bits.push((value >>> bit) & 1);
  }
  append(4, 4);
  append(bytes.length, 8);
  bytes.forEach((byte) => append(byte, 8));
  append(0, 4);
  let pad = 0xec;
  while (bits.length < dataLength * 8) {
    append(pad, 8);
    pad = pad === 0xec ? 0x11 : 0xec;
  }

  // Build the generator in GF(256), then divide the data polynomial to obtain the parity bytes.
  const divisor = new Uint8Array(parityLength);
  divisor[parityLength - 1] = 1;
  let root = 1;
  for (let term = 0; term < parityLength; term++) {
    for (let i = 0; i < parityLength; i++) {
      divisor[i] = multiply(divisor[i], root) ^ (divisor[i + 1] ?? 0);
    }
    root = multiply(root, 2);
  }
  const parity = new Uint8Array(parityLength);
  for (let offset = 0; offset < bits.length; offset += 8) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit++) byte = (byte << 1) | bits[offset + bit];
    const factor = byte ^ parity[0];
    parity.copyWithin(0, 1);
    parity[parityLength - 1] = 0;
    parity.forEach((value, index) => { parity[index] = value ^ multiply(divisor[index], factor); });
  }
  parity.forEach((byte) => append(byte, 8));
  return bits;
}

export function appStoreQr(text: string) {
  const bits = encode(text);
  const modules: (boolean | undefined)[][] = Array.from({ length: size }, () => Array(size));
  function draw(x: number, y: number, dark: boolean) {
    if (x >= 0 && x < size && y >= 0 && y < size) modules[y][x] = dark;
  }

  for (const [x, y] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        draw(x + dx, y + dy, distance !== 2 && distance !== 4);
      }
    }
  }
  for (let i = 8; i < size - 8; i++) {
    draw(i, 6, i % 2 === 0);
    draw(6, i, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) draw(22 + dx, 22 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  // Format information for error correction L and mask zero, including its BCH code.
  const format = (i: number) => ((0x77c4 >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) draw(8, i, format(i));
  draw(8, 7, format(6));
  draw(8, 8, format(7));
  draw(7, 8, format(8));
  for (let i = 9; i < 15; i++) draw(14 - i, 8, format(i));
  for (let i = 0; i < 8; i++) draw(size - 1 - i, 8, format(i));
  for (let i = 8; i < 15; i++) draw(8, size - 15 + i, format(i));
  draw(8, size - 8, true);

  let index = 0;
  let up = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--;
    for (let row = 0; row < size; row++) {
      const y = up ? size - 1 - row : row;
      for (let x = right; x > right - 2; x--) {
        if (modules[y][x] !== undefined) continue;
        draw(x, y, (bits[index++] === 1) !== ((x + y) % 2 === 0));
      }
    }
    up = !up;
  }

  // The white quiet zone is four modules on each side.
  return {
    size: size + 8,
    path: modules.flatMap((row, y) => row.map((dark, x) => dark ? `M${x + 4} ${y + 4}h1v1h-1z` : "")).join(""),
  };
}
