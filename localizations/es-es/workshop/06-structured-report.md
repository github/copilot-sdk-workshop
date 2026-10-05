# Paso 6: Genera un informe estructurado

> **Tiempo:** 10 minutos

## Qué vas a generar

Generarás un informe conciso que separa la evidencia de la página, la correspondencia con criterios,
la corrección y los límites de la revisión.

## Separa la evidencia de la interpretación

Una respuesta del agente contiene **evidencia** e **interpretación**. La evidencia es lo que
Playwright observó, como una entrada sin nombre accesible. La interpretación es la correspondencia
con el criterio y la corrección basadas en esa evidencia y en el resultado del catálogo.

Un contrato de salida claro indica al agente qué incluir, qué omitir y cómo gestionar la
incertidumbre. Hace que los informes sean más coherentes sin afirmar que la revisión sea exhaustiva.

## Sé útil sin exagerar el resultado

Una instantánea automatizada no puede determinar la conformidad de accesibilidad. El informe debe
ceñirse a hallazgos de alta confianza sin estadísticas inventadas, etiquetas decorativas de gravedad
ni una afirmación amplia de que la página cumple o incumple WCAG.

El agente convierte ahora `browser evidence + catalog result` en un informe acotado y repetible.

## Dale un contrato al informe

:::language dotnet
### 1. Añade el contrato del informe

Crea `Helpers/Prompts.cs`:

```csharp
namespace HelloCopilotSDK.Helpers;

public static class Prompts
{
    public static string CreateReportPrompt(Uri targetUri) => $"""
        Prepare an evidence-based accessibility review of {targetUri.AbsoluteUri}.

        1. Use browser_navigate to open that exact URL.
        2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
        3. Identify three to five high-confidence issues supported by the snapshot.
        4. Call accessibility_rule_lookup for each issue before recommending a fix.

        Return only this structure:

        # Accessibility review
        ## Finding 1: <short name>
        - Evidence: <specific element or page structure observed in the browser>
        - WCAG criterion: <criterion and title returned by the catalog>
        - Recommended remediation: <specific implementation change>

        Repeat the finding section as needed.

        ## Review limits
        State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.

        Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.
        """;
}
```
:::
:::language dotnet
### 2. Usa el contrato

Reemplaza la llamada de envío final en `Program.cs`:

```csharp
Console.WriteLine($"\nAnalyzing: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(session, Prompts.CreateReportPrompt(targetUri));
```
:::

:::language nodejs
### 1. Añade el contrato del informe

En `src/workshop.ts`, añade o reemplaza `reportPrompt`:

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.`;
}
```
:::
:::language nodejs
### 2. Crea el punto de entrada del informe

Crea o reemplaza `src/report.ts` con el análisis de URL, la configuración de sesión y el prompt:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, reportPrompt, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true, onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try { await streamResponse(session, reportPrompt(target)); } finally { await session.disconnect(); }
} finally { await client.stop(); }
```
:::
:::language nodejs
### 3. Apunta el inicio del paquete al punto de entrada del informe

Reemplaza `src/index.ts` para que el comando de inicio del paquete lance el punto de entrada del informe:

```typescript
import "./report.js";
```
:::

:::language python
### 1. Añade el contrato del informe

En `workshop.py`, añade o reemplaza `report_prompt`:

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."""
```
:::
:::language python
### 2. Crea el punto de entrada del informe

Crea o reemplaza `report.py` con el análisis de URL, la configuración de sesión, el streaming y el prompt del informe:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData, ToolExecutionCompleteData, ToolExecutionStartData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target, report_prompt


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True, on_permission_request=permission_for_target(target), tools=[accessibility_rule_lookup, create_snapshot_reader(".")], available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"], mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}}) as session:
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
                    case ToolExecutionStartData(tool_name=name): print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success): print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData(): done.set()
            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```
:::
:::language python
### 3. Apunta el comando documentado al punto de entrada del informe

Reemplaza `main.py` para que el comando documentado lance el punto de entrada del informe:

```python
from report import main

import asyncio

if __name__ == "__main__":
    asyncio.run(main())
```
:::

:::language go
### 1. Añade el contrato del informe

En `main.go`, añade `reportPrompt`:

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot for browser-observable evidence.
3. Call accessibility_rule_lookup before each recommendation.

Return only:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific browser evidence>
- WCAG criterion: <catalog result>
- Recommended remediation: <specific change>
## Review limits
State that this focused review is not a full WCAG conformance audit.`, target)
}
```
:::
:::language go
### 2. Analiza el destino y usa el contrato

Reemplaza `main` para que valide el argumento de URL, compile la sesión de tres herramientas y envíe
el prompt del informe:

```go
func main() {
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
	if err := streamResponse(session, reportPrompt(target)); err != nil {
		panic(err)
	}
}
```
:::

:::language rust
### 1. Añade el contrato del informe

En `src/main.rs`, añade `report_prompt`:

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."#
    )
}
```
:::
:::language rust
### 2. Analiza el destino y usa el contrato

