// SafeGuard - Popup Script

let config = null;
let stats = null;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  updateUI();
});

// Cargar datos
async function loadData() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  config = response.config;
  stats = response.stats;
}

// Configurar event listeners
function setupEventListeners() {
  // Toggle principal
  document.getElementById('mainToggle').addEventListener('change', async (e) => {
    if (config.security.passwordEnabled) {
      if (!await verifyPassword()) {
        e.target.checked = !e.target.checked;
        return;
      }
    }
    config.enabled = e.target.checked;
    await saveConfig();
    updateStatusIndicator();
  });
  
  // Level buttons
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (config.security.passwordEnabled) {
        if (!await verifyPassword()) {
          return;
        }
      }
      const level = btn.dataset.level;
      config.blockingLevel = level;
      await saveConfig();
      updateLevelButtons();
    });
  });
  
  // Setting toggles
  document.getElementById('textAnalysis').addEventListener('change', async (e) => {
    if (config.security.passwordEnabled) {
      if (!await verifyPassword()) {
        e.target.checked = !e.target.checked;
        return;
      }
    }
    config.textAnalysis.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('imageBlocking').addEventListener('change', async (e) => {
    if (config.security.passwordEnabled) {
      if (!await verifyPassword()) {
        e.target.checked = !e.target.checked;
        return;
      }
    }
    config.imageBlocking.enabled = e.target.checked;
    await saveConfig();
  });
  
  document.getElementById('urlFiltering').addEventListener('change', async (e) => {
    if (config.security.passwordEnabled) {
      if (!await verifyPassword()) {
        e.target.checked = !e.target.checked;
        return;
      }
    }
    config.urlFiltering.enabled = e.target.checked;
    await saveConfig();
  });
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', async () => {
    if (config.security.passwordEnabled) {
      if (!await verifyPassword()) {
        return;
      }
    }
    chrome.runtime.openOptionsPage();
  });
  
  // Security button
  document.getElementById('securityBtn').addEventListener('click', async () => {
    chrome.runtime.openOptionsPage();
    // Signal to open security tab
    chrome.storage.local.set({ openSecurityTab: true });
  });
  
  // Reset stats
  document.getElementById('resetStatsBtn').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de que quieres reiniciar las estadísticas?')) {
      await chrome.runtime.sendMessage({ type: 'RESET_STATS' });
      await loadData();
      updateStats();
    }
  });
  
  // Password modal handlers
  document.getElementById('verifyPasswordBtn').addEventListener('click', handlePasswordVerification);
  document.getElementById('cancelPasswordBtn').addEventListener('click', () => {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
  });
  
  document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handlePasswordVerification();
    }
  });
}

// Password verification
let passwordVerified = false;
let passwordCallback = null;

async function verifyPassword() {
  return new Promise((resolve) => {
    passwordCallback = resolve;
    document.getElementById('passwordModal').style.display = 'flex';
    document.getElementById('passwordInput').focus();
  });
}

async function handlePasswordVerification() {
  const password = document.getElementById('passwordInput').value;
  const response = await chrome.runtime.sendMessage({
    type: 'VERIFY_PASSWORD',
    password: password
  });
  
  if (response.valid) {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
    passwordVerified = true;
    if (passwordCallback) {
      passwordCallback(true);
      passwordCallback = null;
    }
  } else {
    document.getElementById('passwordError').textContent = 'Contraseña incorrecta';
    document.getElementById('passwordError').style.display = 'block';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
}

// Guardar configuración
async function saveConfig() {
  await chrome.runtime.sendMessage({
    type: 'UPDATE_CONFIG',
    config: config,
    bypassPassword: passwordVerified
  });
  
  passwordVerified = false; // Reset after use
  
  // Notificar a content scripts
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'CONFIG_UPDATED' }).catch(() => {});
  }
}

// Actualizar UI
function updateUI() {
  updateStatusIndicator();
  updateStats();
  updateLevelButtons();
  updateToggles();
}

// Actualizar indicador de estado
function updateStatusIndicator() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  if (config.enabled) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Activo';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Inactivo';
  }
}

// Actualizar estadísticas
function updateStats() {
  document.getElementById('websitesBlocked').textContent = stats.websitesBlocked;
  document.getElementById('imagesBlocked').textContent = stats.imagesBlocked;
  document.getElementById('totalBlocked').textContent = stats.totalBlocked;
  
  // Animar números
  animateValue('websitesBlocked', 0, stats.websitesBlocked, 500);
  animateValue('imagesBlocked', 0, stats.imagesBlocked, 500);
  animateValue('totalBlocked', 0, stats.totalBlocked, 500);
}

// Animar valores numéricos
function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// Actualizar botones de nivel
function updateLevelButtons() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.level === config.blockingLevel) {
      btn.classList.add('active');
    }
  });
}

// Actualizar toggles
function updateToggles() {
  document.getElementById('mainToggle').checked = config.enabled;
  document.getElementById('textAnalysis').checked = config.textAnalysis.enabled;
  document.getElementById('imageBlocking').checked = config.imageBlocking.enabled;
  document.getElementById('urlFiltering').checked = config.urlFiltering.enabled;
}

// Actualizar estadísticas periódicamente
setInterval(async () => {
  await loadData();
  updateStats();
}, 5000);
