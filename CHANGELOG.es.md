# Historial de cambios

**Idioma:** [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md) | [Español](CHANGELOG.es.md) | [简体中文](CHANGELOG.zh-CN.md)

Principales cambios de Linker4Obsidian.

## [0.5.1] - 2026-10-23

- Se corrigió el fallo del análisis de código de Obsidian Community provocado por una regla ESLint al revisar el controlador de eventos DOM.
- Se actualizaron los encabezados de ajustes para utilizar `Setting.setHeading()`.
- Se introdujeron compilaciones reproducibles mediante npm lockfile, una revisión ESLint más completa y la generación automática de artefactos.
- Se añadieron attestations de GitHub y se eliminó el ZIP no admitido de la publicación.
- Sin cambios en el comportamiento de los enlaces.

## [0.5.0] - 2026-10-23

- Preparación para publicar el plugin como **Linker** en el directorio de la comunidad.
- El ID cambió de `linker4obsidian` a `linker`; las instalaciones existentes requieren una migración manual.
- Verificación automática del manifiesto y las versiones.
- GitHub Actions prepara versiones borrador a partir de etiquetas como `0.5.0` (sin `v`).
- Sin cambios en la conversión de enlaces.

## [0.4.0] - 2026-10-23

- Se añadieron enlaces a archivos y carpetas fuera de la bóveda en formatos Markdown (`file:///`) y Wiki (`[[external:...|nombre]]`).
- Se añadió una pestaña independiente de **Archivos y carpetas externos** para elegir el formato y el modo de apertura.
- Se añadieron comandos para insertar enlaces mediante el selector de archivos o introduciendo una ruta absoluta.
- Los enlaces se pueden abrir con la aplicación o gestor predeterminado, con avisos para rutas ausentes y protección ante ejecutables.
- No cambiaron las reglas de adjuntos internos, enlaces Wiki ni YouTube. Interfaz y documentación en cuatro idiomas.

## [0.3.0] - 2026-10-23

- Se añadieron español y chino simplificado al selector de idiomas y a la detección automática.
- Las traducciones de los cuatro idiomas se extrajeron a módulos tipados en `src/locales/`.
- La compilación utiliza esbuild para generar un único `main.js`.
- Se añadieron README e historiales de cambios en español y chino simplificado.
- Se mantuvo la compatibilidad con las reglas y preferencias existentes.

## [0.2.0] - 2026-10-23

- Se añadió la selección de idioma: automático, inglés y ruso.
- Se tradujeron ajustes, diálogos, notificaciones y nombres de comandos.
- Se añadieron READMEs en inglés y ruso con instrucciones para Windows, macOS y Linux.
- Se mantuvo la compatibilidad con los ajustes de 0.1.0.
- Se añadieron el historial de cambios y los paquetes de GitHub Releases (ZIP y archivos individuales).
- Se corrigió la compatibilidad de tipos con la API de Obsidian.

## [0.1.0] - 2026-10-23

- Primera versión funcional para Obsidian de escritorio.
- Enlaces Wiki normales para Markdown; incrustaciones automáticas para adjuntos compatibles.
- Incrustación de YouTube, incluidos Shorts y enlaces a vídeos en directo.
- Comandos de conversión con vista previa y confirmación para la nota actual o toda la bóveda.
- Reglas configurables según extensión.
