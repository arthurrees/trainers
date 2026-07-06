# Hardware Trainer

In-depth interactive trainer for PC hardware. 14 levels, 42 puzzles, covering the builder's-eye view of a desktop PC: the seven major components, how they're balanced, and how the numbers on a spec sheet translate to observable behavior. The user already built and runs the rig that's used as the recurring concrete example throughout (Ryzen 9 3900X / RTX 3070 / B550M Steel Legend / RM850x / H100i Platinum / 4000D Airflow).

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, canvas patterns, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to PC hardware.

## Topic-specific things

- **Namespace:** `window.HWT` &nbsp; · &nbsp; **Storage key:** `hwt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Builder's-eye view, not CS-class view.** The companion is the (planned) `arch-trainer/` which covers the inside of a CPU (binary, two's complement, IEEE 754, caching, pipelining). Don't drift toward those topics here. If a question would be better in arch-trainer, leave it.
- **Tie back to the user's actual rig** where natural — orientation, CPU (3900X is the running example), GPU (3070's 8 GB is what forces 4-bit quants in level 5), PSU (RM850x sizing), cooling (H100i / 4000D Airflow). Don't strip those references when editing.
- **Spec-sheet-first pedagogy.** Each level should leave the reader able to look at one number on a product page and answer (a) what it physically is, (b) what trade-offs go with it, (c) does it matter for their workload. The whole trainer is "decode the marketing."

## Topic-specific library: `HWT.lib.hw`

Pure-function math for puzzles + Play surfaces. Verified by Node smoke test.

| Function | Purpose |
|---|---|
| `pcieLaneMBps(gen)` / `pcieBandwidthGBps(gen, lanes)` / `pcieBandwidthRounded` | PCIe per-lane and link bandwidth (Gen 1–6, x1–x16). Encoding-corrected. |
| `memBandwidthGBps(channels, mtPerSec)` | DDR bandwidth = channels × MT/s × 8 / 1000. |
| `displayBitsPerSec(w, h, hz, bpp)` / `displayGbpsWithOverhead` / `displayLinkGbps(name)` / `DISPLAY_LINKS` | Display bandwidth and connector-version capacities (HDMI/DP). |
| `psuBudget(components)` | Returns `{ total, transientPeak, recommended, headroomPct }`. Transient = +70% on `spike: true` parts. Recommended = ceil(total / 0.6 / 50) × 50. |
| `storageMBps(kind)` / `STORAGE_TYPICAL_MBPS` | Sustained sequential read for HDD / SATA SSD / NVMe Gen 3/4/5. |
| `thermalEstTemp(ambient, tdp, coolerCap)` | Rough steady-state CPU temp = ambient + (TDP / cap) × 60. |
| `fmtGB`, `fmtGBps`, `fmtGbps`, `fmtW`, `approxEq`, `clamp` | Formatting & helpers. |

The `HWT.lib.canvas` helper is identical to the other trainers (pos / scale / unscale).

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | click-card per major component |
| 1 | CPU Anatomy | spec table comparing 4 modern CPUs |
| 2 | Memory & RAM | live bandwidth + latency calculator |
| 3 | PCIe — Lanes, Generations, Bandwidth | gen × lanes calculator with equivalences |
| 4 | Storage — HDD, SATA SSD, NVMe | sustained-throughput bar chart + 100 GB copy time |
| 5 | GPU — VRAM, Bandwidth, Power | VRAM-fits calculator (model size × precision × ctx → does it fit on RTX 3070's 8 GB) |
| 6 | Power Supply (PSU) | live PSU budget — toggle components, see recommended W |
| 7 | Motherboard & Chipset | per-chipset feature table (B550, X570, B650, X670E, Z790, Z890) |
| 8 | Cooling & Thermals | thermal estimator slider |
| 9 | Display Pipeline | resolution × refresh × bpc → bandwidth required, fits-on-link verdict |
| 10 | USB & Peripherals | USB-version picker with real throughput |
| 11 | Networking Hardware | hop-by-hop throughput catalog |
| 12 | Bottlenecks & Balancing | 5 utilization sliders → which is bottleneck |
| 13 | Building & Diagnostics | symptom-to-cause picker |

## Hardware-content priorities

- **Concrete numbers anchor the abstractions.** "PCIe Gen 4 x16 = 31.5 GB/s" beats "very fast." The user reads spec sheets full of these numbers; the trainer should make them readable.
- **Distinguish nameplate from real-world.** USB 3.2 Gen 2 is "10 Gbps" but ~1 GB/s after overhead. PSUs are nameplate-watts but quality matters more. Always cite the realistic number alongside the marketing one.
- **Show the trap.** The most useful pedagogy is the moments where the obvious heuristic fails: bigger PSU isn't always better; more cores isn't always faster; "USB-C" means nothing without the version; HDD-vs-NVMe gap is bigger for random IO than sequential.
- **Use the user's rig as a fixed example.** When something needs a concrete value (transient peak watts, VRAM headroom, thermal margin), plug in 3900X / RTX 3070 / RM850x / H100i numbers. They'll feel familiar.
- **The hard puzzles often combine two ideas across levels** (e.g., L9 hard combines bandwidth math with DSC compression; L12 hard requires reading utilization AND knowing 7B-model bandwidth-bound behavior). Don't make hard puzzles just easier puzzles with bigger numbers.

## Sanity-check verifications

```bash
cd trainers/hardware-trainer
# Library smoke test
node -e "global.window=global; eval(require('fs').readFileSync('js/lib/hw.js','utf8'));
  var hw = global.HWT.lib.hw;
  console.log('Gen3 x16:', hw.pcieBandwidthRounded(3,16), 'GB/s (~15.8)');
  console.log('Gen4 x16:', hw.pcieBandwidthRounded(4,16), 'GB/s (~31.5)');
  console.log('DDR4-3200 dual:', hw.memBandwidthGBps(2,3200), 'GB/s (51.2)');
  console.log('DDR5-6000 dual:', hw.memBandwidthGBps(2,6000), 'GB/s (96.0)');
  console.log('PSU for 3900X+3070+rest 435W avg:', JSON.stringify(hw.psuBudget([
    {name:'CPU',watts:142,spike:true},{name:'GPU',watts:220,spike:true},
    {name:'Mobo+RAM',watts:50},{name:'NVMe',watts:8},{name:'Fans',watts:15}
  ])));"
