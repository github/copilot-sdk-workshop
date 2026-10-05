# Schritt 4: Ein externes Tool sicher anbinden

> **Dauer:** 20 Minuten

## Was Sie anbinden

Sie starten Playwright über MCP, beschränken die Navigation auf das von Ihnen bereitgestellte
Workshop-Ziel, prüfen seinen Barrierefreiheitsbaum und melden den Seitentitel.

## MCP und seine Vertrauensgrenze kennenlernen

Das [**Model Context Protocol (MCP)**](https://github.com/github/copilot-sdk/blob/main/docs/features/mcp.md)
ist eine Standardmethode, um einen Agenten mit wiederverwendbaren Fähigkeiten zu verbinden, die
außerhalb Ihrer Anwendung implementiert sind. In diesem Workshop startet das SDK den
Playwright-MCP-Server als separaten `npx`-Prozess. Playwright übernimmt die Browserautomatisierung,
während Ihre Anwendung die Verbindung konfiguriert.

Die Prozessgrenze ist auch eine **Vertrauensgrenze**. Ein
[Berechtigungshandler](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
ist ein Callback, den die Runtime aufruft, bevor eine angeforderte Aktion ausgeführt wird, und er
entscheidet, ob die jeweilige externe Aktion ausgeführt werden darf.

| Frage | Lokales WCAG-Tool | Playwright MCP |
|---|---|---|
| Wer implementiert es? | Diese Anwendung | Externes Playwright-Paket |
| Wo wird es ausgeführt? | Im selben Anwendungsprozess | Separater Node.js-Prozess |
| Wofür eignet es sich am besten? | Anwendungseigene Daten und deterministische Logik | Wiederverwendbare Browserfähigkeit |
| Wie wird Vertrauen hier gehandhabt? | Schreibgeschütztes Tool überspringt die Berechtigungsprüfung | Toolliste und benutzerdefinierter Handler beschränken den Zugriff |

Die WCAG-Nachschlagefunktion und der eng begrenzte Snapshot-Reader bleiben im Prozess.
`CopilotSession -> Playwright MCP -> browser` überschreitet eine Prozessgrenze.

## Playwright durch Schutzmaßnahmen absichern

Das Browserargument verwendet Microsoft Edge, den Workshopstandard. Wenn Sie stattdessen Google
Chrome vorbereitet haben, verwenden Sie `--browser=chrome`.

Die Tool-Zulassungsliste der Sitzung hält nicht verwandte Runtime-Tools fern. Die Toolliste des
MCP-Servers stellt nur Navigation bereit. In Playwright MCP 0.0.78 schreibt die Navigation ihren
automatischen Barrierefreiheitsbaum in `.playwright-mcp/`. Der Snapshot-Reader der Anwendung
akzeptiert keine Argumente und liest nur den neuesten Playwright-Snapshot, der nach dem Start der
Sitzung erstellt wurde.

`browser_snapshot` bleibt von beiden Zulassungslisten ausgeschlossen, weil sein optionales
`filename`-Argument eine Datei schreiben kann. Die Runtime kann MCP-Tools, die als schreibgeschützt
annotiert sind, automatisch zulassen, ohne Ihren Berechtigungsdelegaten aufzurufen, daher kann ein
Handler dieses Argument nicht zuverlässig bereinigen. Durch Entfernen des Tools wird diese Fähigkeit
entzogen, statt sich auf einen Prompt zu verlassen.

Der Reader akzeptiert keinen Pfad. Er ignoriert bereits vorhandene Dateien, verschachtelte Dateien,
symbolische Links, leere Dateien und Snapshots größer als 1 MB. Navigation wird nur genehmigt, wenn
die vollständige kanonische URL mit dem beim Start angegebenen Ziel übereinstimmt. Schema und Host
verwenden den URL-Standardvergleich ohne Berücksichtigung der Groß-/Kleinschreibung. Pfad, Abfrage
und Fragment müssen unter Berücksichtigung der Groß-/Kleinschreibung übereinstimmen.

Der Handler gibt genau eine Entscheidung pro Anfrage zurück, und hier werden zwei der verfügbaren
Arten benötigt. `approve-once` erlaubt diese einzelne Anfrage. `reject` lehnt sie ab und kann eine
Feedbacknachricht an das Modell weiterleiten, sodass ein abgelehnter Aufruf mit einer Begründung
zurückkommt, statt als stiller Fehler zu erscheinen. Zwei weitere Arten gibt es für Situationen, die
dieser Workshop nicht erreicht: `user-not-available` lehnt ab, weil kein Benutzer zum Bestätigen
anwesend ist, und `no-result` verzichtet vollständig auf eine Antwort, damit stattdessen ein anderer
verbundener Client die Anfrage beantworten kann. Weitere Genehmigungsbereiche —
`approve-for-session`, `approve-for-location` und `approve-permanently` — merken sich eine
Entscheidung über diesen einen Aufruf hinaus. Jedes SDK schreibt all diese Werte nach seiner eigenen
Namenskonvention.

:::language dotnet
## Bereichsgebundenen Playwright-Zugriff in C# einbinden

### 1. Ein kontrolliertes Ziel akzeptieren

Fügen Sie am Anfang von `Program.cs` nach den `using`-Anweisungen und vor dem Banner Folgendes ein:

```csharp
if (args.Length is not 1 ||
    !Uri.TryCreate(args[0], UriKind.Absolute, out var targetUri) ||
    targetUri.Scheme is not ("http" or "https"))
{
    Console.Error.WriteLine("Usage: dotnet run -- <http-or-https-url>");
    return;
}
```

### 2. Den vorgefertigten Berechtigungshandler prüfen

Öffnen Sie `Helpers/WorkshopPermissionHandler.cs`. Der vorgefertigte Handler gibt nur für die
Navigation zum exakten Ziel eine einmalige Genehmigung zurück. Jede andere externe Anfrage wird
abgelehnt.

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

Das .NET SDK stellt MCP-Berechtigungs-Toolnamen derzeit den Servernamen voran (zum Beispiel
`playwright-browser_navigate`), während die MCP-Konfiguration `browser_navigate` verwendet.
`IsPlaywrightTool` akzeptiert diese beiden exakten Formen, statt einen breiten Platzhalter zu
verwenden.

> **SDK-Hinweis:** Version 1.0.7 enthält `PermissionHandler.ApproveAll`, aber keinen integrierten bereichsgebundenen Handler.
> Das Starterprojekt enthält daher einen handgeschriebenen Delegaten. `PermissionDecision` ist derzeit als
> nur für Evaluation markiert, sodass diese eine Hilfsfunktion eine lokale `GHCP001`-Unterdrückung enthält.

### 3. Die vorgefertigte Abgrenzung des Snapshot-Readers prüfen

Öffnen Sie `Helpers/PlaywrightSnapshotReader.cs`. Der Reader erfasst vorhandene Snapshots, wenn das
Tool erstellt wird, akzeptiert keine vom Modell bereitgestellten Argumente, wählt nur ein neues
direktes untergeordnetes Element namens `page-*.yml` aus, lehnt symbolische Links und zu große
Dateien ab und gibt dann den Text zurück.

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

Der Adapter überspringt die Berechtigungsprüfung, weil er schreibgeschützt ist, von der Anwendung
ausgewählten Speicher verwendet und von der Anwendung implementiert wird. Das ist eine engere
Fähigkeit als ein allgemeiner Datei-Reader.

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Ersetzen Sie die Sitzungskonfiguration durch:

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

### 5. Browsernachweise anfordern

Ersetzen Sie den finalen Sendeaufruf:

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

## Ausführen

```bash
dotnet run -- "{{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet.

Achten Sie auf:

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True

Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Verwenden Sie oben die exakte Ziel-URL. Der Handler verweigert andere URLs und Tools absichtlich. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| Der Compiler kann die Berechtigungshilfsfunktion nicht finden | Bestätigen Sie, dass `using HelloCopilotSDK.Helpers;` vorhanden ist und sich die Hilfsdatei im Projekt befindet. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

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
## Bereichsgebundenen Playwright-Zugriff in TypeScript verdrahten

### 1. Ein kontrolliertes Ziel akzeptieren

Ersetzen Sie oben in `src/index.ts` die Einrichtung des Einstiegspunkts durch:

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

### 2. Den vorgefertigten Berechtigungshandler prüfen

Öffnen Sie `src/workshop.ts`. Der vorgefertigte Handler genehmigt nur Playwright-Navigation zum exakten Ziel:

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

Akzeptieren Sie sowohl `browser_navigate` als auch `playwright-browser_navigate`, weil die Runtime
Berechtigungsanforderungen den Servernamen voranstellen kann.

### 3. Die vorgefertigte Abgrenzung des Snapshot-Readers prüfen

Weiter in `src/workshop.ts`: Der Snapshot-Reader erfasst vorhandene Dateien zum Erstellungszeitpunkt
und akzeptiert keinen vom Modell gelieferten Pfad:

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

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Erstellen Sie in `src/index.ts` die Sitzung mit der Zulassungsliste aus drei Tools und Playwright MCP:

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

`availableTools` verwendet den mit Laufzeitpräfix versehenen MCP-Namen
`playwright-browser_navigate`, während die MCP-Serverkonfiguration weiterhin das unpräfigierte
`browser_navigate` aufführt.

## Ausführen

```bash
npm start -- "{{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet.

Achten Sie auf:

```text
[tool:start] playwright-browser_navigate
[tool:done] success=...
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true

Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Verwenden Sie oben die exakte Ziel-URL. Der Handler verweigert andere URLs und Tools absichtlich. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| TypeScript kann Hilfsfunktionen nicht auflösen | Bestätigen Sie, dass der Importpfad mit `.js` endet, und führen Sie `npm install` im Starterverzeichnis aus. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

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
## Bereichsgebundenen Playwright-Zugriff in Python verdrahten

### 1. Ein kontrolliertes Ziel akzeptieren

Validieren Sie oben in `main.py` die Start-URL:

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

### 2. Den vorgefertigten Berechtigungshandler prüfen

Öffnen Sie `workshop.py`. Der vorgefertigte Handler genehmigt nur Playwright-Navigation zum exakten Ziel:

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

### 3. Die vorgefertigte Abgrenzung des Snapshot-Readers prüfen

Weiter in `workshop.py`: Der Snapshot-Reader erfasst vorhandene Dateien zum Erstellungszeitpunkt und
akzeptiert keinen vom Modell gelieferten Pfad:

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

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Ersetzen Sie den Block zur Sitzungserstellung in `main.py`:

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

`available_tools` verwendet den mit Laufzeitpräfix versehenen MCP-Namen
`playwright-browser_navigate`, während die MCP-Serverkonfiguration weiterhin das unpräfigierte
`browser_navigate` aufführt.

## Ausführen

```bash
python main.py "{{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet.

Achten Sie auf Navigations- und Snapshot-Aktivität und anschließend auf einen Seitentitel wie:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Verwenden Sie oben die exakte Ziel-URL. Der Handler verweigert andere URLs und Tools absichtlich. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| Importfehler bei Workshop-Hilfsfunktionen | Aktivieren Sie die virtuelle Umgebung aus der Vorbereitung, und bestätigen Sie, dass `workshop.py` neben `main.py` liegt. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

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
## Bereichsgebundenen Playwright-Zugriff in Go verdrahten

### 1. Ein kontrolliertes Ziel akzeptieren

Validieren Sie zu Beginn von `main` in `main.go` die Start-URL:

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

### 2. Den Berechtigungshandler hinzufügen

Fügen Sie vor `main` den Abgleich der exakten URL und den Berechtigungshandler hinzu:

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

Akzeptieren Sie im Berechtigungspfad sowohl unpräfigierte als auch präfigierte Playwright-Toolnamen.

### 3. Die Snapshot-Reader-Grenze hinzufügen

Fügen Sie weiterhin vor `main` den argumentlosen Snapshot-Reader hinzu:

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

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Definieren Sie in `main` beide lokalen Tools, und ersetzen Sie die Sitzungskonfiguration:

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

Fügen Sie die von den neuen Hilfsfunktionen verwendeten Importe hinzu: `encoding/json`, `net/url`,
`path/filepath`, `sort`, `time` und `"github.com/github/copilot-sdk/go/rpc"`.

## Ausführen

```bash
go run . "{{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet.

Achten Sie auf einen Seitentitel wie:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Verwenden Sie oben die exakte Ziel-URL. Der Handler verweigert andere URLs und Tools absichtlich. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| Fehlende Importe | Fügen Sie `encoding/json`, `net/url`, `path/filepath`, `sort`, `time` und das `rpc`-Paket hinzu. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

`main.go`-Sitzungsverdrahtung:

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
## Bereichsgebundenen Playwright-Zugriff in Rust verdrahten

### 1. Ein kontrolliertes Ziel akzeptieren

Validieren Sie zu Beginn von `main` in `src/main.rs` die Start-URL:

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

### 2. Den Berechtigungshandler hinzufügen

Fügen Sie den Berechtigungshandler für das exakte Ziel vor `main` hinzu:

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

### 3. Die Snapshot-Reader-Grenze hinzufügen

Fügen Sie den argumentlosen Snapshot-Reader vor `main` hinzu:

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

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Definieren Sie in `main` beide lokalen Tools, konfigurieren Sie MCP, und installieren Sie den Berechtigungshandler:

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

Fügen Sie die von den neuen Hilfsfunktionen verwendeten Importe hinzu, darunter
`github_copilot_sdk::handler::{PermissionHandler, PermissionResult}`, `McpServerConfig`,
`McpStdioServerConfig`, `PermissionRequestData`, `PermissionRequestKind`, `RequestId`, `SessionId`,
`indexmap::IndexMap` und `url::Url`.

## Ausführen

```bash
cargo run -- "{{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet.

Achten Sie auf einen Seitentitel wie:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Verwenden Sie oben die exakte Ziel-URL. Der Handler verweigert andere URLs und Tools absichtlich. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| Trait oder Typ nicht aufgelöst | Behalten Sie die oben gezeigten Importe für Berechtigung, MCP, `IndexMap` und `Url` bei. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

Sitzungsverdrahtung aus `src/main.rs`:

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
## Bereichsgebundenen Playwright-Zugriff in Java verdrahten

### 1. Ein kontrolliertes Ziel akzeptieren

Validieren Sie zu Beginn von `main` in `src/main/java/workshop/AccessibilityReport.java` die
Start-URL:

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

Fügen Sie die Parser-Hilfsfunktion hinzu:

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

### 2. Den Berechtigungshandler hinzufügen

Genehmigen Sie in der Sitzungskonfiguration nur Playwright-Navigation zum exakten Ziel:

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

> **Vorübergehende Java-SDK-Einschränkung und Fallback für lokale Demos:** Standardmäßig gilt hier Fail-closed: Es
> wird nur eine `mcp`-Anforderung genehmigt, deren Nutzlast belegt, dass die konfigurierte Playwright-Navigation die
> exakt eingegebene URL ist. Aktuelle Java-SDK-Versionen stellen diese MCP-Anforderungsfelder nicht bereit
> ([github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)), daher weist der
> Standardpfad diese Anforderung zurück, statt zu raten. Übergeben Sie nur für das kontrollierte Workshop-Ziel
> `--allow-local-demo-mcp`. Dieses ausdrückliche Flag genehmigt jeweils eine `mcp`-Anforderung; es verwendet
> **nicht** `APPROVE_ALL`, und die MCP-Konfiguration stellt weiterhin nur Playwright
> `browser_navigate` bereit. Es kann die exakte URL nicht erzwingen, solange die SDK-Nutzlast nicht verfügbar ist. Aktivieren Sie
> es niemals für ein Produktionsziel, ein gemeinsam genutztes Ziel oder ein nicht vertrauenswürdiges Ziel.

Fügen Sie diesen Optionsparser neben `parseTarget` hinzu:

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

Fügen Sie die Hilfsfunktionen für den URL-Abgleich hinzu:

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

### 3. Die Snapshot-Reader-Grenze hinzufügen

Registrieren Sie einen argumentlosen Snapshot-Reader, der nur Playwright-Dateien des aktuellen Laufs zurückgibt:

```java
var readSnapshot = ToolDefinition.from(
        "read_latest_accessibility_snapshot",
        "Reads the newest Playwright accessibility snapshot created during this run.",
        new SnapshotReader(workingDirectory)::read).skipPermission(true);
```

Fügen Sie die verschachtelte Reader-Klasse hinzu:

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

### 4. Playwright MCP und bereichsgebundene Berechtigungen hinzufügen

Erstellen Sie die vollständige Sitzungskonfiguration, und senden Sie den Prompt für Browsernachweise:

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

Fügen Sie die MCP- und Berechtigungsimporte hinzu:

```java
import com.github.copilot.rpc.McpStdioServerConfig;
import com.github.copilot.rpc.PermissionRequestResult;
```

## Ausführen

```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

Der erste Lauf kann länger dauern, während `npx` Playwright startet. Dieser Befehl aktiviert
ausdrücklich den oben beschriebenen vorübergehenden Fallback für lokale Demos; lassen Sie das Flag
weg, um die strikte Fail-closed-Richtlinie beizubehalten.

Achten Sie auf einen Seitentitel wie:

```text
Page title: Blazor Accessibility Target
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `npx` kann nicht gestartet werden | Führen Sie den MCP-Befehl aus der Vorbereitung erneut aus, und prüfen Sie, ob Node.js in `PATH` enthalten ist. |
| Playwright kann keinen Browser finden | Installieren Sie Edge oder Chrome, oder konfigurieren Sie einen installierten Browser wie von Playwright MCP beschrieben. |
| Eine Berechtigung wird zurückgewiesen | Der Standardhandler weist fehlende oder nicht exakte Anforderungsnutzlasten absichtlich zurück. Verwenden Sie das exakte Ziel, wenn das SDK es bereitstellt; fügen Sie nur für dieses kontrollierte Ziel `--allow-local-demo-mcp` hinzu, bis [#2273](https://github.com/github/copilot-sdk/issues/2273) behoben ist. |
| Kein Snapshot des aktuellen Laufs ist verfügbar | Behalten Sie die Prompt-Reihenfolge bei: Rufen Sie `browser_navigate` vor `read_latest_accessibility_snapshot` auf. |
| MCP- oder Berechtigungstypen nicht aufgelöst | Fügen Sie die Importe `McpStdioServerConfig` und `PermissionRequestResult` hinzu. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 4</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 4.

Sitzungsverdrahtung aus `AccessibilityReport.java`:

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

> **Sie können Tools kombinieren, wenn:** das Terminal benannte Playwright-Toolaktivität zeigt und
> den Titel der Zielseite ausgibt.

## Verständnis prüfen

Warum ist Playwright hier ein MCP-Server und nicht ein weiterer anwendungseigener Callback?

<details>
<summary>Antwort prüfen</summary>

Playwright stellt wiederverwendbare Browserautomatisierung in einem eigenen Prozess mit eigenen
Abhängigkeiten bereit. MCP bindet sie an, ohne Browserlogik in den Domänencode der Anwendung zu
verschieben, und Berechtigungen schützen die Prozessgrenze.

</details>

## Weitere Informationen

- [Model Context Protocol](https://modelcontextprotocol.io/): der offene Standard,
  den der Playwright-Server implementiert, und das Vokabular, aus dem seine Toolnamen stammen.
- [MCP-Debugging](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/mcp-debugging.md):
  Diagnose eines Servers, der nicht startet oder andere Tools bereitstellt als erwartet.
- [Fehlerbehandlung für Hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/error-handling.md):
  entscheiden, was eine Sitzung tut, wenn ein Toolaufruf oder ein Handler fehlschlägt.
- [Plugin-Verzeichnisse](https://github.com/github/copilot-sdk/blob/main/docs/features/plugin-directories.md):
  MCP-Server, Skills und Hooks bündeln, damit eine Sitzung sie als Einheit lädt.

Weiter mit [Schritt 5: Lokale Tools und MCP-Tools kombinieren](05-combine-tools.md).
