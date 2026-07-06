# Trainers — Shared Framework

> **Public GitHub repo (portfolio).** This whole `trainers/` folder is published as a single
> public portfolio repo. `README.md` is the public entry point; `project_list.md` is the roadmap.

The `trainers/` folder holds a growing family of self-paced, browser-based trainers for technical fundamentals. Each trainer is its own independent app, but they all follow the same shape (Learn → Play → Try) and the same file/naming conventions documented here.

**Roadmap & status of all trainers:** see `project_list.md`.

This file is the single source of truth for cross-trainer rules. Per-trainer `CLAUDE.md` files cover topic-specific things only and link back here.

---

## Architecture decision: "fork the shell"

Each trainer is a fully independent, self-contained vanilla HTML/JS app. There is **no `_shared/` directory**, no bundler, no build step, no ES modules. Each trainer has its own complete copy of the shell files (`main.js`, `storage.js`, `hints.js`, `styles.css`).

**Why:** topic-specific libraries (`DMT.lib.expr` for logic, `NT.lib.ip` for networking, `AIT.lib.mat` for ML) don't generalize. The shell is small (~200 lines) and very stable. Sharing it would force relative paths, fragile coupling, and would constrain any future trainer that wants a different layout.

**Cost:** a bug fix in `main.js` has to be repeated across every trainer. The shell rarely changes — accept the duplication, propagate fixes manually.

**Do not refactor this into a shared module unless you have a real, recurring drift problem.** The independence is load-bearing.

---

## The Learn → Play → Try shape (sacrosanct)

Every level has three sections, in this exact order:

1. **Learn** — long-form HTML lesson with formulas, worked examples, callouts. Can be long; that's fine.
2. **Play** — interactive sandbox. **No goal here.** Click around, observe, mess with sliders. Builds intuition before the puzzles.
3. **Try** — exactly **3 puzzles**, difficulties `easy` / `medium` / `hard`, in that order. Each puzzle has exactly **3 progressive hints**, last one nearly giving the answer.

Don't break this rhythm. The consistent shape *is* the pedagogy — it teaches users what to expect and lets them self-pace.

---

## File layout (every trainer)

```
<trainer-name>/
  CLAUDE.md             — topic-specific notes; references this parent
  index.html            — script tags, page chrome, loading order
  styles.css            — copy of discrete-trainer's; do not diverge cosmetically
  js/
    main.js             — boot, nav, render. Same shape across trainers, namespace differs.
    storage.js          — localStorage wrapper, also defines registerLevel + levels[]
    hints.js            — progressive hint UI
    glossary.js         — topic-specific glossary table + render fn
    lib/                — topic-specific utilities (expr-parser.js, ip.js, mat.js, ...)
    levels/             — 00-orientation.js through NN-<name>.js
```

---

## Naming conventions

| Trainer | Global namespace | Storage key |
|---|---|---|
| `discrete-trainer/` | `window.DMT` | `dmt_state_v1` |
| `networking-trainer/` | `window.NT` | `nt_state_v1` |
| `ai-trainer/` | `window.AIT` | `ait_state_v1` |

For a new trainer, pick a 2–4 letter uppercase namespace and matching lowercase storage key. **Always include a version suffix** (`_v1`) so we can bump it on shape changes without migration.

---

## Loading order in `index.html`

