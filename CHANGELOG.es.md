# Historial de cambios

**Idioma:** [English](CHANGELOG.md) | [Русский](CHANGELOG.ru.md) | [Español](CHANGELOG.es.md) | [简体中文](CHANGELOG.zh-CN.md)

Principales cambios de Linker4Obsidian.

## [Sin publicar]

- En desarrollo: enlaces a archivos y carpetas externos en formatos Markdown (`file:///`) y Wiki (`external:`), con página de configuración y comandos propios.

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
