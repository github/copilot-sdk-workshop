# Paso 9: Genera un informe HTML interactivo

> **Tiempo:** 15 minutos  
> **Requisito previo:** Completa el Paso 8: Selecciona un modelo.

## Qué vas a crear

El informe Markdown es útil en un terminal, pero sus hallazgos son más fáciles de explorar en un
navegador. Permitirás que la misma sesión de informe cree un archivo independiente
`accessibility-report.html`, luego lo abrirás localmente y filtrarás sus hallazgos.

## Añade una capacidad de escritura acotada

Las herramientas anteriores propias de la aplicación son de solo lectura, y Playwright solo puede
navegar a una URL exacta. Este paso añade dos herramientas integradas del entorno de ejecución:
`builtin:apply_patch` y `builtin:create`. Cualquiera de las dos puede crear el archivo de informe.

Eso **no** significa aprobar todos los cambios de archivo. Mantén la regla existente de navegación
del navegador y aprueba una escritura solo cuando apunte a `accessibility-report.html` directamente
en el directorio de trabajo de la aplicación. Rechaza comandos de shell, otras escrituras de
archivos y cualquier otra solicitud de permiso.

El prompt del informe sigue basándose en evidencias: debe navegar, leer la instantánea de la
ejecución actual y consultar la guía del catálogo antes de escribir el artefacto HTML.

:::language dotnet
## Delimita el permiso de escritura de .NET

Sustituye `CreateForTarget` en `Helpers/WorkshopPermissionHandler.cs`. Ahora el auxiliar también
recibe el directorio de la aplicación y permite solo la ruta de informe normalizada única:

```csharp
public static Func<PermissionRequest, PermissionInvocation, Task<PermissionDecision>> CreateForTarget(
    Uri allowedTarget,
    string workingDirectory)
{
    ArgumentNullException.ThrowIfNull(allowedTarget);
    var reportPath = Path.GetFullPath(Path.Combine(workingDirectory, "accessibility-report.html"));

    return (request, _) =>
    {
        var decision = request switch
        {
            PermissionRequestMcp { ServerName: "playwright" } navigation
                when IsPlaywrightTool(navigation, "browser_navigate") &&
                     IsNavigationToTarget(navigation.Args, allowedTarget) =>
                PermissionDecision.ApproveOnce(),
            PermissionRequestWrite write
                when Path.GetFullPath(write.FileName).Equals(reportPath, StringComparison.OrdinalIgnoreCase) =>
                PermissionDecision.ApproveOnce(),
            _ => PermissionDecision.Reject(
                "This workshop allows only exact target navigation and writing accessibility-report.html.")
        };

        return Task.FromResult(decision);
    };
}
```

Mantén los métodos auxiliares existentes. En `Program.cs`, pasa el `workingDirectory` existente y
añade las herramientas integradas cualificadas por origen:

```csharp
OnPermissionRequest = WorkshopPermissionHandler.CreateForTarget(targetUri, workingDirectory),
AvailableTools =
[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create"
],
```

Sustituye el cuerpo de `CreateReportPrompt` en `Helpers/Prompts.cs`:

```csharp
public static string CreateReportPrompt(Uri targetUri) => $"""
    Prepare an evidence-based accessibility review of {targetUri.AbsoluteUri}.

    1. Use browser_navigate to open that exact URL.
    2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
    3. Identify three to five high-confidence issues supported by the snapshot.
    4. Call accessibility_rule_lookup for each issue before recommending a fix.
    5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

    Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
    JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
    finding count, review limits, and one finding card per supported issue with its evidence, WCAG
    criterion, and remediation. Add an accessible text filter that updates a visible result count
    and filters cards by finding name, criterion, or evidence. Escape all finding text before
    inserting it into HTML. Make keyboard focus visible.

    Do not write any other file. After the write succeeds, respond only with:
    Created accessibility-report.html
    """;
```
:::

:::language nodejs
## Delimita el permiso de escritura de Node.js

