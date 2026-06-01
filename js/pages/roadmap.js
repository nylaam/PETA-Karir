// ============================================================
// js/pages/roadmap.js
// Dynamic roadmap page:
//   - URL param ?path=<pathId>
//   - Vertical node list with connector lines
//   - Status filter (all / not_started / learning / done)
//   - Side drawer with tabs: overview / checklist / resources
//   - Progress state via ProgressStore
// ============================================================

(function () {

  var _pathData      = null;
  var _pathId        = null;
  var _selectedId    = null;
  var _filterStatus  = "all";

  // ── icons (inline SVG) ─────────────────────────────────────
  var ICONS = {
    check: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    clock: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    x:     '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    chevron: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    externalLink: '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    fileText: '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    video:  '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    book:   '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    code:   '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    link:   '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    checkSmall: '<svg class="w-4 h-4 text-slate-300 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  };

  function resIcon(type) {
    var map = {
      course: ICONS.video, docs: ICONS.fileText, article: ICONS.fileText,
      video: ICONS.video, book: ICONS.book, practice: ICONS.code,
      interactive: ICONS.code, research: ICONS.fileText,
    };
    return map[type] || ICONS.link;
  }

  // ── helpers ─────────────────────────────────────────────────
  function hitungOverall() {
    var total = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var done  = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  function getStatus(nodeId) {
    return ProgressStore.getNodeStatus(_pathId, nodeId);
  }

  // ── topbar update ─────────────────────────────────────────
  function updateTopbar() {
    var done     = ProgressStore.getDoneCount(_pathId);
    var learning = ProgressStore.getLearningCount(_pathId);
    var total    = _pathData.nodes_count || _pathData.nodes.length;
    var percent  = ProgressStore.getPercent(_pathId, total);

    var title = document.getElementById("topbar-title");
    var sub   = document.getElementById("topbar-sub");
    var sDone = document.getElementById("stat-done");
    var sLearn= document.getElementById("stat-learning");

    if (title) title.textContent = _pathData.title;
    if (sub)   sub.textContent   = done + "/" + total + " nodes · " + percent + "% complete";
    if (sDone) sDone.textContent  = done;
    if (sLearn)sLearn.textContent = learning;
  }

  // ── node list rendering ────────────────────────────────────
  function renderNodes() {
    var container = document.getElementById("roadmap-nodes");
    if (!container) return;

    var nodes   = _pathData.nodes;
    var html    = "";

    nodes.forEach(function (node, idx) {
      var status    = getStatus(node.id);
      var isHidden  = _filterStatus !== "all" && status !== _filterStatus;
      var isSelected= node.id === _selectedId;

      // Connector line (between cards)
      if (idx > 0) {
        html += '<div class="node-connector"></div>';
      }

      // Node card
      html += '<div class="node-card' +
        (isSelected ? " selected" : "") +
        (isHidden   ? " filtered-out" : "") +
        '" data-node-id="' + node.id + '" id="nc-' + node.id + '">';

      // Status dot
      html += '<div class="node-status-dot ' + status + '"></div>';

      // Content
      html += '<div class="flex-1 min-w-0">';

      // Title row
      html += '<div class="flex items-start justify-between gap-2 mb-1">';
      html += '<h3 class="font-bold text-sm text-slate-900 leading-snug">' + node.title + '</h3>';
      html += '<div class="flex items-center gap-1.5 shrink-0">';
      html += '<span class="level-badge ' + node.level + '">' + node.level + '</span>';
      if (node.semester) {
        html += '<span class="level-badge" style="background:#F3E8FF;color:#6D28D9">Sem ' + node.semester + '</span>';
      }
      html += '</div></div>';

      // Description
      html += '<p class="text-xs text-slate-400 line-clamp-2 mb-2">' + node.description + '</p>';

      // Tags
      if (node.tags && node.tags.length) {
        html += '<div class="flex flex-wrap gap-1">';
        node.tags.forEach(function (t) {
          html += '<span class="tag">' + t + '</span>';
        });
        html += '</div>';
      }

      html += '</div>'; // end content
      html += '</div>'; // end node-card
    });

    container.innerHTML = html;

    // Bind clicks
    container.querySelectorAll(".node-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var nodeId = this.getAttribute("data-node-id");
        if (_selectedId === nodeId) {
          _selectedId = null;
          closeDrawer();
        } else {
          _selectedId = nodeId;
          openDrawer(nodeId);
        }
        // update selected state on cards
        container.querySelectorAll(".node-card").forEach(function (c) {
          c.classList.toggle("selected", c.getAttribute("data-node-id") === _selectedId);
        });
      });
    });
  }

  // ── drawer ────────────────────────────────────────────────
  var _activeTab = "overview";

  function openDrawer(nodeId) {
    var node = _pathData.nodes.find(function (n) { return n.id === nodeId; });
    if (!node) return;
    _activeTab = "overview";
    renderDrawer(node);
    var drawer = document.getElementById("node-drawer");
    if (drawer) {
      drawer.classList.remove("hidden");
      drawer.classList.add("drawer-animate");
    }
  }

  function closeDrawer() {
    var drawer = document.getElementById("node-drawer");
    if (drawer) drawer.classList.add("hidden");
  }

  function renderDrawer(node) {
    var drawer = document.getElementById("node-drawer");
    if (!drawer) return;

    var status  = getStatus(node.id);
    var statusLabel = status === "done" ? "Completed" : status === "learning" ? "Learning" : "Not Started";
    var statusClass = status === "done" ? "status-pill-done" : status === "learning" ? "status-pill-learning" : "status-pill-ns";

    // ── Header ────────────────────────────────────
    var html = '<div class="p-5 border-b border-slate-100">';
    html += '<div class="flex items-start justify-between gap-2 mb-3">';
    html += '<h2 class="font-bold text-base text-slate-900 leading-snug">' + node.title + '</h2>';
    html += '<button id="drawer-close" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">' + ICONS.x + '</button>';
    html += '</div>';

    // Badges
    html += '<div class="flex flex-wrap gap-2 mb-3">';
    html += '<span class="status-pill ' + statusClass + ' text-xs px-2.5 py-1 rounded-full font-medium">' + statusLabel + '</span>';
    html += '<span class="level-badge ' + node.level + '">' + node.level + '</span>';
    if (node.semester) {
      html += '<span class="level-badge" style="background:#F3E8FF;color:#6D28D9">Semester ' + node.semester + '</span>';
    }
    html += '</div>';

    // Action buttons
    html += '<div class="flex gap-2">';
    html += '<button id="btn-learning" class="action-btn' + (status === "learning" ? " active-learning" : "") + '" data-node-id="' + node.id + '">';
    html += ICONS.clock + (status === "learning" ? "Unmark" : "Mark Learning");
    html += '</button>';
    html += '<button id="btn-done" class="action-btn' + (status === "done" ? " active-done" : "") + '" data-node-id="' + node.id + '">';
    html += ICONS.check + (status === "done" ? "Completed ✓" : "Mark Done");
    html += '</button>';
    html += '</div>';
    html += '</div>'; // end header

    // ── Tabs ──────────────────────────────────────
    html += '<div class="flex border-b border-slate-100">';
    ["overview", "checklist", "resources"].forEach(function (tab) {
      html += '<button class="drawer-tab' + (_activeTab === tab ? " active" : "") +
        '" data-tab="' + tab + '">' + tab.charAt(0).toUpperCase() + tab.slice(1) + '</button>';
    });
    html += '</div>';

    // ── Tab content ───────────────────────────────
    html += '<div class="p-5 overflow-y-auto max-h-[60vh]" style="scrollbar-width:thin">';

    if (_activeTab === "overview") {
      html += '<p class="text-sm text-slate-600 leading-relaxed mb-4">' + node.description + '</p>';
      if (node.tags && node.tags.length) {
        html += '<p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topics</p>';
        html += '<div class="flex flex-wrap gap-1.5 mb-4">';
        node.tags.forEach(function (t) {
          html += '<span class="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">' + t + '</span>';
        });
        html += '</div>';
      }
      if (node.connections && node.connections.length) {
        html += '<p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Leads To</p>';
        html += '<div class="flex flex-col gap-1">';
        node.connections.forEach(function (conn) {
          var target = _pathData.nodes.find(function (n) { return n.id === conn; });
          html += '<div class="flex items-center gap-2 text-sm text-slate-500">' +
            ICONS.chevron + '<span>' + (target ? target.title : conn) + '</span></div>';
        });
        html += '</div>';
      }
    }

    if (_activeTab === "checklist") {
      html += '<p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Learning Objectives</p>';
      if (node.checklist && node.checklist.length) {
        node.checklist.forEach(function (item, idx) {
          var checked = ProgressStore.getChecklistItem(_pathId, node.id, idx);
          var rowBg   = checked ? 'background:#F0FDF4;border-color:#BBF7D0' : 'background:#F8FAFC;border-color:#F1F5F9';
          var iconColor = checked ? '#10B981' : '#CBD5E1';
          var textColor = checked ? '#15803D' : '#475569';
          html +=
            '<div class="checklist-item flex items-start gap-2.5 p-3 rounded-lg border mb-2 cursor-pointer select-none transition-all"' +
              ' style="' + rowBg + '"' +
              ' data-checklist-idx="' + idx + '">' +
            '<svg class="w-4 h-4 mt-0.5 shrink-0 transition-colors" style="color:' + iconColor + '"' +
                 ' viewBox="0 0 24 24" fill="' + (checked ? iconColor : 'none') + '" stroke="' + iconColor + '" stroke-width="2">' +
              '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' +
            '</svg>' +
            '<span class="text-sm transition-colors" style="color:' + textColor + (checked ? ';text-decoration:line-through;opacity:0.7' : '') + '">' +
              item +
            '</span>' +
            '</div>';
        });
      } else {
        html += '<p class="text-sm text-slate-400">Belum ada checklist tersedia.</p>';
      }
    }

    if (_activeTab === "resources") {
      html += '<p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Curated Resources</p>';
      if (node.resources && node.resources.length) {
        node.resources.forEach(function (res) {
          html += '<a href="' + res.url + '" target="_blank" rel="noopener noreferrer"' +
            ' class="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50' +
            ' hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group mb-2 no-underline">';
          html += '<span class="text-slate-400 shrink-0 mt-0.5">' + resIcon(res.type) + '</span>';
          html += '<div class="flex-1 min-w-0">';
          html += '<p class="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate">' + res.title + '</p>';
          html += '<p class="text-xs text-slate-400 capitalize">' + res.type + '</p>';
          html += '</div>';
          html += '<span class="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">' + ICONS.externalLink + '</span>';
          html += '</a>';
        });
      } else {
        html += '<p class="text-sm text-slate-400">Belum ada resource tersedia.</p>';
      }
    }

    html += '</div>'; // end tab content
    drawer.innerHTML = html;

    // Bind close button
    var closeBtn = document.getElementById("drawer-close");
    if (closeBtn) closeBtn.addEventListener("click", function () {
      _selectedId = null;
      closeDrawer();
      document.querySelectorAll(".node-card").forEach(function (c) { c.classList.remove("selected"); });
    });

    // Bind tab buttons
    drawer.querySelectorAll(".drawer-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        _activeTab = this.getAttribute("data-tab");
        renderDrawer(node);
      });
    });

    // Bind checklist item clicks
    drawer.querySelectorAll(".checklist-item").forEach(function (row) {
      row.addEventListener("click", function () {
        var idx     = parseInt(this.getAttribute("data-checklist-idx"), 10);
        var current = ProgressStore.getChecklistItem(_pathId, node.id, idx);
        ProgressStore.setChecklistItem(_pathId, node.id, idx, !current);
        // Re-render drawer tab without triggering full subscribe
        renderDrawer(node);
      });
    });

    // Bind action buttons
    var btnLearn = document.getElementById("btn-learning");
    if (btnLearn) btnLearn.addEventListener("click", function () {
      var cur = getStatus(node.id);
      ProgressStore.setNodeStatus(_pathId, node.id, cur === "learning" ? "not_started" : "learning");
    });

    var btnDone = document.getElementById("btn-done");
    if (btnDone) btnDone.addEventListener("click", function () {
      var cur = getStatus(node.id);
      ProgressStore.setNodeStatus(_pathId, node.id, cur === "done" ? "not_started" : "done");
    });
  }

  // ── filter buttons ─────────────────────────────────────────
  function bindFilterButtons() {
    document.querySelectorAll(".filter-status-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        _filterStatus = this.getAttribute("data-filter");
        document.querySelectorAll(".filter-status-btn").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        renderNodes();
      });
    });
  }

  // ── init ──────────────────────────────────────────────────
  function init() {
    var params = new URLSearchParams(window.location.search);
    _pathId    = params.get("path");

    // Compute overall for navbar
    var total   = PATHS.reduce(function (a, p) { return a + p.nodes_count; }, 0);
    var done    = PATHS.reduce(function (a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
    var overall = total > 0 ? Math.round((done / total) * 100) : 0;

    // Navbar needs paths relative to roadmap/ subfolder
    // Override Navbar menuItems hrefs to go one level up
    Navbar.menuItems = [
      { href: "../paths.html",     label: "Path",      icon: "book-open" },
      { href: "../dashboard.html", label: "Dashboard", icon: "layout-dashboard" },
      { href: "../settings.html",  label: "Settings",  icon: "settings" },
    ];
    Navbar.render(overall, "../");
    Footer.render();

    var loading  = document.getElementById("loading-state");
    var notFound = document.getElementById("not-found");
    var layout   = document.getElementById("roadmap-layout");
    var topbar   = document.getElementById("roadmap-topbar");

    // Hide loading
    if (loading) loading.classList.add("hidden");

    if (!_pathId) {
      if (notFound) notFound.classList.remove("hidden");
      return;
    }

    _pathData = PATHS.find(function (p) { return p.path_id === _pathId; });

    if (!_pathData) {
      if (notFound) notFound.classList.remove("hidden");
      return;
    }

    // Set active path
    ProgressStore.setActivePath(_pathId);

    // Show layout
    if (layout) layout.classList.remove("hidden");
    if (topbar) topbar.classList.remove("hidden");

    // Update page title
    document.title = _pathData.title + " — PETA Karir";

    updateTopbar();
    bindFilterButtons();
    renderNodes();
  }

  // ── re-render on progress change ──────────────────────────
  ProgressStore.subscribe(function () {
    if (!_pathData) return;
    updateTopbar();
    renderNodes();
    // Re-open drawer for selected node to reflect new status
    if (_selectedId) {
      var node = _pathData.nodes.find(function (n) { return n.id === _selectedId; });
      if (node) renderDrawer(node);
    }
    Navbar.updateProgress(hitungOverall());
  });

  document.addEventListener("DOMContentLoaded", init);

})();
