// glossary.js - database systems glossary
window.DBT = window.DBT || {};

DBT.glossary = {
  'database': { name: 'database', def: 'Organized persistent data plus rules for reading and changing it safely.' },
  'table': { name: 'table', def: 'A named collection of rows with the same column layout.' },
  'row': { name: 'row', def: 'One record in a table.' },
  'column': { name: 'column', def: 'A named field in each row, with a data type and optional constraints.' },
  'schema': { name: 'schema', def: 'The structure of the database: tables, columns, constraints, indexes, and relationships.' },
  'primary key': { name: 'primary key', def: 'Column or columns that uniquely identify a row and cannot be null.' },
  'foreign key': { name: 'foreign key', def: 'Column that points at a primary key in another table, enforcing a relationship.' },
  'constraint': { name: 'constraint', def: 'A rule the database enforces, such as NOT NULL, UNIQUE, CHECK, or FOREIGN KEY.' },
  'SQL': { name: 'SQL', def: 'Structured Query Language. Declarative language for asking relational databases for data.' },
  'projection': { name: 'projection', def: 'Choosing which columns to return.' },
  'predicate': { name: 'predicate', def: 'A true/false condition, usually in WHERE or HAVING.' },
  'join': { name: 'join', def: 'Combine rows from two tables according to a matching condition.' },
  'inner join': { name: 'inner join', def: 'Return only matching rows from both sides.' },
  'left join': { name: 'left join', def: 'Return every row from the left table; unmatched right-side columns become NULL.' },
  'cardinality': { name: 'cardinality', def: 'How many rows are involved or produced. Also describes one-to-one, one-to-many, many-to-many relationships.' },
  'index': { name: 'index', def: 'Extra data structure that lets the engine find rows without scanning the whole table.' },
  'B-tree': { name: 'B-tree', def: 'Balanced tree used by most relational databases for ordinary indexes.' },
  'selectivity': { name: 'selectivity', def: 'How much a filter narrows the table. High selectivity means few matching rows.' },
  'query plan': { name: 'query plan', def: 'The physical strategy the engine chooses to run a SQL query.' },
  'seq scan': { name: 'sequential scan', def: 'Read the table row by row. Good for small tables or filters matching many rows.' },
  'index seek': { name: 'index seek', def: 'Use an index to jump to matching rows.' },
  'transaction': { name: 'transaction', def: 'A group of changes that commits as one unit or rolls back completely.' },
  'ACID': { name: 'ACID', def: 'Atomicity, Consistency, Isolation, Durability: four properties of reliable transactions.' },
  'commit': { name: 'commit', def: 'Make a transaction permanent.' },
  'rollback': { name: 'rollback', def: 'Undo all changes made by an uncommitted transaction.' },
  'isolation': { name: 'isolation', def: 'How much concurrent transactions are allowed to see each other.' },
  'dirty read': { name: 'dirty read', def: 'Reading uncommitted data from another transaction.' },
  'phantom read': { name: 'phantom read', def: 'A repeated range query sees newly inserted/deleted matching rows.' },
  'lock': { name: 'lock', def: 'A mechanism that blocks conflicting operations to preserve correctness.' },
  'MVCC': { name: 'MVCC', def: 'Multi-Version Concurrency Control. Readers see snapshots while writers create new row versions.' },
  'normalization': { name: 'normalization', def: 'Organizing tables to reduce duplication and update anomalies.' },
  '1NF': { name: 'First Normal Form', def: 'Every cell holds one atomic value; no repeating groups in a row.' },
  '2NF': { name: 'Second Normal Form', def: 'Every non-key attribute depends on the whole key.' },
  '3NF': { name: 'Third Normal Form', def: 'Non-key attributes depend on the key, not on other non-key attributes.' },
  'aggregation': { name: 'aggregation', def: 'Summarizing many rows into fewer rows with COUNT, SUM, AVG, MIN, MAX.' },
  'GROUP BY': { name: 'GROUP BY', def: 'Partition rows into groups, then compute aggregate values per group.' },
  'window function': { name: 'window function', def: 'Compute a value over related rows while keeping each original row.' },
  'page': { name: 'page', def: 'Fixed-size disk block the database reads/writes as a unit.' },
  'buffer pool': { name: 'buffer pool', def: 'Memory cache of database pages.' },
  'WAL': { name: 'write-ahead log', def: 'Log records written before data pages so committed changes can survive crashes.' },
  'checkpoint': { name: 'checkpoint', def: 'Point where dirty pages are flushed enough that crash recovery can start from a newer place.' },
  'replication': { name: 'replication', def: 'Keeping copies of data on multiple servers.' },
  'RPO': { name: 'RPO', def: 'Recovery Point Objective: how much data loss is acceptable.' },
  'RTO': { name: 'RTO', def: 'Recovery Time Objective: how long restoration may take.' },
  'EXPLAIN': { name: 'EXPLAIN', def: 'Database command that shows the chosen query plan.' }
};

DBT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = DBT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
DBT.escapeHtml = escapeHtml;
