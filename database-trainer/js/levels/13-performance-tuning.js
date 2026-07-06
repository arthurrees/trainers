(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 13,
    title: 'Performance Tuning',
    whyItMatters: 'Fast database work is disciplined measurement: find the bottleneck, then change the smallest thing that removes it.',
    glossary: ['EXPLAIN', 'query plan', 'index', 'selectivity', 'buffer pool'],
    learn:
      '<p>Performance tuning starts with a slow query and evidence. Look at the plan, row estimates vs actual rows, missing indexes, bad join order, sorts spilling to disk, lock waits, and network round trips.</p>' +
      '<div class="example"><div class="label">Reliable workflow</div><ol><li>Measure the slow query.</li><li>Run EXPLAIN/ANALYZE.</li><li>Identify the largest cost or wait.</li><li>Change one thing.</li><li>Measure again.</li></ol></div>' +
      '<p>Indexes are common fixes, but not the only fixes. Sometimes the right answer is rewriting a query, changing cardinality, batching work, or adding a materialized summary.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'Symptom', body: 'Dashboard query takes 9 seconds.' },
        { title: 'Evidence', body: 'EXPLAIN shows sequential scan of 20M events plus disk sort.' },
        { title: 'Candidate fix', body: 'Composite index on (tenant_id, created_at) or pre-aggregated daily table.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'What should you run before guessing which index to add?',
        mountInput: function (c) { return db.textInput(c, 'command/tool'); },
        check: function (v) { return db.norm(v).indexOf('explain') !== -1 ? { correct: true, feedback: 'Right. Read the actual plan before guessing.' } : { correct: false, feedback: 'You need plan evidence first.' }; },
        hints: ['The planner can tell you what it is doing.', 'Use the same command from query planning.', 'EXPLAIN, ideally EXPLAIN ANALYZE in a safe environment.']
      },
      {
        difficulty: 'medium',
        prompt: 'A query filters <code>tenant_id = ?</code> and a recent <code>created_at</code> range, then sorts by newest first. Which index is most plausible?',
        mountInput: function (c) { return db.selectInput(c, ['(created_at)', '(tenant_id, created_at)', '(status)']); },
        check: function (v) { return v === '(tenant_id, created_at)' ? { correct: true, feedback: 'Right. Tenant narrows the data, created_at supports range/order inside that tenant.' } : { correct: false, feedback: 'Match the equality prefix first, then the range/order column.' }; },
        hints: ['The query is tenant-scoped.', 'Composite order matters.', '(tenant_id, created_at).']
      },
      {
        difficulty: 'hard',
        prompt: 'A report recomputes daily revenue from 200M raw events every page load. Name a better design.',
        mountInput: function (c) { return db.textInput(c, 'design'); },
        check: function (v) { var n = db.norm(v); return n.indexOf('material') !== -1 || n.indexOf('summary') !== -1 || n.indexOf('aggregate') !== -1 || n.indexOf('precompute') !== -1 ? { correct: true, feedback: 'Right. Precompute/materialize daily aggregates and refresh them on a schedule or incrementally.' } : { correct: false, feedback: 'An index may help, but recomputing huge historical aggregates on every request is the deeper design problem.' }; },
        hints: ['The same expensive aggregate is repeated.', 'Historical data changes slowly.', 'Use a materialized summary/precomputed aggregate table.']
      }
    ]
  });
})();