En `src/workshop.ts`, sustituye `permissionForTarget` por una versión que conserve la navegación
exacta y añada solo la ruta de informe normalizada:

```typescript
export function permissionForTarget(target: URL, workingDirectory: string): PermissionHandler {
  const reportPath = resolve(workingDirectory, "accessibility-report.html");
  return (request) => {
    if (request.kind === "mcp" && request.serverName === "playwright" &&
      (request.toolName === "browser_navigate" || request.toolName === "playwright-browser_navigate") &&
      typeof request.args?.url === "string" && sameUrl(request.args.url, target)) {
      return { kind: "approve-once" };
    }
    if (request.kind === "write" && typeof request.fileName === "string" &&
      resolve(workingDirectory, request.fileName) === reportPath) {
      return { kind: "approve-once" };
    }
    return { kind: "reject", feedback: "This workshop allows only exact target navigation and writing accessibility-report.html." };
  };
}
```

En `src/report.ts`, pasa el directorio de trabajo al controlador y anexa las herramientas integradas
a `availableTools`:

```typescript
onPermissionRequest: permissionForTarget(target, process.cwd()),
availableTools: [
  "accessibility_rule_lookup",
  "read_latest_accessibility_snapshot",
  "playwright-browser_navigate",
  "builtin:apply_patch",
  "builtin:create",
],
```

Sustituye `reportPrompt` en `src/workshop.ts`:

```typescript
export function reportPrompt(target: URL): string {
  return `Prepare an evidence-based accessibility review of ${target.href}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`;
}
```
:::

:::language python
## Delimita el permiso de escritura de Python

En `workshop.py`, sustituye `permission_for_target` por esta versión que tiene en cuenta la ruta:

```python
def permission_for_target(target: str, working_directory: str):
    report_path = Path(working_directory, "accessibility-report.html").resolve()

    def handler(request, _invocation):
        if getattr(request, "kind", None) == "mcp" and request.server_name == "playwright" and request.tool_name in {"browser_navigate", "playwright-browser_navigate"} and isinstance(request.args, dict) and isinstance(request.args.get("url"), str) and _same_url(request.args["url"], target):
            return PermissionDecisionApproveOnce()
        if getattr(request, "kind", None) == "write" and isinstance(getattr(request, "file_name", None), str):
            candidate = Path(request.file_name)
            candidate = candidate if candidate.is_absolute() else Path(working_directory, candidate)
            if candidate.resolve() == report_path:
                return PermissionDecisionApproveOnce()
        return PermissionDecisionReject(
            feedback="This workshop allows only exact target navigation and writing accessibility-report.html.")

    return handler
```

En `report.py`, pasa el directorio actual al controlador de permisos y anexa las herramientas
integradas cualificadas por origen:

```python
on_permission_request=permission_for_target(target, "."),
available_tools=[
    "accessibility_rule_lookup",
    "read_latest_accessibility_snapshot",
    "playwright-browser_navigate",
    "builtin:apply_patch",
    "builtin:create",
],
```

Sustituye `report_prompt` en `workshop.py`:

```python
def report_prompt(target: str) -> str:
    return f"""Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"""
```
:::

:::language go
## Delimita el permiso de escritura de Go

Sustituye `permissionForTarget` en `main.go`. La rama de escritura resuelve los nombres de archivo
relativos respecto al directorio de trabajo de la aplicación, por lo que se rechaza una ruta hermana
o de un directorio padre:

```go
func permissionForTarget(target, workingDirectory string) copilot.PermissionHandlerFunc {
	reportPath := filepath.Join(workingDirectory, "accessibility-report.html")
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
		if json.Unmarshal(raw, &value) == nil && value["kind"] == "write" {
			if fileName, ok := value["fileName"].(string); ok {
				candidate := fileName
				if !filepath.IsAbs(candidate) {
					candidate = filepath.Join(workingDirectory, candidate)
				}
				if filepath.Clean(candidate) == reportPath {
					return &rpc.PermissionDecisionApproveOnce{}, nil
				}
			}
		}
		feedback := "This workshop allows only exact target navigation and writing accessibility-report.html."
		return &rpc.PermissionDecisionReject{Feedback: &feedback}, nil
	}
}
```

