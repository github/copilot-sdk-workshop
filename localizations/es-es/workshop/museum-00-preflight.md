# Museum Exhibit Studio: preparación

> **Tiempo:** Sin límite  
> **Taller:** Agente no SDLC

## Qué vas a crear

Museum Exhibit Studio convierte hechos aprobados por educadores en texto de exposición listo para visitantes:

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

Creas una única aplicación de consola que crece directamente en `start-museum/<language>`. Cada paso
añade una idea y termina con una ejecución real, para que el conservador tome forma ante ti:

| Paso | Añades | Ves |
|---|---|---|
| 1 | Un cliente, una sesión, un prompt | Texto de museo en el terminal |
| 2 | La impresora de streaming ya preparada | Texto que llega en vivo |
| 3 | El mensaje del sistema del conservador | Una voz y una forma distintas |
| 4 | La herramienta de hechos aprobados, el prompt y el ejecutor de sesiones limitado | Texto que sigue tus hechos |
| 5 | El validador ya preparado | Un informe estructural PASS/FAIL |
| 6 | Una sesión de investigación acotada con Wikipedia | Contexto citado, mantenido fuera de la exposición |
| 7 | Una página interactiva | `exhibit.html` en el navegador |
| 8 | Una celebración y recursos | Tu próximo proyecto empieza aquí |

Los siete pasos prácticos duran unos 90 minutos. Complétalos en orden y después celebra lo que has
creado y explora los recursos del paso final.

El proyecto inicial ya incluye la infraestructura que no deberías tener que escribir nunca: los
conjuntos de hechos aprobados y sus límites, el menú de selección de hechos, una impresora de
streaming, validación determinista de exposiciones, el servidor MCP de Wikipedia acotado con su
controlador de permisos de denegación predeterminada, el permiso de escritura de archivo único para
`exhibit.html`, los mensajes del sistema, el texto fijo del prompt para la estructura de la
exposición, la solicitud de investigación y los requisitos de la página, y el control de errores
alrededor de tu código. **Nunca editas los archivos auxiliares.** Escribes el código del SDK: la
configuración de sesión, el registro de herramientas y las configuraciones de sesión, las
instrucciones en los prompts de exposición y página, y un ejecutor de sesiones.

Necesitas una CLI de GitHub Copilot autenticada, el runtime de tu lenguaje y un terminal. Trabajas
directamente en el proyecto mínimo bajo `start-museum/<language>`, no en la aplicación terminada. El
proyecto completado bajo `finished/<language>/museum-exhibit-studio` es solo material de referencia
opcional.

## Clona el repositorio del taller

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Confirma que el terminal está en la raíz del repositorio antes de cambiar a un proyecto inicial:

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

El comando debe finalizar correctamente sin salida.

Creas la aplicación de museo **directamente**, dentro del directorio del proyecto inicial de tu
lenguaje. No hay ningún paso de copia. Eso significa que editas archivos con seguimiento del
repositorio, así que tu trabajo aparece en `git status` como archivos modificados. Es lo esperado y
correcto. Si quieres empezar de nuevo desde un proyecto inicial limpio, ejecuta `git checkout -- .`
desde la raíz del repositorio para descartar tus ediciones.

Cambia ahora al directorio del proyecto inicial de tu lenguaje y quédate ahí para todos los comandos
del taller de museo.

:::language dotnet
Cambia al proyecto inicial de .NET y, después, restaura, compila y ejecuta su punto de entrada local:

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

Condición de superación: la compilación se completa correctamente y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in Helpers/.`

Trabajarás en `start-museum/dotnet` durante el resto del taller, así que deja este terminal aquí.
Desde esta carpeta, introduce `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es `Helpers/Curator*.cs` en el espacio de nombres `MuseumExhibitStudio.Helpers`.
Escribirás todos los cambios de las lecciones en `Program.cs`.
:::

:::language nodejs
Cambia al proyecto inicial de Node.js. Su archivo de bloqueo conserva SDK 1.0.11 y el paquete de
plataforma compatible `@github/copilot` 1.0.80:

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

Condición de superación: la compilación se completa correctamente y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/curator.ts.`

Trabajarás en `start-museum/nodejs` durante el resto del taller, así que deja este terminal aquí.
Desde esta carpeta, introduce `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es `src/curator.ts`, y los mensajes del sistema están en
`src/system-messages.ts`. Escribirás todos los cambios de las lecciones en `src/index.ts`.
:::

:::language python
Cambia al proyecto inicial de Python, crea un entorno virtual aislado e instala SDK 1.0.11:

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

En Windows, el intérprete está en `.venv/Scripts/python.exe`.

