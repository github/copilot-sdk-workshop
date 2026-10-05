# Schritt 9: Einen interaktiven HTML-Bericht generieren

> **Dauer:** 15 Minuten  
> **Voraussetzung:** Schließen Sie Schritt 8: Ein Modell auswählen ab.

## Was Sie erstellen

Der Markdown-Bericht ist in einem Terminal nützlich, aber seine Befunde lassen sich in einem Browser
leichter erkunden. Sie lassen dieselbe Berichtssitzung eine eigenständige Datei
`accessibility-report.html` erstellen, öffnen sie dann lokal und filtern ihre Befunde.

## Eine eng begrenzte Schreibfähigkeit hinzufügen

Die bisherigen anwendungseigenen Tools sind schreibgeschützt, und Playwright kann nur zu einer
exakten URL navigieren. Dieser Schritt fügt zwei integrierte Runtime-Tools hinzu:
`builtin:apply_patch` und `builtin:create`. Jedes der beiden Tools kann die Berichtsdatei erstellen.

Das bedeutet **nicht**, jede Dateiänderung zu genehmigen. Behalten Sie die vorhandene
Browser-Navigationsregel bei und genehmigen Sie einen Schreibvorgang nur, wenn er direkt
`accessibility-report.html` im Arbeitsverzeichnis der Anwendung zum Ziel hat. Lehnen Sie
Shell-Befehle, andere Dateischreibvorgänge und jede andere Berechtigungsanforderung ab.

Der Berichtsprompt bleibt nachweisbasiert: Er muss navigieren, den Snapshot des aktuellen Laufs
lesen und Katalogleitlinien nachschlagen, bevor er das HTML-Artefakt schreibt.

:::language dotnet
## Die .NET-Schreibberechtigung eingrenzen

Ersetzen Sie `CreateForTarget` in `Helpers/WorkshopPermissionHandler.cs`. Die Hilfsfunktion erhält
jetzt auch das Anwendungsverzeichnis und erlaubt nur den einen normalisierten Berichtspfad:

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

Behalten Sie die vorhandenen Hilfsmethoden bei. Übergeben Sie in `Program.cs` das vorhandene
`workingDirectory` und fügen Sie die quellqualifizierten integrierten Tools hinzu:

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

Ersetzen Sie den Rumpf von `CreateReportPrompt` in `Helpers/Prompts.cs`:

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
## Die Node.js-Schreibberechtigung eingrenzen

Ersetzen Sie in `src/workshop.ts` `permissionForTarget` durch eine Version, die die exakte
Navigation beibehält und nur den normalisierten Berichtspfad hinzufügt:

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

Übergeben Sie in `src/report.ts` das Arbeitsverzeichnis an den Handler und hängen Sie die
integrierten Tools an `availableTools` an:

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

Ersetzen Sie `reportPrompt` in `src/workshop.ts`:

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
## Die Python-Schreibberechtigung eingrenzen

Ersetzen Sie in `workshop.py` `permission_for_target` durch diese pfadbewusste Version:

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

Übergeben Sie in `report.py` das aktuelle Verzeichnis an den Berechtigungshandler und hängen Sie die
quellqualifizierten integrierten Tools an:

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

Ersetzen Sie `report_prompt` in `workshop.py`:

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
## Die Go-Schreibberechtigung eingrenzen

Ersetzen Sie `permissionForTarget` in `main.go`. Der Schreibzweig löst relative Dateinamen gegen das
Arbeitsverzeichnis der Anwendung auf, sodass ein gleichgeordneter oder übergeordneter Pfad abgelehnt
wird:

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

Übergeben Sie `workingDirectory` an die Hilfsfunktion und hängen Sie die quellqualifizierten integrierten Tools an:

```go
AvailableTools:      []string{"accessibility_rule_lookup", "read_latest_accessibility_snapshot", "playwright-browser_navigate", "builtin:apply_patch", "builtin:create"},
OnPermissionRequest: permissionForTarget(target, workingDirectory),
```

Ersetzen Sie `reportPrompt`:

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
## Die Rust-Schreibberechtigung eingrenzen

Fügen Sie `report_path: PathBuf` zu `ScopedPermissions` hinzu. Behalten Sie die Extraktion von
`permission_payload` aus Schritt 4 bei: Sie bevorzugt das verschachtelte Objekt `permissionRequest`,
wenn das SDK eines sendet, fällt für ältere Payloads auf das direkte Objekt zurück und lehnt
fehlerhaft gebildete verschachtelte Werte ab. Fügen Sie dann diesen Schreibzweig vor dem ablehnenden
`else` hinzu:

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

Legen Sie beim Erstellen des Berechtigungshandlers das neue Feld fest und hängen Sie die integrierten Tools an:

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

Ersetzen Sie `report_prompt`:

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
## Die Java-Schreibberechtigung eingrenzen

Fügen Sie in `src/main/java/workshop/AccessibilityReport.java` diese Hilfsfunktion neben `isExactNavigation` hinzu:

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

