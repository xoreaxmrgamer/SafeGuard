// SafeGuard - Options Page Script

let config = null;
let stats = null;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupNavigation();
  setupEventListeners();
  updateUI();
});

// Cargar datos
async function loadData() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  config = response.config;
  stats = response.stats;
}

// Configurar navegación
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;
      
      // Update nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update tabs
      tabs.forEach(tab => tab.classList.remove('active'));
      document.getElementById(tabName + '-tab').classList.add('active');
    });
  });
}

// Configurar event listeners
function setupEventListeners() {
  // General settings
  document.getElementById('enabledToggle').addEventListener('change', async (e) => {
    config.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('blockingLevelSelect').addEventListener('change', async (e) => {
    config.blockingLevel = e.target.value;
    await saveConfig();
  });
  
  document.getElementById('showBadgeToggle').addEventListener('change', async (e) => {
    config.notifications.showBlockedCount = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('showWarningsToggle').addEventListener('change', async (e) => {
    config.notifications.showWarnings = e.target.checked;
    await saveConfig();
  });
  
  // Detection settings
  document.getElementById('textAnalysisToggle').addEventListener('change', async (e) => {
    config.textAnalysis.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('sensitivitySelect').addEventListener('change', async (e) => {
    config.textAnalysis.sensitivity = e.target.value;
    await saveConfig();
  });
  
  document.getElementById('scanDepthSelect').addEventListener('change', async (e) => {
    config.textAnalysis.scanDepth = e.target.value;
    await saveConfig();
  });
  
  document.getElementById('imageDetectionToggle').addEventListener('change', async (e) => {
    config.imageBlocking.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('blockSuspiciousToggle').addEventListener('change', async (e) => {
    config.imageBlocking.blockSuspiciousImages = e.target.checked;
    await saveConfig();
  });
  
  // Blocking settings
  document.getElementById('blurInsteadToggle').addEventListener('change', async (e) => {
    config.imageBlocking.blurInsteadOfBlock = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('strictDomainToggle').addEventListener('change', async (e) => {
    config.domainBlocking.strictMode = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('urlFilteringToggle').addEventListener('change', async (e) => {
    config.urlFiltering.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('useBlacklistToggle').addEventListener('change', async (e) => {
    config.urlFiltering.useBlacklist = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('patternMatchToggle').addEventListener('change', async (e) => {
    config.urlFiltering.usePatternMatching = e.target.checked;
    await saveConfig();
  });
  
  // Lists management
  document.getElementById('addWhitelistBtn').addEventListener('click', () => {
    const input = document.getElementById('whitelistInput');
    const domain = input.value.trim();
    if (domain) {
      addToWhitelist(domain);
      input.value = '';
    }
  });
  
  document.getElementById('whitelistInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('addWhitelistBtn').click();
    }
  });
  
  document.getElementById('addBlacklistBtn').addEventListener('click', () => {
    const input = document.getElementById('blacklistInput');
    const domain = input.value.trim();
    if (domain) {
      addToBlacklist(domain);
      input.value = '';
    }
  });
  
  document.getElementById('blacklistInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('addBlacklistBtn').click();
    }
  });
  
  // Advanced settings
  document.getElementById('statsTrackingToggle').addEventListener('change', async (e) => {
    config.statsTracking = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('exportConfigBtn').addEventListener('click', exportConfig);
  document.getElementById('importConfigBtn').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  
  document.getElementById('importFileInput').addEventListener('change', importConfig);
  
  document.getElementById('resetAllBtn').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto? Esta acción no se puede deshacer.')) {
      await chrome.runtime.sendMessage({ type: 'RESET_CONFIG' });
      location.reload();
    }
  });
  
  // Stats
  document.getElementById('resetStatsAllBtn').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
      await chrome.runtime.sendMessage({ type: 'RESET_STATS' });
      await loadData();
      updateStats();
    }
  });
}

// Guardar configuración
async function saveConfig() {
  await chrome.runtime.sendMessage({
    type: 'UPDATE_CONFIG',
    config: config
  });
  showSaveBanner();
}

// Mostrar banner de guardado
function showSaveBanner() {
  const banner = document.getElementById('saveBanner');
  banner.classList.add('show');
  setTimeout(() => {
    banner.classList.remove('show');
  }, 3000);
}

// Actualizar UI
function updateUI() {
  // General
  document.getElementById('enabledToggle').checked = config.enabled;
  document.getElementById('blockingLevelSelect').value = config.blockingLevel;
  document.getElementById('showBadgeToggle').checked = config.notifications.showBlockedCount;
  document.getElementById('showWarningsToggle').checked = config.notifications.showWarnings;
  
  // Detection
  document.getElementById('textAnalysisToggle').checked = config.textAnalysis.enabled;
  document.getElementById('sensitivitySelect').value = config.textAnalysis.sensitivity;
  document.getElementById('scanDepthSelect').value = config.textAnalysis.scanDepth;
  document.getElementById('imageDetectionToggle').checked = config.imageBlocking.enabled;
  document.getElementById('blockSuspiciousToggle').checked = config.imageBlocking.blockSuspiciousImages;
  
  // Blocking
  document.getElementById('blurInsteadToggle').checked = config.imageBlocking.blurInsteadOfBlock;
  document.getElementById('strictDomainToggle').checked = config.domainBlocking.strictMode;
  document.getElementById('urlFilteringToggle').checked = config.urlFiltering.enabled;
  document.getElementById('useBlacklistToggle').checked = config.urlFiltering.useBlacklist;
  document.getElementById('patternMatchToggle').checked = config.urlFiltering.usePatternMatching;
  
  // Advanced
  document.getElementById('statsTrackingToggle').checked = config.statsTracking;
  
  // Lists
  updateLists();
  
  // Stats
  updateStats();
}

// Actualizar listas
function updateLists() {
  // Whitelist
  const whitelistContainer = document.getElementById('whitelistContainer');
  if (config.whitelist.length === 0) {
    whitelistContainer.innerHTML = '<p class="list-empty">No hay dominios en la lista blanca</p>';
  } else {
    whitelistContainer.innerHTML = config.whitelist.map(domain => `
      <div class="list-item">
        <span class="list-item-text">${domain}</span>
        <button class="list-item-remove" onclick="removeFromWhitelist('${domain}')">Eliminar</button>
      </div>
    `).join('');
  }
  
  // Blacklist
  const blacklistContainer = document.getElementById('blacklistContainer');
  if (config.customBlacklist.length === 0) {
    blacklistContainer.innerHTML = '<p class="list-empty">No hay dominios personalizados bloqueados</p>';
  } else {
    blacklistContainer.innerHTML = config.customBlacklist.map(domain => `
      <div class="list-item">
        <span class="list-item-text">${domain}</span>
        <button class="list-item-remove" onclick="removeFromBlacklist('${domain}')">Eliminar</button>
      </div>
    `).join('');
  }
}

// Agregar a whitelist
async function addToWhitelist(domain) {
  if (!config.whitelist.includes(domain)) {
    config.whitelist.push(domain);
    await saveConfig();
    updateLists();
  }
}

// Eliminar de whitelist
window.removeFromWhitelist = async function(domain) {
  config.whitelist = config.whitelist.filter(d => d !== domain);
  await saveConfig();
  updateLists();
}

// Agregar a blacklist
async function addToBlacklist(domain) {
  if (!config.customBlacklist.includes(domain)) {
    config.customBlacklist.push(domain);
    await saveConfig();
    updateLists();
  }
}

// Eliminar de blacklist
window.removeFromBlacklist = async function(domain) {
  config.customBlacklist = config.customBlacklist.filter(d => d !== domain);
  await saveConfig();
  updateLists();
}

// Actualizar estadísticas
function updateStats() {
  document.getElementById('statsWebsites').textContent = stats.websitesBlocked;
  document.getElementById('statsImages').textContent = stats.imagesBlocked;
  document.getElementById('statsRequests').textContent = stats.requestsBlocked;
  document.getElementById('statsTotal').textContent = stats.totalBlocked;
  
  // Last reset
  const lastReset = new Date(stats.lastReset);
  const now = new Date();
  const diff = now - lastReset;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  let lastResetText = 'Hace ';
  if (days === 0) {
    lastResetText += 'hoy';
  } else if (days === 1) {
    lastResetText += '1 día';
  } else {
    lastResetText += days + ' días';
  }
  
  document.getElementById('lastResetInfo').textContent = lastResetText;
}

// Exportar configuración
function exportConfig() {
  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'safeguard-config.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Importar configuración
async function importConfig(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importedConfig = JSON.parse(text);
    
    // Validar estructura básica
    if (typeof importedConfig === 'object') {
      config = { ...config, ...importedConfig };
      await saveConfig();
      updateUI();
      alert('Configuración importada correctamente');
    }
  } catch (error) {
    alert('Error al importar la configuración: ' + error.message);
  }
  
  // Reset input
  event.target.value = '';
}