# Level integrity
node -e "
  var fs = require('fs');
  global.window = global;
  global.document = { /* minimal mocks */ };
  ['js/lib/canvas-utils.js','js/lib/hw.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){
    eval(fs.readFileSync(f,'utf8'));
  });
  fs.readdirSync('js/levels').sort().forEach(function(f){
    eval(fs.readFileSync('js/levels/'+f,'utf8'));
  });
  console.log('Levels:', global.HWT.levels.length, 'Puzzles:',
    global.HWT.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
  global.HWT.levels.forEach(function(l){
    if (l.puzzles.length !== 3) throw new Error('Level '+l.id+' has '+l.puzzles.length+' puzzles');
    l.puzzles.forEach(function(p,i){
      if (!p.hints || p.hints.length !== 3) throw new Error('Level '+l.id+' puzzle '+i+' hints');
    });
  });
  console.log('shape OK: 14 × 3 × 3 = 126 hints');
"
```

The 42 puzzles passed answer-key spot-checks before shipping. The most arithmetically dense ones to redo if you touch math:

- L2.3 (1:1 fabric divider trade-off — both kits same true latency)
- L3.3 (Gen 5 x16 → Gen 5 x8/x8 bifurcation; bandwidth equivalences)
- L9.3 (4K 240 Hz over DP 1.4 with DSC — per-Hz bandwidth math)
- L1.3 (cache speedup — 90/11 = 8.2× memory-layout win)
- L5.2 (13B model precision-fits-on-3070 table)
