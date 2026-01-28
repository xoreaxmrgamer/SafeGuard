# SafeGuard - Extensión de Control de Contenido

<p align="center">
  <img src="icons/icon128.png" alt="SafeGuard Logo" width="128">
</p>

**SafeGuard** es una extensión profesional para Chrome y Brave que proporciona protección avanzada contra contenido no deseado mediante detección inteligente multinivel, análisis de texto en tiempo real y bloqueo configurable.

## ✨ Características Principales

### 🔍 Detección Multinivel
- **Análisis de texto en tiempo real** con sensibilidad ajustable
- **Detección inteligente de imágenes** basada en contexto y atributos
- **Filtrado de URLs** con patrones y coincidencias de keywords
- **Bloqueo de dominios** conocidos y personalizados
- **Escaneo configurable** (rápido, normal o completo)

### 🛡️ Protección Personalizable
- **3 niveles de bloqueo**: Permisivo, Moderado y Estricto
- **Múltiples métodos de bloqueo**: Ocultar completamente o aplicar difuminado
- **Listas personalizables**: Whitelist y Blacklist de dominios
- **Configuración granular** para cada tipo de detección

### 📊 Estadísticas Detalladas
- Contador de sitios web bloqueados
- Imágenes filtradas
- Requests interceptados
- Total de elementos bloqueados
- Historial y seguimiento temporal

### 🎨 Interfaz Profesional
- Diseño moderno y minimalista
- Panel de control intuitivo
- Configuración avanzada completa
- Notificaciones visuales
- Página de bloqueo personalizada

## 🚀 Instalación

### Instalación en Chrome/Brave

1. **Descarga la extensión**
   - Descarga todos los archivos del proyecto
   - O clona el repositorio: `git clone https://github.com/tu-usuario/safeguard-extension.git`

2. **Abre el menú de extensiones**
   - En Chrome/Brave, navega a: `chrome://extensions/`
   - O desde el menú: Más herramientas → Extensiones

3. **Activa el modo de desarrollador**
   - Activa el interruptor "Modo de desarrollador" en la esquina superior derecha

4. **Carga la extensión**
   - Click en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta `safeguard-extension`
   - La extensión se instalará automáticamente

5. **¡Listo!**
   - El icono de SafeGuard aparecerá en tu barra de herramientas
   - Ya estás protegido

## 📖 Uso

### Inicio Rápido

1. **Activa SafeGuard**
   - Haz click en el icono de SafeGuard
   - Verifica que el indicador esté en "Activo"

2. **Selecciona tu nivel de protección**
   - **Permisivo**: Solo bloquea contenido obvio
   - **Moderado**: Balance entre protección y acceso (recomendado)
   - **Estricto**: Máxima protección

3. **Navega con seguridad**
   - SafeGuard trabajará en segundo plano
   - Los sitios bloqueados mostrarán una página informativa
   - Las estadísticas se actualizan en tiempo real

### Configuración Avanzada

Accede a la configuración completa haciendo click en "Configuración Avanzada" desde el popup o el menú de la extensión.

#### Pestañas de Configuración

**1. General**
- Habilitar/deshabilitar la extensión
- Nivel de bloqueo global
- Configuración de notificaciones

**2. Detección**
- **Análisis de texto**: Sensibilidad y profundidad de escaneo
- **Detección de imágenes**: Bloqueo de imágenes sospechosas
- Configuración de cada método de detección

**3. Bloqueo**
- Método de bloqueo (ocultar vs difuminar)
- Modo estricto de dominios
- Filtrado de URLs y patrones

**4. Listas**
- **Whitelist**: Dominios que nunca serán bloqueados
- **Blacklist**: Dominios personalizados a bloquear
- Gestión fácil de agregar/eliminar

**5. Avanzado**
- Exportar/Importar configuración
- Rastreo de estadísticas
- Restaurar valores por defecto

**6. Estadísticas**
- Resumen completo de actividad
- Reinicio de contadores
- Información de última actualización

## ⚙️ Características Técnicas

### Arquitectura

```
SafeGuard/
├── manifest.json          # Configuración de la extensión
├── background.js          # Service Worker principal
├── content.js            # Script de análisis de páginas
├── content.css           # Estilos de elementos bloqueados
├── popup.html/js/css     # Interfaz del popup
├── options.html/js/css   # Página de configuración
├── blocked.html          # Página de bloqueo
└── icons/                # Iconos de la extensión
```

