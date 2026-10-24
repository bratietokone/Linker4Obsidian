# Linker

**Idioma de la documentación:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

Plugin comunitario para la versión de escritorio de [Obsidian](https://obsidian.md/). Mantiene los enlaces a notas Markdown como enlaces Wiki normales e incrusta automáticamente los archivos adjuntos compatibles. También convierte URL de vídeos de YouTube en reproductores integrados.

**Versión:** 0.5.1 · **Estado:** disponible en los plugins comunitarios de Obsidian · **Requisitos:** Obsidian 1.8.7 o superior (Windows, macOS y Linux de escritorio).

## Funciones

- Las notas Markdown conservan `[[nota.md]]`; imágenes, PDF, audio y vídeo se incrustan como `![[archivo.ext]]` según las reglas configurables.
- Procesa enlaces nuevos, pegados o creados mediante el autocompletado `[[`.
- Convierte URL independientes de YouTube (incluidos Shorts y `/live/`) en `![](URL)`.
- Ofrece vista previa y confirmación antes de convertir enlaces de la nota actual o toda la bóveda.
- Interfaz en modo automático (idioma de Obsidian), English, Русский, Español y 简体中文.
- No requiere cuenta ni servicio externo y no envía el contenido de tus notas a un servidor.

- **Archivos y carpetas externos:** crea enlaces Markdown `file:///` y Wiki `[[external:...]]` a archivos externos sin copiarlos a la bóveda.

> **Migración desde Linker4Obsidian 0.4.0 o anterior:** el ID ha cambiado de `linker4obsidian` a `linker`. Desactiva el plugin anterior, instala Linker 0.5.0 o posterior en `.obsidian/plugins/linker/` y copia el antiguo `data.json` si deseas conservar los ajustes. Comprueba la instalación antes de eliminar la carpeta anterior.

**Acceso al sistema de archivos y privacidad:** la función de enlaces externos (solo escritorio) consulta mediante Node.js los metadatos de la ruta local que el usuario elige o abre, y emplea Electron para abrir o mostrar el archivo o carpeta. Ese acceso fuera de la bóveda solo se necesita para esta función. El plugin no lee ni transmite el contenido de archivos externos, no envía notas y no recopila telemetría.

## Instalación (Windows, macOS y Linux)

> Haz una copia de seguridad de tu bóveda antes de convertir enlaces masivamente o probar compilaciones de desarrollo.

### Desde Obsidian (recomendado)

1. Abre **Configuración → Plugins de la comunidad → Explorar (Browse)**.
2. Busca **Linker** (autor: **bratietokone**) o abre la [página del plugin](https://obsidian.md/plugins?id=linker).
3. Pulsa **Instalar** y después **Activar**. Abre **Configuración → Linker** para ajustar idioma y reglas.

Esta es la forma recomendada de instalar y recibir actualizaciones en Windows, macOS y Linux. **No es necesario descargar archivos manualmente.**

### Instalación manual (avanzada y de pruebas)

Para instalar una versión específica de GitHub o una compilación de prueba:

1. Obtén `main.js` y `manifest.json` desde [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases) o desde el artefacto de CI de la rama. La versión **0.5.1 incluye dos archivos separados, no un ZIP**; algunas versiones anteriores sí tienen ZIP.
2. Abre la **carpeta de la bóveda** (no la instalación de Obsidian) y crea `.obsidian/plugins/linker/`.
3. Copia ambos archivos sin cambiar sus nombres:

   ```text
   TuBoveda/
   └── .obsidian/
       └── plugins/
           └── linker/
               ├── main.js
               └── manifest.json
   ```

4. Reinicia Obsidian o recarga los plugins de la comunidad y activa **Linker**.

Antes de sustituir una instalación estable por una versión de prueba, guarda la bóveda y `data.json`. Las publicaciones requieren pruebas locales previas.

### Mostrar la carpeta oculta

| Sistema | Ejemplo de ruta | Mostrar archivos ocultos |
| --- | --- | --- |
| Windows | `C:\\Users\\<usuario>\\Documents\\MiBoveda\\.obsidian\\plugins\\linker\\` | Explorador: Ver → Mostrar → Elementos ocultos. |
| macOS | `/Users/<usuario>/Documents/MiBoveda/.obsidian/plugins/linker/` | Finder: **Cmd+Shift+.** |
| Linux | `/home/<usuario>/Documents/MiBoveda/.obsidian/plugins/linker/` | Gestor de archivos: **Ctrl+H**. |

Son solo ejemplos: tu bóveda puede estar en cualquier ubicación. No crees una carpeta duplicada `linker/linker/`.

## Idioma de la interfaz

En **Configuración → Linker → Idioma de la interfaz** selecciona **Automático**, **English**, **Русский**, **Español** o **简体中文**. Automático sigue el idioma de Obsidian cuando esté disponible; para los idiomas no admitidos se usa inglés.

Los ajustes, notificaciones y diálogos cambian inmediatamente. Para actualizar los nombres de comandos en la paleta, recarga el plugin.

## Reglas predeterminadas

| Contenido | Resultado |
| --- | --- |
| Notas Markdown (`.md`, `.markdown`) | `[[Notas/Mi nota.md]]` |
| Imágenes (`.png`, `.jpg`, `.webp`, etc.) | `![[foto.webp]]` |
| PDF | `![[documento.pdf]]` |
| Vídeo local | `![[video.mp4]]` |
| Audio local | `![[audio.mp3]]` |
| Extensiones desconocidas | `[[archivo.zip]]` |
| URL individual de un vídeo YouTube | `![](https://www.youtube.com/watch?v=VIDEO_ID)` |
| Otros enlaces web | Enlace normal |

Las reglas por categoría y las extensiones adicionales son configurables. **Usar siempre un enlace** tiene prioridad sobre **Incrustar siempre**. La vista previa depende de los formatos compatibles con Obsidian.

## Archivos y carpetas externos

En **Configuración → Linker → Archivos y carpetas externos** hay una página independiente. Activa los enlaces externos y elige Markdown o Wiki para crear enlaces nuevos; ambos formatos siguen funcionando.

```markdown
[Proyectos](<file:///home/user/Projects/>)
[Informe](<file:///home/user/Documents/report.pdf>)

[[external:/home/user/Projects/|Proyectos]]
[[external:/home/user/Documents/report.pdf|Informe]]
```

Desde la paleta de comandos utiliza **Insertar enlace a archivo externo** o **Insertar enlace a carpeta externa**. Selecciona la ruta en el cuadro de diálogo nativo, si está disponible, o introduce una ruta absoluta manualmente. Puedes editar el nombre del enlace.

Los enlaces se abren en el modo de lectura o Live Preview mediante la aplicación predeterminada o el gestor de archivos; también puedes elegir mostrar el destino en su carpeta. Los ejecutables nunca se lanzan automáticamente. Los archivos no encontrados muestran un aviso. No se admiten anfitriones de archivos remotos ni otros esquemas.

**Nota:** no incrusta ni copia archivos externos y no modifica el tratamiento de los adjuntos de la bóveda.

## Uso

- **Enlaces nuevos:** escribe `[[...]]` o selecciona un archivo con el autocompletado.
- **Arrastrar y pegar archivos:** Obsidian gestiona el archivo; Linker aplica la regla cuando Obsidian inserta un enlace Wiki.
- **YouTube:** pega la URL de un vídeo en una línea independiente y adecuada.
- **Notas existentes:** abre la paleta de comandos (`Ctrl+P` / `Cmd+P`) y elige la conversión con vista previa para la nota actual o toda la bóveda.

Las incrustaciones intencionales se conservan. Se omiten bloques de código, código en línea, frontmatter YAML y líneas con comentarios HTML. **Haz una copia de seguridad antes de la conversión masiva.**

## Limitaciones

- Las rutas externas son absolutas, específicas de cada equipo y pueden estar restringidas en entornos aislados como Flatpak.
- Solo funciona en **Obsidian de escritorio**; no es compatible con la versión móvil.
- No se incrustan enlaces exclusivos a listas de reproducción ni otros sitios web.
- Los enlaces Markdown a archivos, como `[archivo](imagen.png)`, no se convierten a Wiki-embeds.
- Los enlaces ya existentes se convierten mediante los comandos; otros plugins pueden influir en la inserción de enlaces.

## Desarrollo

Requiere Node.js y npm. El código TypeScript está en `src/`, las traducciones en `src/locales/` y esbuild genera `main.js` durante la compilación; no se guarda en Git y se adjunta automáticamente a GitHub Releases.

```bash
npm ci
npm run validate
npm run typecheck
npm run lint
npm run build
npm test
```

GitHub Actions ejecuta las mismas comprobaciones.

## Desarrollo y aprobación de versiones

**La versión estable actual es 0.5.1.** Las funciones previstas no se consideran publicadas.

1. **Debatir detalladamente cada etapa antes de implementarla:** alcance, riesgos, criterios de aceptación y posibles regresiones.
2. Desarrollar en **una rama y solicitud de cambios independientes**. Ejecutar `npm ci`, `npm run validate`, `npm run typecheck`, `npm run lint`, `npm run build` y `npm test`. CI comprueba también que la compilación sea reproducible y proporciona un artefacto de prueba.
3. El responsable prueba **localmente en Obsidian de escritorio** el artefacto y, cuando corresponda, compila desde el código fuente. Comprueba enlaces, adjuntos, YouTube y ajustes. Las incidencias se corrigen antes de continuar.
4. **Solo después de aprobar expresamente la publicación**, actualizar `manifest.json` y `package.json` a la versión `X.Y.Z` acordada y añadir el CHANGELOG traducido. Un cambio de versión del manifiesto en `main` desencadena la publicación automáticamente: no se modifica antes de la aprobación.
5. El workflow [Publish Linker release](https://github.com/bratietokone/Linker4Obsidian/actions/workflows/release.yml) valida, compila, prueba, acredita y publica GitHub Release `X.Y.Z` (sin `v`) con `main.js` y `manifest.json`. El archivo generado no se confirma en Git. No se sobrescriben versiones ya publicadas.

**Pasar CI no constituye una autorización para publicar.** No se publican ramas de prueba ni se comienza otra etapa sin la conversación correspondiente.

## Propuestas (aún no disponibles en 0.5.1)

- **Correcciones y compatibilidad:** revisar las [advertencias de Obsidian Community (Issue #9)](https://github.com/bratietokone/Linker4Obsidian/issues/9), especialmente la seguridad de las rutas externas y Obsidian 1.8.7+.
- **Auditoría de adjuntos:** analizar archivos de la bóveda, mostrar posibles adjuntos sin referencias, ofrecer vista previa, informes y exclusiones. El primer paso será **solo lectura**.
- **Limpieza opcional:** en una fase futura, después de discusión y pruebas locales, considerar mover a la papelera únicamente los archivos seleccionados expresamente. No se prevé borrado automático ni permanente.

Son propuestas y **no funciones existentes ni fechas de lanzamiento**.

## Enlaces

- [Releases](https://github.com/bratietokone/Linker4Obsidian/releases)
- [Historial de cambios](CHANGELOG.es.md)
- [Repositorio](https://github.com/bratietokone/Linker4Obsidian)
- [Problemas y sugerencias](https://github.com/bratietokone/Linker4Obsidian/issues)
- [Licencia](LICENSE)

Proyecto comunitario independiente, no afiliado con Obsidian.
