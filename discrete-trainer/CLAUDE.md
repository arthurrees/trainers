# Discrete Math Trainer

Self-paced web app for learning discrete math from zero. Built as CSE 260 (MSU) prep — the user is a complete beginner to the subject, so default to **maximum** beginner-friendliness in any new content.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, canvas patterns, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to discrete math.

## Topic-specific things

- **Namespace:** `window.DMT` &nbsp; · &nbsp; **Storage key:** `dmt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Vocabulary policy:** introduce every math symbol the first time it appears. The user has zero prior exposure to discrete math. Glossary in `js/glossary.js` should grow alongside any new symbols.
- **Programming analogies land well**: framing `∀x ∈ list: P(x)` as `list.every(P)`, `∃x ∈ list: P(x)` as `list.some(P)`, sets as `Set`/array, etc. The user codes — these analogies are how things click.

## Topic-specific libraries

- **`DMT.lib.expr`** — propositional-logic parser/evaluator. Accepts both Unicode (`∧ ∨ ¬ → ↔ ⊕`) and ASCII (`& | ! -> <-> xor`) and English words (`and or not implies iff`). Exposes `parse(s)`, `evaluate(ast, env)`, `valueColumn(ast, vars)`, `vars(ast)`. Used by levels 1–2.
- **`DMT.lib.sets`** — set operations: `union`, `intersection`, `difference`, `symmetric`, `cartesian`, `powerset`, `eq`. Used by level 4.
- **`DMT.lib.graph`** — undirected graph type: `Graph(n)`, `addEdge`, `removeEdge`, `degree`, `bfs`, `dfs`, `connectedComponents`. **Undirected only.** If you need directed graphs add a separate type rather than extending this. Used by level 9.
- **`DMT.lib.canvas`** — small drawing helpers: `pos(canvas, evt)` for hit testing, `hitNode(g, x, y, r)` for graph nodes.

## The 11 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | symbol click-card |
| 1 | Propositional Logic | live truth-table builder for typed expression |
| 2 | Equivalences | rewrite-rule game (apply rule → simplify) |
| 3 | Predicates & Quantifiers | "world" grid where ∀ / ∃ claims evaluate live |
| 4 | Sets | Venn-diagram interactive |
| 5 | Relations & Functions | drag mappings between two columns |
| 6 | Induction | induction-step builder |
| 7 | Counting | choose / permute calculator with worked example |
| 8 | Pigeonhole | hole-and-pigeon counter |
| 9 | Graphs | drag-to-build graph + BFS/DFS animation (canvas) |
| 10 | Trees & Boolean Algebra | expression-tree visualizer |

## Cross-level integration (one gotcha)

Level 9's hard puzzle reads the live graph from its own Play surface. The Play surface writes the current graph to `window._dmtPlayGraph` inside its `render()` on every redraw; the puzzle's `mountInput` returns a `getValue` that reads that global. If you build a similar "puzzle reads the play surface" pattern elsewhere, copy this approach — **don't monkey-patch the library**.

## Truth-table convention

Row order is canonical big-endian: for vars `[p, q]` rows go `(F,F), (F,T), (T,F), (T,T)`. `DMT.lib.expr.valueColumn(ast, vars)` returns a string like `'TTFT'` over that order — used by puzzles that check "build an expression with column X".

## Level-content priorities

If you're adding or editing levels:
1. Concept first, notation second. Always show plain-English meaning before the symbol.
2. Worked examples before abstract definitions.
3. Hints should be progressive: hint 3 is *almost* the answer.
4. The hard puzzle should require integrating ideas from earlier in the same level — not just being a bigger easy puzzle.
