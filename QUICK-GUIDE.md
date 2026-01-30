# 🎯 Guía Rápida: Bloqueo Selectivo Inteligente

## ¿Cómo funciona?

SafeGuard v1.1 analiza cada página y decide inteligentemente qué bloquear:

---

## 📱 Escenario 1: Sitio Totalmente Inapropiado

**Ejemplo**: pornhub.com, sitios XXX, etc.

```
┌──────────────────────────────────────┐
│                                      │
│   [TODO DIFUMINADO Y BLOQUEADO]     │
│                                      │
│     ┌────────────────────┐          │
│     │   🛡️                │          │
│     │  Página Bloqueada  │          │
│     │                    │          │
│     │  ← Volver Atrás    │          │
│     └────────────────────┘          │
│                                      │
└──────────────────────────────────────┘
```

**Resultado**: 
- ❌ TODO bloqueado sin excepción
- ❌ NO puedes ver NADA
- ✅ Mensaje informativo
- ✅ Botón para volver

---

## 📰 Escenario 2: Página Mixta (¡NUEVO!)

**Ejemplo**: Noticias, redes sociales, foros

```
┌──────────────────────────────────────┐
│  Título del Artículo  ✅              │
│  ───────────────────────────────     │
│                                      │
│  Texto normal del artículo que      │
│  puedes leer completamente... ✅     │
│                                      │
│  [IMAGEN DIFUMINADA] ❌               │
│                                      │
│  Más texto legible aquí sobre el    │
│  tema principal... ✅                 │
│                                      │
│  [Foto ilustrativa] ✅                │
│                                      │
│  "Párrafo sospechoso" [BLUR] ❌      │
│                                      │
│  Conclusión del artículo... ✅        │
│                                      │
│  Enlaces:                            │
│  → Más información ✅                 │
│  → Link inapropiado [BLOQUEADO] ❌   │
└──────────────────────────────────────┘
```

**Resultado**: 
- ✅ Contenido limpio: VISIBLE y clickeable
- ❌ Contenido sospechoso: BLOQUEADO permanentemente
- ✅ Puedes leer y navegar normalmente
- ❌ Solo lo inapropiado está censurado

---

## 🌐 Escenario 3: Página Completamente Limpia

**Ejemplo**: Wikipedia, sitios educativos, blogs

```
┌──────────────────────────────────────┐
│  Todo el contenido visible ✅         │
│  ═══════════════════════════         │
│                                      │
│  Textos legibles                     │
│  Imágenes visibles                   │
│  Enlaces clickeables                 │
│  Videos reproducibles                │
│                                      │
│  [Navegación 100% normal]            │
└──────────────────────────────────────┘
```

**Resultado**: 
- ✅ TODO funciona normalmente
- ✅ Navegación sin restricciones
- ✅ SafeGuard en modo silencioso

---

## 🎛️ Comparación Visual

### ❌ ANTES (v1.0):
```
Página con 1 imagen inapropiada:
  → TODA la página difuminada
  → No puedes ver NADA
  → Experiencia limitada
```

### ✅ AHORA (v1.1):
```
Página con 1 imagen inapropiada:
  → Solo ESA imagen difuminada
  → El resto TOTALMENTE visible
  → Navegación normal
```

---

## 🔍 ¿Qué se Considera Sospechoso?

### Imágenes ❌
- src/alt contiene: porn, xxx, sex, nude, nsfw, adult
- Videos con contenido explícito
- Iframes de sitios adultos

### Texto ❌
- Párrafos con keywords explícitas
- Títulos con términos inapropiados
- Comentarios ofensivos

### Enlaces ❌
- URLs con términos adultos
- Links a sitios XXX
- Texto del enlace sospechoso

---

## ✅ ¿Qué NUNCA se Bloquea?

### Contenido Seguro
- ✅ Texto informativo normal
- ✅ Imágenes ilustrativas limpias
- ✅ Enlaces a sitios legítimos
- ✅ Videos educativos
- ✅ Navegación y menús
- ✅ Botones y controles

---

## 🎯 Ejemplos Reales

### Ejemplo 1: Reddit
```
Post 1: Meme divertido           ✅ Visible
Post 2: NSFW marcado            ❌ Difuminado
Post 3: Discusión normal        ✅ Visible
Post 4: Link inapropiado        ❌ Bloqueado
Post 5: Video de gatos          ✅ Visible
```

### Ejemplo 2: Twitter/X
```
Tweet 1: Noticia política       ✅ Visible
Tweet 2: Imagen explícita       ❌ Difuminada
Tweet 3: Tweet normal           ✅ Visible
Link en tweet: sitio XXX        ❌ Bloqueado
```

### Ejemplo 3: Periódico Digital
```
Artículo principal              ✅ Visible
Foto ilustrativa                ✅ Visible
Banner publicitario adulto      ❌ Bloqueado
Comentario ofensivo             ❌ Difuminado
Más noticias                    ✅ Visibles
```

---

## ⚙️ Configuración

Puedes ajustar la sensibilidad:

**Modo Permisivo**: 
- Solo bloquea lo MUY obvio
- Menos falsos positivos

**Modo Moderado** (Recomendado):
- Balance perfecto
- Protección efectiva

**Modo Estricto**:
- Máxima protección
- Más keywords detectadas

---

## 🔒 Garantías

### Lo que SIEMPRE pasa:
1. ❌ Contenido sospechoso → Bloqueado PARA SIEMPRE
2. ❌ No se puede revelar NUNCA
3. ❌ Enlaces bloqueados NO son clickeables

### Lo que NUNCA pasa:
1. ✅ Contenido limpio → Siempre accesible
2. ✅ Navegación normal → Preservada
3. ✅ Falsos positivos → Minimizados

---

## 💡 Tip Pro

Si una página mixta tiene MUCHO contenido inapropiado:
```
Score > 70 o más de 5 keywords
  ↓
SafeGuard bloquea TODO automáticamente
  ↓
Ves el overlay de "Página Bloqueada"
```

Esto te protege de sitios que intentan "disfrazar" contenido adulto.

---

## 🎉 Resultado

**Máxima Protección + Mínima Intrusión**

Puedes navegar normalmente en internet mientras SafeGuard protege tu experiencia de forma inteligente y quirúrgica.

---

<p align="center">
  <strong>SafeGuard v1.1</strong><br>
  Bloqueo Inteligente, No Masivo<br>
  <a href="https://github.com/xoreaxmrgamer/SafeGuard">GitHub</a> • 
  <a href="https://www.youtube.com/@xoreaxmrgamer">YouTube</a>
</p>