Pasa `workingDirectory` al auxiliar y anexa las herramientas integradas cualificadas por origen:

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

Sustituye `reportPrompt`:

```go
func reportPrompt(target string) string {
	return fmt.Sprintf(`Prepare an evidence-based accessibility review of %s.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html`, target)
}
```
:::

:::language rust
## Delimita el permiso de escritura de Rust

Añade `report_path: PathBuf` a `ScopedPermissions`. Mantén la extracción de `permission_payload` del
Paso 4: prefiere el objeto `permissionRequest` anidado cuando el SDK envía uno, recurre al objeto
directo para cargas útiles antiguas y rechaza valores anidados con formato incorrecto. Después añade
esta rama de escritura antes de su `else` de rechazo:

```rust
let file_name = permission_payload(&request.extra)
    .and_then(|payload| payload.get("fileName"))
    .and_then(serde_json::Value::as_str);
let report_write = request.kind == Some(PermissionRequestKind::Write)
    && file_name.is_some_and(|name| {
    let candidate = Path::new(name);
    let candidate = if candidate.is_absolute() {
        candidate.to_path_buf()
    } else {
        self.report_path.parent().unwrap_or(Path::new("")).join(candidate)
    };
    candidate == self.report_path
    });

if report_write {
    PermissionResult::approve_once()
} else if server == Some("playwright")
    && matches!(tool, Some("browser_navigate" | "playwright-browser_navigate"))
    && requested.as_ref().is_some_and(|url| same_url(url, &self.target))
{
    PermissionResult::approve_once()
} else {
    PermissionResult::reject(Some(
        "This workshop allows only exact target navigation and writing accessibility-report.html."
            .to_owned(),
    ))
}
```

Al crear el controlador de permisos, establece el nuevo campo y anexa las herramientas integradas:

```rust
config.available_tools = Some(vec![
    "accessibility_rule_lookup".to_owned(),
    "read_latest_accessibility_snapshot".to_owned(),
    "playwright-browser_navigate".to_owned(),
    "builtin:apply_patch".to_owned(),
    "builtin:create".to_owned(),
]);
let config = config.with_permission_handler(Arc::new(ScopedPermissions {
    target: target.clone(),
    report_path: working_directory.join("accessibility-report.html"),
}));
```

Sustituye `report_prompt`:

```rust
fn report_prompt(target: &Url) -> String {
    format!(
        r#"Prepare an evidence-based accessibility review of {target}.
1. Use browser_navigate to open that exact URL.
2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
3. Identify three to five high-confidence issues supported by the snapshot.
4. Call accessibility_rule_lookup for each issue before recommending a fix.
5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
finding count, review limits, and one finding card per supported issue with its evidence, WCAG
criterion, and remediation. Add an accessible text filter that updates a visible result count
and filters cards by finding name, criterion, or evidence. Escape all finding text before
inserting it into HTML. Make keyboard focus visible.

Do not write any other file. After the write succeeds, respond only with:
Created accessibility-report.html"#
    )
}
```
:::

:::language java
## Delimita el permiso de escritura de Java

En `src/main/java/workshop/AccessibilityReport.java`, añade este auxiliar junto a `isExactNavigation`:

```java
private static boolean isReportWrite(Map<String, Object> request, Path workingDirectory) {
    if (request == null || !(request.get("fileName") instanceof String fileName)) {
        return false;
    }
    Path candidate = Path.of(fileName);
    if (!candidate.isAbsolute()) {
        candidate = workingDirectory.resolve(candidate);
    }
    return candidate.normalize().equals(
            workingDirectory.resolve("accessibility-report.html").normalize());
}
```

