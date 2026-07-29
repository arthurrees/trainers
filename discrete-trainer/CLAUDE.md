# Discrete Math Trainer

Self-paced web app for learning discrete math from zero. Built as CSE 260 (MSU) prep — the user is a complete beginner to the subject, so default to **maximum** beginner-friendliness in any new content.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, canvas patterns, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to discrete math.

## Topic-specific things

- **Namespace:** `window.DMT` &nbsp; · &nbsp; **Storage key:** `dmt_state_v2`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Vocabulary policy:** introduce every math symbol the first time it appears. The user has zero prior exposure to discrete math. Glossary in `js/glossary.js` should grow alongside any new symbols.
- **Programming analogies land well**: framing `∀x ∈ list: P(x)` as `list.every(P)`, `∃x ∈ list: P(x)` as `list.some(P)`, sets as `Set`/array, etc. The user codes — these analogies are how things click.

## Topic-specific libraries

- **`DMT.lib.expr`** — propositional-logic parser/evaluator. Accepts both Unicode (`∧ ∨ ¬ → ↔ ⊕`) and ASCII (`& | ! -> <-> xor`) and English words (`and or not implies iff`). Exposes `parse`, `evaluate`, `collectVars`, `format`, `truthTable`, `equivalent`, `valueColumn`, and `usesOnlyVars`. Used by levels 1–2 and bonus level 14.
- **`DMT.lib.sets`** — set operations on arrays: `union`, `intersect`, `difference`, `symDiff`, `equal`, `subset`, `powerSet`, and `format`. Used by level 5.
- **`DMT.lib.graph`** — undirected graph object created with `create()`, plus node/edge mutation, traversals, and property checks. **Undirected only.** Used by bonus level 13.
- **`DMT.lib.canvas`** — small drawing helpers: `pos(canvas, evt)` for hit testing, `hitNode(g, x, y, r)` for graph nodes.

## The 15 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | symbol click-card |
| 1 | Propositional Logic | live truth-table builder for typed expression |
| 2 | Equivalences & Inference | live equivalence comparison |
| 3 | Predicates & Quantifiers | "world" grid where ∀ / ∃ claims evaluate live |
| 4 | Methods of Proof | proof-method skeleton explorer |
| 5 | Sets | live set-operation explorer |
| 6 | Relations & Functions | relation-matrix property explorer |
| 7 | Induction | induction proof stepper |
| 8 | Counting | permutation/combination calculator |
| 9 | Pigeonhole | hole-and-object counter |
| 10 | Discrete Probability | with/without-replacement calculator |
| 11 | Grammars & Derivations | derivation builder |
| 12 | Finite-State Machines | live DFA trace |
| 13 | Bonus: Graphs & Trees | graph builder + BFS/DFS canvas |
| 14 | Bonus: Boolean Algebra | expression simplifier |

## Truth-table convention

Row order is canonical big-endian: for vars `[p, q]` rows go `(F,F), (F,T), (T,F), (T,T)`. `DMT.lib.expr.valueColumn(ast, vars)` returns a string like `'TTFT'` over that order — used by puzzles that check "build an expression with column X".

## Level-content priorities

If you're adding or editing levels:
1. Concept first, notation second. Always show plain-English meaning before the symbol.
2. Worked examples before abstract definitions.
3. Hints should be progressive: hint 3 is *almost* the answer.
4. The hard puzzle should require integrating ideas from earlier in the same level — not just being a bigger easy puzzle.