Reemplaza `main` para que valide el argumento de URL, compile la sesión de tres herramientas y envíe
el prompt del informe:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
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
    stream_response!(session, report_prompt(&target));
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
:::

:::language java
### 1. Añade el contrato del informe

En `src/main/java/workshop/AccessibilityReport.java`, añade `reportPrompt`:

```java
private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.

            Return only this structure:
            # Accessibility review
            ## Finding 1: <short name>
            - Evidence: <specific element or page structure observed in the browser>
            - WCAG criterion: <criterion and title returned by the catalog>
            - Recommended remediation: <specific implementation change>
            Repeat the finding section as needed.
            ## Review limits
            State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
            Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.""".formatted(target);
}
```

Mantén sin cambios el callback de permisos del Paso 4. Sigue aplicando denegación por defecto salvo
que pases explícitamente `--allow-local-demo-mcp` para el destino controlado del taller. Esa
alternativa temporal solo de tipo `mcp` no demuestra la URL exacta porque
[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273) no expone el payload de
la solicitud; no la uses fuera de una demo local desechable del taller.
:::
:::language java
### 2. Analiza el destino y usa el contrato

Reemplaza `main` para que valide el argumento de URL, compile la sesión de tres herramientas y envíe
el prompt del informe:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

public static void main(String[] args) throws Exception {
    RunOptions options = parseRunOptions(args);
    URI target = options.target();
    Path workingDirectory = Path.of("").toAbsolutePath().normalize();
    if (options.allowLocalDemoMcp()) {
        System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
                + "so this run approves only the mcp permission kind, not an exact target. "
                + "Use only with the controlled workshop target.");
    }
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
        var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
        if (response == null) {
            throw new IllegalStateException("Copilot completed without an assistant message.");
        }
        System.out.println(response.getData().content());
    }
}
```

Mantén la implementación de `parseTarget` y los auxiliares de alternativa junto a `main`:

```java
private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme()) || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}

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
:::

## Ejecútalo

:::language dotnet
```bash
dotnet run
```

Cuando la aplicación pida una URL, pega:

```text
{{TARGET_APP_URL}}
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```
:::

El informe debe seguir esta forma:

```text
# Accessibility review
## Finding 1: Input has no accessible name
- Evidence: The snapshot contains a textbox with no accessible name.
- WCAG criterion: 4.1.2 Name, Role, Value
- Recommended remediation: Associate a visible label using matching for and id values.

## Review limits
This focused review uses browser-observable evidence and is not a full WCAG conformance audit.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| La salida contiene recuentos no respaldados | Confirma que el prompt dice que no se deben notificar estadísticas no respaldadas. |
| Un hallazgo no tiene un elemento o una estructura concretos | Trátalo como no fundamentado; mantén el requisito de evidencia en el contrato del informe. |
| La respuesta afirma cumplimiento de WCAG | Mantén la sección obligatoria **Review limits** y la prohibición explícita. |
| El paquete sigue ejecutando un punto de entrada anterior | Apunta el comando de inicio al punto de entrada del informe del Paso 6 para tu lenguaje. |
| La URL se rechaza | Pasa una URL HTTP o HTTPS; un esquema ausente se cambia automáticamente a `https://`. |

</details>

> **Estás listo para la ejecución final cuando:** cada hallazgo contiene evidencia específica del navegador, un
> criterio del catálogo y una corrección, y el informe termina con sus límites.

## Comprueba lo que has aprendido

En el informe, ¿qué contenido es evidencia directa y qué contenido es interpretación del modelo?

<details>
<summary>Comprueba tu respuesta</summary>

El elemento o la estructura de página que devuelve Playwright es evidencia. Elegir el criterio y
escribir la corrección son interpretaciones basadas en esa evidencia y en el resultado del catálogo.

</details>

:::language dotnet
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/dotnet/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/dotnet/accessibility-report).

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Accessibility Report Generator ===\n");

Console.Write("Enter URL to analyze: ");
var urlInput = Console.ReadLine()?.Trim();

if (string.IsNullOrWhiteSpace(urlInput))
{
    Console.Error.WriteLine("Enter a URL to analyze.");
    return;
}

if (!urlInput.Contains("://", StringComparison.Ordinal))
{
    urlInput = $"https://{urlInput}";
}

if (!Uri.TryCreate(urlInput, UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Enter an absolute HTTP or HTTPS URL.");
    return;
}

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"\nConnected to the Copilot runtime: {ping.Message}\n");

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

