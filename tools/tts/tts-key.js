/* File name for a recorded line: FNV-1a (32 bit, hex) of the text exactly as the page passes it. Shared by the engines and tools/tts. */
(function (g) {
  const ttsKey = s => { let h = 0x811c9dc5; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
  if (typeof module !== 'undefined') module.exports = ttsKey; else g.ttsKey = ttsKey;
})(this);
