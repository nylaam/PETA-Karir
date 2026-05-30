// ============================================================
// js/pages/paths.js
// Logic for the /paths page:
//   - search filtering
//   - category filtering
//   - dynamic card rendering
//   - progress sync with ProgressStore
// ============================================================

(function () {

  var _search   = "";
  var _category = "all"; // "all" | "competency" | "study_program"

  // ── helpers ───────────────────────────────────────────────
  function hitungOverall() {
    var total  = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var done   = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  function getFiltered() {
    return PATHS.filter(function (p) {
      var q = _search.toLowerCase();
      var matchSearch = q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.tags.some(function (t) { return t.toLowerCase().includes(q); });
      var matchCat = _category === "all" || p.category === _category;
      return matchSearch && matchCat;
    });
  }

  // ── card HTML ─────────────────────────────────────────────
  function renderCard(path) {
    var done     = ProgressStore.getDoneCount(path.path_id);
    var learning = ProgressStore.getLearningCount(path.path_id);
    var percent  = ProgressStore.getPercent(path.path_id, path.nodes_count);
    var isActive = path.path_id === ProgressStore.getActivePath();
    var hasProgress = done > 0 || learning > 0;

    var badgeColor = path.category === "competency" ? "#DBEAFE" : "#EDE9FE";
    var badgeText  = path.category === "competency" ? "#1D4ED8" : "#6D28D9";
    var badgeLabel = path.category === "competency" ? "Competency" : "Study Program";

    var progressSection = hasProgress
      ? '<div class="mt-auto">' +
          '<div class="flex items-center justify-between mb-1.5">' +
            '<span class="text-xs text-slate-400">' + done + ' done &middot; ' + learning + ' in progress</span>' +
            '<span class="text-xs font-bold" style="color:' + path.color + '">' + percent + '%</span>' +
          '</div>' +
          PathCard.progressBar(percent, path.color, 5) +
        '</div>'
      : '<div class="mt-auto">' +
          '<div class="flex items-center justify-between text-xs text-slate-400">' +
            '<span>0 / ' + path.nodes_count + ' completed</span>' +
            '<span class="flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">' +
              'Start Path ' +
              '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
            '</span>' +
          '</div>' +
        '</div>';

    return '<a href="roadmap/index.html?path=' + path.path_id + '"' +
      ' class="card-interactive group flex flex-col animate-slide-up' + (isActive ? ' active' : '') + '">' +

      '<div class="flex items-start justify-between mb-4">' +
        '<div class="w-12 h-12 rounded-xl flex items-center justify-center"' +
             ' style="background-color:' + path.color + '18; color:' + path.color + '">' +
          PathCard.getIcon(path.icon) +
        '</div>' +
        '<span class="text-xs font-semibold px-2.5 py-1 rounded-full"' +
              ' style="background:' + badgeColor + '; color:' + badgeText + '">' +
          badgeLabel +
        '</span>' +
      '</div>' +

      '<h3 class="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">' +
        path.title +
      '</h3>' +
      '<p class="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">' + path.description + '</p>' +

      '<div class="flex flex-wrap gap-1.5 mb-4">' + PathCard.tags(path.tags) + '</div>' +

      '<div class="flex items-center gap-4 text-xs text-slate-400 mb-4">' +
        '<span class="flex items-center gap-1">' +
          '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
          path.nodes_count + ' skills' +
        '</span>' +
        (path.estimatedWeeks
          ? '<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>~' + path.estimatedWeeks + ' weeks</span>'
          : '') +
      '</div>' +

      progressSection +
    '</a>';
  }

  // ── render ─────────────────────────────────────────────────
  function renderGrid() {
    var grid      = document.getElementById("paths-grid");
    var empty     = document.getElementById("empty-state");
    var countEl   = document.getElementById("results-count");
    if (!grid) return;

    var filtered = getFiltered();

    if (filtered.length === 0) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      grid.innerHTML = filtered.map(renderCard).join("");
    }

    if (countEl) {
      countEl.innerHTML = 'Menampilkan <span class="font-semibold text-slate-700">' +
        filtered.length + '</span> learning path';
    }
  }

  // ── filter buttons ─────────────────────────────────────────
  function setCategory(cat) {
    _category = cat;
    document.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.classList.remove("active");
    });
    var map = { all: "filter-all", competency: "filter-competency", study_program: "filter-study" };
    var el = document.getElementById(map[cat]);
    if (el) el.classList.add("active");
    renderGrid();
  }

  // ── init ──────────────────────────────────────────────────
  function init() {
    var total   = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var done    = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    var overall = total > 0 ? Math.round((done / total) * 100) : 0;

    Navbar.render(overall);
    Footer.render();

    // Read category from URL ?category=...
    var params = new URLSearchParams(window.location.search);
    var catParam = params.get("category");
    if (catParam === "competency" || catParam === "study_program") {
      _category = catParam;
      var map = { competency: "filter-competency", study_program: "filter-study" };
      document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
      var btnEl = document.getElementById(map[catParam]);
      if (btnEl) btnEl.classList.add("active");
    }

    // Search binding
    var searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        _search = this.value;
        renderGrid();
      });
    }

    // Filter buttons
    document.getElementById("filter-all").addEventListener("click", function () { setCategory("all"); });
    document.getElementById("filter-competency").addEventListener("click", function () { setCategory("competency"); });
    document.getElementById("filter-study").addEventListener("click", function () { setCategory("study_program"); });

    renderGrid();
  }

  // Re-render on progress change
  ProgressStore.subscribe(function () {
    renderGrid();
    Navbar.updateProgress(hitungOverall());
  });

  document.addEventListener("DOMContentLoaded", init);

})();
