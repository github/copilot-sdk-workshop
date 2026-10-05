# Schritt 8: Ein Modell auswählen

> **Dauer:** 10 Minuten  
> **Voraussetzung:** Schließen Sie Schritt 7: Die Anwendung ausführen und erklären ab.

## Was Sie anpassen

Sie listen die für den angemeldeten Benutzer verfügbaren Modelle auf und verwenden das ausgewählte
Modell für die Berichtssitzung.

## Funktionsweise der Modellauswahl

Ein **Modell** ist das spezifische Large Language Model, an das die Runtime jeden Turn sendet. Die
[über GitHub Copilot verfügbaren Modelle](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
ändern sich im Laufe der Zeit und unterscheiden sich je nach Konto. Daher fragt eine Anwendung die
Runtime, welche sie verwenden darf, statt einen Namen fest zu codieren.

:::language dotnet
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `ListModelsAsync` gibt die Modelle
zurück, die für das aktuelle Konto verfügbar sind. `SessionConfig.Model` wählt beim Erstellen einer
Sitzung eines aus.
:::

:::language nodejs
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `client.listModels()` gibt die
Modelle zurück, die für das aktuelle Konto verfügbar sind. Übergeben Sie die gewählte ID als
`model`, wenn Sie `createSession` aufrufen.
:::

:::language python
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `await client.list_models()` gibt die
Modelle zurück, die für das aktuelle Konto verfügbar sind. Übergeben Sie die gewählte ID als
`model`, wenn Sie `create_session` aufrufen.
:::

:::language go
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `client.ListModels(ctx)` gibt die
Modelle zurück, die für das aktuelle Konto verfügbar sind. Legen Sie `SessionConfig.Model` fest,
wenn Sie eine Sitzung erstellen.
:::

:::language rust
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `client.list_models().await?` gibt
die Modelle zurück, die für das aktuelle Konto verfügbar sind (intern verwendet sie
`models().list()`). Legen Sie `SessionConfig.model` fest, wenn Sie eine Sitzung erstellen.
:::

:::language java
Die Copilot-Runtime kann mehr als ein Modell verfügbar machen. `client.listModels()` gibt die
Modelle zurück, die für das aktuelle Konto verfügbar sind. Rufen Sie
`SessionConfig.setModel(selectedId)` auf, wenn Sie eine Sitzung erstellen.
:::

## Modelle austauschen, ohne die Architektur zu ändern

Das Ändern des Modells kann sich auf Latenz, Fähigkeiten und Abrechnung auswirken. Es ändert nicht
die lokalen Tools, die MCP-Konfiguration oder die Berechtigungsrichtlinie; deshalb kommt dieses
Thema nach der Kernarchitektur.

:::language dotnet
Die Modellauswahl konfiguriert `CopilotSession`. Sie ersetzt weder den Client noch eine der beiden Tool-Grenzen.
:::

:::language nodejs
Die Modellauswahl konfiguriert die von `createSession` erstellte Sitzung. Sie ersetzt weder den
Client noch eine der beiden Tool-Grenzen.
:::

:::language python
Die Modellauswahl konfiguriert die von `create_session` erstellte Sitzung. Sie ersetzt weder den
Client noch eine der beiden Tool-Grenzen.
:::

:::language go
Die Modellauswahl konfiguriert `SessionConfig`. Sie ersetzt weder den Client noch eine der beiden Tool-Grenzen.
:::

:::language rust
Die Modellauswahl konfiguriert `SessionConfig`. Sie ersetzt weder den Client noch eine der beiden Tool-Grenzen.
:::

:::language java
Die Modellauswahl konfiguriert `SessionConfig`. Sie ersetzt weder den Client noch eine der beiden Tool-Grenzen.
:::

:::language dotnet
## Eine Modellauswahl hinzufügen

Erstellen Sie `Helpers/ModelSelector.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ModelSelector
{
    public static async Task<string?> SelectAsync(CopilotClient client)
    {
        var models = (await client.ListModelsAsync())?.ToList();
        if (models is null || models.Count is 0)
        {
            Console.WriteLine("No model list was returned; using the account default.");
            return null;
        }

        Console.WriteLine("Available models:");
        for (var index = 0; index < models.Count; index++)
        {
            Console.WriteLine($"{index + 1}. {models[index].Name}");
        }

        Console.Write($"Choose 1-{models.Count} [1]: ");
        var valid = int.TryParse(Console.ReadLine(), out var choice) &&
                    choice >= 1 &&
                    choice <= models.Count;
        var selected = models[(valid ? choice : 1) - 1];

        Console.WriteLine($"Using {selected.Name}\n");
        return selected.Id;
    }
}
```
:::
:::language dotnet
Fügen Sie nach `PingAsync` in `Program.cs` Folgendes ein:

```csharp
var selectedModel = await ModelSelector.SelectAsync(client);
```
:::
:::language dotnet
Fügen Sie dann `Model = selectedModel` zu `SessionConfig` hinzu:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = selectedModel,
    Streaming = true,
    // Keep the existing permission, local-tool, and MCP configuration.
});
```
:::
Entfernen Sie nicht den Rest der Sitzungskonfiguration aus Schritt 6.

:::language nodejs
## Eine Modellauswahl hinzufügen

Erstellen Sie `src/model-selector.ts`:

```typescript
import type { CopilotClient } from "@github/copilot-sdk";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function selectModel(client: CopilotClient): Promise<string | undefined> {
  const models = await client.listModels();
  const [defaultModel] = models;
  if (!defaultModel) {
    console.log("No model list was returned; using the account default.");
    return undefined;
  }

  console.log("Available models:");
  models.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name}`);
  });

  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`Choose 1-${models.length} [1]: `)).trim();
    const choice = Number.parseInt(answer, 10);
    const selected =
      Number.isInteger(choice) && choice >= 1 && choice <= models.length
        ? models[choice - 1] ?? defaultModel
        : defaultModel;
    console.log(`Using ${selected.name}\n`);
    return selected.id;
  } finally {
    rl.close();
  }
}
```

