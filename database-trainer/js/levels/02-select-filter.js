(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 2,
    title: 'SELECT, WHERE & ORDER BY',
    whyItMatters: 'Most database work starts with asking for exactly the rows and columns you need.',
    glossary: ['SQL', 'projection', 'predicate'],
    learn:
      '<p><code>SELECT</code> chooses columns. <code>FROM</code> chooses the table. <code>WHERE</code> filters rows. <code>ORDER BY</code> sorts the final result.</p>' +
      '<pre><code>SELECT name, total_cents\nFROM orders\nWHERE status = \'paid\' AND total_cents &gt;= 5000\nORDER BY total_cents DESC;</code></pre>' +
      '<p>The engine is free to evaluate this physically in a different order. Logically, think: start with rows, filter them, project columns, sort the result.</p>',
    mountPlay: function (container) {
      container.innerHTML = db.tableHtml(['id', 'name', 'status', 'total'], [[1, 'Ava', 'paid', 7200], [2, 'Ben', 'cart', 1800], [3, 'Cam', 'paid', 2500], [4, 'Dee', 'paid', 9100]]);
      db.cards(container, [
        { title: 'Filter', body: 'WHERE status = paid keeps Ava, Cam, Dee.' },
        { title: 'Project', body: 'SELECT name,total hides id and status.' },
        { title: 'Sort', body: 'ORDER BY total DESC puts Dee before Ava.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which clause filters rows before they reach the result?',
        mountInput: function (c) { return db.selectInput(c, ['SELECT', 'WHERE', 'ORDER BY']); },
        check: function (v) { return v === 'WHERE' ? { correct: true, feedback: 'Right. WHERE is the row filter.' } : { correct: false, feedback: 'SELECT chooses columns; ORDER BY sorts. WHERE filters rows.' }; },
        hints: ['It contains true/false conditions.', 'It often says column = value.', 'The answer is WHERE.']
      },
      {
        difficulty: 'medium',
        prompt: 'Write a WHERE condition for paid orders of at least $50, assuming cents are stored in <code>total_cents</code>.',
        mountInput: function (c) { return db.textInput(c, 'WHERE ...'); },
        check: function (v) { var n = db.norm(v); return n.indexOf('status') !== -1 && n.indexOf('paid') !== -1 && n.indexOf('total_cents') !== -1 && n.indexOf('5000') !== -1 ? { correct: true, feedback: 'Good. Money in cents avoids floating point surprises.' } : { correct: false, feedback: 'You need both predicates: status is paid and total_cents is at least 5000.' }; },
        hints: ['$50 is 5000 cents.', 'Use AND to combine conditions.', "One good answer: WHERE status = 'paid' AND total_cents >= 5000."]
      },
      {
        difficulty: 'hard',
        prompt: 'For the table in Play, after filtering paid orders and sorting by total descending, which customer is first?',
        mountInput: function (c) { return db.textInput(c, 'name'); },
        check: function (v) { return db.norm(v) === 'dee' ? { correct: true, feedback: 'Right. Dee has the largest paid order: 9100 cents.' } : { correct: false, feedback: 'Filter out cart rows first, then compare totals among paid rows.' }; },
        hints: ['Ben is not paid.', 'Compare 7200, 2500, and 9100.', 'Dee is first.']
      }
    ]
  });
})();
