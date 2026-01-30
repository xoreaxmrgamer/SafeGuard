// SafeGuard - Content Script
// Análisis en tiempo real y bloqueo de elementos

// CRITICAL: Apply blocking styles IMMEDIATELY before anything loads
(function() {
  const style = document.createElement('style');
  style.id = 'safeguard-preload-styles';
  style.textContent = `
    /* Pre-block ONLY obviously suspicious elements */
    img[src*="porn"], img[src*="xxx"], img[src*="sex"], img[src*="nude"], img[src*="nsfw"],
    img[alt*="porn"], img[alt*="xxx"], img[alt*="sex"], img[alt*="nude"], img[alt*="nsfw"],
    video[src*="porn"], video[src*="xxx"], video[src*="sex"], video[src*="nude"],
    iframe[src*="porn"], iframe[src*="xxx"], iframe[src*="sex"], iframe[src*="nude"] {
      filter: blur(50px) !important;
      pointer-events: none !important;
      opacity: 0.3 !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();

let config = null;
let blockedCount = 0;
let observer = null;
let isPasswordVerified = false;
let pageFullyCompromised = false;
let analysisComplete = false;

// Inicializar
async function initialize() {
  // Obtener configuración
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  config = response.config;
  
  if (!config.enabled) return;
  
  // Analizar página inicial
  await analyzePage();
  
  // Observar cambios dinámicos
  if (config.textAnalysis.scanDepth === 'full') {
    setupMutationObserver();
  }
  
  // Analizar imágenes cargadas dinámicamente
  if (config.imageBlocking.enabled) {
    setupImageObserver();
  }
}

// Analizar página completa
async function analyzePage() {
  // First, determine if the entire page is compromised
  const pageAnalysis = await analyzeEntirePage();
  
  if (pageAnalysis.fullyCompromised) {
    pageFullyCompromised = true;
    // Block everything without exception
    blockEntirePage();
    showWarningBanner({ score: 100, matchedKeywords: pageAnalysis.keywords });
    return;
  }
  
  // Page has both safe and unsafe content - selective blocking
  pageFullyCompromised = false;
  
  // Analizar texto visible
  if (config.textAnalysis.enabled) {
    await analyzePageText();
  }
  
  // Analizar y bloquear imágenes
  if (config.imageBlocking.enabled) {
    await analyzeImages();
  }
  
  // Analizar links
  analyzeLinks();
  
  // Actualizar contador
  updateBlockCounter();
}

// Analyze if entire page is compromised
async function analyzeEntirePage() {
  const textContent = document.body.innerText || '';
  const title = document.title || '';
  const url = window.location.href;
  
  // Analyze title, URL and overall content
  const combinedText = `${title} ${url} ${textContent.substring(0, 2000)}`.toLowerCase();
  
  const analysis = await chrome.runtime.sendMessage({
    type: 'ANALYZE_TEXT',
    text: combinedText
  });
  
  // Consider page fully compromised if:
  // 1. Very high suspicion score (>70)
  // 2. Multiple keywords found (>5)
  // 3. Suspicious URL structure
  const fullyCompromised = 
    analysis.score > 70 || 
    analysis.matchedKeywords.length > 5 ||
    /porn|xxx|sex|nude|nsfw|adult/.test(url.toLowerCase());
  
  return {
    fullyCompromised,
    score: analysis.score,
    keywords: analysis.matchedKeywords
  };
}

// Block entire page without exception - FIXED: Proper z-index hierarchy
function blockEntirePage() {
  // Remove any existing overlay first
  const existingOverlay = document.querySelector('.safeguard-full-block-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // DON'T blur the body - we'll use the overlay for that
  // This prevents z-index conflicts
  document.body.classList.add('safeguard-page-blocked');
  
  // Create overlay as the VERY LAST element in body
  const overlay = document.createElement('div');
  overlay.className = 'safeguard-full-block-overlay';
  
  // Use inline styles as backup for maximum specificity
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(15, 23, 42, 0.98) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    pointer-events: all !important;
    transform: translateZ(0) !important;
    isolation: isolate !important;
  `;
  
  overlay.innerHTML = `
    <div class="safeguard-full-block-message" style="
      position: relative;
      z-index: 2147483647;
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: safeguardSlideUp 0.5s ease-out;
    ">
      <div class="safeguard-block-icon" style="font-size: 64px; margin-bottom: 20px;">🛡️</div>
      <h2 style="font-size: 24px; font-weight: 700; color: #ef4444; margin-bottom: 16px;">
        Página Completamente Bloqueada
      </h2>
      <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin-bottom: 12px;">
        SafeGuard ha detectado que toda esta página contiene contenido inapropiado.
      </p>
      <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin-bottom: 24px;">
        Esta página permanecerá bloqueada.
      </p>
      <button onclick="window.history.back()" style="
        padding: 14px 32px;
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      ">
        ← Volver Atrás
      </button>
    </div>
  `;
  
  // Append to body as LAST element (highest in DOM order)
  document.body.appendChild(overlay);
  
  // Force reflow to ensure styles are applied
  overlay.offsetHeight;
  
  // Prevent scrolling
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  
  blockedCount += 100;
  
  console.log('SafeGuard: Page fully blocked with overlay on top');
}

// Analizar texto de la página
async function analyzePageText() {
  const textContent = document.body.innerText || '';
  
  // Limitar longitud para análisis según profundidad
  let textToAnalyze = textContent;
  if (config.textAnalysis.scanDepth === 'quick') {
    textToAnalyze = textContent.substring(0, 5000);
  } else if (config.textAnalysis.scanDepth === 'normal') {
    textToAnalyze = textContent.substring(0, 15000);
  }
  
  const analysis = await chrome.runtime.sendMessage({
    type: 'ANALYZE_TEXT',
    text: textToAnalyze
  });
  
  if (analysis.suspicious) {
    // Marcar elementos sospechosos
    markSuspiciousContent(analysis.matchedKeywords);
    
    // Mostrar advertencia si está configurado
    if (config.notifications.showWarnings && analysis.score > 50) {
      showWarningBanner(analysis);
    }
  }
}

// Marcar contenido sospechoso - FIXED: TRUE intelligent detection
function markSuspiciousContent(keywords) {
  const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, a, li');
  
  elements.forEach(element => {
    // Skip if already processed
    if (element.dataset.safeguardProcessed === 'true') return;
    element.dataset.safeguardProcessed = 'true';
    
    const text = element.innerText?.toLowerCase() || '';
    let isSuspicious = false;
    let suspicionScore = 0;
    
    // TRUE detection: count matches
    for (const keyword of keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
      const matches = text.match(regex);
      if (matches) {
        suspicionScore += matches.length;
        isSuspicious = true;
      }
    }
    
    if (isSuspicious) {
      element.classList.add('safeguard-suspicious');
      
      if (config.blockingLevel === 'strict') {
        // Strict mode: hide completely
        element.style.display = 'none';
        element.classList.add('safeguard-blocked');
        blockedCount++;
      } else {
        // PERMANENT blur ONLY if highly suspicious (score > 2)
        if (suspicionScore > 2) {
          // High suspicion - PERMANENT block
          element.style.filter = 'blur(10px)';
          element.style.pointerEvents = 'none';
          element.style.userSelect = 'none';
          element.title = 'Contenido inapropiado bloqueado permanentemente';
          element.classList.add('safeguard-permanent-block');
          element.style.cursor = 'not-allowed';
          element.dataset.safeguardPermanent = 'true';
          blockedCount++;
        } else {
          // Low suspicion - REVEALABLE on click
          element.style.filter = 'blur(8px)';
          element.style.cursor = 'pointer';
          element.title = 'Click para revelar (contenido potencialmente sensible)';
          element.classList.add('safeguard-revealable');
          element.dataset.safeguardPermanent = 'false';
          
          // Add click listener to reveal
          element.addEventListener('click', function revealContent(e) {
            e.stopPropagation();
            this.style.filter = 'none';
            this.style.cursor = 'default';
            this.classList.remove('safeguard-revealable');
            this.classList.add('safeguard-revealed');
            this.title = 'Contenido revelado';
            this.removeEventListener('click', revealContent);
          });
        }
      }
    } else {
      // Content is SAFE - mark as safe
      element.classList.add('safeguard-safe');
      element.dataset.safeguardPermanent = 'false';
    }
  });
}

// Analizar y bloquear imágenes - FIXED: TRUE intelligent detection
async function analyzeImages() {
  const images = document.querySelectorAll('img, picture, video, iframe[src*="youtube"], iframe[src*="vimeo"]');
  
  images.forEach(async (element) => {
    // Skip if already processed
    if (element.dataset.safeguardProcessed === 'true') return;
    element.dataset.safeguardProcessed = 'true';
    
    // Check if already permanently blocked by pre-load styles
    const preBlocked = element.style.filter && element.style.pointerEvents === 'none';
    if (preBlocked) {
      element.classList.add('safeguard-permanent-block');
      element.dataset.safeguardPermanent = 'true';
      blockedCount++;
      return;
    }
    
    const src = element.src || element.dataset.src || '';
    const alt = element.alt || '';
    const title = element.title || '';
    const className = element.className || '';
    
    const combinedText = `${src} ${alt} ${title} ${className}`.toLowerCase();
    
    // TRUE suspicion analysis with scoring
    const analysis = await analyzeSuspicionLevel(combinedText, element);
    
    if (analysis.suspicious) {
      if (analysis.highConfidence) {
        // High confidence - PERMANENT block
        element.style.filter = 'blur(50px)';
        element.style.pointerEvents = 'none';
        element.style.userSelect = 'none';
        element.style.cursor = 'not-allowed';
        element.classList.add('safeguard-permanent-block');
        element.title = 'Contenido inapropiado bloqueado permanentemente';
        element.dataset.safeguardPermanent = 'true';
        blockedCount++;
        
        await chrome.runtime.sendMessage({
          type: 'REPORT_BLOCK',
          blockType: 'image'
        });
      } else {
        // Low confidence - REVEALABLE on click
        element.style.filter = 'blur(20px)';
        element.style.cursor = 'pointer';
        element.classList.add('safeguard-revealable');
        element.title = 'Click para revelar (contenido potencialmente sensible)';
        element.dataset.safeguardPermanent = 'false';
        
        element.addEventListener('click', function revealImage(e) {
          e.stopPropagation();
          e.preventDefault();
          this.style.filter = 'none';
          this.style.cursor = 'default';
          this.classList.remove('safeguard-revealable');
          this.classList.add('safeguard-revealed');
          this.title = 'Contenido revelado';
          this.removeEventListener('click', revealImage);
        });
      }
    } else {
      // Safe content
      element.classList.add('safeguard-safe');
      element.dataset.safeguardPermanent = 'false';
    }
  });
}

// NEW: Analyze suspicion level with scoring
async function analyzeSuspicionLevel(text, element) {
  const highConfidencePatterns = [
    /porn/gi, /xxx/gi, /nude/gi, /naked/gi, /nsfw/gi
  ];
  
  const mediumConfidencePatterns = [
    /sex/gi, /adult/gi, /explicit/gi, /erotic/gi
  ];
  
  let score = 0;
  let matchCount = 0;
  
  // Check high confidence patterns
  for (const pattern of highConfidencePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length * 10;
      matchCount += matches.length;
    }
  }
  
  // Check medium confidence patterns
  for (const pattern of mediumConfidencePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length * 5;
      matchCount += matches.length;
    }
  }
  
  return {
    suspicious: score > 0,
    highConfidence: score >= 20 || matchCount >= 3,
    score: score
  };
}