Importieren Sie in `src/report.ts` die Hilfsfunktion und rufen Sie sie nach `client.start()` auf:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { selectModel } from "./model-selector.js";
import {
  accessibilityRuleLookup,
  createSnapshotReader,
  permissionForTarget,
  reportPrompt,
  streamResponse,
} from "./workshop.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm start -- <http-or-https-url>");
const target = new URL(input.includes("://") ? input : `https://${input}`);
if (!["http:", "https:"].includes(target.protocol)) {
  throw new Error("Enter an absolute HTTP or HTTPS URL.");
}

const client = new CopilotClient();
await client.start();
try {
  const selectedModel = await selectModel(client);
  const session = await client.createSession({
    model: selectedModel,
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
    await streamResponse(session, reportPrompt(target));
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

Behalten Sie jede vorhandene Tool-, MCP- und Berechtigungseinstellung aus Schritt 6 bei. Fügen Sie nur `model: selectedModel` hinzu.
:::

:::language python
## Eine Modellauswahl hinzufügen

Erstellen Sie `model_selector.py`:

```python
from __future__ import annotations

from copilot import CopilotClient


async def select_model(client: CopilotClient) -> str | None:
    models = await client.list_models()
    if not models:
        print("No model list was returned; using the account default.")
        return None

    print("Available models:")
    for index, model in enumerate(models, start=1):
        print(f"{index}. {model.name}")

    answer = input(f"Choose 1-{len(models)} [1]: ").strip()
    try:
        choice = int(answer)
    except ValueError:
        choice = 1
    if choice < 1 or choice > len(models):
        choice = 1

    selected = models[choice - 1]
    print(f"Using {selected.name}\n")
    return selected.id
```

Importieren Sie in `report.py` die Hilfsfunktion und übergeben Sie `model=` an `create_session`,
ohne die Tool-Konfiguration aus Schritt 6 zu entfernen:

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
    ToolExecutionCompleteData,
    ToolExecutionStartData,
)

from model_selector import select_model
from workshop import (
    accessibility_rule_lookup,
    create_snapshot_reader,
    permission_for_target,
    report_prompt,
)


async def main() -> None:
    target = sys.argv[1] if len(sys.argv) == 2 else input("Enter URL to analyze: ").strip()
    target = target if "://" in target else f"https://{target}"
    if urlsplit(target).scheme not in {"http", "https"}:
        raise ValueError("Enter an absolute HTTP or HTTPS URL.")

    async with CopilotClient() as client:
        selected_model = await select_model(client)
        async with await client.create_session(
            model=selected_model,
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
                    case ToolExecutionStartData(tool_name=name):
                        print(f"\n[tool:start] {name}")
                    case ToolExecutionCompleteData(success=success):
                        print(f"[tool:done] success={success}")
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(report_prompt(target))
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Starten Sie weiterhin über `python main.py`, damit der vorhandene Einstiegspunkt weiterhin `report.main` importiert.
:::

:::language go
## Eine Modellauswahl hinzufügen

Fügen Sie diese Hilfsfunktion oben in `main.go` (oder in einer gleichgeordneten Datei im selben Paket) hinzu:

```go
func selectModel(ctx context.Context, client *copilot.Client) (string, error) {
	models, err := client.ListModels(ctx)
	if err != nil {
		return "", err
	}
	if len(models) == 0 {
		fmt.Println("No model list was returned; using the account default.")
		return "", nil
	}

	fmt.Println("Available models:")
	for index, model := range models {
		fmt.Printf("%d. %s\n", index+1, model.Name)
	}

	fmt.Printf("Choose 1-%d [1]: ", len(models))
	var answer string
	fmt.Scanln(&answer)
	choice := 1
	if parsed, parseErr := strconv.Atoi(strings.TrimSpace(answer)); parseErr == nil {
		choice = parsed
	}
	if choice < 1 || choice > len(models) {
		choice = 1
	}

	selected := models[choice-1]
	fmt.Printf("Using %s\n\n", selected.Name)
	return selected.ID, nil
}
```

Fügen Sie dem Importblock `"strconv"` hinzu, falls es noch nicht vorhanden ist. Wählen Sie nach
`client.Start` ein Modell aus und legen Sie `SessionConfig.Model` fest:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()

selectedModel, err := selectModel(context.Background(), client)
if err != nil {
	panic(err)
}

session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
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
```

Behalten Sie jede vorhandene Tool-, MCP- und Berechtigungseinstellung aus Schritt 6 bei. Fügen Sie nur `Model: selectedModel` hinzu.
:::

:::language rust
## Eine Modellauswahl hinzufügen

Fügen Sie diese Hilfsfunktion in `src/main.rs` hinzu:

```rust
async fn select_model(client: &Client) -> Result<Option<String>, Box<dyn std::error::Error>> {
    // list_models caches the catalog; it calls models().list() on first use.
    let models = client.list_models().await?;
    if models.is_empty() {
        println!("No model list was returned; using the account default.");
        return Ok(None);
    }

    println!("Available models:");
    for (index, model) in models.iter().enumerate() {
        println!("{}. {}", index + 1, model.name);
    }

    print!("Choose 1-{} [1]: ", models.len());
    io::stdout().flush()?;
    let mut answer = String::new();
    io::stdin().read_line(&mut answer)?;
    let choice = answer.trim().parse::<usize>().unwrap_or(1);
    let index = if (1..=models.len()).contains(&choice) {
        choice - 1
    } else {
        0
    };
    let selected = &models[index];
    println!("Using {}\n", selected.name);
    Ok(Some(selected.id.clone()))
}
```

Wählen Sie nach `Client::start` ein Modell aus und legen Sie vor `create_session` `config.model` fest:

```rust
let client = Client::start(ClientOptions::default()).await?;
let selected_model = select_model(&client).await?;

let mut config = SessionConfig::default();
config.model = selected_model;
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

let session = client.create_session(config).await?;
```

Behalten Sie jede vorhandene Tool-, MCP- und Berechtigungseinstellung aus Schritt 6 bei. Fügen Sie nur `config.model` hinzu.
:::

:::language java
## Eine Modellauswahl hinzufügen

Erstellen Sie `src/main/java/workshop/ModelSelector.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.ModelInfo;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class ModelSelector {
    private ModelSelector() {
    }

    public static String select(CopilotClient client) throws Exception {
        List<ModelInfo> models = client.listModels().get();
        if (models == null || models.isEmpty()) {
            System.out.println("No model list was returned; using the account default.");
            return null;
        }

        System.out.println("Available models:");
        for (int index = 0; index < models.size(); index++) {
            System.out.println((index + 1) + ". " + models.get(index).getName());
        }

        System.out.print("Choose 1-" + models.size() + " [1]: ");
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String answer = reader.readLine();
        int choice = 1;
        try {
            if (answer != null && !answer.isBlank()) {
                choice = Integer.parseInt(answer.trim());
            }
        } catch (NumberFormatException ignored) {
            choice = 1;
        }
        if (choice < 1 || choice > models.size()) {
            choice = 1;
        }

        ModelInfo selected = models.get(choice - 1);
        System.out.println("Using " + selected.getName() + System.lineSeparator());
        return selected.getId();
    }
}
```

Wählen Sie in `src/main/java/workshop/AccessibilityReport.java` nach `client.start().get()` ein
Modell aus und rufen Sie `SessionConfig.setModel(selectedId)` auf:

```java
try (var client = new CopilotClient()) {
    client.start().get();
    String selectedModel = ModelSelector.select(client);

    var config = new SessionConfig()
            .setModel(selectedModel)
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

    var session = client.createSession(config).get();
    var response = session.sendAndWait(new MessageOptions().setPrompt(reportPrompt(target))).get();
    if (response == null) {
        throw new IllegalStateException("Copilot completed without an assistant message.");
    }
    System.out.println(response.getData().content());
}
```

Behalten Sie jede vorhandene Tool-, MCP- und Berechtigungseinstellung aus Schritt 6 bei. Fügen Sie
nur `SessionConfig.setModel(selectedModel)` hinzu. Bewahren Sie insbesondere die standardmäßige
Ablehnung ohne exakte Zielübereinstimmung und die explizit aktivierte Problemumgehung
`--allow-local-demo-mcp` für
[github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273) auf; dieser Fallback
genehmigt nur die Art `mcp` und kann die Ziel-URL nicht verifizieren.
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
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```
:::
Geben Sie die Workshop-Ziel-URL ein, wählen Sie dann ein Modell aus und bestätigen Sie, dass dieselben bereichsgebundenen Tools weiterhin ausgeführt werden.

<details>
<summary>Fehlerbehebung für diesen Schritt</summary>

| Symptom | Behebung |
|---|---|
| Es werden keine Modelle aufgelistet | Die Hilfsfunktion fällt auf den Kontostandard zurück; prüfen Sie die Authentifizierung, wenn das unerwartet ist. |
| Eine Zahl liegt außerhalb des Bereichs | Der Helper verwendet sicher das erste Modell. |
| Tools verschwinden | Fügen Sie nur die Modellauswahl hinzu; behalten Sie die vorhandene Tool-, MCP- und Berechtigungskonfiguration bei. |
| Authentifizierungsfehler beim Auflisten der Modelle | Führen Sie `copilot login` erneut aus, und führen Sie dann die Anwendung erneut aus. |

</details>

> **Dieser Schritt ist abgeschlossen, wenn:** das ausgewählte Modell benannt ist und der Bericht weiterhin beide
> bereichsgebundenen Tool-Typen verwendet.

## Verständnis prüfen

Warum wurde die Modellauswahl aus Schritt 1 heraus verschoben?

<details>
<summary>Antwort prüfen</summary>

Die Modellauswahl ist eine Konfiguration und kein zentrales Agent-Konzept. Wird sie bis zum Ende
zurückgestellt, gelangen Sie früher zu einer nützlichen Copilot-Antwort und die erste Lektion bleibt
auf Clients und Sitzungen fokussiert.

</details>

## Weitere Informationen

- [Eigenen Schlüssel verwenden](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md):
  eine Sitzung auf Ihre eigenen OpenAI-, Azure- oder Anthropic-Anmeldedaten und -Modelle ausrichten.
- [SDK- und CLI-Kompatibilität](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  welche Optionen jedes SDK bereitstellt, einschließlich Modellauflistung und Systemnachrichten.
- [Verwaltete Azure-Identität](https://github.com/github/copilot-sdk/blob/main/docs/setup/azure-managed-identity.md):
  Microsoft Foundry-Modelle erreichen, ohne einen Schlüssel in der Anwendung zu speichern.

Fahren Sie mit [Schritt 9: Einen interaktiven HTML-Bericht generieren](09-interactive-html-report.md) fort.
