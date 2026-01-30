// SafeGuard - Background Service Worker
// Gestión central de detección, bloqueo y configuración

const DEFAULT_CONFIG = {
  enabled: true,
  blockingLevel: 'moderate', // 'strict', 'moderate', 'permissive'
  textAnalysis: {
    enabled: true,
    sensitivity: 'high', // 'low', 'medium', 'high'
    scanDepth: 'full', // 'quick', 'normal', 'full'
    suspicionThreshold: 3, // NEW: How many keyword matches for permanent block
    allowReveal: true // NEW: Allow revealing low-suspicion content
  },
  imageBlocking: {
    enabled: true,
    blockSuspiciousImages: true,
    blurInsteadOfBlock: false,
    confidenceThreshold: 20 // NEW: Score threshold for high-confidence blocking
  },
  urlFiltering: {
    enabled: true,
    useBlacklist: true,
    usePatternMatching: true
  },
  domainBlocking: {
    enabled: true,
    strictMode: true
  },
  notifications: {
    showBlockedCount: true,
    showWarnings: true
  },
  whitelist: [],
  customBlacklist: [],
  statsTracking: true,
  stats: {
    resetPeriod: 'never', // NEW: Auto-reset period
    lastAutoReset: null
  },
  security: {
    passwordEnabled: false,
    passwordHash: null
  }
};

// Patrones de detección multinivel
const DETECTION_PATTERNS = {
  strict: {
    keywords: [
      // Términos explícitos (lista reducida para ejemplo)
      'porn', 'xxx', 'sex', 'nude', 'naked', 'adult', 'nsfw',
      'erotic', 'explicit', 'hardcore', 'softcore', 'hentai',
      'camgirl', 'webcam', 'onlyfans', 'stripper', 'escort'
    ],
    urlPatterns: [
      /porn/i, /xxx/i, /sex/i, /nude/i, /nsfw/i, /adult/i,
      /erotic/i, /xvideos/i, /pornhub/i, /xhamster/i, /redtube/i,
      /youporn/i, /tube8/i, /spankwire/i, /keezmovies/i
    ],
    domainKeywords: [
      'porn', 'xxx', 'sex', 'adult', 'nsfw', 'nude', 'cam', 'tube'
    ]
  },
  moderate: {
    keywords: [
      'porn', 'xxx', 'explicit', 'hardcore', 'nsfw', 'adult'
    ],
    urlPatterns: [
      /porn/i, /xxx/i, /nsfw/i, /explicit/i
    ],
    domainKeywords: [
      'porn', 'xxx', 'adult'
    ]
  },
  permissive: {
    keywords: [
      'porn', 'xxx', 'hardcore'
    ],
    urlPatterns: [
      /porn/i, /xxx/i
    ],
    domainKeywords: [
      'porn', 'xxx'
    ]
  }
};

// Dominios conocidos a bloquear
const KNOWN_BLOCKED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com',
  'redtube.com', 'youporn.com', 'tube8.com', 'spankwire.com'
];

let config = { ...DEFAULT_CONFIG };
let stats = {
  totalBlocked: 0,
  websitesBlocked: 0,
  imagesBlocked: 0,
  requestsBlocked: 0,
  lastReset: Date.now()
};

// Inicialización
chrome.runtime.onInstalled.addListener(async () => {
  await loadConfig();
  console.log('SafeGuard inicializado');
  // Start stats auto-reset checker
  startStatsAutoReset();
});

