// ============================================================
// js/pages/dashboard.js
// Dashboard page logic — migrated from TSX dashboard/page.tsx
//
// Sections:
//  1. Stat cards (overall %, done, learning, remaining)
//  2. Progress per Path — horizontal segmented bars
//  3. Path Summary — compact progress list
//  4. Recommended Next Steps — reachable not-started nodes
//  5. Export progress as JSON
// ============================================================

(function () {

  // ── SVG icons ─────────────────────────────────────────────
  var ICONS = {
    trendingUp: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    checkCircle: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    clock: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    bookOpen: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    barChart: '<svg class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    arrowRight: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  };

  // ── helpers ───────────────────────────────────────────────
  function hitungOverall() {
    var total = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var done  = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  function calcStats() {
    var totalNodes    = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var totalDone     = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    var totalLearning = PATHS.reduce(function (a, p) { return a + ProgressStore.getLearningCount(p.path_id); }, 0);
    var totalRemaining= totalNodes - totalDone - totalLearning;
    var overallPct    = totalNodes > 0 ? Math.round((totalDone / totalNodes) * 100) : 0;
    return { totalNodes, totalDone, totalLearning, totalRemaining, overallPct };
  }

  // paths that have any progress
  function getChartData() {
    return PATHS.map(function (p) {
      var done     = ProgressStore.getDoneCount(p.path_id);
      var learning = ProgressStore.getLearningCount(p.path_id);
      var total    = p.nodes_count;
      return {
        pathId:   p.path_id,
        fullName: p.title,
        done:     done,
        learning: learning,
        total:    total,
        color:    p.color,
        percent:  total > 0 ? Math.round((done / total) * 100) : 0,
      };
    }).filter(function (d) { return d.done > 0 || d.learning > 0; });
  }

  // recommended next steps
  function calcNextSteps() {
    var steps = [];
    var progress = ProgressStore.getProgress();

    PATHS.forEach(function (p) {
      var pp = progress[p.path_id] || {};
      if (!p.nodes) return;

      p.nodes.forEach(function (n) {
        var status = pp[n.id] || "not_started";
        if (status !== "not_started") return;

        var isReachable = p.nodes.some(function (other) {
          return other.connections && other.connections.indexOf(n.id) !== -1 &&
            (pp[other.id] === "done" || pp[other.id] === "learning");
        });
        var isRoot = !p.nodes.some(function (other) {
          return other.connections && other.connections.indexOf(n.id) !== -1;
        });
        var pathHasProgress = Object.keys(pp).length > 0;

        if (isReachable || (isRoot && pathHasProgress)) {
          steps.push({
            nodeTitle: n.title,
            pathTitle: p.title,
            pathId:    p.path_id,
          });
        }
      });
    });

    return steps.slice(0, 5);
  }

  // ── render: stat cards ────────────────────────────────────
  function renderStatCards() {
    var el = document.getElementById("stat-cards");
    if (!el) return;

    var s = calcStats();

    var cards = [
      {
        icon: ICONS.trendingUp,
        value: s.overallPct + "%",
        label: "Overall Progress",
        iconBg: "background:#EFF6FF",
        iconColor: "color:#2563EB",
        valueColor: "color:#2563EB",
      },
      {
        icon: ICONS.checkCircle,
        value: s.totalDone,
        label: "Skills Completed",
        iconBg: "background:#D1FAE5",
        iconColor: "color:#10B981",
        valueColor: "color:#10B981",
      },
      {
        icon: ICONS.clock,
        value: s.totalLearning,
        label: "In Progress",
        iconBg: "background:#EFF6FF",
        iconColor: "color:#2563EB",
        valueColor: "color:#2563EB",
      },
      {
        icon: ICONS.bookOpen,
        value: s.totalRemaining,
        label: "Remaining",
        iconBg: "background:#F1F5F9",
        iconColor: "color:#94A3B8",
        valueColor: "color:#475569",
      },
    ];

    el.innerHTML = cards.map(function (c) {
      return '<div class="card flex items-center gap-4 animate-slide-up">' +
        '<div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"' +
             ' style="' + c.iconBg + '; ' + c.iconColor + '">' +
          c.icon +
        '</div>' +
        '<div>' +
          '<p class="text-2xl font-bold" style="' + c.valueColor + '">' + c.value + '</p>' +
          '<p class="text-xs text-slate-400 mt-0.5">' + c.label + '</p>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  // ── render: progress per path (horizontal segmented bars) ─
  function renderProgressPerPath() {
    var el = document.getElementById("progress-per-path");
    if (!el) return;

    var data = getChartData();

    if (data.length === 0) {
      el.innerHTML =
        '<div class="flex flex-col items-center justify-center h-[220px] text-center">' +
          '<span class="text-slate-300 mb-3">' + ICONS.barChart + '</span>' +
          '<p class="text-slate-500 font-semibold">Belum ada progress</p>' +
          '<p class="text-sm text-slate-400 mt-1">Mulai belajar dari Path Catalog</p>' +
          '<a href="paths.html" class="btn btn-secondary btn-sm mt-4">Explore Paths</a>' +
        '</div>';
      return;
    }

    el.innerHTML =
      '<div class="space-y-4 overflow-y-auto max-h-[240px] pr-1" style="scrollbar-width:thin">' +
      data.map(function (d) {
        var donePct     = d.total > 0 ? (d.done / d.total) * 100 : 0;
        var learningPct = d.total > 0 ? (d.learning / d.total) * 100 : 0;

        return '<a href="roadmap/index.html?path=' + d.pathId + '"' +
          ' class="block cursor-pointer group no-underline">' +

          '<div class="flex items-center justify-between mb-1.5">' +
            '<span class="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">' +
              d.fullName +
            '</span>' +
            '<div class="flex items-center gap-2 ml-3 shrink-0">' +
              '<span class="text-xs text-slate-400">' + d.done + '/' + d.total + '</span>' +
              '<span class="text-xs font-bold" style="color:' + d.color + '">' + d.percent + '%</span>' +
            '</div>' +
          '</div>' +

          // Segmented bar track
          '<div class="w-full rounded-full overflow-hidden" style="height:10px;background:#F1F5F9">' +
            '<div class="h-full flex rounded-full overflow-hidden">' +
              (donePct > 0
                ? '<div class="h-full transition-all duration-500" style="width:' + donePct + '%;background:#10B981"></div>'
                : '') +
              (learningPct > 0
                ? '<div class="h-full transition-all duration-500" style="width:' + learningPct + '%;background:' + d.color + ';opacity:0.6"></div>'
                : '') +
            '</div>' +
          '</div>' +

          // Legend
          '<div class="flex items-center gap-3 mt-1">' +
            '<span class="flex items-center gap-1 text-slate-400" style="font-size:10px">' +
              '<span class="inline-block w-2 h-2 rounded-full" style="background:#10B981"></span>' +
              'Done: ' + d.done +
            '</span>' +
            '<span class="flex items-center gap-1 text-slate-400" style="font-size:10px">' +
              '<span class="inline-block w-2 h-2 rounded-full" style="background:' + d.color + ';opacity:0.7"></span>' +
              'Learning: ' + d.learning +
            '</span>' +
          '</div>' +

        '</a>';
      }).join("") +
      '</div>';
  }

  // ── render: path summary ──────────────────────────────────
  function renderPathSummary() {
    var el = document.getElementById("path-summary");
    if (!el) return;

    var progress = ProgressStore.getProgress();
    var anyDone  = false;
    var html     = "";

    PATHS.forEach(function (p) {
      var done = ProgressStore.getDoneCount(p.path_id);
      if (done === 0) return;
      anyDone = true;

      var total = p.nodes_count;
      var pct   = total > 0 ? Math.round((done / total) * 100) : 0;

      html +=
        '<a href="roadmap/index.html?path=' + p.path_id + '"' +
          ' class="block cursor-pointer group no-underline">' +
          '<div class="flex items-center justify-between mb-1">' +
            '<span class="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">' +
              p.title +
            '</span>' +
            '<span class="text-xs font-bold ml-2 shrink-0" style="color:' + p.color + '">' + pct + '%</span>' +
          '</div>' +
          PathCard.progressBar(pct, p.color, 4) +
        '</a>';
    });

    if (!anyDone) {
      html = '<p class="text-sm text-slate-400 text-center py-8">Belum ada path yang dimulai.</p>';
    }

    el.innerHTML = html;
  }

  // ── render: next steps ────────────────────────────────────
  function renderNextSteps() {
    var section = document.getElementById("next-steps-section");
    var grid    = document.getElementById("next-steps-grid");
    if (!section || !grid) return;

    var steps = calcNextSteps();

    if (steps.length === 0) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");
    grid.innerHTML = steps.map(function (step) {
      return '<a href="roadmap/index.html?path=' + step.pathId + '"' +
        ' class="card-interactive group no-underline">' +
        '<div class="flex items-start gap-3">' +
          '<div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"' +
               ' style="background:#FEF3C7;color:#F59E0B">' +
            ICONS.arrowRight +
          '</div>' +
          '<div>' +
            '<p class="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">' +
              step.nodeTitle +
            '</p>' +
            '<p class="text-xs text-slate-400 mt-0.5">' + step.pathTitle + '</p>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join("");
  }

  // ── export progress ───────────────────────────────────────
  function handleExport() {
    var data = JSON.stringify(ProgressStore.getProgress(), null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement("a");
    a.href     = url;
    a.download = "peta-karir-progress-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── render all ────────────────────────────────────────────
  function renderAll() {
    renderStatCards();
    renderProgressPerPath();
    renderPathSummary();
    renderNextSteps();
  }

  // ── init ─────────────────────────────────────────────────
  function init() {
    var overall = hitungOverall();
    Navbar.render(overall);
    Footer.render();

    var exportBtn = document.getElementById("btn-export");
    if (exportBtn) exportBtn.addEventListener("click", handleExport);

    renderAll();
  }

  // Re-render on progress change
  ProgressStore.subscribe(function () {
    renderAll();
    Navbar.updateProgress(hitungOverall());
  });

  document.addEventListener("DOMContentLoaded", init);

})();