// Verificar si una imagen es sospechosa
async function isSuspiciousImage(text, element) {
  // Patrones sospechosos en URLs y atributos
  const suspiciousPatterns = [
    /porn/i, /xxx/i, /nude/i, /naked/i, /nsfw/i, /adult/i,
    /sex/i, /erotic/i, /explicit/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  // Verificar dimensiones sospechosas (imágenes muy grandes pueden ser contenido)
  if (config.imageBlocking.blockSuspiciousImages) {
    const width = element.width || element.naturalWidth || 0;
    const height = element.height || element.naturalHeight || 0;
    
    // Imágenes grandes sin alt text pueden ser sospechosas
    if (width > 500 && height > 500 && !element.alt) {
      // Verificar contexto
      const parent = element.closest('a, div');
      if (parent) {
        const parentText = parent.innerText?.toLowerCase() || '';
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(parentText)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

// Analizar links
function analyzeLinks() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.href.toLowerCase();
    const text = link.innerText?.toLowerCase() || '';
    
    const suspiciousPatterns = [
      /porn/i, /xxx/i, /adult/i, /nsfw/i, /nude/i, /sex/i
    ];
    
    let isSuspicious = false;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(href) || pattern.test(text)) {
        isSuspicious = true;
        break;
      }
    }
    
    if (isSuspicious) {
      // Suspicious link - PERMANENT block
      link.classList.add('safeguard-blocked-link');
      link.classList.add('safeguard-permanent-block');
      link.style.pointerEvents = 'none'; // Completely disable
      link.style.opacity = '0.3';
      link.style.textDecoration = 'line-through';
      link.style.cursor = 'not-allowed';
      link.style.userSelect = 'none';
      link.title = 'Enlace inapropiado bloqueado permanentemente';
      link.onclick = (e) => { e.preventDefault(); return false; };
      link.href = 'javascript:void(0)'; // Disable navigation
      blockedCount++;
    } else {
      // Safe link - can be clicked normally
      link.classList.add('safeguard-safe');
    }
  });
}

