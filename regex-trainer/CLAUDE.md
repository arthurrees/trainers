# Regex Trainer

Interactive trainer for regular expressions. 14 levels, 42 puzzles, from literal text through
escaping, character classes, quantifiers, greedy/lazy, anchors, groups, alternation, backreferences,
lookaround, flags, replace, and ReDoS / catastrophic backtracking.

> Cross-trainer rules (file layout, Learn -> Play -> Try shape, naming, loading order, scaffolding)
> live in `../CLAUDE.md`. This file covers only regex-specific guidance.

## Topic-specific things

- **Namespace:** `window.RXT`
- **Storage key:** `rxt_state_v1`
- **Run it:** open `index.html` directly (works on `file://`). State persists in `localStorage`.
- **Audience:** a developer who codes daily but is new to regex. Maximum beginner-friendliness;
  introduce every token on first use. Programming analogies land well.
- **Engine:** every Play and Try surface runs the browser's **native JavaScript RegExp engine**, so
  everything the user types is real and runnable. Behavior is exactly JS regex. Level 13 calls out the
  cross-flavor differences (atomic groups / possessive quantifiers exist in PCRE/Java but NOT JS; Go's
  RE2 is non-backtracking; inline `(?i)` modifiers vs JS trailing flags).

## Library: `RXT.lib.rx` (in `js/lib/rx.js`)

All real matching goes through this. It wraps the native engine plus a tiny instrumented backtracker
used only to illustrate ReDoS in level 13.

| Function | Purpose |
|---|---|
| `build(pattern, flags)` | Native RegExp, throws a friendly Error on bad syntax |
| `matches(pattern, flags, text)` | All matches: `[{index, text, groups:[full,g1,...], named}]`, zero-width safe |
| `test(pattern, flags, text)` | Match anywhere? (g/y stripped, so it is pure) |
| `matchesWhole(pattern, flags, text)` | Match the ENTIRE string? (wraps `^(?:...)$`) |
| `capture(pattern, flags, text)` | First match `{whole, groups, named, index}` or null |
| `replace(pattern, flags, text, repl)` | Native `String.replace` semantics (`$1`, `$&`, `$<name>`) |
| `highlight(pattern, flags, text)` | `{html, count, error}` — escaped HTML with `<mark>` per match |
| `escapeLiteral(s)` | Escape regex metacharacters in `s` |
| `mountTester(container, opts)` | **The standard Play surface** — live pattern/flags/sample tester with highlight + capture panel |
| `patternField(container, opts)` | **The standard puzzle input** — compact pattern (+flag) field, live preview, returns `getValue -> {pattern, flags}` |
| `backtrackSteps(pattern, text)` | `{matched, steps, blown}` — instrumented mini-engine (literals, `.`, classes, groups, greedy `*+?` only). Level 13 only. |

### check() design rule
Grade puzzles by **behavior**, never string equality. Run the user's `{pattern, flags}` through the
helpers against accept/reject strings. Accept mathematically-equivalent answers (`\d` == `[0-9]`,
lazy `".*?"` == negated-class `"[^"]*"`). Wrap rx calls in try/catch.

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | Live tester seeded with literal + `\d+` |
| 1 | Literal Characters & Escaping | Tester: escaped dot vs wildcard |
| 2 | The Dot & Character Classes | Tester: classes, ranges, negation |
| 3 | Shorthand Classes | Tester: `\w+` token runs |
| 4 | Quantifiers | Tester: `\d{2,4}`, `colou?r` |
| 5 | Greedy vs Lazy | Tester: `<.*>` vs `<.*?>` |
| 6 | Anchors & Boundaries | Tester: `\bcat\b`, multiline `^` |
| 7 | Groups & Capturing | Tester with live capture-group panel |
| 8 | Alternation | Tester: `\b(?:cat|dog|bird)\b` |
| 9 | Backreferences | Tester: `(\w)\1` doubled chars |
| 10 | Lookahead & Lookbehind | Tester: `\d+(?=px)`, `(?<=\$)\d+` |
| 11 | Flags & Modes | Tester: toggle g/i/m/s, watch matches change |
| 12 | Replace & Capture References | Custom find/replace sandbox (live `$1` output) |
| 13 | Performance & Catastrophic Backtracking | Custom step-count visualizer via `backtrackSteps` |

## Verification

Run from `trainers/regex-trainer`:

```bash
node -e "
  var fs = require('fs');
  global.window = global;
  global.localStorage = { getItem:function(){return null;}, setItem:function(){}, removeItem:function(){} };
  ['js/lib/rx.js','js/lib/canvas-utils.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){eval(fs.readFileSync(f,'utf8'));});
  fs.readdirSync('js/levels').sort().forEach(function(f){eval(fs.readFileSync('js/levels/'+f,'utf8'));});
  console.log('Levels:', RXT.levels.length, 'Puzzles:', RXT.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
"
```

Expected: `Levels: 14 Puzzles: 42`. Then spot-check answer keys per level (each puzzle's `check()` is
pure, so call it with a canonical correct answer and a wrong answer). Because every `check()` grades by
behavior (running the user's pattern through the `rx` helpers), the regression test that matters is:
for each puzzle, the canonical answer and its known equivalents are accepted, and the common
too-loose answers (a bare wildcard `.`, an over-wide class, a naive un-grouped alternation) are
rejected.
