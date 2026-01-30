# Changelog - SafeGuard

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.1.0] - 2026-01-30

### 🆕 Nuevas Características

#### 🧠 Sistema de Bloqueo Selectivo Inteligente
- Análisis completo de la página para determinar nivel de compromiso
- **Tres escenarios de bloqueo**:
  1. Página completamente comprometida → Bloqueo total con overlay
  2. Página mixta → Solo contenido sospechoso bloqueado permanentemente
  3. Página limpia → Navegación normal
- Contenido seguro permanece completamente accesible e interactivo
- Contenido sospechoso bloqueado permanentemente sin posibilidad de revelado
- Score de suspicacia y conteo de keywords para determinar compromiso
- Overlay informativo en páginas totalmente bloqueadas

#### 🔐 Protección por Contraseña
- Sistema completo de protección por contraseña
- Encriptación SHA-256 de contraseñas
- Bloqueo de modificaciones sin autenticación
- Pestaña dedicada de seguridad en configuración
- Opción para establecer y desactivar contraseña
- Botón de acceso rápido desde el popup

#### ⚡ Bloqueo Ultra Rápido
- Estilos de pre-bloqueo aplicados instantáneamente
- Detección antes de que se cargue el contenido
- Eliminación del "flash" de contenido inapropiado
- Análisis más agresivo en `document_start`

#### 🚫 Censura Permanente
- Contenido difuminado NUNCA puede ser revelado
- Deshabilitación completa de interacciones en elementos bloqueados
- Eliminación de event listeners de revelado
- `pointer-events: none` y `user-select: none` en todo contenido censurado
- Enlaces bloqueados completamente inaccesibles

#### 💾 Persistencia de Configuración
- Nivel de protección se guarda automáticamente
- Configuración se mantiene entre reinicios del navegador
- Valor por defecto cambiado de "Estricto" a "Moderado"
- Sincronización instantánea entre popup y background

#### 📄 Página de Bloqueo Mejorada
- Mensajes informativos claros
- No más páginas en blanco
- Información detallada de la razón del bloqueo
- Opción de agregar a whitelist directamente
- Footer con información del creador

#### 👨‍💻 Información del Creador
- Pestaña "Acerca de" completa
- Enlaces a GitHub y YouTube
- Información de versión
- Créditos y licencia
- Logo y branding actualizado

### 🔧 Mejoras

#### Rendimiento
- Análisis más rápido de contenido
- Reducción del tiempo de respuesta en bloqueos
- Optimización de MutationObserver
- Pre-carga de estilos de bloqueo

#### Interfaz
- 8 pestañas en configuración (antes 6)
- Diseño de seguridad profesional
- Indicadores visuales de estado de protección
- Enlaces sociales en footer
- Mejor organización de contenido
- Overlay de bloqueo total para páginas comprometidas

#### Seguridad
- Sistema anti-manipulación completo
- Bloqueo permanente selectivo (solo contenido sospechoso)
- Contenido seguro permanece accesible
- Protección a nivel de CSS y JavaScript
- Validación de contraseña en todas las acciones

### 🐛 Correcciones

- **Fixed**: Nivel de protección se reseteaba a "Estricto" en cada reinicio
- **Fixed**: Contenido difuminado podía ser revelado con click
- **Fixed**: Enlaces bloqueados aún eran clickeables
- **Fixed**: Páginas bloqueadas mostraban pantalla en blanco
- **Fixed**: Flash de contenido inapropiado antes del bloqueo
- **Fixed**: Elementos bloqueados mantenían interactividad

### 📝 Documentación

- README actualizado con v1.1
- Nuevas secciones de FAQ sobre protección por contraseña
- Información del creador en todos los archivos relevantes
- CHANGELOG agregado
- Guías de las nuevas características

### 🔄 Cambios Técnicos

#### Archivos Modificados
- `manifest.json`: Versión 1.1, autor, homepage_url
- `background.js`: Sistema de contraseñas, hash SHA-256
- `content.js`: Pre-bloqueo, censura permanente
- `content.css`: Estilos permanentes de bloqueo
- `popup.html`: Modal de contraseña, botón de seguridad
- `popup.css`: Estilos de modal
- `popup.js`: Lógica de verificación de contraseña
- `options.html`: Pestaña de seguridad y acerca de
- `options.css`: Estilos para nuevas secciones
- `options.js`: Funcionalidad de seguridad
- `blocked.html`: Footer con creador
- `README.md`: Actualización completa

#### Nuevas Características del Código
```javascript
// Hash de contraseñas con SHA-256
async function hashPassword(password)

// Verificación de contraseña antes de cambios
if (config.security.passwordEnabled && !bypassPassword)

// Pre-bloqueo instantáneo de contenido
(function() { /* Estilos inmediatos */ })()

// Censura permanente sin revelado
element.style.pointerEvents = 'none'
element.onclick = null
```

---

## [1.0.0] - 2026-01-28

### 🎉 Lanzamiento Inicial

#### Características Principales
- Detección multinivel de contenido
- 3 niveles de protección
- Análisis de texto en tiempo real
- Bloqueo de imágenes
- Filtrado de URLs
- Whitelist y Blacklist
- Estadísticas detalladas
- Interfaz moderna

#### Componentes
- Service Worker (background.js)
- Content Script (content.js)
- Popup de control
- Página de opciones completa
- Página de bloqueo
- Iconos personalizados

#### Tecnologías
- Manifest V3
- Chrome Extensions API
- MutationObserver API
- Storage API
- Web Crypto API

---

## Formato de Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

---

## Enlaces

- [Repositorio GitHub](https://github.com/xoreaxmrgamer/SafeGuard)
- [Issues y Reportes](https://github.com/xoreaxmrgamer/SafeGuard/issues)
- [YouTube](https://www.youtube.com/@xoreaxmrgamer)

---

**Creado por XorEaxMrGamer** | © 2026