Condición de superación: el código fuente compila y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in curator.py.`

Trabajarás en `start-museum/python` durante el resto del taller, así que mantén este terminal aquí.
Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es `curator.py`, y los mensajes del sistema están en `system_messages.py`.
Escribirás todos los cambios de las lecciones en `main.py`.
:::

:::language go
Entra en el proyecto inicial de Go, descarga la dependencia fijada del SDK 1.0.11 y compílalo:

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

Condición de superación: la compilación se completa correctamente y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in curator.go.`

Trabajarás en `start-museum/go` durante el resto del taller, así que mantén este terminal aquí.
Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es `curator.go`, y los mensajes del sistema están en `system_messages.go`. Ambos
están en el mismo paquete `main`. Escribirás todos los cambios de las lecciones en `main.go`.
:::

:::language rust
Entra en el proyecto inicial de Rust, recupera las dependencias fijadas y compruébalo:

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

Condición de superación: Cargo deja `Cargo.lock` sin cambios y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/lib.rs.`

Trabajarás en `start-museum/rust` durante el resto del taller, así que mantén este terminal aquí.
Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es el crate de biblioteca `museum_exhibit_studio` en `src/lib.rs`, con los
mensajes del sistema en `src/system_messages.rs`. Escribirás todos los cambios de las lecciones en
`src/main.rs`.
:::

:::language java
Entra en el proyecto inicial de Maven, resuelve el SDK 1.0.11, compila y ejecútalo con el Maven
Wrapper incluido (no hace falta instalar Maven aparte; en Windows, usa `mvnw.cmd` en vez de
`./mvnw`):

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

Condición de superación: Maven se completa correctamente y el programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/main/java/workshop/.`

Trabajarás en `start-museum/java` durante el resto del taller, así que mantén este terminal aquí.
Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Tu módulo auxiliar es `src/main/java/workshop/Curator*.java`. Escribirás todos los cambios de las
lecciones en `src/main/java/workshop/MuseumExhibitStudio.java`.
:::

## Cómo funcionan las ediciones

Abre el punto de entrada indicado al final del bloque de configuración anterior. Cada lugar donde
escribes código es una **región** con nombre entre dos comentarios marcadores:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

La línea `BEGIN` enumera cada paso que toca la región, así que el archivo también sirve como mapa
del taller. Cada bloque de código de una lección se introduce con una línea que nombra su región y
una de dos acciones:

| Acción | La región está | Qué haces |
|---|---|---|
| **INSERT** | Vacía | Pega el bloque entre las dos líneas marcadoras. |
| **REPLACE** | Contiene código de un paso anterior | Elimina todo lo que hay entre las dos líneas marcadoras y luego pega el bloque. |

Un bloque siempre es el contenido completo de su región, así que nunca fusionas código a mano. Deja
las líneas marcadoras y el código fuera de las regiones exactamente como están.

## Establece el límite de confianza

| Control | Qué puede hacer |
|---|---|
| Mensaje del sistema | Guiar el rol, el tono, el alcance y la forma de la salida |
| Lista de herramientas permitidas | Decidir exactamente qué herramientas existen para una sesión |
| Código de la aplicación | Controlar los datos que hay detrás de una herramienta e imponer límites, tiempo de espera, validación y limpieza |
| Revisión humana | Decidir si cada afirmación histórica está respaldada |

Los hechos aprobados por el educador son la única fuente aprobada, y el conservador accede a ellos
mediante una herramienta propia de la aplicación. La memoria del modelo no es conocimiento
museístico verificado, y las instrucciones del prompt no son un límite de autorización: solo la
lista de permitidos y el controlador de permisos deciden lo que la sesión puede hacer realmente.

## Más información

El SDK que hay detrás del conservador está documentado fuera de este taller. Merece la pena tener
estas páginas abiertas mientras sigues el taller.

- [Procedimientos de GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk): la propia
  documentación de GitHub sobre el SDK, incluidos los requisitos previos que cubre esta preparación.
- [Mapa de documentación del Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  el índice de configuración, autenticación, características y solución de problemas.
- [Configuración predeterminada: CLI incluida](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  cómo el SDK localiza e inicia Copilot CLI, y cómo apuntarlo a un binario distinto.
- [Guía de depuración](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  el primer lugar donde mirar cuando una ejecución falla antes de producir cualquier salida.

:::language dotnet
- [Referencia del SDK de .NET](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de .NET.
:::

:::language nodejs
- [Referencia del SDK de Node.js](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de Node.js.
:::

:::language python
- [Referencia del SDK de Python](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de Python.
:::

:::language go
- [Referencia del SDK de Go](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  instalación del módulo y un ejemplo mínimo para el SDK de Go.
:::

:::language rust
- [Referencia del SDK de Rust](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  instalación del crate y un ejemplo mínimo para el SDK de Rust.
:::

:::language java
- [Referencia del SDK de Java](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  coordenadas de dependencia y un ejemplo mínimo para el SDK de Java.
:::

Continúa con [Tu primera sesión de conservador](museum-01-first-curator-session.md).