// Configurar observador de mutaciones
function setupMutationObserver() {
  observer = new MutationObserver((mutations) => {
    let shouldAnalyze = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        shouldAnalyze = true;
      }
    });
    
    if (shouldAnalyze) {
      // Debounce para evitar análisis excesivos
      clearTimeout(window.safeguardAnalysisTimeout);
      window.safeguardAnalysisTimeout = setTimeout(() => {
        analyzePage();
      }, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Configurar observador de imágenes
function setupImageObserver() {
  // Observar imágenes que se cargan después
  const imgObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG' || node.tagName === 'PICTURE' || node.tagName === 'VIDEO') {
          analyzeImages();
        }
        if (node.querySelectorAll) {
          const images = node.querySelectorAll('img, picture, video');
          if (images.length > 0) {
            analyzeImages();
          }
        }
      });
    });
  });
  
  imgObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Mostrar banner de advertencia
function showWarningBanner(analysis) {
  if (document.getElementById('safeguard-warning-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'safeguard-warning-banner';
  banner.className = 'safeguard-warning';
  banner.innerHTML = `
    <div class="safeguard-warning-content">
      <span class="safeguard-warning-icon">⚠️</span>
      <span class="safeguard-warning-text">
        SafeGuard ha detectado contenido potencialmente inapropiado en esta página.
        <strong>${blockedCount}</strong> elementos bloqueados.
      </span>
      <button class="safeguard-warning-close">✕</button>
    </div>
  `;
  
  document.body.insertBefore(banner, document.body.firstChild);
  
  // Cerrar banner
  banner.querySelector('.safeguard-warning-close').addEventListener('click', () => {
    banner.remove();
  });
  
  // Auto-cerrar después de 10 segundos
  setTimeout(() => {
    banner.remove();
  }, 10000);
}

// Actualizar contador en badge
function updateBlockCounter() {
  if (blockedCount > 0) {
    chrome.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: blockedCount
    });
  }
}

