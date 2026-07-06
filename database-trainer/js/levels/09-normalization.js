(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 9,
    title: 'Normalization',
    whyItMatters: 'Normalization removes duplicated facts that otherwise drift out of sync.',
    glossary: ['normalization', '1NF', '2NF', '3NF', 'foreign key'],
    learn:
      '<p>Normalization is about putting each fact in one place. Duplication causes update anomalies: you fix one copy but miss another.</p>' +
      '<div class="example"><div class="label">Bad shape</div><code>orders(id, customer_name, customer_email, product1, product2, product3)</code></div>' +
      '<p>A better design separates customers, orders, products, and order_items. Joins recover the combined view when needed.</p>',
    mountPlay: function (container) {
      container.innerHTML = db.tableHtml(['order_id', 'customer_email', 'product1', 'product2'], [[1, 'ava@x', 'Keyboard', 'Mouse'], [2, 'ava@x', 'Monitor', '']]);
      db.cards(container, [
        { title: 'Repeating columns', body: 'product1/product2 breaks 1NF.' },
        { title: 'Repeated customer', body: 'email appears on every order.' },
        { title: 'Fix', body: 'customers, orders, products, order_items.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which normal form says each cell should hold one atomic value, not a list?',
        mountInput: function (c) { return db.selectInput(c, ['1NF', '2NF', '3NF']); },
        check: function (v) { return v === '1NF' ? { correct: true, feedback: 'Right. 1NF removes repeating groups and list-in-a-cell fields.' } : { correct: false, feedback: 'Atomic cells are the first step: 1NF.' }; },
        hints: ['It is the first one.', 'No comma-separated list in a single cell.', '1NF.']
      },
      {
        difficulty: 'medium',
        prompt: 'A table stores <code>order_id, customer_email, customer_name</code> on every order. If a customer changes name, many rows need updating. What anomaly is this?',
        mountInput: function (c) { return db.textInput(c, 'anomaly'); },
        check: function (v) { return db.norm(v).indexOf('update') !== -1 ? { correct: true, feedback: 'Right. Duplicated facts create update anomalies.' } : { correct: false, feedback: 'The problem appears when one fact changes and many copies must be edited.' }; },
        hints: ['The old value remains in some rows if you miss them.', 'It happens during changes.', 'Update anomaly.']
      },
      {
        difficulty: 'hard',
        prompt: 'Name the bridge table for orders and products, and the two foreign keys it should contain.',
        mountInput: function (c) { return db.textInput(c, 'table and keys'); },
        check: function (v) { var n = db.norm(v); return n.indexOf('order') !== -1 && n.indexOf('product') !== -1 && n.indexOf('id') !== -1 ? { correct: true, feedback: 'Good. order_items(order_id, product_id, quantity, price_at_purchase) is the common shape.' } : { correct: false, feedback: 'The bridge needs one key to orders and one key to products.' }; },
        hints: ['Usually named order_items.', 'It stores one row per product in an order.', 'order_items with order_id and product_id.']
      }
    ]
  });
})();