Console.WriteLine($"Analyzing: {targetUri.AbsoluteUri}\n");
await ResponseStreamer.SendAndPrintAsync(session, Prompts.CreateReportPrompt(targetUri));
```
</details>
:::

:::language nodejs
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report).

`src/index.ts`:

```typescript
import "./report.js";
```

`src/report.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, createSnapshotReader, permissionForTarget, reportPrompt, streamResponse } from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) throw new Error("Enter an absolute HTTP or HTTPS URL.");
const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true, onPermissionRequest: permissionForTarget(target),
    tools: [accessibilityRuleLookup, createSnapshotReader(process.cwd())],
    availableTools: ["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"],
    mcpServers: { playwright: { command: "npx", args: ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], workingDirectory: process.cwd(), tools: ["browser_navigate"] } },
  });
  try { await streamResponse(session, reportPrompt(target)); } finally { await session.disconnect(); }
} finally { await client.stop(); }
```

`reportPrompt` en `src/workshop.ts`:

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.`;
}
```
</details>
:::

:::language python
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report).

`main.py`:

```python
from report import main

import asyncio

if __name__ == "__main__":
    asyncio.run(main())
```

`report.py`:

```python
import asyncio
import sys
from urllib.parse import urlsplit

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData, ToolExecutionCompleteData, ToolExecutionStartData

from workshop import accessibility_rule_lookup, create_snapshot_reader, permission_for_target, report_prompt


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True, on_permission_request=permission_for_target(target), tools=[accessibility_rule_lookup, create_snapshot_reader(".")], available_tools=["accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate"], mcp_servers={"playwright": {"command": "npx", "args": ["-y", "@playwright/mcp@0.0.78", "--browser=msedge", "--output-dir", ".playwright-mcp", "--output-mode", "file"], "working_directory": ".", "tools": ["browser_navigate"]}}) as session:
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
                    case ToolExecutionStartData(tool_name=name): print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success): print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData(): done.set()
            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

`report_prompt` en `workshop.py`:

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."""
```
</details>
:::

:::language go
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/go/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/accessibility-report).
El contrato del informe y el punto de entrada:

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot for browser-observable evidence.
3. Call accessibility_rule_lookup before each recommendation.

Return only:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific browser evidence>
- WCAG criterion: <catalog result>
- Recommended remediation: <specific change>
## Review limits
State that this focused review is not a full WCAG conformance audit.`, target)
}

func main() {
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
	if err := streamResponse(session, reportPrompt(target)); err != nil {
		panic(err)
	}
}
```
</details>
:::

:::language rust
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/rust/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/accessibility-report).
El contrato del informe y el punto de entrada:

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.

Return only this structure:
# Accessibility review
## Finding 1: <short name>
- Evidence: <specific element or page structure observed in the browser>
- WCAG criterion: <criterion and title returned by the catalog>
- Recommended remediation: <specific implementation change>
Repeat the finding section as needed.
## Review limits
State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant."#
    )
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
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
    stream_response!(session, report_prompt(&target));
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
</details>
:::

:::language java
<details>
<summary>Implementación completa del Paso 6</summary>

Para comparar, usa el proyecto [`finished/java/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/accessibility-report).
El contrato del informe, el análisis de argumentos y el punto de entrada:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";

public static void main(String[] args) throws Exception {
    RunOptions options = parseRunOptions(args);
    URI target = options.target();
    Path workingDirectory = Path.of("").toAbsolutePath().normalize();
    if (options.allowLocalDemoMcp()) {
        System.err.println("WARNING: Local demo fallback enabled. MCP request payload fields are unavailable, "
                + "so this run approves only the mcp permission kind, not an exact target. "
                + "Use only with the controlled workshop target.");
    }
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
        var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
        if (response == null) {
            throw new IllegalStateException("Copilot completed without an assistant message.");
        }
        System.out.println(response.getData().content());
    }
}

private static URI parseTarget(String value) throws URISyntaxException {
    String candidate = value.contains("://") ? value : "https://" + value;
    URI target = new URI(candidate);
    if (!target.isAbsolute()
            || target.getHost() == null
            || !("http".equalsIgnoreCase(target.getScheme()) || "https".equalsIgnoreCase(target.getScheme()))) {
        throw new IllegalArgumentException("Enter an absolute HTTP or HTTPS URL.");
    }
    return target;
}

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

private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.

            Return only this structure:
            # Accessibility review
            ## Finding 1: <short name>
            - Evidence: <specific element or page structure observed in the browser>
            - WCAG criterion: <criterion and title returned by the catalog>
            - Recommended remediation: <specific implementation change>
            Repeat the finding section as needed.
            ## Review limits
            State that this is a focused review of browser-observable evidence, not a full WCAG conformance audit.
            Do not invent evidence, report unsupported statistics, or claim the page is WCAG compliant.""".formatted(target);
}
```
</details>
:::

## Más información

- [Hook de prompt de usuario enviado](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  modificar o rechazar un prompt en el código antes de que el runtime lo envíe.
- [Hook de prompt de usuario transformado](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  inspeccionar el prompt orientado al modelo que el runtime ha construido realmente a partir de tu texto.
- [Citas](https://github.com/github/copilot-sdk/blob/main/docs/features/citations.md):
  una forma experimental de vincular fragmentos de una respuesta con el material que los respalda.

Continúa con [Paso 7: Ejecuta y explica la aplicación](07-run-explain.md).