This order is required (each layer depends on the previous one's globals):

1. `js/lib/*.js` — pure utilities (no level dependency)
2. `js/storage.js` — defines `XXX.storage`, `XXX.levels = []`, `XXX.registerLevel`
3. `js/glossary.js` — defines `XXX.glossary` and `XXX.glossaryRender`
4. `js/hints.js` — defines `XXX.hints`
5. `js/levels/00..NN-*.js` — each calls `XXX.registerLevel({...})`
6. `js/main.js` — boots last, reads `XXX.levels`, renders the UI

---

## Level object shape

```js
XXX.registerLevel({
  id: 0,                            // integer; nav sorts by this
  title: 'Orientation',
  whyItMatters: 'one-sentence motivation that appears under the title',
  glossary: ['key1', 'key2'],       // each must exist in XXX.glossary
  learn: '<HTML string>',           // long-form lesson
  mountPlay: function (container) {
    // optional. Build interactive sandbox into container.
    // Called once per level visit; clean up via container.innerHTML = '' if mounted before.
  },
  puzzles: [
    {
      difficulty: 'easy',           // or 'medium', 'hard' — must be in this order
      prompt: '<HTML string>',
      mountInput: function (container) {
        // Build input UI; return a getValue() function.
        return function () { return container.querySelector('input').value; };
      },
      check: function (value) {
        // Return { correct: bool, feedback: 'string' (HTML allowed) }.
        return { correct: true, feedback: 'Right. ...' };
      },
      hints: ['hint 1', 'hint 2', 'hint 3']  // exactly 3, progressively more revealing
    },
    // ... medium puzzle ...
    // ... hard puzzle ...
  ]
});
```

---

## Canvas diagram patterns

Several Play surfaces use HTML5 canvas for visualizations. The patterns that have proven useful:

- **Function plotter** — sample `f(x)` and `f'(x)` across a range; draw with axes (ai-trainer L2, L6).
- **Live computational visualizer** — sliders update parameters; render the result as a labeled diagram (ai-trainer L3 regression line, L4 decision boundary, L5 GD trajectory, L9 optimizer race).
- **Network/architecture diagram** — nodes + weighted edges, color-coded by sign or magnitude, values inside nodes (ai-trainer L7 forward pass, L8 backprop with red backward arrows, L13 transformer block).
- **Sequence/ladder diagram** — two vertical lifelines, time flowing down, color-coded arrows for each message (networking-trainer L7 TCP, L11 TLS).
- **Topology diagram** — devices laid out spatially, animated arrows for current step's traffic (networking-trainer L4 ARP).
- **Tree/hierarchy diagram** — boxes connected by edges, current node highlighted, visited nodes dimmed (networking-trainer L9 DNS).
- **Categorized grid** — items grouped by category, color-coded by group (networking-trainer L10 HTTP status codes — uses HTML/CSS, not canvas).
- **Log-scale bar chart** — for comparisons spanning many orders of magnitude (ai-trainer L16 training cost timeline).

When adding a canvas visualization, use a small palette derived from the CSS variables in `styles.css` (`#7ab7ff` accent, `#a78bfa` accent-2, `#4ade80` good, `#fbbf24` warn, `#f87171` bad, `#9aa3b2` text-dim, `#3a4256` border, `#0a0c11` canvas bg). Helper utilities live in each trainer's `js/lib/canvas-utils.js` (typically just `pos(canvas, evt)` for hit testing and `scale`/`unscale` for value↔pixel mapping).

---

## Style conventions

- **Plain ES5-ish JS** in level files: `var`, function expressions, no `let` / `const` / arrow functions / destructuring / template literals. Libraries follow the same style. Keeps everything readable for beginners and avoids transpiler nostalgia.
- **No external dependencies, no fonts, no images.** Emojis are OK (render natively on Win11). Canvas is fine.
- **Beginner-first writing.** Introduce every new term and acronym on first use. Heavy use of `<div class="example">` and `<div class="callout">` for highlighting.
- **Programming analogies welcome** when appropriate (the user is a developer).
- **Topic-specific tone**: the `whyItMatters` line should explain *why this matters in CS / engineering practice*, not just "this is a chapter in the textbook".

---

## Storage shape

Single `localStorage` key per trainer (`<ns>_state_v1`):

```
{
  solved: { [levelId]: { [puzzleIdx]: true } },
  notes:  { [levelId]: 'user notes string' },
  currentLevel: number
}
```

Bump the version (`_v2`, `_v3`) if you change the shape. **Don't migrate** — just reset. Progress loss on a schema change is acceptable.

---

## Scaffolding a new trainer

When the user asks for a new trainer:

1. **Decide namespace + storage key.** 2–4 uppercase letters + matching `xxx_state_v1`.
2. **Create the folder structure**:
   ```
   trainers/<name>-trainer/
     CLAUDE.md
     index.html
     styles.css                ← copy from discrete-trainer
     js/
       main.js                 ← copy + replace `DMT` with your namespace globally
       storage.js              ← copy + replace `DMT` and `dmt_state_v1`
       hints.js                ← copy + replace `DMT`
       glossary.js             ← topic-specific table; replace `DMT` and the global object
       lib/                    ← create your topic-specific utilities here
       levels/                 ← start with 00-orientation.js
   ```
3. **Update `index.html`** with the new title, your namespace's `<script>` tags, and any topic-specific lib script tags before `storage.js`.
4. **Write a Level 0 — Orientation** as the entry point.
5. **Add to `project_list.md`** with status (🛠️ in progress, ✅ shipped).
6. **Write the per-trainer CLAUDE.md** — short, just topic-specific notes + a link to this file.
7. **Smoke-test via Node**: parse all level files, verify shape (3 puzzles each, 3 hints each), spot-check answer keys.

The user's typical pattern: brainstorm → propose lineup → "plow through and ship all of it" → review. Default to writing the full lineup unless they ask for a subset.

---

## Verification before shipping

For each trainer (or after substantial changes):

```bash
cd trainers/<name>-trainer
node -e "
  var fs = require('fs');
  global.window = global;
  global.document = { createElement: function(){return{appendChild:function(){},addEventListener:function(){},classList:{add:function(){},remove:function(){}},querySelectorAll:function(){return[];},style:{},insertBefore:function(){},getContext:function(){return{fillRect:function(){},fillText:function(){},beginPath:function(){},moveTo:function(){},lineTo:function(){},stroke:function(){},fill:function(){},closePath:function(){},strokeRect:function(){},arc:function(){},setLineDash:function(){},measureText:function(){return{width:50};},clearRect:function(){},fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',textBaseline:''};}};},getElementById:function(){return{innerHTML:'',value:'',addEventListener:function(){},textContent:''};}};
  ['js/lib/<your-libs>.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){eval(fs.readFileSync(f,'utf8'));});
  fs.readdirSync('js/levels').sort().forEach(function(f){eval(fs.readFileSync('js/levels/'+f,'utf8'));});
  console.log('Levels: '+global.<NS>.levels.length+' Puzzles: '+global.<NS>.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
"
```

Then spot-check 3–5 puzzle answer keys per level. If a level has a Play surface, also try mounting it (use a richer `document` mock that supports `getBoundingClientRect`, `getContext`, etc.).

---

## Post-ship accuracy audit (mandatory)

After a trainer passes smoke tests and is declared "shipped", **immediately run a full factual accuracy audit** before moving on. LLM-generated educational content is high-risk for hallucinated numbers, outdated dates, reversed logic, and plausible-but-wrong technical claims. The audit that caught 9 errors across the first 6 trainers proved this is not optional.

### What to check

For every level, read the Learn HTML, puzzle prompts, feedback strings, and hints. Flag anything that falls into these categories:

1. **Factually wrong** (critical) — reversed logic ("even cycles break bipartiteness" when it's odd), wrong computed numbers (backprop post-step values that don't reproduce), incorrect classifications.
2. **Wrong dates or specs** (moderate) — technology release years, protocol speeds, standard versions. These are easy to hallucinate and hard for a learner to catch.
3. **Overstated or understated benchmarks** (moderate) — hash rates, throughput numbers, cost figures. If a number is used in puzzle math downstream, getting it wrong cascades.
4. **Misattributions** (minor) — crediting the wrong entity for something (e.g., DigiCert for 90-day certs when that's Let's Encrypt).
5. **Reject-feedback that rejects a correct answer** (minor but frustrating) — mathematically equivalent answers marked wrong (e.g., "beam search k=1" = greedy).

### How to report

Rank findings by priority (critical → moderate → minor). For each, give the file path, line number(s), what's wrong, and what the correct value is. Do NOT silently fix — list them first so the user can review, then fix on approval (or if told "fix all", fix all at once).

### When to skip

If the trainer is purely structural (orientation-only, no technical claims) or if the user explicitly says to skip the audit, you can skip it. Otherwise, always run it.

---

## When NOT to use this framework

- **Real-time multiplayer / server-side state** — these trainers are 100% client-side, `localStorage` only.
- **Mobile-first apps** — the layout is desktop-optimized (sidebar with glossary + notes). It works on mobile but isn't a great experience.
- **Topics where the visualization needs WebGL or heavy graphics** — canvas is plenty for the diagrams we've built; if you need 3D or shader programming, this isn't the right shell.

For the kinds of "how does X work" topics that fill `project_list.md`, this framework is exactly right.
