// ============================================================
// js/components/Footer.js
// Komponen footer yang muncul di semua halaman.
// Cara pakai: panggil Footer.render() di setiap halaman.
// ============================================================

var Footer = {
  menuItems: [
    { href: "paths.html",     label: "Paths" },
    { href: "dashboard.html", label: "Dashboard" },
    { href: "settings.html",  label: "Settings" },
  ],

  render: function(basePath) {
    var el = document.getElementById("footer");
    if (!el) return;

    var base = basePath || "";
    var year = new Date().getFullYear();

    var linksHTML = this.menuItems.map(function(item) {
      return '<a href="' + base + item.href + '" class="text-slate-400 hover:text-white text-sm transition-colors">' + item.label + '</a>';
    }).join("");

    el.innerHTML = `
      <footer class="bg-slate-900 text-slate-300 mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div class="grid sm:grid-cols-2 gap-8 items-start">

            <!-- Brand -->
            <div>
              <a href="${base}index.html" class="inline-flex items-center gap-2.5 mb-4 no-underline">
                <img src="${base}images/logo.png" alt="PETA Karir Logo" class="w-8 h-8 object-contain" />
                <span class="font-bold text-lg text-white">
                  PETA <span class="text-sky-400">Karir</span>
                </span>
              </a>
              <p class="text-slate-400 text-sm leading-relaxed max-w-xs">
                Platform roadmap belajar interaktif untuk mahasiswa FILKOM UB.
              </p>
            </div>

            <!-- Navigasi -->
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Navigasi</p>
              <nav class="flex flex-col gap-2">
                ${linksHTML}
              </nav>
            </div>

          </div>

          <!-- Copyright -->
          <div class="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            Copyright &copy;${year} PETA Karir by Kelompok .. DDAP TI. All rights reserved.
          </div>

        </div>
      </footer>`;
  },

};
