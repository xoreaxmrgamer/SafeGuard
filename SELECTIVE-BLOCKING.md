# 🧠 Sistema de Bloqueo Selectivo Inteligente - SafeGuard v1.1

## 📋 Visión General

SafeGuard v1.1 incorpora un **sistema de bloqueo selectivo inteligente** que diferencia entre:
- ✅ Contenido seguro (puede ser visto)
- ❌ Contenido sospechoso (bloqueado permanentemente)
- 🌐 Páginas completamente comprometidas (bloqueo total)

---

## 🎯 Lógica de Decisión

### 1️⃣ Análisis Inicial de la Página

Cuando se carga una página, SafeGuard realiza un análisis completo:

```javascript
// Factores evaluados:
- Título de la página
- URL completa
- Primeros 2000 caracteres de texto
- Cantidad de keywords sospechosas
- Score de suspicacia
```

**Criterios para "Página Completamente Comprometida"**:
- Score de suspicacia > 70
- Más de 5 keywords sospechosas encontradas
- URL contiene términos explícitos (porn, xxx, sex, nude, nsfw, adult)

---

## 🔄 Tres Escenarios de Bloqueo

### Escenario A: Página Completamente Comprometida 🌐

**Cuándo ocurre**:
- La página entera es contenido inapropiado
- Sitios dedicados a contenido explícito
- URLs con términos obvios

**Qué sucede**:
```
✓ Todo el contenido se difumina (blur 30px)
✓ Overlay informativo aparece encima
✓ Mensaje: "Página Completamente Bloqueada"
✓ NO hay posibilidad de ver nada
✓ Botón para volver atrás
✓ Toda la página sin interacción
```

**Ejemplo visual**:
```
┌─────────────────────────────────┐
│  [DIFUMINADO COMPLETO]          │
│                                 │
│  ┌───────────────────────┐     │
│  │   🛡️                  │     │
│  │  Página Completamente │     │
│  │  Bloqueada            │     │
│  │                       │     │
│  │  ← Volver             │     │
│  └───────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

---

### Escenario B: Página Mixta (Contenido Seguro + Sospechoso) 🔄

**Cuándo ocurre**:
- La página tiene contenido variado
- Algunos elementos son seguros, otros no
- Noticias, foros, redes sociales, etc.

**Qué sucede - Análisis Selectivo**:

#### Para Imágenes:
```javascript
✓ Imagen con src/alt sospechoso → Blur permanente (50px)
✓ Imagen segura → Visible normalmente
✓ Video sospechoso → Blur permanente
✓ Video seguro → Reproducible normalmente
```

#### Para Texto:
```javascript
✓ Párrafo con keywords → Blur permanente (10px)
✓ Párrafo limpio → Legible normalmente
✓ Título sospechoso → Blur permanente
✓ Título limpio → Visible normalmente
```

#### Para Enlaces:
```javascript
✓ Link con URL sospechosa → Deshabilitado + tachado
✓ Link limpio → Clickeable normalmente
✓ Link con texto sospechoso → Deshabilitado
✓ Link con texto limpio → Clickeable
```

**Ejemplo visual**:
```
┌─────────────────────────────────┐
│  Título del Artículo ✓          │
│                                 │
│  Párrafo normal visible...  ✓   │
│                                 │
│  [DIFUMINADO PERMANENTE] ❌      │
│                                 │
│  Más texto legible aquí...  ✓   │
│                                 │
│  [Imagen limpia visible]    ✓   │
│                                 │
│  [IMAGEN DIFUMINADA]        ❌   │
│                                 │
│  Link normal →             ✓   │
│  Link bloqueado            ❌   │
└─────────────────────────────────┘
```

---

### Escenario C: Página Completamente Limpia ✅

**Cuándo ocurre**:
- No se detecta contenido sospechoso
- Score de suspicacia bajo
- Sin keywords problemáticas

**Qué sucede**:
```
✓ Todo el contenido visible normalmente
✓ Todas las imágenes cargadas
✓ Todos los enlaces clickeables
✓ Navegación completamente normal
✓ SafeGuard en modo monitoreo silencioso
```

---

## 🔍 Criterios de Detección Detallados

### Imágenes Sospechosas:

**Se consideran sospechosas si contienen**:
```javascript
// En atributos (src, alt, title, class):
- porn, xxx, nude, naked, nsfw, adult
- sex, erotic, explicit
- Combinaciones de keywords

