# Git Trainer

Interactive trainer for Git internals and workflows. 14 levels, 42 puzzles, covering the object model, three trees, refs, commits, merging, rebase, detached HEAD, remotes, reflog, cherry-pick, .gitignore, stash, and advanced ops.

> Cross-trainer rules live in `../CLAUDE.md`. This file covers only Git-specific guidance.

## Topic-specific things

- **Namespace:** `window.GT`
- **Storage key:** `gt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Audience:** a developer who uses git daily but doesn't understand the model underneath — knows add/commit/push, panics at rebase/detached HEAD.
- **Pedagogy:** model-first, then commands make sense. Every level anchors commands to the underlying object-store / ref machinery.

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | Myth-buster explorer |
| 1 | The Object Model | Clickable object graph (blobs, trees, commits) |
| 2 | The Three Trees | Working dir / index / HEAD state visualizer |
| 3 | Refs & HEAD | Branch pointer simulator |
| 4 | Commits & the DAG | Clickable commit graph with ancestor highlighting |
| 5 | Merging | Fast-forward vs 3-way merge animator |
| 6 | Rebase | Rebase before/after visualizer (new SHA bubbles) |
| 7 | Detached HEAD | HEAD state machine (attached / detached / commit / rescue) |
| 8 | Remote Tracking Refs | Fetch/push/pull simulator (local + remote side-by-side) |
| 9 | Reflog | Reflog timeline with clickable restore |
| 10 | Cherry-pick | Cherry-pick branch visualizer |
| 11 | .gitignore | Live pattern matcher with example pairs |
| 12 | Stash | Stash stack visualizer (push/pop/apply/drop) |
| 13 | Advanced Ops | git bisect binary search game |

## Library: `GT.lib.git`

| Function | Purpose |
|---|---|
| `fakeHash(str)` / `shortHash(str)` | Deterministic fake SHA for Play surfaces |
| `topoSort(commits)` | Topological sort of commit DAG |
| `ancestors(id, byId)` | Set of ancestor commit IDs |
| `lca(idA, idB, commits)` | Lowest common ancestor |
| `rebase(commits, branchTipId, baseTipId)` | Simulate rebase, returns new commit objects |
| `matchIgnorePattern(pattern, path)` | Single .gitignore pattern matching |
| `matchIgnore(rules, path)` | Apply list of rules to a path |
| `parseIgnore(text)` | Parse .gitignore text into rules array |
| `stashPush(stack, entry)` | Push entry onto stash stack |
| `stashPop(stack)` | Pop top entry from stash stack |
| `pos(canvas, evt)` | Canvas hit-test helper |

## Verification

Run from `trainers/git-trainer`:

```bash
node -e "
  var fs = require('fs');
  global.window = global;
  global.localStorage = { getItem: function(){return null;}, setItem: function(){}, removeItem: function(){} };
  global.document = {
    createElement: function(){ return { appendChild:function(){}, addEventListener:function(){}, classList:{add:function(){},remove:function(){}}, querySelector:function(){return null;}, querySelectorAll:function(){return[];}, style:{}, innerHTML:'', textContent:'', value:'', checked:false }; },
    getElementById: function(){ return null; }
  };
  ['js/lib/git.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){eval(fs.readFileSync(f,'utf8'));});
  fs.readdirSync('js/levels').sort().forEach(function(f){eval(fs.readFileSync('js/levels/'+f,'utf8'));});
  console.log('Levels:', GT.levels.length, 'Puzzles:', GT.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
"
```

Expected: `Levels: 14 Puzzles: 42`
