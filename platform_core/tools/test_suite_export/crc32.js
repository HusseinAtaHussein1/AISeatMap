// CRC-32 (IEEE 802.3), required by every ZIP entry header — and therefore by the .xlsx writer.
// Its own file so the writer reads as document assembly rather than bit arithmetic.

'use strict';

const TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

/** @param {Buffer|Uint8Array} buf @returns {number} unsigned 32-bit CRC */
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i += 1) {
    crc = (crc >>> 8) ^ TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

module.exports = { crc32 };
