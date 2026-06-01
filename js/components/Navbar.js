var Navbar = {
  menuItems: [
    { href: "paths.html",     label: "Path",      icon: "book-open" },
    { href: "dashboard.html", label: "Dashboard", icon: "layout-dashboard" },
    { href: "settings.html",  label: "Settings",  icon: "settings" },
  ],

  icons: {
    "map": `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,
    "book-open": `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    "layout-dashboard": `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    "settings": `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    "trending-up": `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  },

  getIcon: function(name) {
    return this.icons[name] || "";
  },

  render: function(overallPercent, basePath) {
    var el = document.getElementById("navbar");
    if (!el) return;

    // basePath: '' for root pages, '../' for subfolders like roadmap/
    var base = basePath || "";
    var currentPage = window.location.pathname.split("/").pop() || "index.html";

    var menuHTML = this.menuItems.map(function(item) {
      // Extract just the filename for comparison (strips ../ prefix)
      var itemFile = item.href.split("/").pop();
      var isActive = currentPage === itemFile;
      var activeClass = isActive
        ? "bg-blue-50 text-blue-600 font-semibold"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100";
      return `<a href="${item.href}" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${activeClass}">
        ${Navbar.getIcon(item.icon)}
        ${item.label}
      </a>`;
    }).join("");

    var logoHref = base + "index.html";

    el.style.position = "fixed";
    el.style.top       = "0";
    el.style.left      = "0";
    el.style.right     = "0";
    el.style.zIndex    = "9999";

    el.innerHTML = `
      <header class="glass" style="width:100%;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">

            <!-- Logo -->
            <a href="${logoHref}" class="flex items-center gap-2.5 no-underline">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   style="background: white; border: 1.5px solid #DBEAFE;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
              </div>
              <span class="font-bold text-xl text-slate-900">
                PETA <span class="text-blue-600">Karir</span>
              </span>
              <span class="hidden sm:inline text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                FILKOM UB
              </span>
            </a>

            <!-- Menu navigasi -->
            <nav class="hidden sm:flex items-center gap-1">
              ${menuHTML}
            </nav>

            <!-- Pill progress -->
            <div class="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span class="text-blue-600">${this.getIcon("trending-up")}</span>
              <span id="nav-progress-label" class="text-xs font-semibold text-slate-500">
                ${overallPercent}% overall
              </span>
              <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div id="nav-progress-fill"
                     class="h-full rounded-full transition-all duration-500"
                     style="width: ${overallPercent}%; background: linear-gradient(90deg, #2563EB, #38BDF8);">
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>`;
  },

  updateProgress: function(percent) {
    var label = document.getElementById("nav-progress-label");
    var fill  = document.getElementById("nav-progress-fill");
    if (label) label.textContent = percent + "% overall";
    if (fill)  fill.style.width  = percent + "%";
  },

};