> **Advertencia de seguridad destacada de Java:** El controlador predeterminado sigue rechazando por defecto: aprueba una solicitud MCP
> solo tras validar el destino exacto y una solicitud de escritura solo tras
> validar la ruta de `accessibility-report.html`. Las versiones actuales del SDK de Java no exponen estos
> campos de solicitud de permisos ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)).
> La marca `--allow-local-demo-mcp` existente se limita al tipo `mcp`. El Paso 9 requiere además
> `--allow-local-demo-write`, que se limita al tipo `write` y a la lista de permitidos de herramientas
> `builtin:apply_patch` / `builtin:create`, pero **no puede exigir la ruta de salida**.
> Habilita ambas marcas
> solo para este destino local desechable y controlado del taller. No uses nunca ninguna de las dos alternativas para
> árboles de trabajo de producción, compartidos o no fiables.

Para añadir la alternativa de escritura separada, sustituye el analizador del Paso 4 por:

```java
private static final String LOCAL_DEMO_MCP_FLAG = "--allow-local-demo-mcp";
private static final String LOCAL_DEMO_WRITE_FLAG = "--allow-local-demo-write";

private static RunOptions parseRunOptions(String[] args) throws URISyntaxException {
    boolean allowLocalDemoMcp = false;
    boolean allowLocalDemoWrite = false;
    String target = null;
    for (String arg : args) {
        if (LOCAL_DEMO_MCP_FLAG.equals(arg)) {
            if (allowLocalDemoMcp) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_MCP_FLAG + " at most once.");
            }
            allowLocalDemoMcp = true;
            continue;
        }
        if (LOCAL_DEMO_WRITE_FLAG.equals(arg)) {
            if (allowLocalDemoWrite) {
                throw new IllegalArgumentException("Specify " + LOCAL_DEMO_WRITE_FLAG + " at most once.");
            }
            allowLocalDemoWrite = true;
            continue;
        }
        if (target == null) {
            target = arg;
        } else {
            throw new IllegalArgumentException(usage());
        }
    }
    if (target == null) {
        throw new IllegalArgumentException(usage());
    }
    return new RunOptions(parseTarget(target), allowLocalDemoMcp, allowLocalDemoWrite);
}

private record RunOptions(URI target, boolean allowLocalDemoMcp, boolean allowLocalDemoWrite) {
}
```

Amplía la llamada `setAvailableTools` existente y la devolución de llamada de permisos:

```java
.setAvailableTools(List.of(
        "accessibility_rule_lookup",
        "read_latest_accessibility_snapshot",
        "playwright-browser_navigate",
        "builtin:apply_patch",
        "builtin:create"))
// Keep the existing MCP server configuration.
.setOnPermissionRequest((request, ignored) -> {
    if ("mcp".equals(request.getKind())
            && isExactNavigation(request.getExtensionData(), target)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if ("write".equals(request.getKind())
            && isReportWrite(request.getExtensionData(), workingDirectory)) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoMcp() && "mcp".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    if (options.allowLocalDemoWrite() && "write".equals(request.getKind())) {
        return java.util.concurrent.CompletableFuture.completedFuture(
                PermissionRequestResult.approveOnce());
    }
    return java.util.concurrent.CompletableFuture.completedFuture(
            PermissionRequestResult.reject(
                    "This workshop allows only exact target navigation and writing accessibility-report.html. "
                            + "Requests without target or path data remain denied unless the explicit "
                            + "local-demo fallback for that permission kind is enabled."));
})
```

Sustituye `reportPrompt`:

