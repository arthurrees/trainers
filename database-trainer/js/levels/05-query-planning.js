(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 5,
    title: 'Query Planning',
    whyItMatters: 'The same SQL can be fast or terrible depending on the physical plan the optimizer chooses.',
    glossary: ['query plan', 'seq scan', 'index seek', 'selectivity', 'EXPLAIN'],
    learn:
      '<p>The optimizer estimates costs and chooses a plan: scan a table, seek an index, join with nested loops or hash join, sort, aggregate, and so on.</p>' +
      '<pre><code>EXPLAIN SELECT * FROM orders WHERE id = 10;\n-- Index Scan using orders_pkey ...</code></pre>' +
      '<p>High-selectivity predicates usually favor indexes. Low-selectivity predicates may be faster as a sequential scan because most rows are needed anyway.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'id = 10', body: 'Very selective: index seek.' },
        { title: 'status = paid', body: 'Maybe many rows: planner may scan.' },
        { title: 'ORDER BY created_at', body: 'Could use an index order or perform a sort.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which command shows the plan a database intends to use?',
        mountInput: function (c) { return db.textInput(c, 'command'); },
        check: function (v) { return db.norm(v).indexOf('explain') !== -1 ? { correct: true, feedback: 'Right. EXPLAIN shows the chosen plan.' } : { correct: false, feedback: 'The command is usually EXPLAIN, with vendor-specific options like ANALYZE.' }; },
        hints: ['It does not run the query in basic form.', 'It explains the physical strategy.', 'Use EXPLAIN.']
      },
      {
        difficulty: 'medium',
        prompt: 'A table has 10 million rows. <code>WHERE id = 123</code> uses a primary-key index. Scan or seek?',
        mountInput: function (c) { return db.selectInput(c, ['Sequential scan', 'Index seek']); },
        check: function (v) { return v === 'Index seek' ? { correct: true, feedback: 'Right. One primary-key row is extremely selective.' } : { correct: false, feedback: 'A primary-key equality lookup should jump through the index.' }; },
        hints: ['Only one row can match.', 'Primary keys are indexed.', 'Use an index seek.']
      },
      {
        difficulty: 'hard',
        prompt: 'Why might <code>WHERE is_deleted = false</code> ignore an index when 99% of rows are false?',
        mountInput: function (c) { return db.textInput(c, 'reason'); },
        check: function (v) { return db.hasAll(v, ['most']) || db.hasAll(v, ['many']) || db.norm(v).indexOf('selectiv') !== -1 ? { correct: true, feedback: 'Exactly. The predicate is not selective, so an index adds random lookups without skipping much data.' } : { correct: false, feedback: 'Think selectivity. If almost every row matches, the index does not narrow much.' }; },
        hints: ['Indexes help when they skip lots of rows.', '99% matching means almost no filtering.', 'Low selectivity often makes a scan cheaper.']
      }
    ]
  });
})();
