(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 4,
    title: 'Indexes',
    whyItMatters: 'Indexes are the difference between reading one page and searching millions of rows.',
    glossary: ['index', 'B-tree', 'selectivity', 'primary key'],
    learn:
      '<p>An index is a sorted access path. Instead of checking every row, the engine walks the index to find matching row locations.</p>' +
      '<div class="example"><div class="label">Tradeoff</div>Indexes speed reads that match their leading columns, but every insert/update/delete must maintain them. Too few indexes cause slow reads; too many indexes slow writes.</div>' +
      '<p>Most ordinary indexes are B-trees: shallow balanced trees where each step narrows the search range.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'No index', body: 'WHERE email = ? checks row 1, row 2, row 3 ... until done.' },
        { title: 'B-tree index', body: 'Jump through sorted keys to the matching email, then fetch the row.' },
        { title: 'Write cost', body: 'Inserting a user also inserts one key into each relevant index.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'A query often runs <code>WHERE users.email = ?</code>. Which index is most useful?',
        mountInput: function (c) { return db.selectInput(c, ['INDEX ON users(email)', 'INDEX ON users(created_at)', 'No index helps equality']); },
        check: function (v) { return v === 'INDEX ON users(email)' ? { correct: true, feedback: 'Right. The filter starts with email, so index email.' } : { correct: false, feedback: 'Index the column used by the selective equality predicate.' }; },
        hints: ['Look at the WHERE column.', 'Equality lookup on email is highly selective.', 'Use INDEX ON users(email).']
      },
      {
        difficulty: 'medium',
        prompt: 'Why can too many indexes make writes slower?',
        mountInput: function (c) { return db.textInput(c, 'reason'); },
        check: function (v) { return db.hasAll(v, ['update']) || db.hasAll(v, ['maintain']) || db.hasAll(v, ['insert', 'index']) ? { correct: true, feedback: 'Yes. Every changed row may require changes to multiple index structures.' } : { correct: false, feedback: 'Think about what else must be changed when a row is inserted.' }; },
        hints: ['Indexes are extra data structures.', 'They must stay consistent with the table.', 'Each write also maintains every affected index.']
      },
      {
        difficulty: 'hard',
        prompt: 'For an index on <code>(tenant_id, created_at)</code>, which filter can use the leading column best?',
        mountInput: function (c) { return db.selectInput(c, ['WHERE created_at > now() - interval 1 day', 'WHERE tenant_id = 42 AND created_at > now() - interval 1 day', 'WHERE status = paid']); },
        check: function (v) { return v.indexOf('tenant_id = 42') !== -1 ? { correct: true, feedback: 'Right. Composite B-tree indexes work best from the leftmost prefix.' } : { correct: false, feedback: 'The leading column is tenant_id. The best predicate constrains it first.' }; },
        hints: ['Composite index order matters.', 'Use the leftmost prefix.', 'tenant_id plus created_at is the best match.']
      }
    ]
  });
})();
