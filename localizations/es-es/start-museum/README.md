# Proyectos iniciales de Museum Exhibit Studio

Elige el directorio del lenguaje del taller y trabaja directamente dentro de él. Después de
cambiarte a él, abre esa misma carpeta en tu editor (`code .` desde dentro, o el comando de abrir
carpeta de cualquier otro editor) y mantén allí la terminal. Estos proyectos iniciales contienen
dependencias fijadas, un punto de entrada organizado en regiones con nombre, un módulo auxiliar de
conservador ya preparado y un archivo ya preparado que contiene los mensajes del sistema. Los
auxiliares contienen la infraestructura que nunca tienes que escribir: los conjuntos de hechos
aprobados, sus límites y el menú que permite a un educador elegirlos o escribirlos, la herramienta
local ya preparada `approved_fact_lookup` que entrega esos hechos al conservador, la herramienta
local ya preparada `approved_wikipedia_fact_lookup` que devuelve investigación capturada y citas
cuando existe investigación utilizable, una función de impresión en streaming, validación
determinista de exposiciones, el servidor MCP de Wikipedia con ámbito restringido y su controlador
de permisos que deniega de forma predeterminada, el permiso de escritura de un único archivo
`exhibit.html`, el texto fijo del prompt (estructura de la exposición, solicitud de investigación y
requisitos de la página), la búsqueda `COPILOT_MODEL` y el mensaje de fallo. El archivo de mensajes
del sistema contiene los tres mensajes largos bajo los que se ejecutan las sesiones: el del
conservador, el del conservador cuando la investigación está disponible y el del asistente de
investigación. Nunca edites los auxiliares.

Los proyectos iniciales **no** incluyen las instrucciones del prompt de la exposición, la
configuración de sesión, el registro de herramientas ni el ejecutor de sesión. Los escribirás
durante las lecciones: una sesión, luego streaming, luego la voz del conservador (instalando el
mensaje del sistema ya preparado), el registro de la herramienta de hechos y su prompt con un
ejecutor de sesión acotado, el informe de validación, la investigación con Wikipedia de ámbito
restringido y una página interactiva `exhibit.html`. Empieza en
[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md).

## Cómo está organizado el punto de entrada

El punto de entrada del proyecto inicial incluye la forma fija del programa (función de entrada,
controlador de errores, limpieza) y un conjunto de regiones vacías con nombre. Una región son dos
comentarios marcadores, y su línea `BEGIN` lista cada paso que la toca:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Cada bloque de código de la lección nombra su región y una de dos acciones. **INSERT** significa que
la región está vacía: pega el bloque entre las líneas marcadoras. **REPLACE** significa que la
región contiene código de un paso anterior: elimina todo lo que hay entre las líneas marcadoras y,
después, pega el bloque. Un bloque siempre es el contenido completo de su región. No edites nunca
una línea marcadora ni el código que está fuera de las regiones.

| Región | Contiene | Pasos |
|---|---|---|
| `imports` | Importaciones | 1, después cada vez que un paso necesite nombres nuevos |
| `banner` | Banner del programa | 1 |
| `choose-facts` | Llamada de selección de hechos | 4 |
| `research` | Paso opcional de investigación de Wikipedia | 6 |
| `generate` | Llamada de generación de la exposición | 1 a 6 |
| `validate` | Informe de validación | 5 |
| `sources` | Fuentes consultadas | 6 |
| `exhibit-page` | Sesión opcional de `exhibit.html` | 7 |
| `exhibit-prompt` | Generador del prompt de exposición | 4, 6 |
| `html-prompt` | Generador del prompt de página | 7 |
| `generation-config` | Configuración de sesión de generación | 4, 6 |
| `research-config` | Configuración de sesión de investigación | 6 |
| `html-config` | Configuración de sesión de página | 7 |
| `session-runner` | Ejecutor de sesión | 4 |

El paso 6 registra condicionalmente la búsqueda de Wikipedia junto con la búsqueda de hechos
aprobados y pide al conservador que llame a ambas antes de escribir la narrativa y las preguntas
para visitantes. La investigación sigue siendo complementaria, no verificada por el educador; los
hechos aprobados tienen prioridad. Si se rechaza la investigación o no se recibe ningún resumen
citado utilizable, la generación usa solo `approved_fact_lookup`.

| Lenguaje | Módulo auxiliar | Mensajes del sistema | Cambia de directorio, compila y ejecuta |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

Ejecutar el proyecto inicial imprime su identidad y no inicia Copilot ni requiere autenticación.
Como editas estos archivos en el mismo sitio, tu trabajo aparece en `git status`. Es lo esperado.
Ejecuta `git checkout -- .` desde la raíz del repositorio para restaurar un proyecto inicial limpio.

Todos los proyectos iniciales ya fijan las dependencias que necesita la aplicación terminada, así
que no editas nunca un manifiesto de proyecto durante el taller. El proyecto inicial de Rust compila
el crate de biblioteca `museum_exhibit_studio` desde `src/lib.rs`; importa desde él los auxiliares
en `src/main.rs`.
