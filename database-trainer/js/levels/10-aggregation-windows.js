(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 10,
    title: 'Aggregation & Window Functions',
    whyItMatters: 'Analytics queries depend on knowing when rows collapse and when they stay visible.',
    glossary: ['aggregation', 'GROUP BY', 'window function'],
    learn:
      '<p><code>GROUP BY</code> collapses many input rows into one output row per group. Window functions compute over a set of related rows while keeping every row.</p>' +
      '<pre><code>SELECT customer_id, COUNT(*)\nFROM orders\nGROUP BY customer_id;\n\nSELECT id, customer_id,\n  SUM(total) OVER (PARTITION BY customer_id) AS customer_total\nFROM orders;</code></pre>',
    mountPlay: function (container) {
      container.innerHTML = db.tableHtml(['id', 'customer', 'total'], [[1, 'Ava', 50], [2, 'Ava', 70], [3, 'Ben', 20]]);
      db.cards(container, [
        { title: 'GROUP BY customer', body: 'Ava -> 120, Ben -> 20: two rows.' },
        { title: 'Window partition customer', body: 'Three rows remain; Ava rows both show 120.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which clause collapses rows into one row per group?',
        mountInput: function (c) { return db.selectInput(c, ['GROUP BY', 'ORDER BY', 'WHERE']); },
        check: function (v) { return v === 'GROUP BY' ? { correct: true, feedback: 'Right. GROUP BY changes row cardinality.' } : { correct: false, feedback: 'WHERE filters, ORDER BY sorts. GROUP BY collapses rows.' }; },
        hints: ['It pairs with COUNT/SUM/AVG.', 'One row per category.', 'GROUP BY.']
      },
      {
        difficulty: 'medium',
        prompt: 'In the Play data, what is Ava\'s grouped SUM(total)?',
        mountInput: function (c) { return db.numberInput(c, 'sum'); },
        check: function (v) { return v === 120 ? { correct: true, feedback: 'Right. 50 + 70 = 120.' } : { correct: false, feedback: 'Add Ava rows only.' }; },
        hints: ['Ava has two orders.', '50 and 70.', '120.']
      },
      {
        difficulty: 'hard',
        prompt: 'You need each order row plus that customer\'s lifetime total. GROUP BY or window function?',
        mountInput: function (c) { return db.textInput(c, 'choice'); },
        check: function (v) { return db.norm(v).indexOf('window') !== -1 || db.norm(v).indexOf('over') !== -1 ? { correct: true, feedback: 'Right. A window function keeps the original order rows.' } : { correct: false, feedback: 'GROUP BY would collapse the order rows. You need the original rows to remain.' }; },
        hints: ['Do not collapse orders.', 'Use OVER (PARTITION BY customer_id).', 'Window function.']
      }
    ]
  });
})();
