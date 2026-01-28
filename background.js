// SafeGuard - Background Service Worker
// Gestión central de detección, bloqueo y configuración

const DEFAULT_CONFIG = {
  enabled: true,
  blockingLevel: 'strict', // 'strict', 'moderate', 'permissive'
  textAnalysis: {
    enabled: true,
    sensitivity: 'high', // 'low', 'medium', 'high'
    scanDepth: 'full' // 'quick', 'normal', 'full'
  },
  imageBlocking: {
    enabled: true,
    blockSuspiciousImages: true,
    blurInsteadOfBlock: false
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
  statsTracking: true
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
});

// Cargar configuración
async function loadConfig() {
  const stored = await chrome.storage.local.get(['config', 'stats']);
  if (stored.config) {
    config = { ...DEFAULT_CONFIG, ...stored.config };
  }
  if (stored.stats) {
    stats = stored.stats;
  }
}

// Guardar configuración
async function saveConfig() {
  await chrome.storage.local.set({ config, stats });
}

// Analizar URL
function analyzeURL(url) {
  if (!config.enabled || !config.urlFiltering.enabled) return { blocked: false };
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const fullURL = url.toLowerCase();
    
    // Verificar whitelist
    if (config.whitelist.some(domain => hostname.includes(domain.toLowerCase()))) {
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
    
    // Verificar blacklist personalizada
    if (config.customBlacklist.some(domain => hostname.includes(domain.toLowerCase()))) {
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
        config = { ...config, ...message.config };
        await saveConfig();
        sendResponse({ success: true });
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
