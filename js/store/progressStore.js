var ProgressStore = (function() {

  var STORAGE_KEY   = "peta-karir-progress";
  var ACTIVE_KEY    = "peta-karir-active-path";
  var CHECKLIST_KEY = "peta-karir-checklist";

  var _progress   = {};
  var _activePath = null;
  var _checklist  = {}; // { "pathId__nodeId__idx": true/false }
  var _listeners  = [];

  function _load() {
    try {
      _progress  = JSON.parse(localStorage.getItem(STORAGE_KEY)   || "{}");
      _activePath= localStorage.getItem(ACTIVE_KEY) || null;
      _checklist = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}");
    } catch (e) {
      _progress   = {};
      _activePath = null;
      _checklist  = {};
    }
  }

  function _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(_checklist));
    if (_activePath) {
      localStorage.setItem(ACTIVE_KEY, _activePath);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
    _listeners.forEach(function(fn) { fn(); });
  }

  function subscribe(fn) { _listeners.push(fn); }

  function getProgress()           { return _progress; }
  function getActivePath()         { return _activePath; }
  function getPathProgress(pathId) { return _progress[pathId] || {}; }

  function setActivePath(pathId) {
    _activePath = pathId;
    _save();
  }

  function getDoneCount(pathId) {
    var pp = _progress[pathId] || {};
    return Object.values(pp).filter(function(s) { return s === "done"; }).length;
  }

  function getLearningCount(pathId) {
    var pp = _progress[pathId] || {};
    return Object.values(pp).filter(function(s) { return s === "learning"; }).length;
  }

  function getPercent(pathId, totalNodes) {
    if (!totalNodes) return 0;
    return Math.round((getDoneCount(pathId) / totalNodes) * 100);
  }

  function getNodeStatus(pathId, nodeId) {
    return (_progress[pathId] && _progress[pathId][nodeId]) || "not_started";
  }

  function setNodeStatus(pathId, nodeId, status) {
    if (!_progress[pathId]) _progress[pathId] = {};
    if (status === "not_started") {
      delete _progress[pathId][nodeId];
    } else {
      _progress[pathId][nodeId] = status;
    }
    _save();
  }

  function getChecklistItem(pathId, nodeId, idx) {
    var key = pathId + "__" + nodeId + "__" + idx;
    return !!_checklist[key];
  }

  function setChecklistItem(pathId, nodeId, idx, checked) {
    var key = pathId + "__" + nodeId + "__" + idx;
    if (checked) {
      _checklist[key] = true;
    } else {
      delete _checklist[key];
    }
    // save without triggering full subscribe (checklist doesn't affect progress stats)
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(_checklist));
  }

  _load();

  return {
    subscribe,
    getProgress,
    getActivePath,
    setActivePath,
    getPathProgress,
    getDoneCount,
    getLearningCount,
    getPercent,
    getNodeStatus,
    setNodeStatus,
    getChecklistItem,
    setChecklistItem,
  };

})();
