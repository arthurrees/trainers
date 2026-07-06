// db.js - tiny helpers for database trainer levels
window.DBT = window.DBT || {};
window.DBT.levels = window.DBT.levels || [];
DBT.registerLevel = function (lvl) { DBT.levels.push(lvl); };
DBT.lib = DBT.lib || {};

DBT.lib.db = (function () {
  function norm(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function hasAll(text, words) {
    var n = norm(text);
    for (var i = 0; i < words.length; i++) {
      if (n.indexOf(norm(words[i])) === -1) return false;
    }
    return true;
  }
  function approx(n, target, tol) {
    n = Number(n);
    return isFinite(n) && Math.abs(n - target) <= tol;
  }
  function textInput(container, placeholder) {
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder || '';
    input.style.width = '100%';
    input.style.fontSize = '15px';
    container.appendChild(input);
    return function () { return input.value; };
  }
  function numberInput(container, placeholder) {
    var input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = placeholder || '';
    input.style.width = '140px';
    container.appendChild(input);
    return function () { return Number(input.value); };
  }
  function selectInput(container, options) {
    var sel = document.createElement('select');
    sel.innerHTML = '<option value="">- choose -</option>' + options.map(function (o) {
      return '<option>' + o + '</option>';
    }).join('');
    container.appendChild(sel);
    return function () { return sel.value; };
  }
  function multiSelect(container, options) {
    var checks = [];
    options.forEach(function (o) {
      var label = document.createElement('label');
      label.style.display = 'block';
      label.style.margin = '6px 0';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = o;
      checks.push(cb);
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + o));
      container.appendChild(label);
    });
    return function () {
      return checks.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
    };
  }
  function tableHtml(headers, rows) {
    return '<table class="mini-table"><thead><tr>' + headers.map(function (h) {
      return '<th>' + h + '</th>';
    }).join('') + '</tr></thead><tbody>' + rows.map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
  }
  function cards(container, items) {
    var wrap = document.createElement('div');
    wrap.className = 'choice-grid';
    items.forEach(function (it) {
      var card = document.createElement('div');
      card.className = 'choice-card';
      card.innerHTML = '<h4>' + it.title + '</h4><p>' + it.body + '</p>';
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
  }
  return {
    norm: norm,
    hasAll: hasAll,
    approx: approx,
    textInput: textInput,
    numberInput: numberInput,
    selectInput: selectInput,
    multiSelect: multiSelect,
    tableHtml: tableHtml,
    cards: cards
  };
})();
