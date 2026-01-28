// SafeGuard - Content Script
// Análisis en tiempo real y bloqueo de elementos

let config = null;
let blockedCount = 0;
let observer = null;

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

// Marcar contenido sospechoso
function markSuspiciousContent(keywords) {
  const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, a, li');
  
  elements.forEach(element => {
    const text = element.innerText?.toLowerCase() || '';
    
    for (const keyword of keywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'i');
      if (regex.test(text)) {
        element.classList.add('safeguard-suspicious');
        
        if (config.blockingLevel === 'strict') {
          element.style.display = 'none';
          blockedCount++;
        } else {
          element.style.filter = 'blur(10px)';
          element.style.cursor = 'pointer';
          element.title = 'Contenido filtrado por SafeGuard - Click para mostrar';
          element.addEventListener('click', function() {
            this.style.filter = 'none';
          }, { once: true });
        }
        break;
      }
    }
  });
}

// Analizar y bloquear imágenes
async function analyzeImages() {
  const images = document.querySelectorAll('img, picture, video, iframe[src*="youtube"], iframe[src*="vimeo"]');
  
  images.forEach(async (element) => {
    // Verificar atributos sospechosos
    const src = element.src || element.dataset.src || '';
    const alt = element.alt || '';
    const title = element.title || '';
    const className = element.className || '';
    
    const combinedText = `${src} ${alt} ${title} ${className}`.toLowerCase();
    
    // Análisis básico de URL y atributos
    const isSuspicious = await isSuspiciousImage(combinedText, element);
    
    if (isSuspicious) {
      if (config.imageBlocking.blurInsteadOfBlock) {
        // Aplicar blur
        element.style.filter = 'blur(20px)';
        element.style.cursor = 'pointer';
        element.classList.add('safeguard-blurred');
        
        // Permitir click para revelar
        element.addEventListener('click', function() {
          this.style.filter = 'none';
          this.classList.remove('safeguard-blurred');
        }, { once: true });
      } else {
        // Bloquear completamente
        element.style.display = 'none';
        element.classList.add('safeguard-blocked');
      }
      
      blockedCount++;
      await chrome.runtime.sendMessage({
        type: 'REPORT_BLOCK',
        blockType: 'image'
      });
    }
  });
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
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(href) || pattern.test(text)) {
        link.classList.add('safeguard-blocked-link');
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.3';
        link.style.textDecoration = 'line-through';
        link.title = 'Enlace bloqueado por SafeGuard';
        blockedCount++;
        break;
      }
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
    initialize();
  }
});

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