// NEW: Auto-reset stats based on configured period
function startStatsAutoReset() {
  // Check every 5 minutes
  setInterval(async () => {
    if (!config.stats || config.stats.resetPeriod === 'never') return;
    
    const now = Date.now();
    const lastReset = stats.lastReset || now;
    const timeSinceReset = now - lastReset;
    
    let resetInterval;
    switch (config.stats.resetPeriod) {
      case '1h': resetInterval = 60 * 60 * 1000; break;
      case '12h': resetInterval = 12 * 60 * 60 * 1000; break;
      case '24h': resetInterval = 24 * 60 * 60 * 1000; break;
      case '48h': resetInterval = 48 * 60 * 60 * 1000; break;
      case '1w': resetInterval = 7 * 24 * 60 * 60 * 1000; break;
      case '1m': resetInterval = 30 * 24 * 60 * 60 * 1000; break;
      default: return;
    }
    
    if (timeSinceReset >= resetInterval) {
      console.log('SafeGuard: Auto-resetting stats (period: ' + config.stats.resetPeriod + ')');
      stats = {
        totalBlocked: 0,
        websitesBlocked: 0,
        imagesBlocked: 0,
        requestsBlocked: 0,
        lastReset: now
      };
      await saveConfig();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

// Cargar configuración
// Cargar configuración - FIXED: Proper loading with fallback and deep merge
async function loadConfig() {
  try {
    // Try chrome.storage.local first
    const stored = await chrome.storage.local.get(['config', 'stats']);
    
    if (stored.config && typeof stored.config === 'object') {
      // Deep merge with defaults to ensure all properties exist
      config = { ...DEFAULT_CONFIG, ...stored.config };
      
      // Ensure nested objects are properly merged
      if (stored.config.security) {
        config.security = { ...DEFAULT_CONFIG.security, ...stored.config.security };
      }
      if (stored.config.textAnalysis) {
        config.textAnalysis = { ...DEFAULT_CONFIG.textAnalysis, ...stored.config.textAnalysis };
      }
      if (stored.config.imageBlocking) {
        config.imageBlocking = { ...DEFAULT_CONFIG.imageBlocking, ...stored.config.imageBlocking };
      }
      if (stored.config.urlFiltering) {
        config.urlFiltering = { ...DEFAULT_CONFIG.urlFiltering, ...stored.config.urlFiltering };
      }
      if (stored.config.domainBlocking) {
        config.domainBlocking = { ...DEFAULT_CONFIG.domainBlocking, ...stored.config.domainBlocking };
      }
      if (stored.config.notifications) {
        config.notifications = { ...DEFAULT_CONFIG.notifications, ...stored.config.notifications };
      }
      
      console.log('SafeGuard: Configuration loaded successfully');
    } else {
      config = { ...DEFAULT_CONFIG };
      console.log('SafeGuard: Using default configuration');
      // Save defaults
      await saveConfig();
    }
    
    if (stored.stats) {
      stats = stored.stats;
    }
  } catch (error) {
    console.error('SafeGuard: Error loading configuration:', error);
    config = { ...DEFAULT_CONFIG };
  }
}

// Guardar configuración - FIXED: Proper persistence with error handling
async function saveConfig() {
  try {
    if (!config) {
      console.error('SafeGuard: Config is null, cannot save');
      return;
    }
    
    // Create a clean copy to avoid circular references
    const configToSave = JSON.parse(JSON.stringify(config));
    
    // Save to chrome.storage.local
    await chrome.storage.local.set({ 
      config: configToSave,
      stats: stats 
    });
    
    console.log('SafeGuard: Configuration saved successfully');
  } catch (error) {
    console.error('SafeGuard: Error saving configuration:', error);
  }
}

// Analizar URL
function analyzeURL(url) {
  if (!config.enabled || !config.urlFiltering.enabled) return { blocked: false };
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const fullURL = url.toLowerCase();
    
    // Verificar whitelist con soporte de comodines
    if (isInList(hostname, config.whitelist)) {
      return { blocked: false, reason: 'whitelisted' };
    }
    
    // Verificar dominios bloqueados conocidos
    if (config.domainBlocking.enabled) {
      const isBlockedDomain = KNOWN_BLOCKED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      if (isBlockedDomain) {
        return { blocked: true, reason: 'known_domain', confidence: 100 };
      }
    }
    
    // Verificar blacklist personalizada con comodines
    if (isInList(hostname, config.customBlacklist)) {
      return { blocked: true, reason: 'custom_blacklist', confidence: 100 };
    }
    
    // Análisis de patrones
    if (config.urlFiltering.usePatternMatching) {
      const patterns = DETECTION_PATTERNS[config.blockingLevel];
      
      // Verificar patrones en URL
      for (const pattern of patterns.urlPatterns) {
        if (pattern.test(fullURL)) {
          return { blocked: true, reason: 'url_pattern', confidence: 90 };
        }
      }
      
      // Verificar keywords en dominio
      for (const keyword of patterns.domainKeywords) {
        if (hostname.includes(keyword)) {
          return { blocked: true, reason: 'domain_keyword', confidence: 85 };
        }
      }
    }
    
    return { blocked: false };
  } catch (e) {
    return { blocked: false };
  }
}

// NEW: Check if hostname matches any pattern in list (with wildcard support)
function isInList(hostname, list) {
  return list.some(pattern => {
    // Convert wildcard pattern to regex
    if (pattern.includes('*')) {
      // Escape special regex characters except *
      const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const regex = new RegExp('^' + regexPattern + '$', 'i');
      return regex.test(hostname);
    } else {
      // Exact match or subdomain match
      return hostname === pattern.toLowerCase() || 
             hostname.endsWith('.' + pattern.toLowerCase());
    }
  });
}

// Interceptar requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!config.enabled) return;
    
    const analysis = analyzeURL(details.url);
    
    if (analysis.blocked) {
      stats.requestsBlocked++;
      
      // Si es una navegación principal, redirigir a página de bloqueo
      if (details.type === 'main_frame') {
        stats.websitesBlocked++;
        saveConfig();
        
        return {
          redirectUrl: chrome.runtime.getURL('blocked.html') + 
            '?url=' + encodeURIComponent(details.url) +
            '&reason=' + analysis.reason
        };
      }
      
      // Bloquear otros tipos de recursos
      if (config.imageBlocking.enabled && 
          (details.type === 'image' || details.type === 'media')) {
        stats.imagesBlocked++;
      }
      
      saveConfig();
      return { cancel: true };
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

// Comunicación con content scripts y popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'GET_CONFIG':
        sendResponse({ config, stats });
        break;
        
      case 'UPDATE_CONFIG':
        // Check password protection
        if (config.security.passwordEnabled && !message.bypassPassword) {
          sendResponse({ success: false, error: 'password_required' });
          return;
        }
        config = { ...config, ...message.config };
        await saveConfig();
        
        // Notify all tabs about config update
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type: 'CONFIG_UPDATED' }).catch(() => {});
        });
        
        sendResponse({ success: true });
        break;
        
      case 'VERIFY_PASSWORD':
        const inputHash = await hashPassword(message.password);
        const isValid = inputHash === config.security.passwordHash;
        sendResponse({ valid: isValid });
        break;
        
      case 'SET_PASSWORD':
        const hash = await hashPassword(message.password);
        config.security.passwordEnabled = true;
        config.security.passwordHash = hash;
        await saveConfig();
        sendResponse({ success: true });
        break;
        
      case 'DISABLE_PASSWORD':
        const verifyHash = await hashPassword(message.password);
        if (verifyHash === config.security.passwordHash) {
          config.security.passwordEnabled = false;
          config.security.passwordHash = null;
          await saveConfig();
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'invalid_password' });
        }
        break;
        
      case 'ANALYZE_TEXT':
        const textAnalysis = analyzeText(message.text);
        sendResponse(textAnalysis);
        break;
        
      case 'RESET_STATS':
        stats = {
          totalBlocked: 0,
          websitesBlocked: 0,
          imagesBlocked: 0,
          requestsBlocked: 0,
          lastReset: Date.now()
        };
        await saveConfig();
        sendResponse({ success: true });
        break;
        
      case 'ADD_TO_WHITELIST':
        if (!config.whitelist.includes(message.domain)) {
          config.whitelist.push(message.domain);
          await saveConfig();
        }
        sendResponse({ success: true });
        break;
        
      case 'REPORT_BLOCK':
        stats.totalBlocked++;
        if (message.blockType === 'image') stats.imagesBlocked++;
        await saveConfig();
        sendResponse({ success: true });
        break;
    }
  })();
  return true; // Mantener el canal abierto para respuesta asíncrona
});

// Hash password function using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'SafeGuard_Salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Análisis de texto
function analyzeText(text) {
  if (!config.textAnalysis.enabled) {
    return { suspicious: false, score: 0 };
  }
  
  const lowerText = text.toLowerCase();
  const patterns = DETECTION_PATTERNS[config.blockingLevel];
  
  let score = 0;
  let matchedKeywords = [];
  
  // Contar coincidencias de keywords
  for (const keyword of patterns.keywords) {
    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * 10;
      matchedKeywords.push(keyword);
    }
  }
  
  // Ajustar por sensibilidad
  const threshold = {
    low: 50,
    medium: 30,
    high: 15
  }[config.textAnalysis.sensitivity];
  
  return {
    suspicious: score >= threshold,
    score,
    matchedKeywords,
    threshold
  };
}

// Actualizar badge con contador
function updateBadge(tabId, count) {
  if (config.notifications.showBlockedCount && count > 0) {
    chrome.action.setBadgeText({ 
      text: count.toString(), 
      tabId 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#e74c3c' 
    });
  }
}

// Limpiar badge
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
});
