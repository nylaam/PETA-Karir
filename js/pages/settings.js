var PROGRESS_KEY    = "peta-karir-progress";
var ACTIVE_PATH_KEY = "peta-karir-active-path";
var LAST_UPDATE_KEY = "peta-karir-last-updated";

function hitungOverall() {
  var totalSkill   = PATHS.reduce(function(a, p) { return a + p.nodes_count; }, 0);
  var totalSelesai = PATHS.reduce(function(a, p) { return a + ProgressStore.getDoneCount(p.path_id); }, 0);
  return totalSkill > 0 ? Math.round((totalSelesai / totalSkill) * 100) : 0;
}

function renderDataStorage() {
  var rawData   = localStorage.getItem(PROGRESS_KEY) || "{}";
  var sizeBytes = new Blob([rawData]).size;
  var sizeKB    = (sizeBytes / 1024).toFixed(2);

  var progress      = JSON.parse(rawData);
  var pathsWithData = Object.keys(progress).length;

  var lastUpdated = localStorage.getItem(LAST_UPDATE_KEY) || null;
  var tanggal     = lastUpdated ? new Date(lastUpdated).toLocaleDateString("id-ID") : "—";

  document.getElementById("data-size").textContent    = sizeKB + " KB";
  document.getElementById("paths-count").textContent  = pathsWithData;
  document.getElementById("last-updated").textContent = tanggal;
}

function exportProgress() {
  var data = {
    exported_at: new Date().toISOString(),
    progress: JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"),
  };

  var blob     = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url      = URL.createObjectURL(blob);
  var link     = document.createElement("a");
  link.href    = url;
  link.download = "peta-karir-progress.json";
  link.click();
  URL.revokeObjectURL(url);

  tampilToast("File progress berhasil didownload");
}

function prosesImport(file) {
  if (!file || file.type !== "application/json") {
    tampilToast("File harus berformat .json");
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);

      if (!data.progress || typeof data.progress !== "object") {
        tampilToast("⚠ Format file tidak valid");
        return;
      }

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress));
      localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());

      renderDataStorage();
      Navbar.updateProgress(hitungOverall());
      tampilToast("Progress berhasil diimport");

    } catch (err) {
      tampilToast("File tidak bisa dibaca");
    }
  };
  reader.readAsText(file);
}

// Handler untuk klik pilih file
function handleFileInput(event) {
  prosesImport(event.target.files[0]);
}

// Handler untuk drag file
function handleDragOver(event) {
  event.preventDefault();
  document.getElementById("drop-zone").style.borderColor = "#2563EB";
  document.getElementById("drop-zone").style.background  = "#EFF6FF";
}

// Handler untuk drop file 
function handleDrop(event) {
  event.preventDefault();
  document.getElementById("drop-zone").style.borderColor = "";
  document.getElementById("drop-zone").style.background  = "";

  var file = event.dataTransfer.files[0];
  prosesImport(file);
}

// Reset semua progress 
function konfirmasiReset() {
  var yakin = confirm("Yakin mau reset semua progress? Ini tidak bisa dibatalkan.");
  if (!yakin) return;

  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(ACTIVE_PATH_KEY);
  localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());

  renderDataStorage();
  Navbar.updateProgress(0);
  tampilToast("Progress berhasil direset");
}

// Toast notifikasi 
function tampilToast(pesan) {
  var toast = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = pesan;

  toast.style.display = "flex";
  toast.classList.remove("hidden");

  setTimeout(function() {
    toast.style.display = "none";
  }, 2500);
}

document.addEventListener("DOMContentLoaded", function() {
  Navbar.render(hitungOverall());
  Footer.render();
  renderDataStorage();
});