```java
private static String reportPrompt(URI target) {
    return """
            Prepare an evidence-based accessibility review of %s.
            1. Use browser_navigate to open that exact URL.
            2. Call read_latest_accessibility_snapshot to inspect its accessibility tree.
            3. Identify three to five high-confidence issues supported by the snapshot.
            4. Call accessibility_rule_lookup for each issue before recommending a fix.
            5. Use apply_patch or create to create exactly accessibility-report.html in the current working directory.

            Write one complete, standalone HTML document. Use semantic HTML, embedded CSS, and embedded
            JavaScript only; do not use external assets, URLs, or libraries. Include a title, target URL,
            finding count, review limits, and one finding card per supported issue with its evidence, WCAG
            criterion, and remediation. Add an accessible text filter that updates a visible result count
            and filters cards by finding name, criterion, or evidence. Escape all finding text before
            inserting it into HTML. Make keyboard focus visible.

            Do not write any other file. After the write succeeds, respond only with:
            Created accessibility-report.html""".formatted(target);
}
```
:::

## Ejecútalo

:::language dotnet
```bash
dotnet run
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
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp --allow-local-demo-write {{TARGET_APP_URL}}"
```
:::

Usa el destino del taller:

```text
{{TARGET_APP_URL}}
```

La transcripción de herramientas debería incluir las llamadas existentes de navegación, instantánea
y catálogo, además de una escritura mediante `apply_patch` o `create`. Abre
`accessibility-report.html` en un navegador. Escribe una palabra de un hallazgo, criterio WCAG o
línea de evidencia en el filtro y confirma que las tarjetas visibles y el recuento de resultados se
actualizan.

<details>
<summary>Solución de problemas de este paso</summary>

| Síntoma | Corrección |
|---|---|
| La escritura se rechaza | El controlador predeterminado requiere la ruta exacta `accessibility-report.html`. Si los campos de la carga del SDK de Java no están disponibles, usa `--allow-local-demo-write` solo para la demostración local controlada; aprueba el tipo `write`, pero no puede demostrar la ruta. |
| Se solicita más de un archivo | Mantén solo `builtin:apply_patch` y `builtin:create` en la nueva capacidad integrada. El controlador predeterminado rechaza otras rutas; la alternativa de escritura de demostración local de Java no puede ofrecer esa garantía. |
| El filtro no funciona | El documento generado debe incluir JavaScript integrado que filtre tarjetas y actualice su recuento de resultados en directo. Vuelve a ejecutarlo una vez si el agente omitió un elemento necesario. |
| El informe se carga sin estilos | Mantén CSS y JavaScript integrados en el único archivo HTML; el prompt prohíbe intencionadamente recursos y bibliotecas externos. |

</details>

> **Este paso está completo cuando:** `accessibility-report.html` se abre localmente y
> filtra hallazgos fundamentados en evidencias. Con el controlador exacto predeterminado, la sesión no aprueba ninguna otra
> ruta de archivo; la alternativa de escritura de demostración local de Java deliberadamente no puede ofrecer esa garantía.

## Comprueba lo que has aprendido

¿Por qué permitir dos herramientas de escritura integradas con nombre es más seguro que aprobar ampliamente el acceso al sistema de archivos?

<details>
<summary>Comprueba tu respuesta</summary>

`builtin:apply_patch` y `builtin:create` exponen solo las capacidades de escritura de archivos
necesarias. La devolución de llamada de permisos predeterminada vincula ambas capacidades a una ruta
de salida normalizada. El modelo no puede usar comandos de shell ni escribir otro archivo, mientras
que las herramientas locales existentes y la navegación acotada de Playwright permanecen sin
cambios. La alternativa de demostración local de Java es una excepción explícita mientras el SDK
omite los campos de la carga de permisos, por lo que debe seguir limitada a un destino local
controlado.

</details>

## Más información

- [Hook previo al uso de herramientas](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md):
  aprobar, denegar o reescribir una llamada a herramienta antes de que se ejecute, en código en lugar de en un prompt.
- [Referencia de hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md):
  todos los hooks que expone el SDK y la entrada que recibe cada uno.
- [Configuración de la CLI local](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md):
  controlar qué CLI inicia el SDK, lo que decide dónde se guarda un archivo escrito.

Continúa con [Paso 10: ¡Lo has conseguido!](10-complete.md) para celebrarlo y consultar recursos con los que seguir creando.
