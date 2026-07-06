// hw.js — hardware math used across levels
// Pure functions. ES5-only. Verified by Node smoke test.
window.HWT = window.HWT || {};
HWT.lib = HWT.lib || {};

HWT.lib.hw = (function () {

  // ---------- PCIe bandwidth ----------
  // Per-lane bandwidth in MB/s (one direction, after encoding overhead).
  // Gen 1/2 use 8b/10b (20% overhead); Gen 3+ use 128b/130b (~1.5% overhead).
  // Convention: round figures used in marketing. We use the conventional "real" numbers.
  var PCIE_LANE_MBPS = {
    1: 250,   // 2.5 GT/s × 8/10 / 8 = 250 MB/s
    2: 500,   // 5.0 GT/s × 8/10 / 8 = 500 MB/s
    3: 985,   // 8.0 GT/s × 128/130 / 8 ≈ 984.6 MB/s — call it 985 (or "~1 GB/s")
    4: 1969,  // 16 GT/s
    5: 3938,  // 32 GT/s
    6: 7563   // 64 GT/s, PAM4 + FLIT
  };
  function pcieLaneMBps(gen) { return PCIE_LANE_MBPS[gen] || 0; }
  function pcieBandwidthGBps(gen, lanes) {
    var mbps = pcieLaneMBps(gen) * lanes;
    return mbps / 1000;
  }
  // Convenience: round to 1 decimal
  function pcieBandwidthRounded(gen, lanes) {
    return Math.round(pcieBandwidthGBps(gen, lanes) * 10) / 10;
  }

  // ---------- Memory bandwidth ----------
  // DDR is 8 bytes wide per channel. Bandwidth (GB/s) = channels * MT/s * 8 / 1000.
  function memBandwidthGBps(channels, mtPerSec) {
    return channels * mtPerSec * 8 / 1000;
  }

  // ---------- Display bandwidth (uncompressed) ----------
  // Bits/sec ≈ width * height * refresh * bpp.
  // Real DP/HDMI add ~5–25% overhead (8b/10b or 16b/18b coding + control). We add 25% as a safety factor.
  function displayBitsPerSec(w, h, hz, bpp) {
    return w * h * hz * bpp;
  }
  function displayGbpsWithOverhead(w, h, hz, bpp) {
    var raw = displayBitsPerSec(w, h, hz, bpp) / 1e9;
    return raw * 1.25;
  }
  // Compare against link capacity (Gbps, uncompressed payload).
  // HDMI 2.0 = 14.4 Gbps payload, HDMI 2.1 = 42.6 (FRL), DP 1.4 = 25.92, DP 2.1 UHBR20 = 77.4.
  var DISPLAY_LINKS = {
    'HDMI 1.4': 8.16,
    'HDMI 2.0': 14.4,
    'HDMI 2.1': 42.6,
    'DP 1.2':   17.28,
    'DP 1.4':   25.92,
    'DP 2.1 UHBR10': 38.69,
    'DP 2.1 UHBR20': 77.37
  };
  function displayLinkGbps(name) { return DISPLAY_LINKS[name] || 0; }

  // ---------- PSU budgeting ----------
  // Sum components + apply efficiency-aware headroom.
  // Returns { total, recommended, headroomPct, transientWatts }.
  // Rule of thumb: aim to operate at 50–70% of PSU rated load (peak efficiency on most curves).
  // GPU transient spikes can exceed average draw 1.5–2× for ~ms. We use 1.7× for "transientWatts".
  function psuBudget(components) {
    var total = 0;
    var transient = 0;
    components.forEach(function (c) {
      total += c.watts || 0;
      // GPUs and CPUs spike; storage / fans don't meaningfully.
      if (c.spike) transient += (c.watts || 0) * 0.7; // additional watts on top of total
      else transient += 0;
    });
    var transientPeak = total + transient;
    // Recommend a PSU sized so that average load is around 60% of rated.
    var recommended = Math.ceil(total / 0.6 / 50) * 50; // round up to nearest 50 W
    var headroomPct = recommended > 0 ? (recommended - total) / recommended * 100 : 0;
    return {
      total: total,
      transientPeak: transientPeak,
      recommended: recommended,
      headroomPct: Math.round(headroomPct)
    };
  }

  // ---------- Storage performance (sanity numbers) ----------
  // Typical sustained sequential read (MB/s):
  var STORAGE_TYPICAL_MBPS = {
    'HDD 7200rpm':   180,
    'SATA SSD':      540,    // SATA-III caps near 600 MB/s; consumer SSDs cluster around 540
    'NVMe Gen3 x4': 3500,
    'NVMe Gen4 x4': 7000,
    'NVMe Gen5 x4':12000
  };
  function storageMBps(kind) { return STORAGE_TYPICAL_MBPS[kind] || 0; }

  // ---------- Cooling: simple thermal headroom model ----------
  // Estimated steady-state CPU temp = ambient + (TDP / cooler_capacity) * 60 (very rough).
  // cooler_capacity is "TDP this cooler dissipates while keeping a chip at +60 K above ambient".
  function thermalEstTemp(ambientC, tdpW, coolerCapacityW) {
    if (coolerCapacityW <= 0) return Infinity;
    return ambientC + (tdpW / coolerCapacityW) * 60;
  }

  // ---------- Generic helpers ----------
  function fmtGB(n) { return (Math.round(n * 10) / 10) + ' GB'; }
  function fmtGBps(n) { return (Math.round(n * 10) / 10) + ' GB/s'; }
  function fmtGbps(n) { return (Math.round(n * 10) / 10) + ' Gbps'; }
  function fmtW(n) { return Math.round(n) + ' W'; }
  function approxEq(a, b, tol) { tol = tol == null ? 0.05 : tol; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  return {
    pcieLaneMBps: pcieLaneMBps,
    pcieBandwidthGBps: pcieBandwidthGBps,
    pcieBandwidthRounded: pcieBandwidthRounded,
    memBandwidthGBps: memBandwidthGBps,
    displayBitsPerSec: displayBitsPerSec,
    displayGbpsWithOverhead: displayGbpsWithOverhead,
    displayLinkGbps: displayLinkGbps,
    DISPLAY_LINKS: DISPLAY_LINKS,
    psuBudget: psuBudget,
    storageMBps: storageMBps,
    STORAGE_TYPICAL_MBPS: STORAGE_TYPICAL_MBPS,
    thermalEstTemp: thermalEstTemp,
    fmtGB: fmtGB, fmtGBps: fmtGBps, fmtGbps: fmtGbps, fmtW: fmtW,
    approxEq: approxEq, clamp: clamp
  };
})();
