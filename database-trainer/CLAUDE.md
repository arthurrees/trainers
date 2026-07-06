# Database Systems Trainer

Interactive trainer for database systems: SQL basics, relational modeling, indexes, query planning, transactions, isolation, storage, replication, and performance tuning.

> Cross-trainer rules live in `../CLAUDE.md`. This file covers only database-specific guidance.

## Topic-specific things

- **Namespace:** `window.DBT`
- **Storage key:** `dbt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Audience:** a programmer who may know basic SQL syntax but does not yet have a database-engine mental model.
- **Pedagogy:** make invisible engine behavior visible. Use row tables, B-tree lookup steps, lock timelines, WAL records, query plans, and transaction interleavings.

## The 14 levels

| # | Title | Main idea |
|---|---|---|
| 0 | Orientation | Database as persistent, shared, queryable state |
| 1 | Tables, Schemas & Constraints | Rows, columns, keys, nullability, integrity |
| 2 | SELECT, WHERE & ORDER BY | Filtering, projection, ordering |
| 3 | Joins | Inner/left joins, bridge tables, cardinality |
| 4 | Indexes | B-trees, lookup cost, write cost |
| 5 | Query Planning | Scans, seeks, selectivity, explain plans |
| 6 | Transactions & ACID | Commit/rollback, atomicity, durability |
| 7 | Isolation Levels | Dirty/non-repeatable/phantom reads |
| 8 | Locks & MVCC | Blocking vs snapshots, row locks, version chains |
| 9 | Normalization | 1NF/2NF/3NF and when denormalization is acceptable |
| 10 | Aggregation & Windows | GROUP BY vs window functions |
| 11 | Storage, Pages & WAL | Pages, buffer pool, checkpoints, crash recovery |
| 12 | Replication & Backups | RPO/RTO, sync/async replication, restore testing |
| 13 | Performance Tuning | Systematic slow-query diagnosis |

## Content priorities

- Prefer concrete SQL and small tables over abstract prose.
- Include the engine's point of view: what rows/pages/indexes/locks are touched.
- Keep vendor-neutral language, but mention PostgreSQL/MySQL/SQLite differences only when useful.
- Hard puzzles should combine modeling, query behavior, and operational consequences.

## Verification

Run from `trainers/database-trainer`:

```bash
node -e "var fs=require('fs'); global.window=global; global.localStorage={getItem:function(){return null},setItem:function(){},removeItem:function(){}}; global.document={createElement:function(){return{appendChild:function(){},addEventListener:function(){},classList:{add:function(){},remove:function(){}},querySelector:function(){return null},querySelectorAll:function(){return[]},style:{},innerHTML:'',textContent:'',value:''};},getElementById:function(){return null;}}; ['js/lib/db.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){eval(fs.readFileSync(f,'utf8'));}); fs.readdirSync('js/levels').sort().forEach(function(f){eval(fs.readFileSync('js/levels/'+f,'utf8'));}); console.log('Levels:', DBT.levels.length, 'Puzzles:', DBT.levels.reduce(function(a,l){return a+l.puzzles.length;},0));"
```
