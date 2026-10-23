# Linker4Obsidian

**Idioma de la documentación:** [English](README.md) | [Русский](README.ru.md) | [Español](README.es.md) | [简体中文](README.zh-CN.md)

Plugin comunitario para la versión de escritorio de [Obsidian](https://obsidian.md/). Mantiene los enlaces a notas Markdown como enlaces Wiki normales e incrusta automáticamente los archivos adjuntos compatibles. También convierte URL de vídeos de YouTube en reproductores integrados.

**Versión:** 0.3.0 · **Distribución:** GitHub Releases (instalación manual) · **Requisitos:** Obsidian 1.8.7 o superior, Windows, macOS o Linux. El plugin aún no figura en el catálogo oficial.

## Funciones

- Las notas Markdown conservan `[[nota.md]]`; imágenes, PDF, audio y vídeo se incrustan como `![[archivo.ext]]` según las reglas configurables.
- Procesa enlaces nuevos, pegados o creados mediante el autocompletado `[[`.
- Convierte URL independientes de YouTube (incluidos Shorts y `/live/`) en `![](URL)`.
- Ofrece vista previa y confirmación antes de convertir enlaces de la nota actual o toda la bóveda.
- Interfaz en modo automático (idioma de Obsidian), English, Русский, Español y 简体中文.
- No requiere cuenta ni servicio externo y no envía el contenido de tus notas a un servidor.

- **Archivos y carpetas externos:** crea enlaces Markdown `file:///` y Wiki `[[external:...]]` a archivos externos sin copiarlos a la bóveda.

## Instalación (Windows, macOS y Linux)

> Antes de realizar conversiones masivas, haz una copia de seguridad de la bóveda o utiliza una bóveda de prueba.

1. Abre [GitHub Releases](https://github.com/bratietokone/Linker4Obsidian/releases). Mientras el repositorio sea privado, necesitarás acceso. Descarga `main.js` y `manifest.json` de los archivos de la versión (**Assets**) o el archivo `linker4obsidian-vX.Y.Z.zip`.
2. En tu **bóveda de Obsidian** (no en la carpeta de instalación del programa), abre o crea `.obsidian/plugins/linker4obsidian/`.
3. Coloca allí `main.js` y `manifest.json`. Si utilizas el ZIP, extrae la carpeta `linker4obsidian/` dentro de `.obsidian/plugins/`.

   ```text
   TuBoveda/
   └── .obsidian/
       └── plugins/
           └── linker4obsidian/
               ├── main.js
               └── manifest.json
   ```

4. Reinicia Obsidian (o recarga los plugins de la comunidad), abre **Configuración → Plugins de la comunidad** y activa **Linker4Obsidian**.
5. Abre la configuración del plugin para seleccionar el idioma y las reglas.

### Mostrar la carpeta oculta

| Sistema | Ejemplo de ruta | Mostrar archivos ocultos |
| --- | --- | --- |
| Windows | `C:\\Users\\<usuario>\\Documents\\MiBoveda\\.obsidian\\plugins\\linker4obsidian\\` | Explorador: Ver → Mostrar → Elementos ocultos. |
| macOS | `/Users/<usuario>/Documents/MiBoveda/.obsidian/plugins/linker4obsidian/` | Finder: **Cmd+Shift+.** |
| Linux | `/home/<usuario>/Documents/MiBoveda/.obsidian/plugins/linker4obsidian/` | Gestor de archivos: **Ctrl+H**. |

Son solo ejemplos: tu bóveda puede estar en cualquier ubicación. No crees una carpeta duplicada `linker4obsidian/linker4obsidian/`.

## Idioma de la interfaz

En **Configuración → Linker4Obsidian → Idioma de la interfaz** selecciona **Automático**, **English**, **Русский**, **Español** o **简体中文**. Automático sigue el idioma de Obsidian cuando esté disponible; para los idiomas no admitidos se usa inglés.

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

## Archivos y carpetas externos (versión de desarrollo)

En **Configuración → Linker4Obsidian → Archivos y carpetas externos** hay una página independiente. Activa los enlaces externos y elige Markdown o Wiki para crear enlaces nuevos; ambos formatos siguen funcionando.

```markdown
[Proyectos](<file:///home/user/Projects/>)
[Informe](<file:///home/user/Documents/report.pdf>)

[[external:/home/user/Projects/|Proyectos]]
[[external:/home/user/Documents/report.pdf|Informe]]
```

Desde la paleta de comandos utiliza **Insertar enlace a archivo externo** o **Insertar enlace a carpeta externa**. Selecciona la ruta en el cuadro de diálogo nativo, si está disponible, o introduce una ruta absoluta manualmente. Puedes editar el nombre del enlace.

Los enlaces se abren en el modo de lectura o Live Preview mediante la aplicación predeterminada o el gestor de archivos; también puedes elegir mostrar el destino en su carpeta. Los ejecutables nunca se lanzan automáticamente. Los archivos no encontrados muestran un aviso. No se admiten anfitriones de archivos remotos ni otros esquemas.

**Nota:** función de desarrollo todavía no incluida en la versión estable v0.3.0. No incrusta ni copia adjuntos externos y no cambia el tratamiento de adjuntos de la bóveda.

## Uso

- **Enlaces nuevos:** escribe `[[...]]` o selecciona un archivo con el autocompletado.
- **Arrastrar y pegar archivos:** Obsidian gestiona el archivo; Linker4Obsidian aplica la regla cuando Obsidian inserta un enlace Wiki.
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

## Enlaces

- [Releases](https://github.com/bratietokone/Linker4Obsidian/releases)
- [Historial de cambios](CHANGELOG.es.md)
- [Repositorio](https://github.com/bratietokone/Linker4Obsidian)
- [Problemas y sugerencias](https://github.com/bratietokone/Linker4Obsidian/issues)
- [Licencia](LICENSE)

Proyecto comunitario independiente, no afiliado con Obsidian.