// Análisis contextual:
- Imágenes grandes (>500x500) sin alt text
- Padre del elemento contiene keywords
- URL de origen sospechosa
```

### Texto Sospechoso:

**Se considera sospechoso si contiene**:
```javascript
// Keywords por nivel:

Estricto: 15 términos
Moderado: 6 términos  
Permisivo: 3 términos

// Detección con regex:
\b[keyword]\b  // Solo palabras completas
```

### Enlaces Sospechosos:

**Se consideran sospechosos si**:
```javascript
// URL contiene:
/porn|xxx|adult|nsfw|nude|sex/i

// Texto del link contiene:
/porn|xxx|adult|nsfw|nude|sex/i
```

---

## 🎨 Estados Visuales

### Estado 1: Bloqueado Permanentemente
```css
.safeguard-permanent-block {
  filter: blur(50px) !important;
  pointer-events: none !important;
  user-select: none !important;
  cursor: not-allowed !important;
}
```
- ❌ NO puede ser revelado NUNCA
- ❌ NO responde a clicks
- ❌ NO puede ser seleccionado
- ❌ Cursor muestra "not-allowed"

### Estado 2: Seguro (Accesible)
```css
.safeguard-safe {
  /* Sin restricciones */
  cursor: pointer;
}
```
- ✅ Totalmente interactivo
- ✅ Puede ser clickeado
- ✅ Puede ser seleccionado
- ✅ Funciona normalmente

### Estado 3: Página Completa Bloqueada
```css
.safeguard-page-blocked {
  filter: blur(30px);
  pointer-events: none;
  overflow: hidden;
}
```
- ❌ Todo difuminado
- ❌ Overlay no removible
- ❌ Sin interacción posible

---

## 🔬 Flujo de Análisis Técnico

### Paso 1: Carga de Página
```
Usuario navega → URL interceptada → Pre-análisis rápido
```

### Paso 2: Evaluación Inicial
```javascript
// background.js analiza:
- ¿URL en blacklist?
- ¿Dominio conocido?
- ¿Patrones sospechosos en URL?

→ SI (muy obvio) → Bloquea página completa
→ NO → Permite carga y analiza contenido
```

### Paso 3: Análisis de Contenido (content.js)
```javascript
1. Obtener configuración
2. Analizar página completa (score + keywords)
   
   SI score > 70 || keywords > 5:
      → Bloquear página completa
   
   SINO:
      → Análisis selectivo:
         - Analizar cada imagen
         - Analizar cada texto
         - Analizar cada enlace
         
         Para cada elemento:
            SI sospechoso:
               → Aplicar blur permanente
            SINO:
               → Marcar como seguro
               → Permitir interacción
```

### Paso 4: Monitoreo Continuo
```javascript
MutationObserver detecta cambios:
   → Nuevo contenido agregado dinámicamente
   → Re-analizar solo elementos nuevos
   → Aplicar reglas correspondientes
