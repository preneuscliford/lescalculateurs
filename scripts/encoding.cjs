const fs = require("fs");

const WINDOWS_1252_MAP = new Map([
  [0x80, 0x20ac],
  [0x82, 0x201a],
  [0x83, 0x0192],
  [0x84, 0x201e],
  [0x85, 0x2026],
  [0x86, 0x2020],
  [0x87, 0x2021],
  [0x88, 0x02c6],
  [0x89, 0x2030],
  [0x8a, 0x0160],
  [0x8b, 0x2039],
  [0x8c, 0x0152],
  [0x8e, 0x017d],
  [0x91, 0x2018],
  [0x92, 0x2019],
  [0x93, 0x201c],
  [0x94, 0x201d],
  [0x95, 0x2022],
  [0x96, 0x2013],
  [0x97, 0x2014],
  [0x98, 0x02dc],
  [0x99, 0x2122],
  [0x9a, 0x0161],
  [0x9b, 0x203a],
  [0x9c, 0x0153],
  [0x9e, 0x017e],
  [0x9f, 0x0178],
]);

function decodeWindows1252(buffer) {
  let out = "";
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte >= 0x80 && byte <= 0x9f) {
      const cp = WINDOWS_1252_MAP.get(byte);
      out += cp ? String.fromCodePoint(cp) : String.fromCodePoint(byte);
      continue;
    }
    out += String.fromCodePoint(byte);
  }
  return out;
}

function decodeUtf8OrThrow(buffer) {
  const dec = new TextDecoder("utf-8", { fatal: true });
  return dec.decode(buffer);
}

function decodeText(buffer) {
  try {
    return { text: decodeUtf8OrThrow(buffer), encoding: "utf8" };
  } catch (_) {
    return { text: decodeWindows1252(buffer), encoding: "windows-1252" };
  }
}

function readTextFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return decodeText(buf).text;
}

function writeTextFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

module.exports = {
  decodeText,
  readTextFile,
  writeTextFile,
};

