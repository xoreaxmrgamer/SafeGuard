// SafeGuard - Options Page Script

let config = null;
let stats = null;
let passwordVerified = false;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupNavigation();
  setupEventListeners();
  updateUI();
  
  // Check if should open security tab
  const stored = await chrome.storage.local.get(['openSecurityTab']);
  if (stored.openSecurityTab) {
    openTab('security');
    chrome.storage.local.remove(['openSecurityTab']);
  }
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
      openTab(tabName);
    });
  });
}

function openTab(tabName) {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');
  
  // Update nav
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  
  // Update tabs
  tabs.forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName + '-tab')?.classList.add('active');
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
  
  // NEW: Threshold inputs with auto-save
  document.getElementById('suspicionThreshold').addEventListener('change', async (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      if (!config.textAnalysis) config.textAnalysis = {};
      config.textAnalysis.suspicionThreshold = value;
      await saveConfig();
      showSaveBanner();
    }
  });
  
  document.getElementById('imageConfidenceThreshold').addEventListener('change', async (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 100) {
      if (!config.imageBlocking) config.imageBlocking = {};
      config.imageBlocking.confidenceThreshold = value;
      await saveConfig();
      showSaveBanner();
    }
  });
  
  document.getElementById('allowRevealToggle').addEventListener('change', async (e) => {
    if (!config.textAnalysis) config.textAnalysis = {};
    config.textAnalysis.allowReveal = e.target.checked;
    await saveConfig();
  });
  
  // NEW: Stats reset period
  document.getElementById('statsResetPeriod').addEventListener('change', async (e) => {
    if (!config.stats) config.stats = {};
    config.stats.resetPeriod = e.target.value;
    await saveConfig();
    showSaveBanner();
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
  
  // Security - Password setup
  document.getElementById('setPasswordBtn').addEventListener('click', async () => {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
      alert('Por favor, completa ambos campos de contraseña');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    
    const response = await chrome.runtime.sendMessage({
      type: 'SET_PASSWORD',
      password: newPassword
    });
    
    if (response.success) {
      config.security.passwordEnabled = true;
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      updateSecurityUI();
      showSaveBanner();
      alert('✅ Contraseña establecida correctamente. Tu configuración ahora está protegida.');
    }
  });
  
  document.getElementById('removePasswordBtn').addEventListener('click', async () => {
    const password = prompt('Introduce tu contraseña actual para desactivar la protección:');
    
    if (!password) return;
    
    const response = await chrome.runtime.sendMessage({
      type: 'DISABLE_PASSWORD',
      password: password
    });
    
    if (response.success) {
      config.security.passwordEnabled = false;
      config.security.passwordHash = null;
      updateSecurityUI();
      showSaveBanner();
      alert('✅ Protección por contraseña desactivada');
    } else {
      alert('❌ Contraseña incorrecta');
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
  
  // NEW: Load threshold values
  if (config.textAnalysis.suspicionThreshold !== undefined) {
    document.getElementById('suspicionThreshold').value = config.textAnalysis.suspicionThreshold;
  }
  if (config.imageBlocking.confidenceThreshold !== undefined) {
    document.getElementById('imageConfidenceThreshold').value = config.imageBlocking.confidenceThreshold;
  }
  if (config.textAnalysis.allowReveal !== undefined) {
    document.getElementById('allowRevealToggle').checked = config.textAnalysis.allowReveal;
  }
  if (config.stats && config.stats.resetPeriod) {
    document.getElementById('statsResetPeriod').value = config.stats.resetPeriod;
  }
  
  // Lists
  updateLists();
  
  // Stats
  updateStats();
  
  // Security
  updateSecurityUI();
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

// Update security UI
function updateSecurityUI() {
  const hasPassword = config.security.passwordEnabled;
  
  document.getElementById('noPasswordSection').style.display = hasPassword ? 'none' : 'block';
  document.getElementById('hasPasswordSection').style.display = hasPassword ? 'block' : 'none';
  
  if (hasPassword) {
    document.getElementById('securityIcon').textContent = '🔒';
    document.getElementById('securityStatusText').textContent = 'Protegido';
    document.getElementById('securityStatusDesc').textContent = 'La configuración está protegida por contraseña';
    document.getElementById('securityStatus').style.background = '#d1fae5';
  } else {
    document.getElementById('securityIcon').textContent = '🔓';
    document.getElementById('securityStatusText').textContent = 'Sin Protección';
    document.getElementById('securityStatusDesc').textContent = 'La configuración no está protegida por contraseña';
    document.getElementById('securityStatus').style.background = '#fee2e2';
  }
}
