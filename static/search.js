(function () {
  "use strict";
  var input = document.getElementById("site-search");
  var list = document.getElementById("search-results");
  if (!input || !list) return;

  var index = null;
  var activeIndex = -1;

  function load() {
    if (index) return Promise.resolve(index);
    return fetch("/assets/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; return data; })
      .catch(function () { index = []; return index; });
  }

  function render(matches) {
    list.innerHTML = "";
    activeIndex = -1;
    if (!matches.length) {
      list.hidden = true;
      return;
    }
    matches.forEach(function (m) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = m.url;
      a.innerHTML =
        (m.icon ? '<span class="ico" aria-hidden="true">' + m.icon + "</span>" : "") +
        '<span><span class="r-title"></span><span class="r-desc"></span></span>';
      a.querySelector(".r-title").textContent = m.title;
      a.querySelector(".r-desc").textContent = m.desc;
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = false;
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      render([]);
      return;
    }
    var matches = index.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) !== -1 || item.desc.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);
    render(matches);
  }

  input.addEventListener("input", function () {
    load().then(function () { search(input.value); });
  });

  input.addEventListener("focus", function () {
    if (input.value.trim()) load().then(function () { search(input.value); });
  });

  input.addEventListener("keydown", function (e) {
    var items = list.querySelectorAll("a");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items[activeIndex].focus();
    } else if (e.key === "Escape") {
      render([]);
      input.blur();
    } else if (e.key === "Enter") {
      if (items.length) {
        e.preventDefault();
        window.location.href = items[0].getAttribute("href");
      }
    }
  });

  list.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(list.querySelectorAll("a"));
    var i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (i < items.length - 1) items[i + 1].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (i === 0) { input.focus(); } else if (i > 0) { items[i - 1].focus(); }
    } else if (e.key === "Escape") {
      render([]);
      input.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search")) render([]);
  });
})();
