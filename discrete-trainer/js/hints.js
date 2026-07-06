// hints.js — progressive hint UI
window.DMT = window.DMT || {};

DMT.hints = {
  /**
   * Mounts a hint button + reveal area inside `container`.
   * Returns nothing; manages its own state.
   */
  mount: function (container, hints) {
    if (!hints || !hints.length) return;
    var revealed = 0;
    var btn = document.createElement('button');
    btn.className = 'secondary-btn';
    btn.textContent = 'Hint (' + hints.length + ' available)';
    var box = document.createElement('div');
    box.style.marginTop = '8px';

    btn.addEventListener('click', function () {
      if (revealed >= hints.length) return;
      var hint = document.createElement('div');
      hint.className = 'hint-box';
      hint.innerHTML =
        '<span class="label">Hint ' + (revealed + 1) + ' of ' + hints.length + '</span>' +
        DMT.escapeHtml(hints[revealed]);
      box.appendChild(hint);
      revealed++;
      if (revealed >= hints.length) btn.disabled = true;
      btn.textContent = revealed >= hints.length
        ? 'All hints shown'
        : 'Hint (' + (hints.length - revealed) + ' left)';
    });

    container.appendChild(btn);
    container.appendChild(box);
  }
};
