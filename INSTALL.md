# 🚀 Guía de Instalación Rápida - SafeGuard

## Instalación en 3 Pasos

### Paso 1: Preparar la Extensión
1. Descarga o clona este repositorio
2. Asegúrate de tener todos los archivos en la carpeta `safeguard-extension`

### Paso 2: Cargar en el Navegador
1. Abre Chrome o Brave
2. Ve a: `chrome://extensions/`
3. Activa el **Modo de desarrollador** (esquina superior derecha)
4. Click en **"Cargar extensión sin empaquetar"**
5. Selecciona la carpeta `safeguard-extension`

### Paso 3: ¡Listo!
- El icono de SafeGuard aparecerá en tu barra de herramientas
- Haz click para configurar tu nivel de protección
- Comienza a navegar de forma segura

## Estructura de Archivos Requeridos

```
safeguard-extension/
├── manifest.json          ✅ Requerido
├── background.js          ✅ Requerido
├── content.js            ✅ Requerido
├── content.css           ✅ Requerido
├── popup.html            ✅ Requerido
├── popup.js              ✅ Requerido
├── popup.css             ✅ Requerido
├── options.html          ✅ Requerido
├── options.js            ✅ Requerido
├── options.css           ✅ Requerido
├── blocked.html          ✅ Requerido
├── icons/
│   ├── icon16.png       ✅ Requerido
│   ├── icon48.png       ✅ Requerido
│   └── icon128.png      ✅ Requerido
├── README.md             ℹ️ Opcional
└── LICENSE               ℹ️ Opcional
```

## Verificación

Para verificar que la extensión está funcionando:

1. El icono debe aparecer en la barra de herramientas
2. Al hacer click, debe abrirse el popup
3. El indicador debe mostrar "Activo" en verde
4. Las estadísticas deben mostrar 0 inicialmente

## Configuración Inicial Recomendada

1. **Nivel de Protección**: Moderado (recomendado para empezar)
2. **Análisis de texto**: Activado
3. **Bloqueo de imágenes**: Activado
4. **Filtrado de URLs**: Activado

## Solución de Problemas

### La extensión no carga
- Verifica que todos los archivos estén presentes
- Asegúrate de seleccionar la carpeta correcta
- Revisa que el modo desarrollador esté activado

### El icono no aparece
- Click derecho en la barra de herramientas
- Selecciona "SafeGuard" para fijarlo

### No bloquea contenido
- Verifica que la protección esté activada
- Revisa el nivel de bloqueo configurado
- Abre la consola del desarrollador (F12) para ver errores

## Permisos Necesarios

SafeGuard requiere los siguientes permisos:
- `storage`: Para guardar tu configuración
- `webRequest`: Para interceptar y analizar requests
- `webNavigation`: Para detectar cambios de página
- `tabs`: Para gestionar las pestañas
- `declarativeNetRequest`: Para bloqueo eficiente
- `<all_urls>`: Para funcionar en todos los sitios

## Próximos Pasos

Después de instalar:
1. Explora la configuración avanzada
2. Personaliza las listas blanca/negra
3. Ajusta la sensibilidad según tus necesidades
4. Revisa las estadísticas después de un tiempo de uso

## Soporte

¿Necesitas ayuda? Consulta el README.md completo o abre un issue en GitHub.

---

**¡Disfruta de una navegación más segura con SafeGuard!** 🛡️