> **Deutliche Java-Sicherheitswarnung:** Der Standardhandler bleibt fail-closed: Er genehmigt eine MCP-Anforderung
> erst nach exakter Zielvalidierung und eine Schreibanforderung erst nach
> `accessibility-report.html`-Pfadvalidierung. Aktuelle Java-SDK-Releases stellen diese
> Berechtigungsanforderungsfelder nicht bereit ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)).
> Das vorhandene Flag `--allow-local-demo-mcp` ist auf die Art `mcp` beschränkt. Schritt 9 erfordert zusätzlich
> `--allow-local-demo-write`, das auf die Art `write` und die
> Tool-Zulassungsliste `builtin:apply_patch` / `builtin:create` beschränkt ist, aber **den Ausgabepfad nicht erzwingen kann**.
> Aktivieren Sie beide Flags
> nur für dieses wegwerfbare, kontrollierte lokale Workshop-Ziel. Verwenden Sie niemals eine der beiden Ausweichlösungen für
> Produktions-, gemeinsam genutzte oder nicht vertrauenswürdige Worktrees.

Um den separaten Schreib-Fallback hinzuzufügen, ersetzen Sie den Parser aus Schritt 4 durch:

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

Erweitern Sie den vorhandenen Aufruf `setAvailableTools` und den Berechtigungs-Callback:

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

Ersetzen Sie `reportPrompt`:

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

## Ausführen

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

Verwenden Sie das Workshop-Ziel:

```text
{{TARGET_APP_URL}}
```

Das Tool-Transkript sollte die vorhandenen Navigations-, Snapshot- und Katalogaufrufe sowie einen
Schreibvorgang mit `apply_patch` oder `create` enthalten. Öffnen Sie `accessibility-report.html` in
einem Browser. Geben Sie ein Wort aus einem Befund, WCAG-Kriterium oder einer Nachweiszeile in den
Filter ein und bestätigen Sie, dass die sichtbaren Karten und die Ergebnisanzahl aktualisiert
werden.

<details>
<summary>Fehlerbehebung für diesen Schritt</summary>

| Symptom | Behebung |
|---|---|
| Der Schreibvorgang wird abgelehnt | Der Standardhandler verlangt den exakten Pfad `accessibility-report.html`. Wenn Java-SDK-Payload-Felder nicht verfügbar sind, verwenden Sie `--allow-local-demo-write` nur für die kontrollierte lokale Demo; das Flag genehmigt die Art `write`, kann den Pfad aber nicht nachweisen. |
| Mehr als eine Datei wird angefordert | Behalten Sie in der neuen integrierten Fähigkeit nur `builtin:apply_patch` und `builtin:create` bei. Der Standardhandler lehnt andere Pfade ab; der Java-Schreib-Fallback für lokale Demos kann diese Garantie nicht geben. |
| Der Filter funktioniert nicht | Das generierte Dokument muss eingebettetes JavaScript enthalten, das Karten filtert und die Live-Ergebnisanzahl aktualisiert. Führen Sie den Lauf einmal erneut aus, wenn der Agent ein erforderliches Element ausgelassen hat. |
| Der Bericht wird ohne Styling geladen | Lassen Sie CSS und JavaScript in die eine HTML-Datei eingebettet; der Prompt verbietet externe Assets und Bibliotheken absichtlich. |

</details>

> **Dieser Schritt ist abgeschlossen, wenn:** `accessibility-report.html` lokal geöffnet wird und
> nachweisgestützte Befunde filtert. Mit dem standardmäßigen exakten Handler genehmigt die Sitzung keinen anderen
> Dateipfad; der Java-Schreib-Fallback für lokale Demos kann diese Garantie absichtlich nicht geben.

## Verständnis prüfen

Warum ist es sicherer, zwei benannte integrierte Schreib-Tools zu erlauben, als Dateisystemzugriff breit zu genehmigen?

<details>
<summary>Antwort prüfen</summary>

`builtin:apply_patch` und `builtin:create` stellen nur die erforderlichen Dateischreibfähigkeiten
bereit. Der standardmäßige Berechtigungs-Callback bindet beide Fähigkeiten an einen normalisierten
Ausgabepfad. Das Modell kann keine Shell-Befehle verwenden oder eine andere Datei schreiben, während
die vorhandenen lokalen Tools und die bereichsgebundene Playwright-Navigation unverändert bleiben.
Der Java-Fallback für lokale Demos ist eine explizite Ausnahme, solange das SDK keine
Berechtigungs-Payload-Felder bereitstellt, daher muss er auf ein kontrolliertes lokales Ziel
beschränkt bleiben.

</details>

## Weitere Informationen

- [Hook vor der Tool-Nutzung](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md):
  einen Tool-Aufruf genehmigen, ablehnen oder umschreiben, bevor er ausgeführt wird, im Code statt in einem Prompt.
- [Hooks-Referenz](https://github.com/github/copilot-sdk/blob/main/docs/hooks/README.md):
  alle Hooks, die das SDK bereitstellt, und die Eingabe, die jeder erhält.
- [Lokale CLI-Einrichtung](https://github.com/github/copilot-sdk/blob/main/docs/setup/local-cli.md):
  steuern, welche CLI das SDK startet, wodurch entschieden wird, wo eine geschriebene Datei landet.

Fahren Sie mit [Schritt 10: Geschafft!](10-complete.md) fort, um zu feiern und Ressourcen zum Weiterbauen zu erhalten.
