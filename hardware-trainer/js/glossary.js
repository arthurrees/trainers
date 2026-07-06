// glossary.js — shared glossary, rendered in sidebar
window.HWT = window.HWT || {};

HWT.glossary = {
  // Orientation
  'PC':       { name: 'personal computer', def: 'Catch-all for desktop/laptop/workstation. In this trainer "PC" usually means a desktop tower you can build yourself.' },
  'tower':    { name: 'tower / chassis / case', def: 'The metal box that holds everything. Sizes: full tower, mid-tower (most common), micro-ATX, ITX.' },
  'OEM':      { name: 'OEM (original equipment manufacturer)', def: 'A pre-built PC sold by a brand (Dell, HP, etc.). Often uses non-standard parts and is hard to upgrade.' },
  'spec sheet': { name: 'spec sheet', def: 'The list of numbers a product is sold by. Most of this trainer is teaching you to read one.' },

  // CPU
  'CPU':      { name: 'central processing unit', def: 'The "brain" — runs the OS and your programs. Made of cores. Modern desktop CPUs: 6–16 cores typically.' },
  'core':     { name: 'core', def: 'An independent execution unit on the CPU. A 12-core chip can do 12 things truly in parallel.' },
  'thread':   { name: 'thread (hardware)', def: 'An execution stream the CPU presents to the OS. With SMT/Hyper-Threading, one core exposes 2 threads.' },
  'SMT':      { name: 'simultaneous multithreading', def: 'Intel calls it Hyper-Threading. Lets a core run two instruction streams at once when one stalls — ~30% throughput gain typically.' },
  'IPC':      { name: 'instructions per clock', def: 'How much work a core gets done per cycle. Higher IPC = faster at the same clock speed. The big architectural number.' },
  'clock':    { name: 'clock speed (GHz)', def: 'Cycles per second of the CPU. 4 GHz = 4 billion cycles/sec. Half the performance story; IPC is the other half.' },
  'TDP':      { name: 'thermal design power (W)', def: 'Roughly: how much heat the cooler must dissipate, in watts. Often confused with power draw — they\'re close, but not identical (especially under boost).' },
  'cache':    { name: 'CPU cache', def: 'Tiny, very fast SRAM right next to the cores. L1 is fastest+smallest (per core), L2 bigger, L3 shared across cores. Misses cost 100s of cycles.' },
  'CCD':      { name: 'core complex die', def: 'On AMD Ryzen, a chiplet with up to 8 cores + L3. Multi-CCD chips (e.g. 3900X) split cores across 2 CCDs — cross-CCD latency matters for some workloads.' },
  'IMC':      { name: 'integrated memory controller', def: 'The CPU\'s built-in connection to RAM. Determines max supported DDR speed and channel count.' },
  'iGPU':     { name: 'integrated GPU', def: 'A small GPU built into the CPU. Useful for displays without a discrete card. Ryzen "X" chips like 3900X have NO iGPU; "G" chips do.' },

  // Memory
  'RAM':      { name: 'random-access memory', def: 'Main memory. Fast, volatile (loses contents on power-off), much smaller than storage. Modern desktops: 16–64 GB.' },
  'DRAM':     { name: 'DRAM', def: 'Dynamic RAM — uses tiny capacitors that need refreshing thousands of times per second. The kind in your DIMMs.' },
  'DIMM':     { name: 'dual in-line memory module', def: 'The physical RAM stick. Modern desktops use DDR4 or DDR5 DIMMs.' },
  'DDR':      { name: 'double data rate', def: 'Transfers data on both rising and falling clock edges. DDR5-6000 = 6000 MT/s = 3000 MHz actual clock × 2.' },
  'channel':  { name: 'memory channel', def: 'A 64-bit-wide path between CPU and RAM. Dual-channel doubles bandwidth. Most consumer boards = 2 channels; HEDT/server = 4 or 8.' },
  'CAS':      { name: 'CAS latency (CL)', def: 'Cycles between issuing a column address and the data showing up. Lower = better. Latency in ns = CL × 2 / MT-per-second × 1000.' },
  'XMP':      { name: 'XMP / DOCP / EXPO', def: 'A profile stored on the DIMM that the BIOS reads to overclock RAM to its rated speed. Without enabling it, fast RAM runs at JEDEC defaults.' },

  // PCIe
  'PCIe':     { name: 'PCI Express', def: 'The high-speed serial bus connecting CPU/chipset to GPUs, NVMe, capture cards. Defined by generation (1–6) and lane count (x1, x4, x8, x16).' },
  'lane':     { name: 'PCIe lane', def: 'One full-duplex serial pair. Bandwidth scales linearly: x4 has 4× a lane, x16 has 16×.' },
  'bifurcation': { name: 'PCIe bifurcation', def: 'Splitting one PCIe slot\'s lanes into multiple smaller links — e.g. x16 → x8/x8 or x4/x4/x4/x4. Needed for some multi-NVMe cards.' },

  // Storage
  'HDD':      { name: 'hard disk drive', def: 'Spinning magnetic platters. Cheap per GB, slow (180 MB/s seq, ~5 ms random seek). Bulk storage / archive only in 2026.' },
  'SSD':      { name: 'solid-state drive', def: 'NAND flash + controller. Two flavors physically: SATA (cabled) and NVMe (M.2 slot, PCIe).' },
  'NVMe':     { name: 'NVMe', def: 'Non-Volatile Memory Express — the protocol for PCIe-attached SSDs. Designed for parallelism (64K queues × 64K commands).' },
  'M.2':      { name: 'M.2 slot', def: 'A small physical slot on the motherboard that accepts NVMe (PCIe x4) or SATA SSD sticks. Watch for shared lanes with PCIe slots.' },
  'TLC':      { name: 'TLC NAND', def: 'Triple-level cell — 3 bits per cell. Common on consumer SSDs. Endurance: hundreds to a couple thousand P/E cycles.' },

  // GPU
  'GPU':      { name: 'graphics processing unit', def: 'Massively parallel processor. Originally for graphics; now does ML, video encode, physics, mining.' },
  'VRAM':     { name: 'video RAM', def: 'GPU\'s on-board memory (GDDR6/6X/7 or HBM). Holds textures, framebuffers, model weights. Once full, perf cliffs hard.' },
  'CUDA':     { name: 'CUDA cores', def: 'NVIDIA\'s name for the GPU\'s ALU lanes. RTX 3070 has 5,888. Don\'t compare CUDA-core counts across architectures.' },
  'TGP':      { name: 'TGP / TBP', def: 'Total graphics/board power — what the whole card draws under load. The RTX 3070 FE is 220 W TGP.' },
  '12VHPWR':  { name: '12VHPWR connector', def: 'The 16-pin GPU power connector introduced with RTX 30/40. Carries up to 600 W. Notorious early-revision melting issues if not seated fully.' },

  // PSU
  'PSU':      { name: 'power supply unit', def: 'Converts wall AC to the DC rails (3.3 V / 5 V / 12 V) the PC uses. The single most underrated component.' },
  'rail':     { name: 'rail', def: 'A specific voltage output line. Modern PSUs are essentially "single 12 V rail" — the 12 V rail powers CPU + GPU.' },
  '80 PLUS':  { name: '80 PLUS rating', def: 'Efficiency tier — Bronze, Gold, Platinum, Titanium. Higher = less waste heat, but main upside is build quality, not the 2–4% efficiency.' },
  'modular':  { name: 'modular PSU', def: 'Cables detach from the PSU. Lets you only plug in what you need. "Semi-modular" = main cables fixed, peripherals modular.' },
  'transient': { name: 'transient spike', def: 'A short power surge (1–10 ms). Modern GPUs spike to 1.5–2× their average draw. A weak PSU shuts down on these even though it "should" handle the load.' },

  // Motherboard
  'mobo':     { name: 'motherboard', def: 'The PCB everything plugs into. Houses the CPU socket, RAM slots, PCIe slots, M.2 slots, chipset, VRMs, I/O ports.' },
  'socket':   { name: 'CPU socket', def: 'The physical interface for the CPU. AM4 (Ryzen 1000–5000), AM5 (Ryzen 7000+), LGA1700 (Intel 12–14th gen).' },
  'chipset':  { name: 'chipset', def: 'A second chip on the motherboard that adds I/O the CPU doesn\'t directly provide (extra USB, extra SATA, extra PCIe lanes via DMI/uplink to CPU).' },
  'VRM':      { name: 'voltage regulator module', def: 'Multi-phase circuit on the mobo that converts 12 V from the PSU down to the ~1 V the CPU runs on. More phases = stabler under heavy load.' },
  'BIOS':     { name: 'BIOS / UEFI', def: 'The firmware that runs before the OS — initializes hardware, picks a boot drive. UEFI is the modern replacement for legacy BIOS.' },
  'POST':     { name: 'POST', def: 'Power-On Self-Test — the BIOS\'s startup checks. Beep codes / debug LEDs report failures.' },
  'DMI':      { name: 'DMI / chipset uplink', def: 'The link between CPU and chipset. Effectively a fixed-width PCIe link (e.g. DMI 4.0 x8 = ~16 GB/s). All chipset I/O competes for this pipe.' },

  // Cooling
  'air cooler': { name: 'air cooler', def: 'Heatsink + fan(s) on the CPU. Quiet, reliable, no liquid. Top-end: Noctua NH-D15.' },
  'AIO':      { name: 'AIO (all-in-one) liquid cooler', def: 'Sealed pump+radiator+fans loop pre-filled with coolant. The H100i RGB Platinum is a 240mm AIO.' },
  'TIM':      { name: 'thermal interface material', def: 'The paste between CPU IHS and cooler. Fills micro air gaps. Pump-out and dryout matter over years.' },
  'fan curve': { name: 'fan curve', def: 'A mapping from temperature to fan RPM, set in BIOS or software. Lets you tune noise vs cooling.' },

  // Display
  'DP':       { name: 'DisplayPort', def: 'The PC-native display connector. Higher bandwidth than HDMI of the same era; royalty-free.' },
  'HDMI':     { name: 'HDMI', def: 'Consumer-electronics display connector. 2.0 / 2.1 are the relevant modern versions.' },
  'refresh rate': { name: 'refresh rate (Hz)', def: 'How many times per second the monitor redraws. 60, 144, 240, 360 Hz are common. Higher = smoother motion.' },
  'bpc':      { name: 'bits per channel (bpc)', def: '8-bit = 16.7M colors; 10-bit = 1.07B. HDR generally needs 10-bit. Total bpp = 3 × bpc (RGB).' },
  'DSC':      { name: 'display stream compression', def: 'Visually-lossless 2:1–3:1 compression in DP/HDMI. How modern monitors hit 4K@240Hz HDR over a single cable.' },

  // USB / peripherals
  'USB':      { name: 'USB', def: 'Universal Serial Bus. Generations: 2.0 (480 Mbps), 3.0/3.1 Gen 1 (5 Gbps), 3.1 Gen 2 (10 Gbps), 3.2 Gen 2x2 (20 Gbps), USB4 (40 Gbps).' },
  'TB':       { name: 'Thunderbolt', def: 'Intel/Apple high-speed link over USB-C. TB3/TB4 = 40 Gbps. Carries PCIe + DP. Now merged with USB4 standard.' },

  // Networking hardware
  'Ethernet': { name: 'Ethernet', def: 'Wired LAN over twisted pair (Cat5e/6/6a). Speeds: 100 Mbps, 1 GbE, 2.5 GbE, 5 GbE, 10 GbE.' },
  'Wi-Fi':    { name: 'Wi-Fi', def: 'Wireless LAN. Recent generations: Wi-Fi 5 (ac, 5GHz), Wi-Fi 6 (ax, OFDMA), Wi-Fi 6E (+6 GHz band), Wi-Fi 7 (be, 320 MHz, MLO).' },
  'NIC':      { name: 'network interface card', def: 'The Ethernet/Wi-Fi adapter. Modern desktops: NIC built into the mobo.' },
  'PHY':      { name: 'PHY', def: 'The physical-layer chip — converts logical bits to electrical signals on the wire (or RF for Wi-Fi).' },
  'MAC':      { name: 'MAC', def: 'Media Access Control sub-layer. Handles framing and the unique 48-bit hardware address.' },

  // Bottlenecks / diagnostics
  'bottleneck': { name: 'bottleneck', def: 'The slowest component that\'s capping the whole system. In games it\'s often GPU; in compiles it\'s often CPU; in big-data work it\'s storage or RAM.' },
  'utilization': { name: 'utilization (%)', def: 'How busy a component is. The bottleneck is usually the one pegged at 99–100% while others have headroom.' },
  'beep code': { name: 'beep code', def: 'A pattern of beeps at POST that encodes a fault (RAM, GPU, CPU). Vendor-specific: AMI, Award, Phoenix differ.' },
  'debug LED': { name: 'debug LED / Q-LED', def: 'Dedicated LEDs (often labeled CPU / DRAM / VGA / BOOT) on modern boards. Stays lit on whichever stage failed.' }
};

HWT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = HWT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
HWT.escapeHtml = escapeHtml;