### Sistema de Detección

**1. Análisis de URLs**
- Verificación contra whitelist
- Comparación con dominios conocidos
- Detección de patrones sospechosos
- Keywords en dominios

**2. Análisis de Texto**
- Escaneo del contenido visible
- Sistema de puntuación por keywords
- Umbrales ajustables por sensibilidad
- Marcado de elementos sospechosos

**3. Análisis de Imágenes**
- Verificación de atributos (src, alt, title)
- Análisis de contexto (elementos padre)
- Detección por dimensiones
- Bloqueo o difuminado configurable

**4. Observación Dinámica**
- MutationObserver para contenido dinámico
- Análisis de elementos cargados posteriormente
- Actualización en tiempo real

### Niveles de Bloqueo

**Permisivo**
- Lista reducida de keywords
- Solo patrones muy específicos
- Mínimo impacto en navegación
- Ideal para uso general

**Moderado (Recomendado)**
- Balance entre protección y accesibilidad
- Lista estándar de keywords
- Patrones comunes
- Configuración por defecto

**Estricto**
- Máxima protección
- Lista extendida de keywords
- Todos los patrones habilitados
- Bloqueo proactivo

## 🔒 Privacidad y Seguridad

- ✅ **Sin recopilación de datos**: SafeGuard no recopila ni envía información personal
- ✅ **Procesamiento local**: Todo el análisis se hace en tu navegador
- ✅ **Sin conexiones externas**: No requiere servidores externos
- ✅ **Código abierto**: Puedes revisar todo el código
- ✅ **Sin tracking**: No hay seguimiento de tu actividad

## 🛠️ Personalización

### Agregar Sitios a la Whitelist

1. Abre la configuración avanzada
2. Ve a la pestaña "Listas"
3. En "Lista Blanca", escribe el dominio (ej: `ejemplo.com`)
4. Click en "Agregar"

### Agregar Sitios a la Blacklist

1. Abre la configuración avanzada
2. Ve a la pestaña "Listas"
3. En "Lista Negra", escribe el dominio
4. Click en "Agregar"

### Ajustar Sensibilidad

Para reducir falsos positivos:
1. Ve a Configuración → Detección
2. Cambia la sensibilidad a "Baja" o "Media"
3. Ajusta la profundidad de escaneo según necesites

## 📊 Exportar/Importar Configuración

### Exportar
1. Ve a Configuración Avanzada → Avanzado
2. Click en "Exportar Configuración"
3. Se descargará un archivo JSON con tu configuración

### Importar
1. Ve a Configuración Avanzada → Avanzado
2. Click en "Importar Configuración"
3. Selecciona el archivo JSON exportado previamente

## ❓ Preguntas Frecuentes

**¿SafeGuard ralentiza mi navegador?**
No. SafeGuard está optimizado para un rendimiento mínimo. El análisis se hace de manera eficiente y solo cuando es necesario.

**¿Puedo usar SafeGuard en modo incógnito?**
Sí, pero debes habilitarlo manualmente en chrome://extensions/ → SafeGuard → "Permitir en modo incógnito"

**¿Qué hago si un sitio legítimo es bloqueado?**
Puedes agregarlo a tu whitelist desde la página de bloqueo o desde la configuración.

**¿SafeGuard funciona en todos los sitios?**
Sí, SafeGuard funciona en todos los sitios web excepto en las páginas internas del navegador (chrome://, about:, etc.)

**¿Cuánta memoria usa SafeGuard?**
SafeGuard usa típicamente entre 20-50 MB de memoria, comparable a otras extensiones de seguridad.

## 🐛 Reportar Problemas

Si encuentras un problema:
1. Abre un issue en GitHub
2. Describe el problema en detalle
3. Incluye:
   - Versión del navegador
   - Versión de SafeGuard
   - Pasos para reproducir
   - Capturas de pantalla si aplica

## 🤝 Contribuir

Las contribuciones son bienvenidas! Si quieres contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

Gracias a todos los que han contribuido al proyecto y proporcionado feedback para mejorarlo.

---

**Desarrollado con ❤️ para una navegación más segura**

¿Necesitas ayuda? Abre un issue en GitHub o contacta al soporte.
