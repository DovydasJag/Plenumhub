/* Footer "Privacy and cookie settings" link: reopens Google's consent message so visitors can change or
   withdraw consent. Only loaded when consent_head.html exists. If the consent script is blocked or has not
   loaded, the link falls back to the consent section of the Privacy Policy (its href). */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('[data-privacy-settings]') : null;
    if (!link) { return; }
    var g = window.googlefc;
    if (!g || !g.callbackQueue) { return; }
    e.preventDefault();
    g.callbackQueue.push(function () { window.googlefc.showRevocationMessage(); });
  });
})();
