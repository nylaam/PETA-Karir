function hitungOverall() {
  var totalSkill  = PATHS.reduce(function(total, p) { return total + p.nodes_count; }, 0);
  var totalSelesai = PATHS.reduce(function(total, p) { return total + ProgressStore.getDoneCount(p.path_id); }, 0);
  return totalSkill > 0 ? Math.round((totalSelesai / totalSkill) * 100) : 0;
}

// Render Hero
function renderHero() {
  var activeId   = ProgressStore.getActivePath();
  var activePath = activeId ? PATHS.find(function(p) { return p.path_id === activeId; }) : null;
  var heroEl     = document.getElementById("hero-section");
  if (!heroEl) return;

  if (activePath) {
    heroEl.innerHTML = renderHeroContinue(activePath);
  } else {
    heroEl.innerHTML = renderHeroWelcome();
  }
}

// Hero saat belum ada path aktif
function renderHeroWelcome() {
  return `
    <div class="relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600
                p-8 sm:p-12 text-white animate-fade-in">
      <div class="hero-blob-1"></div>
      <div class="hero-blob-2"></div>

      <div class="relative z-10 max-w-2xl">
        <p class="text-sky-300 text-sm font-semibold uppercase tracking-wider mb-4">
          ✦ Selamat Datang di PETA Karir
        </p>
        <h1 class="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Your Learning<br>
          <span class="text-sky-300">Roadmap</span> Starts Here
        </h1>
        <p class="text-blue-200 text-lg mb-8 max-w-xl leading-relaxed">
          Platform roadmap belajar interaktif untuk mahasiswa FILKOM UB.
          Temukan jalur skill IT yang tepat untuk karirmu.
        </p>
        <a href="paths.html" class="btn btn-white btn-lg">
          Mulai Eksplorasi →
        </a>
      </div>
    </div>`;
}

// Hero saat sudah ada path aktif (continue learning)
function renderHeroContinue(activePath) {
  var done     = ProgressStore.getDoneCount(activePath.path_id);
  var percent  = ProgressStore.getPercent(activePath.path_id, activePath.nodes_count);
  var learning = Object.values(ProgressStore.getPathProgress(activePath.path_id))
                   .filter(function(s) { return s === "learning"; }).length;

  return `
    <div class="relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600
                p-8 text-white animate-fade-in">
      <div class="hero-blob-1"></div>
      <div class="hero-blob-2"></div>

      <div class="relative z-10">
        <p class="text-sky-300 text-sm font-semibold uppercase tracking-wider mb-2">
          ▶ Continue Learning
        </p>
        <h1 class="text-3xl sm:text-4xl font-extrabold mb-2">${activePath.title}</h1>
        <p class="text-blue-200 mb-6 max-w-xl">${activePath.description}</p>

        <!-- Statistik -->
        <div class="flex flex-wrap gap-6 mb-6">
          <div><p class="text-3xl font-bold">${percent}%</p><p class="text-xs text-blue-300">Completed</p></div>
          <div><p class="text-3xl font-bold">${done}</p><p class="text-xs text-blue-300">Skills Mastered</p></div>
          <div><p class="text-3xl font-bold">${learning}</p><p class="text-xs text-blue-300">In Progress</p></div>
        </div>

        <!-- Progress bar -->
        <div class="progress-track mb-6 max-w-md" style="height: 8px">
          <div class="progress-fill" style="width: ${percent}%; background: #38BDF8; height: 8px;"></div>
        </div>

        <!-- Tombol -->
        <div class="flex flex-wrap gap-3">
          <a href="roadmap.html?path=${activePath.path_id}" class="btn btn-white btn-lg">
            Continue Roadmap →
          </a>
          <a href="paths.html" class="btn btn-ghost btn-lg">
            Browse All Paths
          </a>
        </div>
      </div>
    </div>`;
}

// Render grid Competency Paths
function renderCompetencyGrid() {
  var grid     = document.getElementById("competency-grid");
  if (!grid) return;
  var activeId = ProgressStore.getActivePath();
  var paths    = PATHS.filter(function(p) { return p.category === "competency"; });

  grid.innerHTML = paths.map(function(path) {
    var done    = ProgressStore.getDoneCount(path.path_id);
    var percent = ProgressStore.getPercent(path.path_id, path.nodes_count);
    return PathCard.competency(path, percent, done, path.path_id === activeId);
  }).join("");
}

// Render grid Study Program Paths
function renderStudyGrid() {
  var grid     = document.getElementById("study-grid");
  if (!grid) return;
  var activeId = ProgressStore.getActivePath();
  var paths    = PATHS.filter(function(p) { return p.category === "study_program"; });

  grid.innerHTML = paths.map(function(path) {
    var done    = ProgressStore.getDoneCount(path.path_id);
    var percent = ProgressStore.getPercent(path.path_id, path.nodes_count);
    return PathCard.studyProgram(path, percent, done, path.path_id === activeId);
  }).join("");
}

function renderPage() {
  Navbar.render(hitungOverall());
  Footer.render();
  renderHero();
  renderCompetencyGrid();
  renderStudyGrid();
}

// Re-render setiap kali progress berubah
ProgressStore.subscribe(function() {
  renderHero();
  renderCompetencyGrid();
  renderStudyGrid();
  Navbar.updateProgress(hitungOverall());
});

document.addEventListener("DOMContentLoaded", renderPage);