```

---

## 📊 Ejemplos de Uso Real

### Ejemplo 1: Sitio de Noticias

**Situación**: Artículo sobre tema sensible con imágenes mixtas

**Resultado**:
- ✅ Título del artículo: Visible
- ✅ Texto principal: Visible
- ❌ Imagen explícita: Difuminada permanentemente
- ✅ Imagen ilustrativa: Visible
- ✅ Enlaces a más noticias: Clickeables
- ❌ Link a contenido adulto: Bloqueado

**Usuario puede**: Leer el artículo completo y navegar normalmente, solo el contenido inapropiado está censurado.

---

### Ejemplo 2: Foro de Discusión

**Situación**: Thread con comentarios variados

**Resultado**:
- ✅ Comentario 1 (limpio): Visible
- ❌ Comentario 2 (inapropiado): Difuminado
- ✅ Comentario 3 (limpio): Visible
- ❌ Avatar con imagen inapropiada: Difuminado
- ✅ Avatares normales: Visibles
- ✅ Botones de navegación: Funcionales

**Usuario puede**: Participar en la discusión, solo el contenido ofensivo está oculto.

---

### Ejemplo 3: Red Social

**Situación**: Feed con publicaciones mixtas

**Resultado**:
- ✅ Post 1 (foto de paisaje): Visible
- ✅ Post 2 (meme divertido): Visible
- ❌ Post 3 (contenido NSFW): Difuminado completamente
- ✅ Post 4 (video de gatito): Visible
- ❌ Link en comentario inapropiado: Deshabilitado

**Usuario puede**: Scrollear normalmente y disfrutar del contenido apropiado.

---

## ⚙️ Configuración del Usuario

### Niveles de Agresividad

**Permisivo**:
- Menos keywords (3)
- Score threshold alto (50)
- Solo contenido muy obvio

**Moderado** (Recomendado):
- Keywords estándar (6)
- Score threshold medio (30)
- Balance protección/acceso

**Estricto**:
- Más keywords (15)
- Score threshold bajo (15)
- Máxima protección

---

## 🎯 Ventajas del Sistema

### Para el Usuario:
1. ✅ **Navegación normal** en sitios legítimos
2. ✅ **Contenido útil accesible** incluso en páginas mixtas
3. ✅ **Protección efectiva** contra contenido inapropiado
4. ✅ **No bloquea páginas completas** innecesariamente

### Técnicas:
1. ✅ **Menor número de falsos positivos**
2. ✅ **Mejor experiencia de usuario**
3. ✅ **Bloqueo quirúrgico** en lugar de masivo
4. ✅ **Análisis inteligente** con contexto

---

## 🔒 Garantías de Seguridad

### Lo que NUNCA cambia:
1. ❌ Contenido detectado como sospechoso → **NUNCA** puede ser revelado
2. ❌ Enlaces bloqueados → **NUNCA** pueden ser clickeados
3. ❌ Imágenes inapropiadas → **SIEMPRE** permanecen difuminadas
4. ❌ Páginas completamente comprometidas → **NUNCA** son accesibles

### Lo que SÍ es flexible:
1. ✅ Contenido limpio → Siempre accesible
2. ✅ Navegación normal → Preservada cuando es seguro
3. ✅ Interacción → Permitida en áreas seguras

---

## 📈 Comparación: Antes vs Ahora

### Versión Anterior (v1.0):
```
Página con contenido mixto:
→ TODO difuminado
→ Nada clickeable
→ Nada revelable
→ Experiencia limitada
```

### Versión Nueva (v1.1):
```
Página con contenido mixto:
→ Solo contenido sospechoso difuminado
→ Contenido limpio clickeable
→ Navegación normal en áreas seguras
→ Experiencia completa donde es seguro
```

---

## 💡 Resumen

**El sistema inteligente detecta y actúa de forma quirúrgica**:

🌐 **Página 100% inapropiada** → Bloqueo total
🔄 **Página mixta** → Bloqueo selectivo (solo lo malo)
✅ **Página limpia** → Navegación normal

**Resultado**: Máxima protección + Mínima intrusión

---

<p align="center">
  <strong>SafeGuard v1.1 - Bloqueo Inteligente</strong><br>
  Protección quirúrgica, no masiva
</p>

<p align="center">
  Por <a href="https://github.com/xoreaxmrgamer">XorEaxMrGamer</a>
</p>
