# Linker

**Idioma de la documentación:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

Plugin comunitario para la versión de escritorio de [Obsidian](https://obsidian.md/). Mantiene los enlaces a notas Markdown como enlaces Wiki normales e incrusta automáticamente los archivos adjuntos compatibles. También convierte URL de vídeos de YouTube en reproductores integrados.

**Versión:** 0.5.0 · **Distribución:** GitHub Releases (instalación manual) · **Requisitos:** Obsidian 1.8.7 o superior, Windows, macOS o Linux. El plugin aún no figura en el catálogo oficial.

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

> Antes de realizar conversiones masivas, haz una copia de seguridad de la bóveda o utiliza una bóveda de prueba.

1. Abre [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases). Mientras el repositorio sea privado, necesitarás acceso. Descarga `main.js` y `manifest.json` de los archivos de la versión (**Assets**) o el archivo `linker-vX.Y.Z.zip`.
2. En tu **bóveda de Obsidian** (no en la carpeta de instalación del programa), abre o crea `.obsidian/plugins/linker/`.
3. Coloca allí `main.js` y `manifest.json`. Si utilizas el ZIP, extrae la carpeta `linker/` dentro de `.obsidian/plugins/`.

   ```text
   TuBoveda/
   └── .obsidian/
       └── plugins/
           └── linker/
               ├── main.js
               └── manifest.json
   ```

4. Reinicia Obsidian (o recarga los plugins de la comunidad), abre **Configuración → Plugins de la comunidad** y activa **Linker**.
5. Abre la configuración del plugin para seleccionar el idioma y las reglas.

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

Requiere Node.js y npm. El código TypeScript está en `src/`, las traducciones en `src/locales/` y esbuild crea un único `main.js`.

```bash
npm install
npm run typecheck
npm run build
npm test
```

GitHub Actions ejecuta las mismas comprobaciones.

## Publicar una versión nueva

Actualiza `manifest.json` y `package.json` a la misma versión nueva `X.Y.Z` y añade la sección `## [X.Y.Z]` a `CHANGELOG.md`. Si cambió el código, reconstruye y confirma `main.js`. Integra todo en `main`. El flujo [Publish Linker release](https://github.com/bratietokone/Linker4Obsidian/actions/workflows/release.yml) valida, compila, ejecuta las pruebas y publica automáticamente la versión de GitHub con la etiqueta `X.Y.Z` (sin `v`). Si falla alguna comprobación, no publica nada. No es necesario crear etiquetas ni publicar borradores manualmente. Puedes reintentarlo con **Run workflow** en `main`. Las versiones publicadas no se sobrescriben.

## Enlaces

- [Releases](https://github.com/bratietokone/Linker4Obsidian/releases)
- [Historial de cambios](CHANGELOG.es.md)
- [Repositorio](https://github.com/bratietokone/Linker4Obsidian)
- [Problemas y sugerencias](https://github.com/bratietokone/Linker4Obsidian/issues)
- [Licencia](LICENSE)

Proyecto comunitario independiente, no afiliado con Obsidian.
