# Paso 4: Conecta una herramienta externa de forma segura

> **Tiempo:** 20 minutos

## Qué conectarás

Iniciarás Playwright mediante MCP, limitarás la navegación al destino del taller que proporciones,
inspeccionarás su árbol de accesibilidad y notificarás el título de la página.

## Conoce MCP y su límite de confianza

El [**Model Context Protocol (MCP)**](https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md)
es una forma estándar de conectar un agente a capacidades reutilizables implementadas fuera de tu
aplicación. En este taller, el SDK inicia el servidor MCP de Playwright como un proceso `npx`
independiente. Playwright gestiona la automatización del navegador, mientras tu aplicación configura
la conexión.

El límite de proceso también es un **límite de confianza**. Un
[controlador de permisos](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
es un callback que el runtime invoca antes de que se ejecute una acción solicitada, y decide si cada
acción externa puede continuar.

| Pregunta | Herramienta WCAG local | Playwright MCP |
|---|---|---|
| ¿Quién la implementa? | Esta aplicación | Paquete externo de Playwright |
| ¿Dónde se ejecuta? | Mismo proceso de la aplicación | Proceso de Node.js independiente |
| ¿Para qué es mejor? | Datos propios de la aplicación y lógica determinista | Capacidad de navegador reutilizable |
| ¿Cómo se gestiona aquí la confianza? | La herramienta de solo lectura omite el permiso | La lista de herramientas y el controlador personalizado restringen el acceso |

La búsqueda de WCAG y el lector limitado de instantáneas permanecen en el proceso.
`CopilotSession -> Playwright MCP -> browser` cruza un límite de proceso.

## Pon Playwright tras controles de protección

El argumento del navegador usa Microsoft Edge, el valor predeterminado del taller. Si en su lugar
preparaste Google Chrome, usa `--browser=chrome`.

La lista de permitidos de herramientas de la sesión mantiene fuera las herramientas del runtime no
relacionadas. La lista de herramientas del servidor MCP expone solo la navegación. En Playwright MCP
0.0.78, la navegación escribe su árbol de accesibilidad automático en `.playwright-mcp/`. El lector
de instantáneas de la aplicación no acepta argumentos y solo lee la instantánea de Playwright más
reciente creada después de que se iniciara la sesión.

`browser_snapshot` se queda fuera de ambas listas de permitidos porque su argumento opcional
`filename` puede escribir un archivo. El runtime puede permitir automáticamente herramientas MCP
anotadas como de solo lectura sin llamar a tu delegado de permisos, así que un controlador no puede
sanear ese argumento de forma fiable. Quitar la herramienta cierra la capacidad en lugar de depender
de un prompt.

El lector no acepta ninguna ruta. Ignora archivos preexistentes, archivos anidados, enlaces
simbólicos, archivos vacíos e instantáneas mayores de 1 MB. La navegación solo se aprueba cuando la
URL canónica completa coincide con el destino proporcionado al inicio. El esquema y el host usan una
comparación sin distinción de mayúsculas y minúsculas conforme al estándar de URL. La ruta, la
consulta y el fragmento deben coincidir distinguiendo mayúsculas y minúsculas.

El controlador devuelve exactamente una decisión por solicitud, y esta necesita dos de los tipos
disponibles. `approve-once` permite esta única solicitud. `reject` la deniega y puede reenviar un
mensaje con comentarios para el modelo, de modo que una llamada rechazada vuelve con un motivo en
lugar de como un error silencioso. Existen dos tipos más para situaciones a las que no llega este
taller: `user-not-available` deniega porque no hay ningún usuario presente para confirmar y
`no-result` se abstiene de responder por completo para que otro cliente conectado pueda responder a
la solicitud en su lugar. Los ámbitos de aprobación más amplios — `approve-for-session`,
`approve-for-location` y `approve-permanently` — recuerdan una decisión más allá de esta llamada.
Cada SDK escribe todos estos valores con su propia convención de nomenclatura.

:::language dotnet
## Conecta el acceso con ámbito a Playwright en C#

### 1. Acepta un destino controlado

En la parte superior de `Program.cs`, después de las instrucciones `using` y antes del banner, inserta:

```csharp
if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}
```

### 2. Inspecciona el controlador de permisos ya preparado

Abre `Helpers/WorkshopPermissionHandler.cs`. El controlador ya preparado devuelve una aprobación de
un solo uso solo para navegación al destino exacto. Cualquier otra solicitud externa se rechaza.

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows Playwright to navigate only to the exact requested target.")
        };

        return Task.FromResult(decision);
    };
}
```

Actualmente, el SDK de .NET antepone el nombre del servidor a los nombres de herramientas de
permisos de MCP (por ejemplo, `playwright-browser_navigate`), mientras que la configuración de MCP
usa `browser_navigate`. `IsPlaywrightTool` acepta esas dos formas exactas en lugar de usar un
comodín amplio.

> **Nota del SDK:** la versión 1.0.7 incluye `PermissionHandler.ApproveAll`, pero no un controlador con ámbito integrado.
> Por eso el proyecto inicial incluye un delegado escrito a mano. `PermissionDecision` está marcado actualmente solo para evaluación,
> así que ese auxiliar contiene una supresión local de `GHCP001`.

### 3. Inspecciona el límite ya preparado del lector de instantáneas

Abre `Helpers/PlaywrightSnapshotReader.cs`. El lector captura las instantáneas existentes cuando se
crea la herramienta, no acepta argumentos proporcionados por el modelo, selecciona solo un nuevo
hijo directo llamado `page-*.yml`, rechaza enlaces simbólicos y archivos demasiado grandes, y
después devuelve el texto.

```csharp
public static AIFunction CreateTool(string workingDirectory)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(workingDirectory);

    var outputDirectory = Path.GetFullPath(Path.Combine(workingDirectory, ".playwright-mcp"));
    var existingSnapshots = Directory.Exists(outputDirectory)
        ? Directory.EnumerateFiles(outputDirectory, "page-*.yml", SearchOption.TopDirectoryOnly)
            .Select(Path.GetFullPath)
            .ToHashSet(PathComparer)
        : new HashSet<string>(PathComparer);

    return CopilotTool.DefineTool(
        () => Task.FromResult(ReadLatestSnapshot(outputDirectory, existingSnapshots)),
        toolOptions: new CopilotToolOptions { SkipPermission = true },
        factoryOptions: new AIFunctionFactoryOptions
        {
            Name = "read_latest_accessibility_snapshot",
            Description = "Reads the newest Playwright accessibility snapshot created during this run."
        });
}
```

El adaptador omite el permiso porque es de solo lectura, usa almacenamiento seleccionado por la
aplicación y está implementado por la aplicación. Es una capacidad más limitada que un lector de
archivos general.

### 4. Añade Playwright MCP y permisos con ámbito

Sustituye la configuración de la sesión por:

```csharp
var workingDirectory = Directory.GetCurrentDirectory();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri),
    Tools =
    [
        AccessibilityRuleCatalog.CreateLookupTool(),
        PlaywrightSnapshotReader.CreateTool(workingDirectory)
    ],
    AvailableTools =
    [
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate"
    ],
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["playwright"] = new McpStdioServerConfig
        {
            Command = "npx",
            Args = ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
            WorkingDirectory = workingDirectory,
            Tools = ["browser_navigate"]
        }
    }
});
```

### 5. Solicita evidencia del navegador

Sustituye la llamada de envío final:

```csharp
Console.WriteLine($"\nInspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and report the page title
    plus one sentence describing its main content.
    """);
```

## Ejecútalo

```bash
dotnet run -- "{{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright.

Busca:

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True

Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | Usa la URL de destino exacta anterior. El controlador deniega intencionadamente otras URL y herramientas. |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| El compilador no encuentra el auxiliar de permisos | Confirma que `using HelloCopilotSDK.Helpers;` está presente y que el archivo auxiliar está en el proyecto. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}

Console.WriteLine("=== Scoped Playwright MCP access ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

var workingDirectory = Directory.GetCurrentDirectory();

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri),
    Tools =
    [
        AccessibilityRuleCatalog.CreateLookupTool(),
        PlaywrightSnapshotReader.CreateTool(workingDirectory)
    ],
    AvailableTools =
    [
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate"
    ],
    McpServers = new Dictionary<string, McpServerConfig>
    {
        ["playwright"] = new McpStdioServerConfig
        {
            Command = "npx",
            Args = ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
            WorkingDirectory = workingDirectory,
            Tools = ["browser_navigate"]
        }
    }
});

Console.WriteLine($"Inspecting: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(
    session,
    $"""
    Use browser_navigate to open {targetUri.AbsoluteUri}.
    Then use read_latest_accessibility_snapshot and return the page title
    plus one sentence describing its main content.
    """);
```

</details>
:::

:::language nodejs
## Conecta el acceso con ámbito limitado de Playwright en TypeScript

### 1. Acepta un destino controlado

En la parte superior de `src/index.ts`, reemplaza la configuración del punto de entrada por:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import {
  accessibilityRuleLookup,
  createSnapshotReader,
  permissionForTarget,
  streamResponse,
} from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("Enter an absolute HTTP or HTTPS URL.");
}
```

### 2. Inspecciona el controlador de permisos ya preparado

Abre `src/workshop.ts`. El controlador ya preparado aprueba solo la navegación de Playwright al destino exacto:

```typescript
export function permissionForTarget(target: URL): PermissionHandler {
  return (request) => {
    if (
      request.kind === "mcp" &&
      request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" ||
        request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" &&
      sameUrl(request.args.url, target)
    ) {
      return { kind: "approve-once" };
    }
    return {
      kind: "reject",
      feedback:
        "This workshop allows Playwright to navigate only to the exact requested target.",
    };
  };
}

function sameUrl(requested: string, allowed: URL): boolean {
  try {
    const parsed = new URL(requested);
    return (
      parsed.protocol.toLowerCase() === allowed.protocol.toLowerCase() &&
      parsed.hostname.toLowerCase() === allowed.hostname.toLowerCase() &&
      parsed.port === allowed.port &&
      parsed.username === allowed.username &&
      parsed.password === allowed.password &&
      parsed.pathname === allowed.pathname &&
      parsed.search === allowed.search &&
      parsed.hash === allowed.hash
    );
  } catch {
    return false;
  }
}
```

Acepta tanto `browser_navigate` como `playwright-browser_navigate`, porque el runtime puede
anteponer el nombre del servidor a las solicitudes de permisos.

### 3. Inspecciona el límite ya preparado del lector de instantáneas

Aún en `src/workshop.ts`, el lector de instantáneas captura los archivos existentes en el momento de
la creación y no acepta ninguna ruta proporcionada por el modelo:

```typescript
export function createSnapshotReader(workingDirectory: string) {
  const outputDirectory = resolve(workingDirectory, ".playwright-mcp");
  const existingSnapshots = safeSnapshotNames(outputDirectory).then(
    (names) => new Set(names.map((name) => resolve(outputDirectory, name))),
  );
  return defineTool("read_latest_accessibility_snapshot", {
    description:
      "Reads the newest Playwright accessibility snapshot created during this run.",
    parameters: z.object({}),
    skipPermission: true,
    handler: async () => {
      const baseline = await existingSnapshots;
      const candidates = await Promise.all(
        (await safeSnapshotNames(outputDirectory)).map(async (name) => {
          const path = resolve(outputDirectory, name);
          const details = await lstat(path);
          return { path, details };
        }),
      );
      const snapshot = candidates
        .filter(
          ({ path, details }) =>
            !baseline.has(path) &&
            !details.isSymbolicLink() &&
            details.isFile() &&
            details.size > 0 &&
            details.size <= maxSnapshotBytes,
        )
        .sort((left, right) => right.details.mtimeMs - left.details.mtimeMs)[0];
      if (!snapshot) {
        throw new Error(
          "No current-run Playwright snapshot is available. Call browser_navigate first.",
        );
      }
      return readFile(snapshot.path, "utf8");
    },
  });
}
```

### 4. Añade Playwright MCP y permisos con ámbito

En `src/index.ts`, crea la sesión con la lista de permitidos de tres herramientas y Playwright MCP:

```typescript
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: [
      "accessibility_rule_lookup",
      "read_latest_accessibility_snapshot",
      "playwright-browser_navigate",
    ],
    mcpServers: {
      playwright: {
        command: "npx",
        args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
        workingDirectory: process.cwd(),
        tools: ["browser_navigate"],
      },
    },
  });
  try {
    await streamResponse(
      session,
      `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`,
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`availableTools` usa el nombre MCP con prefijo del runtime `playwright-browser_navigate`, mientras
que la configuración del servidor MCP sigue enumerando el `browser_navigate` sin prefijo.

## Ejecútalo

```bash
npm start -- "{{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright.

Busca:

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true

Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | Usa la URL de destino exacta anterior. El controlador deniega intencionadamente otras URL y herramientas. |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| TypeScript no puede resolver los auxiliares | Confirma que la ruta de importación termina en `.js` y ejecuta `npm install` en la carpeta del proyecto inicial. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try {
    await streamResponse(session, `Use browser_navigate to open ${target.href}, then read_latest_accessibility_snapshot and report the page title.`);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

</details>
:::

:::language python
## Conecta el acceso con ámbito limitado de Playwright en Python

### 1. Acepta un destino controlado

En la parte superior de `main.py`, valida la URL de inicio:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
)

from workshop import (
    accessibility_rule_lookup,
    create_snapshot_reader,
    permission_for_target,
)


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
```

### 2. Inspecciona el controlador de permisos ya preparado

Abre `workshop.py`. El controlador ya preparado aprueba solo la navegación de Playwright al destino exacto:

```python
def permission_for_target(target: str):
    def handler(request, _invocation):
        if (
            getattr(request, "kind", None) == "mcp"
            and request.server_name == "playwright"
            and request.tool_name
            in {"browser_navigate", "playwright-browser_navigate"}
            and isinstance(request.args, dict)
            and isinstance(request.args.get("url"), str)
            and _same_url(request.args["url"], target)
        ):
            return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback=(
                "This workshop allows Playwright to navigate only to the exact requested target."
            )
        )

    return handler


def _same_url(requested: str, allowed: str) -> bool:
    try:
        left, right = urlsplit(requested), urlsplit(allowed)
        return (
            left.scheme.lower(),
            left.hostname.lower() if left.hostname else "",
            left.port,
            left.username,
            left.password,
            left.path,
            left.query,
            left.fragment,
        ) == (
            right.scheme.lower(),
            right.hostname.lower() if right.hostname else "",
            right.port,
            right.username,
            right.password,
            right.path,
            right.query,
            right.fragment,
        )
    except ValueError:
        return False
```

### 3. Inspecciona el límite ya preparado del lector de instantáneas

Aún en `workshop.py`, el lector de instantáneas captura los archivos existentes en el momento de la
creación y no acepta ninguna ruta proporcionada por el modelo:

```python
def create_snapshot_reader(working_directory: str):
    output_directory = Path(working_directory, ".playwright-mcp").resolve()
    existing = (
        {path.resolve() for path in output_directory.glob("page-*.yml")}
        if output_directory.is_dir()
        else set()
    )

    @define_tool(
        name="read_latest_accessibility_snapshot",
        description=(
            "Reads the newest Playwright accessibility snapshot created during this run."
        ),
        skip_permission=True,
    )
    def read_latest_accessibility_snapshot() -> str:
        candidates = [
            path
            for path in output_directory.glob("page-*.yml")
            if path.resolve() not in existing
            and not path.is_symlink()
            and path.is_file()
            and 0 < path.stat().st_size <= MAX_SNAPSHOT_BYTES
        ]
        if not candidates:
            raise FileNotFoundError(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
            )
        return max(candidates, key=lambda path: path.stat().st_mtime).read_text(
            encoding="utf-8"
        )

    return read_latest_accessibility_snapshot
```

### 4. Añade Playwright MCP y permisos con ámbito

Reemplaza el bloque de creación de la sesión en `main.py`:

```python
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=[
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate",
            ],
            mcp_servers={
                "playwright": {
                    "command": "npx",
                    "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"],
                    "working_directory": ".",
                    "tools": ["browser_navigate"],
                }
            },
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(
                f"Use browser_navigate to open {target}, then "
                "read_latest_accessibility_snapshot and report the page title."
            )
            await done.wait()
            if error is not None:
                raise error
```

`available_tools` usa el nombre MCP con prefijo del runtime `playwright-browser_navigate`, mientras
que la configuración del servidor MCP sigue enumerando el `browser_navigate` sin prefijo.

## Ejecútalo

```bash
python main.py "{{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright.

Busca actividad de navegación e instantáneas y, después, un título de página como:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | Usa la URL de destino exacta anterior. El controlador deniega intencionadamente otras URL y herramientas. |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| Errores de importación de los auxiliares del taller | Activa el entorno virtual de preparación y confirma que `workshop.py` está junto a `main.py`. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

`main.py`:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target


async def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python main.py <http-or-https-url>")
    target = sys.argv[1]
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            on_permission_request=permission_for_target(target),
            tools=[accessibility_rule_lookup, create_snapshot_reader(".")],
            available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
            mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}},
        ) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(f"Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Conecta el acceso con ámbito limitado de Playwright en Go

### 1. Acepta un destino controlado

Al principio de `main` en `main.go`, valida la URL de inicio:

```go
if len(os.Args) != 2 {
	fmt.Fprintln(os.Stderr, "Usage: go run . <http-or-https-url>")
	return
}
target := os.Args[1]
if !strings.Contains(target, "://") {
	target = "https://" + target
}
parsed, err := url.ParseRequestURI(target)
if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
	fmt.Fprintln(os.Stderr, "Enter an absolute HTTP or HTTPS URL.")
	return
}
```

### 2. Añade el controlador de permisos

Antes de `main`, añade la coincidencia de URL exacta y el controlador de permisos:

```go
func sameURL(requested, allowed string) bool {
	left, leftErr := url.Parse(requested)
	right, rightErr := url.Parse(allowed)
	userInfo := func(value *url.Userinfo) string {
		if value == nil {
			return ""
		}
		return value.String()
	}
	return leftErr == nil && rightErr == nil &&
		strings.EqualFold(left.Scheme, right.Scheme) &&
		strings.EqualFold(left.Hostname(), right.Hostname()) &&
		left.Port() == right.Port() &&
		userInfo(left.User) == userInfo(right.User) &&
		left.EscapedPath() == right.EscapedPath() &&
		left.RawQuery == right.RawQuery &&
		left.Fragment == right.Fragment
}

func permissionForTarget(target string) copilot.PermissionHandlerFunc {
	return func(request copilot.PermissionRequest, _ copilot.PermissionInvocation) (rpc.PermissionDecision, error) {
		raw, _ := json.Marshal(request)
		var value map[string]any
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "mcp" && value["serverName"] == "playwright" {
			toolName, _ := value["toolName"].(string)
			args, _ := value["args"].(map[string]any)
			requested, _ := args["url"].(string)
			if (toolName == "browser_navigate" || toolName == "playwright-browser_navigate") && sameURL(requested, target) {
				return &rpc.PermissionDecisionApproveOnce{}, nil
			}
		}
		feedback := "This workshop allows Playwright to navigate only to the exact requested target."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

Acepta nombres de herramientas de Playwright tanto sin prefijo como con prefijo en la ruta de permisos.

### 3. Añade el límite del lector de instantáneas

Aún antes de `main`, añade el lector de instantáneas sin argumentos:

```go
const maxSnapshotBytes = 1_000_000

func snapshotReader(workingDirectory string) func(struct{}, copilot.ToolInvocation) (string, error) {
	outputDirectory := filepath.Join(workingDirectory, ".playwright-mcp")
	existing := map[string]struct{}{}
	if entries, err := os.ReadDir(outputDirectory); err == nil {
		for _, entry := range entries {
			if strings.HasPrefix(entry.Name(), "page-") && strings.HasSuffix(entry.Name(), ".yml") {
				existing[filepath.Join(outputDirectory, entry.Name())] = struct{}{}
			}
		}
	}

	return func(_ struct{}, _ copilot.ToolInvocation) (string, error) {
		entries, err := os.ReadDir(outputDirectory)
		if err != nil {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		type candidate struct {
			path string
			mod  time.Time
		}
		var candidates []candidate
		for _, entry := range entries {
			path := filepath.Join(outputDirectory, entry.Name())
			info, err := entry.Info()
			if _, existed := existing[path]; existed || err != nil || entry.IsDir() ||
				entry.Type()&os.ModeSymlink != 0 || !info.Mode().IsRegular() ||
				info.Size() == 0 || info.Size() > maxSnapshotBytes ||
				!strings.HasPrefix(entry.Name(), "page-") || !strings.HasSuffix(entry.Name(), ".yml") {
				continue
			}
			candidates = append(candidates, candidate{path, info.ModTime()})
		}
		if len(candidates) == 0 {
			return "", fmt.Errorf("No current-run Playwright snapshot is available. Call browser_navigate first.")
		}
		sort.Slice(candidates, func(i, j int) bool { return candidates[i].mod.Before(candidates[j].mod) })
		contents, err := os.ReadFile(candidates[len(candidates)-1].path)
		return string(contents), err
	}
}
```

### 4. Añade Playwright MCP y permisos con ámbito

En `main`, define ambas herramientas locales y reemplaza la configuración de la sesión:

```go
workingDirectory, err := os.Getwd()
if err != nil {
	panic(err)
}
lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
lookup.SkipPermission = true
readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
readSnapshot.SkipPermission = true

client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{lookup, readSnapshot},
	AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"},
	OnPermissionRequest: permissionForTarget(target),
	MCPServers: map[string]copilot.MCPServerConfig{
		"playwright": copilot.MCPStdioServerConfig{
			Command:          "npx",
			Args:             []string{"-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"},
			WorkingDirectory: workingDirectory,
			Tools:            []string{"browser_navigate"},
		},
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

Añade las importaciones que usan los nuevos auxiliares: `encoding/json`, `net/url`, `path/filepath`,
`sort`, `time` y `"github.com/github/copilot-sdk/go/rpc"`.

## Ejecútalo

```bash
go run . "{{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright.

Busca un título de página como:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | Usa la URL de destino exacta anterior. El controlador deniega intencionadamente otras URL y herramientas. |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| Faltan importaciones | Añade `encoding/json`, `net/url`, `path/filepath`, `sort`, `time` y el paquete `rpc`. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

Cableado de sesión de `main.go`:

```go
workingDirectory, err := os.Getwd()
if err != nil {
	panic(err)
}
lookup := copilot.DefineTool("accessibility_rule_lookup", "Looks up read-only WCAG guidance maintained by this application.", accessibilityRuleLookup)
lookup.SkipPermission = true
readSnapshot := copilot.DefineTool("read_latest_accessibility_snapshot", "Reads the newest Playwright accessibility snapshot created during this run.", snapshotReader(workingDirectory))
readSnapshot.SkipPermission = true

client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{lookup, readSnapshot},
	AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"},
	OnPermissionRequest: permissionForTarget(target),
	MCPServers: map[string]copilot.MCPServerConfig{
		"playwright": copilot.MCPStdioServerConfig{
			Command:          "npx",
			Args:             []string{"-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"},
			WorkingDirectory: workingDirectory,
			Tools:            []string{"browser_navigate"},
		},
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
if err := streamResponse(session, fmt.Sprintf("Use browser_navigate to open %s, then read_latest_accessibility_snapshot and report the page title.", target)); err != nil {
	panic(err)
}
```

</details>
:::

:::language rust
## Conecta el acceso con ámbito limitado de Playwright en Rust

### 1. Acepta un destino controlado

Al principio de `main` en `src/main.rs`, valida la URL de inicio:

```rust
let argument = std::env::args()
    .nth(1)
    .ok_or("Usage: cargo run -- <http-or-https-url>")?;
let target_text = if argument.contains("://") {
    argument
} else {
    format!("https://{argument}")
};
let target = Url::parse(&target_text)?;
if !matches!(target.scheme(), "http" | "https") || target.host_str().is_none() {
    return Err("Enter an absolute HTTP or HTTPS URL.".into());
}
```

### 2. Añade el controlador de permisos

Añade el controlador de permisos de destino exacto antes de `main`:

```rust
struct ScopedPermissions {
    target: Url,
}

fn permission_payload(
    extra: &serde_json::Value,
) -> Option<&serde_json::Map<String, serde_json::Value>> {
    match extra.get("permissionRequest") {
        Some(request) => request.as_object(),
        None => extra.as_object(),
    }
}

#[async_trait]
impl PermissionHandler for ScopedPermissions {
    async fn handle(
        &self,
        _session_id: SessionId,
        _request_id: RequestId,
        request: PermissionRequestData,
    ) -> PermissionResult {
        let payload = permission_payload(&request.extra);
        let server = payload
            .and_then(|payload| payload.get("serverName"))
            .and_then(serde_json::Value::as_str);
        let tool = payload
            .and_then(|payload| payload.get("toolName"))
            .and_then(serde_json::Value::as_str);
        let requested = payload
            .and_then(|payload| payload.get("args"))
            .and_then(|args| args.get("url"))
            .and_then(serde_json::Value::as_str)
            .and_then(|value| Url::parse(value).ok());
        if server == Some("playwright")
            && matches!(
                tool,
                Some("browser_navigate" | "playwright-browser_navigate")
            )
            && requested
                .as_ref()
                .is_some_and(|url| same_url(url, &self.target))
        {
            PermissionResult::approve_once()
        } else {
            PermissionResult::reject(Some(
                "This workshop allows Playwright to navigate only to the exact requested target."
                    .to_owned(),
            ))
        }
    }
}

fn same_url(left: &Url, right: &Url) -> bool {
    left.scheme().eq_ignore_ascii_case(right.scheme())
        && left
            .host_str()
            .unwrap_or_default()
            .eq_ignore_ascii_case(right.host_str().unwrap_or_default())
        && left.port() == right.port()
        && left.username() == right.username()
        && left.password() == right.password()
        && left.path() == right.path()
        && left.query() == right.query()
        && left.fragment() == right.fragment()
}
```

### 3. Añade el límite del lector de instantáneas

Añade el lector de instantáneas sin argumentos antes de `main`:

```rust
const MAX_SNAPSHOT_BYTES: u64 = 1_000_000;

struct SnapshotReader {
    output_directory: PathBuf,
    existing: HashSet<PathBuf>,
}

impl SnapshotReader {
    fn new(working_directory: &Path) -> Self {
        let output_directory = working_directory.join(".playwright-mcp");
        let existing = std::fs::read_dir(&output_directory)
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let name = entry.file_name();
                let name = name.to_string_lossy();
                (name.starts_with("page-") && name.ends_with(".yml")).then(|| entry.path())
            })
            .collect();
        Self {
            output_directory,
            existing,
        }
    }
}

#[async_trait]
impl ToolHandler for SnapshotReader {
    async fn call(&self, _invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let entries =
            match std::fs::read_dir(&self.output_directory) {
                Ok(entries) => entries,
                Err(_) => return Ok(ToolResult::Text(
                    "No current-run Playwright snapshot is available. Call browser_navigate first."
                        .to_owned(),
                )),
            };
        let newest = entries
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                let name = entry.file_name();
                let name = name.to_string_lossy();
                let metadata = std::fs::symlink_metadata(&path).ok()?;
                (!self.existing.contains(&path)
                    && name.starts_with("page-")
                    && name.ends_with(".yml")
                    && !metadata.file_type().is_symlink()
                    && metadata.is_file()
                    && metadata.len() > 0
                    && metadata.len() <= MAX_SNAPSHOT_BYTES)
                    .then_some((metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH), path))
            })
            .max_by_key(|(modified, _)| *modified);
        let Some((_, path)) = newest else {
            return Ok(ToolResult::Text(
                "No current-run Playwright snapshot is available. Call browser_navigate first."
                    .to_owned(),
            ));
        };
        match std::fs::read_to_string(path) {
            Ok(contents) => Ok(ToolResult::Text(contents)),
            Err(_) => Ok(ToolResult::Text(
                "The current-run Playwright snapshot could not be read.".to_owned(),
            )),
        }
    }
}
```

### 4. Añade Playwright MCP y permisos con ámbito

En `main`, define ambas herramientas locales, configura MCP e instala el controlador de permisos:

```rust
let working_directory = std::env::current_dir()?;
let lookup = Tool::new("accessibility_rule_lookup")
    .with_description("Looks up read-only WCAG guidance maintained by this application.")
    .with_parameters(schema_for::<LookupParams>())
    .with_skip_permission(true)
    .with_handler(Arc::new(AccessibilityRuleLookup));
let reader = Tool::new("read_latest_accessibility_snapshot")
    .with_description(
        "Reads the newest Playwright accessibility snapshot created during this run.",
    )
    .with_parameters(
        serde_json::json!({"type": "object", "properties": {}, "additionalProperties": false}),
    )
    .with_skip_permission(true)
    .with_handler(Arc::new(SnapshotReader::new(&working_directory)));

let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup, reader]);
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
]);
config.mcp_servers = Some(IndexMap::from([(
    "playwright".to_owned(),
    McpServerConfig::Stdio(McpStdioServerConfig {
        command: "npx".to_owned(),
        args: vec![
            "-y".to_owned(),
            "@playwright/mcp@0.0.78".to_owned(),
            "--browser=msedge".to_owned(),
            "--output-dir".to_owned(),
            ".playwright-mcp".to_owned(),
            "--output-mode".to_owned(),
            "file".to_owned(),
        ],
        tools: Some(vec!["browser_navigate".to_owned()]),
        working_directory: Some(working_directory.display().to_string()),
        ..Default::default()
    }),
)]));
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
}));

let client = Client::start(ClientOptions::default()).await?;
let session = client.create_session(config).await?;
stream_response!(
    session,
    format!(
        "Use browser_navigate to open {target}, then read_latest_accessibility_snapshot and report the page title."
    )
);
session.disconnect().await?;
client.stop().await?;
```

Añade las importaciones que usan los nuevos auxiliares, incluidas
`github_copilot_sdk::handler::{PermissionHandler, PermissionResult}`, `McpServerConfig`,
`McpStdioServerConfig`, `PermissionRequestData`, `PermissionRequestKind`, `RequestId`, `SessionId`,
`indexmap::IndexMap` y `url::Url`.

## Ejecútalo

```bash
cargo run -- "{{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright.

Busca un título de página como:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | Usa la URL de destino exacta anterior. El controlador deniega intencionadamente otras URL y herramientas. |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| Trait o tipo sin resolver | Mantén las importaciones de permisos, MCP, `IndexMap` y `Url` mostradas arriba. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

Cableado de sesión de `src/main.rs`:

```rust
let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup, reader]);
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
]);
config.mcp_servers = Some(IndexMap::from([(
    "playwright".to_owned(),
    McpServerConfig::Stdio(McpStdioServerConfig {
        command: "npx".to_owned(),
        args: vec![
            "-y".to_owned(),
            "@playwright/mcp@0.0.78".to_owned(),
            "--browser=msedge".to_owned(),
            "--output-dir".to_owned(),
            ".playwright-mcp".to_owned(),
            "--output-mode".to_owned(),
            "file".to_owned(),
        ],
        tools: Some(vec!["browser_navigate".to_owned()]),
        working_directory: Some(working_directory.display().to_string()),
        ..Default::default()
    }),
)]));
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
}));

let client = Client::start(ClientOptions::default()).await?;
let session = client.create_session(config).await?;
stream_response!(session, mcp_safety_prompt(&target));
```

</details>
:::

:::language java
## Conecta el acceso con ámbito limitado de Playwright en Java

### 1. Acepta un destino controlado

Al principio de `main` en `src/main/java/workshop/AccessibilityReport.java`, valida la URL de
inicio:

```java
RunOptions options = parseRunOptions(args);
URI target = options.target();
Path workingDirectory = Path.of("").toAbsolutePath().normalize();
if (options.allowLocalDemoMcp()) {
    System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
            + "so this run approves only the mcp permission kind, not an exact target. "
            + "Use only with the controlled workshop target.");
}
```

Añade el auxiliar de análisis:

```java
private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme())
                    || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}
```

### 2. Añade el controlador de permisos

Aprueba solo la navegación de Playwright al destino exacto en la configuración de la sesión:

```java
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    // SDK issue #2273 currently prevents inspecting MCP request fields for the exact check.
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows Playwright to navigate only to the exact requested target. "
                            + "MCP requests without target data remain denied unless the explicit "
                            + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
})
```

> **Limitación temporal del SDK de Java y ruta alternativa local-demo:** De forma predeterminada,
> esto aplica denegación por defecto: aprueba solo una solicitud `mcp` cuyo payload demuestra que
> la navegación de Playwright configurada es la URL introducida exacta. Las versiones actuales del
> SDK de Java no exponen esos campos de solicitud MCP
> ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)), así que la
> ruta predeterminada rechaza esa solicitud en lugar de hacer suposiciones. Solo para el destino
> controlado del taller, pasa `--allow-local-demo-mcp`. Esa marca explícita aprueba una solicitud
> `mcp` cada vez; **no** usa `APPROVE_ALL`, y la configuración MCP sigue exponiendo solo
> `browser_navigate` de Playwright. No puede exigir la URL exacta mientras el payload del SDK no esté disponible. No lo habilites nunca para un destino de producción, compartido o que no sea de confianza.

Añade este analizador de opciones junto a `parseTarget`:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
        } else if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp);
}

private static String usage() {
    return "Usage: ./mvnw compile exec:java -Dexec.args=\"["
            + LOCAL_DEMO_MCP_FLAG + "] <http-or-https-url>\"";
}

private record RunOptions(URI target, boolean allowLocalDemoMcp) {
}
```

Añade los auxiliares de coincidencia de URL:

```java
private static boolean isExactNavigation(Map<String, Object> request, URI target) {
    if (request == null
            || !"playwright".equals(request.get("serverName"))
            || !(request.get("toolName") instanceof String toolName)
            || !("browser_navigate".equals(toolName)
                    || "playwright-browser_navigate".equals(toolName))
            || !(request.get("args") instanceof Map<?, ?> args)
            || !(args.get("url") instanceof String requested)) {
        return false;
    }
    try {
        return sameUrl(new URI(requested), target);
    } catch (URISyntaxException ignored) {
        return false;
    }
}

private static boolean sameUrl(URI requested, URI allowed) {
    return equalsIgnoreCase(requested.getScheme(), allowed.getScheme())
            && equalsIgnoreCase(requested.getHost(), allowed.getHost())
            && requested.getPort() == allowed.getPort()
            && java.util.Objects.equals(requested.getRawUserInfo(), allowed.getRawUserInfo())
            && java.util.Objects.equals(requested.getRawPath(), allowed.getRawPath())
            && java.util.Objects.equals(requested.getRawQuery(), allowed.getRawQuery())
            && java.util.Objects.equals(requested.getRawFragment(), allowed.getRawFragment());
}

private static boolean equalsIgnoreCase(String left, String right) {
    return left == null ? right == null : right != null && left.equalsIgnoreCase(right);
}
```

### 3. Añade el límite del lector de instantáneas

Registra un lector de instantáneas sin argumentos que solo devuelva archivos de Playwright de la ejecución actual:

```java
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);
```

Añade la clase lectora anidada:

```java
private static final class SnapshotReader {
    private final Path outputDirectory;
    private final Set<Path> existing;

    private SnapshotReader(Path workingDirectory) throws IOException {
        outputDirectory = workingDirectory.resolve(".playwright-mcp").normalize();
        existing = new HashSet<>();
        if (Files.isDirectory(outputDirectory, LinkOption.NOFOLLOW_LINKS)) {
            try (Stream<Path> paths = Files.list(outputDirectory)) {
                paths.filter(SnapshotReader::isSnapshotName).forEach(existing::add);
            }
        }
    }

    private String read() {
        try (Stream<Path> paths = Files.list(outputDirectory)) {
            Path newest = paths
                    .filter(path -> !existing.contains(path))
                    .filter(SnapshotReader::isSnapshotName)
                    .filter(path -> !Files.isSymbolicLink(path))
                    .filter(SnapshotReader::isSafeSnapshot)
                    .max(Comparator.comparing(this::modifiedTime))
                    .orElseThrow(() -> new IllegalStateException(
                            "No current-run Playwright snapshot is available. Call browser_navigate first."));
            return Files.readString(newest, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No current-run Playwright snapshot is available. Call browser_navigate first.",
                    exception);
        }
    }

    private static boolean isSnapshotName(Path path) {
        String name = path.getFileName().toString();
        return name.startsWith("page-") && name.endsWith(".yml");
    }

    private static boolean isSafeSnapshot(Path path) {
        try {
            BasicFileAttributes attributes = Files.readAttributes(
                    path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
            return attributes.isRegularFile()
                    && !attributes.isSymbolicLink()
                    && attributes.size() > 0
                    && attributes.size() <= MAX_SNAPSHOT_BYTES;
        } catch (IOException exception) {
            return false;
        }
    }

    private java.nio.file.attribute.FileTime modifiedTime(Path path) {
        try {
            return Files.getLastModifiedTime(path, LinkOption.NOFOLLOW_LINKS);
        } catch (IOException exception) {
            return java.nio.file.attribute.FileTime.fromMillis(0);
        }
    }
}
```

### 4. Añade Playwright MCP y permisos con ámbito

Compila la configuración completa de la sesión y envía el prompt de evidencia del navegador:

```java
var lookup = ToolDefinition.from(
        "accessibility_rule_lookup",
        "Looks up read-only WCAG guidance maintained by this application.",
        Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
        AccessibilityReport::lookupRule).skipPermission(true);
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);

var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup, readSnapshot))
        .setAvailableTools(List.of(
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate"))
        .setMcpServers(Map.of("playwright", new McpStdioServerConfig()
                .setCommand("npx")
                .setArgs(List.of("-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"))
                .setWorkingDirectory(workingDirectory.toString())
                .setTools(List.of("browser_navigate"))))
        .setOnPermissionRequest((request, ignored) -> {
            if ("mcp".equals(request.getKind())
                    && isExactNavigation(request.getExtensionData(), target)) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            return java.util.concurrent.CompletableFuture.completedFuture(
                    PermissionRequestResult.reject(
                            "This workshop allows Playwright to navigate only to the exact requested target. "
                                    + "MCP requests without target data remain denied unless the explicit "
                                    + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
        });

try (var client = new CopilotClient()) {
    client.start().get();
    var session = client.createSession(config).get();
    var response = session.sendAndWait(new MessageOptions().setPrompt(
            """
            Open %s with browser_navigate.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Return the observed page title only.

            The permission handler must approve only this exact Playwright navigation target."""
                    .formatted(target))).get();
    if (response == null) {
        throw new IllegalStateException("Copilot completed without an assistant message.");
    }
    System.out.println(response.getData().content());
}
```

Añade las importaciones de MCP y permisos:

```java
import com.github.copilot.rpc.McpStdioServerConfig;
import com.github.copilot.rpc.PermissionRequestResult;
```

## Ejecútalo

```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

La primera ejecución puede tardar más mientras `npx` inicia Playwright. Este comando opta
intencionadamente por la ruta alternativa temporal local-demo anterior; omite la marca para mantener
la política estricta de denegación por defecto.

Busca un título de página como:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| `npx` no se puede iniciar | Vuelve a ejecutar el comando MCP de preparación y comprueba que Node.js está en `PATH`. |
| Playwright no puede encontrar un navegador | Instala Edge o Chrome, o configura un navegador instalado como describe Playwright MCP. |
| Se rechaza un permiso | El controlador predeterminado deniega intencionadamente payloads de solicitud ausentes o no exactos. Usa el destino exacto cuando el SDK lo proporcione; solo para este destino controlado, añade `--allow-local-demo-mcp` hasta que se corrija [#2273](https://github.com/github/copilot-sdk/issues/2273). |
| No hay disponible ninguna instantánea de la ejecución actual | Mantén el orden del prompt: llama a `browser_navigate` antes de `read_latest_accessibility_snapshot`. |
| Tipos de MCP o de permisos sin resolver | Añade las importaciones `McpStdioServerConfig` y `PermissionRequestResult`. |

</details>

<details>
<summary>Implementación completa del Paso 4</summary>

Compara tu trabajo con esta implementación completa del Paso 4.

Cableado de sesión de `AccessibilityReport.java`:

```java
var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup, readSnapshot))
        .setAvailableTools(List.of(
                "accessibility_rule_lookup",
                "read_latest_accessibility_snapshot",
                "playwright-browser_navigate"))
        .setMcpServers(Map.of("playwright", new McpStdioServerConfig()
                .setCommand("npx")
                .setArgs(List.of("-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"))
                .setWorkingDirectory(workingDirectory.toString())
                .setTools(List.of("browser_navigate"))))
        .setOnPermissionRequest((request, ignored) -> {
            if ("mcp".equals(request.getKind())
                    && isExactNavigation(request.getExtensionData(), target)) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
                return java.util.concurrent.CompletableFuture.completedFuture(
                        PermissionRequestResult.approveOnce());
            }
            return java.util.concurrent.CompletableFuture.completedFuture(
                    PermissionRequestResult.reject(
                            "This workshop allows Playwright to navigate only to the exact requested target. "
                                    + "MCP requests without target data remain denied unless the explicit "
                                    + LOCAL_DEMO_MCP_FLAG + " local-demo fallback is enabled."));
        });
```

</details>
:::

> **Estás listo para combinar herramientas cuando:** el terminal muestra actividad de herramientas
> de Playwright con nombre e imprime el título de la página de destino.

## Comprueba lo que has aprendido

¿Por qué Playwright es aquí un servidor MCP en lugar de otro callback propio de la aplicación?

<details>
<summary>Comprueba tu respuesta</summary>

Playwright proporciona automatización de navegador reutilizable en su propio proceso, con sus
propias dependencias. MCP lo conecta sin trasladar la lógica del navegador al código de dominio de
la aplicación, y los permisos protegen el límite del proceso.

</details>

## Más información

- [Model Context Protocol](https://modelcontextprotocol.io/): el estándar abierto que implementa el servidor
  Playwright y del que procede el vocabulario de sus nombres de herramientas.
- [Depuración de MCP](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/mcp-debugging.md):
  diagnosticar un servidor que no se inicia o que expone herramientas distintas de las esperadas.
- [Gestión de errores de hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/error-handling.md):
  decidir qué hace una sesión cuando falla una llamada a herramienta o un controlador.
- [Directorios de plugins](https://github.com/github/copilot-sdk/blob/main/docs/features/plugin-directories.md):
  agrupar servidores MCP, skills y hooks para que una sesión los cargue como una unidad.

Continúa con [Paso 5: Combina herramientas locales y MCP](05-combine-tools.md).