// Listener para mensajes del background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONFIG_UPDATED') {
    // Reload config and re-analyze
    initialize();
  } else if (message.type === 'DISABLE_SAFEGUARD') {
    // NEW: Properly disable all SafeGuard effects
    disableAllEffects();
    sendResponse({ success: true });
  } else if (message.type === 'ENABLE_SAFEGUARD') {
    // NEW: Re-enable SafeGuard
    initialize();
    sendResponse({ success: true });
  }
  return true;
});

// NEW: Properly disable all SafeGuard effects
function disableAllEffects() {
  // Remove all safeguard classes
  document.querySelectorAll('.safeguard-permanent-block, .safeguard-revealable, .safeguard-revealed, .safeguard-safe, .safeguard-suspicious, .safeguard-blocked-link').forEach(el => {
    el.style.filter = '';
    el.style.pointerEvents = '';
    el.style.userSelect = '';
    el.style.cursor = '';
    el.classList.remove('safeguard-permanent-block', 'safeguard-revealable', 'safeguard-revealed', 'safeguard-safe', 'safeguard-suspicious', 'safeguard-blocked-link');
    delete el.dataset.safeguardProcessed;
    delete el.dataset.safeguardPermanent;
  });
  
  // Remove page block if present
  if (document.body.classList.contains('safeguard-page-blocked')) {
    document.body.style.filter = '';
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('safeguard-page-blocked');
  }
  
  // Remove overlay
  const overlay = document.querySelector('.safeguard-full-block-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Remove warning banner
  const banner = document.getElementById('safeguard-warning-banner');
  if (banner) {
    banner.remove();
  }
  
  // Disconnect observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  analysisComplete = false;
  blockedCount = 0;
  pageFullyCompromised = false;
  
  console.log('SafeGuard: All effects disabled');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
