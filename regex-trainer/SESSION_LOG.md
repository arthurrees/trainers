# Regex Trainer — Session Log

## 2026-06-28 — built and shipped end to end

New trainer in the `trainers/` family. Subject: **regular expressions**. It was the top unbuilt
candidate on `trainers/project_list.md` (visual, rule-based, beginner-hostile, lots of Play surface),
and it is distinct from all 11 existing trainers. Built as a surprise gift project.

**Namespace** `window.RXT` · **storage key** `rxt_state_v1` · 14 levels (0-13), 42 puzzles.

### Architecture
- Forked the discrete-trainer shell verbatim (storage/hints/main/styles), renamed DMT → RXT.
- New topic library `js/lib/rx.js` wraps the **native browser RegExp engine** so everything the user
  types is real and runnable. Public API: `build, matches, test, matchesWhole, capture, replace,
  highlight, escapeLiteral, mountTester, patternField, backtrackSteps`.
  - `mountTester` is the standard Play surface (live pattern + flags + sample, match highlight,
    capture-group readout). `patternField` is the standard puzzle input (returns `{pattern, flags}`).
  - `backtrackSteps` is a small instrumented backtracker (subset only) used to SHOW ReDoS step
    explosion in level 13. Verified exponential: `(a+)+b` on 14 a's = 65,534 steps vs `a+b` = 21.
- `check()` functions grade by BEHAVIOR (run the pattern through rx helpers vs accept/reject strings),
  never by string equality, so equivalent answers (`\d` == `[0-9]`, lazy == negated class) are accepted.

### Levels
0 Orientation · 1 Literals/Escaping · 2 Dot & Classes · 3 Shorthand (`\d\w\s`) · 4 Quantifiers ·
5 Greedy vs Lazy · 6 Anchors & Boundaries · 7 Groups & Capturing · 8 Alternation ·
9 Backreferences · 10 Lookahead/Lookbehind · 11 Flags & Modes · 12 Replace & Capture Refs ·
13 Performance & Catastrophic Backtracking.

### How it was built
- Wrote shell + `rx.js` + level 0 (orientation) by hand, unit-tested `rx.js` in Node.
- Fanned out levels 1-13 with a Workflow (one author agent per level, each self-tested its answer keys
  in Node against the real `rx` library, then an adversarial auditor checked each level). First run
  died on a transient network outage; resumed and completed (13/13 authored, 13/13 self-test pass).
- Audit found 1 critical + 11 moderate + minor issues. Fixed all critical + moderate by hand:
  - L1: "12 metacharacters" → 14 (14 are listed); tightened all 3 too-loose checks.
  - L2: widened reject sets (easy/medium/hard were false-accepting `[aeiouy]`, `[0-9a-fh]`, `[A-Za-z_0]`).
  - L4 hard: reject `.{1,3}%` (must be digits).
  - L6: `escapeHtml` → `RXT.escapeHtml` (load crash in the Node harness); medium puzzle now rejects
    `^.{3}$` (must be digits) and the success feedback no longer claims the user used `^`/`$`.
  - L8 hard: corrected a false prompt claim (`^yes|no$` leaks on `yesterday`, not `say no please`).
  - L11 hard: tightened the dotAll check so `.*` no longer passes (match must be the `<a>...</a>` span).
  - L13 medium: stopped mislabeling lazy `.*?` as "greedy" in feedback.
  - Purged em dashes from user-facing copy I authored (left verbatim-shell strings + `// Level N — Title`
    comment headers to match the other 11 trainers).

### Verification (all green)
- Load test: 14 levels, 42 puzzles, structure valid (3 puzzles × 3 hints, ordered difficulties,
  glossary keys all resolve).
- Behavior regression: 201 assertions — every canonical answer accepted, equivalents accepted, every
  audit false-accept now rejected, generic wrong answers rejected.
- DOM-mock mount test: 98 assertions — every `mountPlay` and `mountInput`/`getValue` runs without
  throwing.

### Status
Shipped. Open `index.html` directly (works on `file://`). Added to `project_list.md` and
`.Admin/overview.md`. Scaffolding (`_BUILD_SPEC.md`, temp Node tests) removed.
