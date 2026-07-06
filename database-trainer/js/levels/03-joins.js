(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 3,
    title: 'Joins',
    whyItMatters: 'Real data is split across tables; joins are how you put related facts back together.',
    glossary: ['join', 'inner join', 'left join', 'foreign key', 'cardinality'],
    learn:
      '<p>A join matches rows from one table with rows from another. The most common pattern is a foreign key pointing at a primary key.</p>' +
      '<pre><code>SELECT users.email, orders.total_cents\nFROM users\nJOIN orders ON orders.user_id = users.id;</code></pre>' +
      '<p>An inner join keeps matches only. A left join keeps every left-side row and fills missing right-side columns with NULL.</p>',
    mountPlay: function (container) {
      container.innerHTML = db.tableHtml(['users.id', 'email'], [[1, 'ava@x'], [2, 'ben@x'], [3, 'cam@x']]) +
        db.tableHtml(['orders.id', 'user_id', 'total'], [[10, 1, 5000], [11, 1, 7000], [12, 2, 900]]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which join returns users only when they have at least one matching order?',
        mountInput: function (c) { return db.selectInput(c, ['INNER JOIN', 'LEFT JOIN']); },
        check: function (v) { return v === 'INNER JOIN' ? { correct: true, feedback: 'Right. Inner join drops non-matches.' } : { correct: false, feedback: 'LEFT JOIN would keep users without orders too.' }; },
        hints: ['Matches only.', 'Non-matching left rows disappear.', 'Use INNER JOIN.']
      },
      {
        difficulty: 'medium',
        prompt: 'In the Play data, how many rows does <code>users JOIN orders ON orders.user_id = users.id</code> return?',
        mountInput: function (c) { return db.numberInput(c, 'rows'); },
        check: function (v) { return v === 3 ? { correct: true, feedback: 'Yes. Ava has 2 orders, Ben has 1, Cam has 0, so inner join returns 3 rows.' } : { correct: false, feedback: 'Count matching order rows, not users.' }; },
        hints: ['Each matching order creates a result row.', 'Ava contributes two.', '2 + 1 + 0 = 3.']
      },
      {
        difficulty: 'hard',
        prompt: 'Why does a many-to-many relationship usually need a bridge table?',
        mountInput: function (c) { return db.textInput(c, 'explain'); },
        check: function (v) { return db.hasAll(v, ['many']) && (db.norm(v).indexOf('bridge') !== -1 || db.norm(v).indexOf('join table') !== -1) ? { correct: true, feedback: 'Right. The bridge stores one row per association, avoiding repeated lists in either main table.' } : { correct: false, feedback: 'A many-to-many relationship is a set of pairings. That set deserves its own table.' }; },
        hints: ['Example: students and courses.', 'One student has many courses; one course has many students.', 'Use a bridge/join table with student_id and course_id.']
      }
    ]
  });
})();
