var ProgressStore = (function() {

  // key menyimpan data di localStorage
  var STORAGE_KEY  = "peta-karir-progress";
  var ACTIVE_KEY   = "peta-karir-active-path";

  var _progress    = {};
  var _activePath  = null;
  var _listeners   = [];

  function _load() {
    try {
      _progress   = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      _activePath = localStorage.getItem(ACTIVE_KEY) || null;
    } catch (e) {
      _progress   = {};
      _activePath = null;
    }
  }

  // Simpan data ke localStorage
  function _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
    if (_activePath) {
      localStorage.setItem(ACTIVE_KEY, _activePath);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
    _listeners.forEach(function(fn) { fn(); });
  }

  // Public API
  // Daftar fungsi yang ingin dipanggil setiap ada perubahan data
  function subscribe(fn) {
    _listeners.push(fn);
  }

  // Ambil semua data progress
  function getProgress() {
    return _progress;
  }

  // Ambil ID path yang sedang aktif
  function getActivePath() {
    return _activePath;
  }

  // Set path mana yang sedang aktif
  function setActivePath(pathId) {
    _activePath = pathId;
    _save();
  }

  function getPathProgress(pathId) {
    return _progress[pathId] || {};
  }

  function getDoneCount(pathId) {
    var pp = _progress[pathId] || {};
    return Object.values(pp).filter(function(s) { return s === "done"; }).length;
  }

  function getPercent(pathId, totalNodes) {
    if (!totalNodes) return 0;
    return Math.round((getDoneCount(pathId) / totalNodes) * 100);
  }

  _load();

  return {
    subscribe,
    getProgress,
    getActivePath,
    setActivePath,
    getPathProgress,
    getDoneCount,
    getPercent,
  };

})();
