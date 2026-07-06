// ip.js — IPv4 utilities. All operations are 32-bit; we use unsigned-style math
// in JS by masking with >>> 0 where needed.
window.NT = window.NT || {};
NT.lib = NT.lib || {};

NT.lib.ip = (function () {

  function parseIPv4(s) {
    if (typeof s !== 'string') return null;
    var parts = s.trim().split('.');
    if (parts.length !== 4) return null;
    var out = [];
    for (var i = 0; i < 4; i++) {
      if (!/^\d+$/.test(parts[i])) return null;
      var n = parseInt(parts[i], 10);
      if (n < 0 || n > 255) return null;
      out.push(n);
    }
    return out;
  }

  function ipToInt(octets) {
    return (((octets[0] << 24) >>> 0) +
            (octets[1] << 16) +
            (octets[2] << 8) +
            (octets[3])) >>> 0;
  }

  function intToIp(n) {
    n = n >>> 0;
    return [
      (n >>> 24) & 0xff,
      (n >>> 16) & 0xff,
      (n >>>  8) & 0xff,
      (n       ) & 0xff
    ];
  }

  function ipToString(octets) {
    return octets.join('.');
  }

  // 8-bit number -> 8-character binary string
  function octetToBinary(n) {
    var s = (n & 0xff).toString(2);
    while (s.length < 8) s = '0' + s;
    return s;
  }

  // ip array -> 'aaaaaaaa.bbbbbbbb.cccccccc.dddddddd'
  function ipToBinary(octets) {
    return octets.map(octetToBinary).join('.');
  }

  // CIDR prefix -> 32-bit mask integer (e.g. 24 -> 0xFFFFFF00)
  function maskFromPrefix(prefix) {
    if (prefix < 0 || prefix > 32) return 0;
    if (prefix === 0) return 0;
    return (0xFFFFFFFF << (32 - prefix)) >>> 0;
  }

  // CIDR prefix -> [a,b,c,d]
  function maskOctetsFromPrefix(prefix) {
    return intToIp(maskFromPrefix(prefix));
  }

  // mask integer -> CIDR prefix (only valid if mask is contiguous 1s then 0s)
  function prefixFromMask(maskInt) {
    var p = 0;
    var m = maskInt >>> 0;
    while (m & 0x80000000) { p++; m = (m << 1) >>> 0; }
    return p;
  }

  // network address (int) given an IP int and prefix
  function networkInt(ipInt, prefix) {
    return (ipInt & maskFromPrefix(prefix)) >>> 0;
  }

  // broadcast address (int) given an IP int and prefix
  function broadcastInt(ipInt, prefix) {
    var mask = maskFromPrefix(prefix);
    return (networkInt(ipInt, prefix) | (~mask >>> 0)) >>> 0;
  }

  // Number of total addresses in the block (network + hosts + broadcast)
  function blockSize(prefix) {
    if (prefix < 0 || prefix > 32) return 0;
    return Math.pow(2, 32 - prefix);
  }

  // Usable host count (excludes network + broadcast for /30 and shorter; /31 is link, /32 is single)
  function usableHosts(prefix) {
    if (prefix >= 31) return Math.pow(2, 32 - prefix); // edge: not standard, but useful
    return Math.pow(2, 32 - prefix) - 2;
  }

  function ipClass(octets) {
    var a = octets[0];
    if (a < 128) return 'A';
    if (a < 192) return 'B';
    if (a < 224) return 'C';
    if (a < 240) return 'D';
    return 'E';
  }

  function isPrivate(octets) {
    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    return false;
  }

  // Returns true iff the mask is "valid" — leading 1s, then 0s, no holes.
  function isValidMask(maskInt) {
    var m = maskInt >>> 0;
    // Find the run of leading 1s. Then everything after must be 0.
    var seenZero = false;
    for (var i = 31; i >= 0; i--) {
      var bit = (m >>> i) & 1;
      if (bit === 0) seenZero = true;
      else if (seenZero) return false;
    }
    return true;
  }

  return {
    parseIPv4: parseIPv4,
    ipToInt: ipToInt,
    intToIp: intToIp,
    ipToString: ipToString,
    octetToBinary: octetToBinary,
    ipToBinary: ipToBinary,
    maskFromPrefix: maskFromPrefix,
    maskOctetsFromPrefix: maskOctetsFromPrefix,
    prefixFromMask: prefixFromMask,
    networkInt: networkInt,
    broadcastInt: broadcastInt,
    blockSize: blockSize,
    usableHosts: usableHosts,
    ipClass: ipClass,
    isPrivate: isPrivate,
    isValidMask: isValidMask
  };
})();
