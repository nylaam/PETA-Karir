var PathCard = {
  icons: {
    "server":          `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    "monitor":         `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    "brain":           `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.14Z"/></svg>`,
    "shield":          `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    "git-branch":      `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
    "graduation-cap":  `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    "database":        `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  },

  getIcon: function(name) {
    return this.icons[name] || this.icons["database"];
  },

  progressBar: function(percent, color, height) {
    return `
      <div class="progress-track" style="height:${height}px">
        <div class="progress-fill" style="width:${percent}%; background:${color}; height:${height}px;"></div>
      </div>`;
  },

  tags: function(tagsArray) {
    return tagsArray.slice(0, 3).map(function(t) {
      return '<span class="tag">' + t + '</span>';
    }).join("");
  },

  activeBadge: function() {
    return `<span class="status-pill active-pill"><span class="dot"></span>Active</span>`;
  },

  competency: function(path, percent, done, isActive) {
    return `
      <a href="roadmap/index.html?path=${path.path_id}"
         class="card-interactive group animate-slide-up ${isActive ? "active" : ""}">

        <div class="flex items-start justify-between mb-4">
          <!-- Icon path -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center"
               style="background-color: ${path.color}18; color: ${path.color}">
            ${this.getIcon(path.icon)}
          </div>
          ${isActive ? this.activeBadge() : ""}
        </div>

        <h3 class="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          ${path.title}
        </h3>
        <p class="text-xs text-slate-400 mb-3 line-clamp-2">${path.description}</p>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1 mb-4">${this.tags(path.tags)}</div>

        <!-- Progress -->
        ${this.progressBar(percent, path.color, 4)}
        <div class="flex justify-between mt-2">
          <span class="text-xs text-slate-400">${done}/${path.nodes_count} skills</span>
          <span class="text-xs font-semibold" style="color: ${path.color}">${percent}%</span>
        </div>

      </a>`;
  },

  studyProgram: function(path, percent, done, isActive) {
    return `
      <a href="roadmap/index.html?path=${path.path_id}"
         class="card-interactive group flex gap-4 animate-slide-up ${isActive ? "active" : ""}">

        <!-- Icon -->
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
             style="background-color: ${path.color}18; color: ${path.color}">
          ${this.getIcon(path.icon)}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <h3 class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              ${path.title}
            </h3>
            ${isActive ? this.activeBadge() : ""}
          </div>
          <p class="text-xs text-slate-400 mb-2 line-clamp-1">${path.description}</p>
          ${this.progressBar(percent, path.color, 3)}
          <p class="text-xs text-slate-400 mt-1">${done}/${path.nodes_count} completed</p>
        </div>

      </a>`;
  },

};
