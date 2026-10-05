# Schritt 3: Anwendungseigenes Wissen hinzufügen

> **Dauer:** 15 Minuten

## Was Sie hinzufügen

Sie geben Copilot ein typisiertes lokales Tool, das ein genaues Kriterium und eine Abhilfemaßnahme
aus dem anwendungseigenen Katalog der Web Content Accessibility Guidelines (WCAG) abruft.

## Ein Tool Ihrer App für Copilot bereitstellen

**Toolaufrufe** ermöglichen es dem Modell, während der Arbeit an einer Antwort eine Fähigkeit
anzufordern. Ein [**lokales Tool**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
wird innerhalb des Prozesses Ihrer Anwendung ausgeführt. Das Modell entscheidet, wann es dieses Tool
anfordert, aber Ihr Code bleibt für die Daten, die Validierung, die Ausführung und das Ergebnis
zuständig.

In diesem Schritt stellen Sie anwendungseigene WCAG-Anleitungen als `accessibility_rule_lookup`
bereit, registrieren dieses Tool bei der Sitzung und machen es dem Modell ausdrücklich verfügbar.

## Eigene maßgebliche Quelle einbringen

Das Allgemeinwissen des Modells ist kein Ersatz für Daten, die Ihre Anwendung besitzt. Dieses lokale
Tool gibt ein kleines, exaktes Ergebnis aus deterministischem Code zurück, den Sie testen können,
statt den vollständigen Katalog in jeden Prompt einzufügen.

`skip permission` ist hier absichtlich gesetzt, weil das Tool nur anwendungseigene Daten liest. Der
externe MCP-Prozess im nächsten Schritt verwendet stattdessen eine Berechtigungsgrenze.

:::language dotnet
## Die C#-Nachschlagefunktion einbinden

### 1. Das Katalogsuch-Tool hinzufügen

Fügen Sie am Anfang von `Helpers/AccessibilityRuleCatalog.cs` Folgendes ein:

```csharp
using System.ComponentModel;
using GitHub.Copilot;
using Microsoft.Extensions.AI;
```

Fügen Sie innerhalb von `AccessibilityRuleCatalog` nach dem vorhandenen `Rules`-Array Folgendes ein:

```csharp
public static AIFunction CreateLookupTool() => CopilotTool.DefineTool(
    ([Description("The accessibility issue or WCAG criterion to look up.")] string query) =>
        Task.FromResult(Lookup(query)),
    toolOptions: new CopilotToolOptions { SkipPermission = true },
    factoryOptions: new AIFunctionFactoryOptions
    {
        Name = "accessibility_rule_lookup",
        Description = "Looks up read-only WCAG guidance maintained by this application."
    });

public static AccessibilityRule Lookup(string query)
{
    var normalizedQuery = query.Trim();
    return Rules.FirstOrDefault(rule =>
               normalizedQuery.Contains(rule.Criterion, StringComparison.OrdinalIgnoreCase) ||
               normalizedQuery.Contains(rule.Title, StringComparison.OrdinalIgnoreCase) ||
               rule.Keywords.Any(keyword =>
                   normalizedQuery.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
           ?? new AccessibilityRule(
               "No exact match",
               "Criterion not found",
               "The issue is not represented in the workshop catalog.",
               "Verify the evidence and consult the complete WCAG reference.",
               []);
}
```

### 2. Tool-Aktivität anzeigen

Fügen Sie in `Helpers/ResponseStreamer.cs` diese Fälle vor `SessionIdleEvent` ein:

```csharp
case ToolExecutionStartEvent tool:
    Console.WriteLine($"\n[tool:start] {tool.Data.ToolName}");
    break;
case ToolExecutionCompleteEvent tool:
    Console.WriteLine($"[tool:done] success={tool.Data.Success}");
    break;
```

### 3. Das Tool registrieren und anfordern

Ersetzen Sie die Sitzungskonfiguration und den Sendeaufruf in `Program.cs`:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    Tools = [AccessibilityRuleCatalog.CreateLookupTool()],
    AvailableTools = ["accessibility_rule_lookup"]
});

Console.WriteLine("\nCopilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Use accessibility_rule_lookup to explain how to fix an input with no accessible name.");
```

## Ausführen

```bash
dotnet run
```

Achten Sie auf den Toolnamen und seine Zuordnung zu 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=True

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Es wird kein Tool-Ereignis angezeigt | Behalten Sie die ausdrückliche Anweisung `Use accessibility_rule_lookup` in diesem Lernschritt bei. |
| Der Compiler kann `AIFunction` nicht finden | Fügen Sie der Katalogdatei `using Microsoft.Extensions.AI;` hinzu. |
| Das Ergebnis meldet keine exakte Übereinstimmung | Stellen Sie sicher, dass der Prompt `accessible name` enthält, ein Schlüsselwort in den Starterdaten. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`Program.cs`:

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Application-owned WCAG guidance ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true,
    Tools = [AccessibilityRuleCatalog.CreateLookupTool()],
    AvailableTools = ["accessibility_rule_lookup"]
});

Console.WriteLine("Copilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Use accessibility_rule_lookup to explain how to fix an input with no accessible name.");
```

Das Katalog-Tool und die Nachschlagefunktion befinden sich in `Helpers/AccessibilityRuleCatalog.cs`.
Die Ausgabe von Tool-Start und Tool-Abschluss befindet sich in `Helpers/ResponseStreamer.cs`.

</details>
:::

:::language nodejs
## Die TypeScript-Nachschlagefunktion einbinden

### 1. Das vorgefertigte typisierte Tool prüfen

Öffnen Sie `src/workshop.ts`. Das Starterprojekt importiert bereits den Katalog und definiert dieses lokale Tool:

```typescript
export const accessibilityRuleLookup = defineTool("accessibility_rule_lookup", {
  description: "Looks up read-only WCAG guidance maintained by this application.",
  parameters: z.object({ query: z.string().describe("The accessibility issue or WCAG criterion to look up.") }),
  skipPermission: true,
  handler: async ({ query }) => {
    const normalized = query.trim().toLowerCase();
    return accessibilityRules.find((rule) => normalized.includes(rule.criterion.toLowerCase()) || normalized.includes(rule.title.toLowerCase()) || rule.keywords.some((keyword) => normalized.includes(keyword))) ?? noMatch;
  },
});
```

Das Zod-Schema gibt dem Modell ein typisiertes `query`-Argument. Der Handler durchsucht
`accessibilityRules`, das anwendungseigen bleibt. `skipPermission: true` ist absichtlich gesetzt,
weil dieses Tool nur anwendungseigene schreibgeschützte Daten zurückgibt.

### 2. Die Ausgabe der Tool-Aktivität bestätigen

In derselben Datei gibt `streamResponse` bereits Ereignisse des Tool-Lebenszyklus aus:

```typescript
else if (event.type === "tool.execution_start") console.log(`\n[tool:start] ${event.data.toolName}`);
else if (event.type === "tool.execution_complete") console.log(`[tool:done] success=${event.data.success}`);
```

Behalten Sie diese Zweige bei, damit Sie sehen können, wann das Modell das lokale Tool aufruft.

### 3. Das Tool registrieren und anfordern

Importieren Sie in `src/index.ts` das Tool zusammen mit der Streaming-Hilfsfunktion:

```typescript
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";
```

Ersetzen Sie die Sitzungserstellung und den Sendeaufruf:

```typescript
const session = await client.createSession({
  streaming: true,
  tools: [accessibilityRuleLookup],
  availableTools: ["accessibility_rule_lookup"],
});
try {
  await streamResponse(
    session,
    "Use accessibility_rule_lookup to explain WCAG 4.1.2.",
  );
} finally {
  await session.disconnect();
}
```

`tools` registriert die Implementierung. `availableTools` ist die Zulassungsliste, die das Modell aufrufen darf.

## Ausführen

```bash
npm start
```

Achten Sie auf den Toolnamen und die Anleitung für WCAG 4.1.2:

```text
[tool:start] accessibility_rule_lookup
[tool:done] success=true

WCAG 4.1.2 Name, Role, Value ...
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| TypeScript kann `zod` nicht auflösen | Führen Sie im Starterverzeichnis `npm install` aus. |
| Es wird kein Tool-Ereignis angezeigt | Behalten Sie den Toolnamen sowohl in `tools` als auch in `availableTools` bei, und behalten Sie die ausdrückliche Anweisung im Prompt bei. |
| Die Suche gibt keinen Treffer zurück | Fragen Sie nach `4.1.2` oder `accessible name`, die beide im Katalog enthalten sind. |
| Tool-Ereignisse werden nie ausgegeben | Stellen Sie sicher, dass `streamResponse` weiterhin `tool.execution_start` und `tool.execution_complete` verarbeitet. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { accessibilityRuleLookup, streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({
    streaming: true,
    tools: [accessibilityRuleLookup],
    availableTools: ["accessibility_rule_lookup"],
  });
  try {
    await streamResponse(session, "Use accessibility_rule_lookup to explain WCAG 4.1.2.");
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

Die Definition des typisierten Tools und die Ausgabe der Tool-Aktivität befinden sich in `src/workshop.ts`.

</details>
:::

:::language python
## Die Python-Nachschlagefunktion einbinden

### 1. Das vorgefertigte typisierte Tool prüfen

Öffnen Sie `workshop.py`. Das Starterprojekt definiert bereits das Parametermodell und das lokale Tool:

```python
class LookupParams(BaseModel):
    query: str = Field(description="The accessibility issue or WCAG criterion to look up.")


@define_tool(name="accessibility_rule_lookup", description="Looks up read-only WCAG guidance maintained by this application.", skip_permission=True)
def accessibility_rule_lookup(params: LookupParams) -> dict[str, object]:
    query = params.query.strip().lower()
    rule = next((item for item in ACCESSIBILITY_RULES if item.criterion.lower() in query or item.title.lower() in query or any(keyword in query for keyword in item.keywords)), None)
    if rule is None:
        return {"criterion": "No exact match", "title": "Criterion not found", "when_it_applies": "The issue is not represented in the workshop catalog.", "recommendation": "Verify the evidence and consult the complete WCAG reference."}
    return rule.__dict__
```

Pydantic beschreibt das für das Modell sichtbare Argument, während der Handler `ACCESSIBILITY_RULES`
durchsucht, das anwendungseigen bleibt. `skip_permission=True` ist absichtlich gesetzt, weil dieses
Tool nur anwendungseigene schreibgeschützte Daten zurückgibt.

### 2. Das Tool registrieren und anfordern

Importieren Sie in `main.py` das Tool:

```python
from workshop import accessibility_rule_lookup
```

Ersetzen Sie die Sitzungserstellung und den Sendeaufruf. Behalten Sie den Ereignishandler aus Schritt 2 innerhalb des Sitzungsblocks bei:

```python
async with await client.create_session(
    streaming=True,
    tools=[accessibility_rule_lookup],
    available_tools=["accessibility_rule_lookup"],
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
        "Use accessibility_rule_lookup to explain WCAG 4.1.2."
    )
    await done.wait()
    if error is not None:
        raise error
```

`tools` registriert die Implementierung. `available_tools` ist die Zulassungsliste, die das Modell aufrufen darf.

## Ausführen

```bash
python main.py
```

Die Antwort sollte den Titel und die Empfehlung aus dem Katalog für WCAG 4.1.2 verwenden:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate a visible <label> with the input ...
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Python kann `pydantic` nicht importieren | Aktivieren Sie die virtuelle Umgebung aus der Vorbereitung und installieren Sie `requirements.txt` erneut. |
| Das Tool wird nicht aufgerufen | Behalten Sie es sowohl in `tools` als auch in `available_tools` bei, und behalten Sie die ausdrückliche Anweisung im Prompt bei. |
| Die Suche gibt keinen Treffer zurück | Fragen Sie nach `4.1.2` oder `accessible name`, die beide im Katalog enthalten sind. |
| Importfehler für `accessibility_rule_lookup` | Stellen Sie sicher, dass `from workshop import accessibility_rule_lookup` in `main.py` vorhanden ist. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`main.py`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData

from workshop import accessibility_rule_lookup


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(
            streaming=True,
            tools=[accessibility_rule_lookup],
            available_tools=["accessibility_rule_lookup"],
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
            await session.send("Use accessibility_rule_lookup to explain WCAG 4.1.2.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Die Definition des typisierten Tools befindet sich in `workshop.py`.

</details>
:::

:::language go
## Die Go-Nachschlagefunktion einbinden

### 1. Die typisierte Nachschlagefunktion hinzufügen

Fügen Sie `strings` den Importen in `main.go` hinzu, und fügen Sie dann diese Deklarationen vor `streamResponse` hinzu:

```go
type lookupParams struct {
	Query string `json:"query" jsonschema:"The accessibility issue or WCAG criterion to look up."`
}

func accessibilityRuleLookup(params lookupParams, _ copilot.ToolInvocation) (any, error) {
	query := strings.ToLower(params.Query)
	if strings.Contains(query, "4.1.2") || strings.Contains(query, "accessible name") {
		return map[string]string{
			"criterion":      "4.1.2",
			"title":          "Name, Role, Value",
			"recommendation": "Associate each input with a visible label.",
		}, nil
	}
	return map[string]string{
		"criterion":      "No exact match",
		"recommendation": "Verify the evidence and consult the WCAG reference.",
	}, nil
}
```

### 2. Das Tool definieren und registrieren

Erstellen Sie das Tool am Anfang von `main`:

```go
lookup := copilot.DefineTool(
	"accessibility_rule_lookup",
	"Looks up read-only WCAG guidance maintained by this application.",
	accessibilityRuleLookup,
)
lookup.SkipPermission = true
```

Ersetzen Sie die Sitzungskonfiguration und den finalen Sendeaufruf:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Streaming:      copilot.Bool(true),
	Tools:          []copilot.Tool{lookup},
	AvailableTools: []string{"accessibility_rule_lookup"},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()

if err := streamResponse(
	session,
	"Use accessibility_rule_lookup to explain WCAG 4.1.2.",
); err != nil {
	panic(err)
}
```

`Tools` registriert die Implementierung. `AvailableTools` ist die Zulassungsliste, die das Modell
aufrufen darf. `SkipPermission = true` ist absichtlich gesetzt, weil dieses Tool nur
anwendungseigene schreibgeschützte Daten zurückgibt.

## Ausführen

```bash
go run .
```

Die gestreamte Antwort sollte das Suchergebnis für WCAG 4.1.2 verwenden:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `strings` ist nicht definiert | Fügen Sie den Standardbibliotheksimport `strings` hinzu. |
| Das Modell kann das Tool nicht sehen | Behalten Sie das Tool in `Tools` und seinen exakten Namen in `AvailableTools` bei. |
| Die Suche gibt keinen Treffer zurück | Fragen Sie nach `4.1.2` oder `accessible name`. |
| Der Build schlägt bei `DefineTool` fehl | Stellen Sie sicher, dass die Handler-Signatur `(lookupParams, copilot.ToolInvocation) (any, error)` lautet. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`main.go`:

```go
package main

import (
	"context"
	"fmt"
	"strings"

	copilot "github.com/github/copilot-sdk/go"
)

type lookupParams struct {
	Query string `json:"query" jsonschema:"The accessibility issue or WCAG criterion to look up."`
}

func accessibilityRuleLookup(params lookupParams, _ copilot.ToolInvocation) (any, error) {
	query := strings.ToLower(params.Query)
	if strings.Contains(query, "4.1.2") || strings.Contains(query, "accessible name") {
		return map[string]string{
			"criterion":      "4.1.2",
			"title":          "Name, Role, Value",
			"recommendation": "Associate each input with a visible label.",
		}, nil
	}
	return map[string]string{
		"criterion":      "No exact match",
		"recommendation": "Verify the evidence and consult the WCAG reference.",
	}, nil
}

func streamResponse(session *copilot.Session, prompt string) error {
	receivedDelta := false
	unsubscribe := session.On(func(event copilot.SessionEvent) {
		if delta, ok := event.Data.(*copilot.AssistantMessageDeltaData); ok {
			receivedDelta = true
			fmt.Print(delta.DeltaContent)
		}
	})
	defer unsubscribe()
	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{Prompt: prompt})
	if err == nil && !receivedDelta && response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Print(message.Content)
		}
	}
	fmt.Println()
	return err
}

func main() {
	lookup := copilot.DefineTool(
		"accessibility_rule_lookup",
		"Looks up read-only WCAG guidance maintained by this application.",
		accessibilityRuleLookup,
	)
	lookup.SkipPermission = true

	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming:      copilot.Bool(true),
		Tools:          []copilot.Tool{lookup},
		AvailableTools: []string{"accessibility_rule_lookup"},
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Use accessibility_rule_lookup to explain WCAG 4.1.2."); err != nil {
		panic(err)
	}
}
```

</details>
:::

:::language rust
## Die Rust-Nachschlagefunktion einbinden

### 1. Den typisierten Handler hinzufügen

Fügen Sie diese Importe nahe am Anfang von `src/main.rs` hinzu:

```rust
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;
```

Ersetzen Sie die enger gefassten SDK-Importe aus Schritt 2, und fügen Sie dann den typisierten Handler vor `stream_response` hinzu:

```rust
#[derive(Deserialize, JsonSchema)]
struct LookupParams {
    /// The accessibility issue or WCAG criterion to look up.
    query: String,
}

struct AccessibilityRuleLookup;

#[async_trait]
impl ToolHandler for AccessibilityRuleLookup {
    async fn call(&self, invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let params: LookupParams = serde_json::from_value(invocation.arguments)?;
        let result = if params.query.to_lowercase().contains("4.1.2") {
            r#"{"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}"#
        } else {
            r#"{"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}"#
        };
        Ok(ToolResult::Text(result.to_owned()))
    }
}
```

### 2. Das Tool definieren und registrieren

Erstellen Sie am Anfang von `main` das Tool und fügen Sie es der Sitzungskonfiguration hinzu:

```rust
let lookup = Tool::new("accessibility_rule_lookup")
    .with_description("Looks up read-only WCAG guidance maintained by this application.")
    .with_parameters(schema_for::<LookupParams>())
    .with_skip_permission(true)
    .with_handler(Arc::new(AccessibilityRuleLookup));

let client = Client::start(ClientOptions::default()).await?;
let mut config = SessionConfig::default();
config.streaming = Some(true);
config.tools = Some(vec![lookup]);
config.available_tools = Some(vec!["accessibility_rule_lookup".to_owned()]);
let session = client.create_session(config).await?;

stream_response!(
    session,
    "Use accessibility_rule_lookup to explain WCAG 4.1.2.".to_owned()
);
```

Behalten Sie den Disconnect aus Schritt 2 und das Herunterfahren des Clients nach dem Makroaufruf
bei. `config.tools` registriert die Implementierung. `config.available_tools` ist die
Zulassungsliste, die das Modell aufrufen darf. `with_skip_permission(true)` ist absichtlich gesetzt,
weil dieses Tool nur anwendungseigene schreibgeschützte Daten zurückgibt.

## Ausführen

```bash
cargo run
```

Die gestreamte Antwort sollte das Suchergebnis für WCAG 4.1.2 verwenden:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Ein Trait oder Derive ist nicht aufgelöst | Behalten Sie die oben gezeigten Importe für `async_trait`, `serde`, das Schema und das Tool bei. |
| Das Modell kann das Tool nicht sehen | Legen Sie sowohl `config.tools` als auch `config.available_tools` fest. |
| Die Suche gibt keinen Treffer zurück | Fragen Sie ausdrücklich nach `4.1.2`. |
| Typfehler im Handler | Stellen Sie sicher, dass `ToolHandler::call` `Result<ToolResult, Error>` zurückgibt. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`src/main.rs`:

```rust
use std::io::{self, Write};
use std::sync::Arc;

use async_trait::async_trait;
use github_copilot_sdk::tool::{JsonSchema, ToolHandler, schema_for};
use github_copilot_sdk::types::{SessionConfig, Tool, ToolInvocation};
use github_copilot_sdk::{Client, ClientOptions, Error, ToolResult};
use serde::Deserialize;

#[derive(Deserialize, JsonSchema)]
struct LookupParams {
    /// The accessibility issue or WCAG criterion to look up.
    query: String,
}

struct AccessibilityRuleLookup;

#[async_trait]
impl ToolHandler for AccessibilityRuleLookup {
    async fn call(&self, invocation: ToolInvocation) -> Result<ToolResult, Error> {
        let params: LookupParams = serde_json::from_value(invocation.arguments)?;
        let result = if params.query.to_lowercase().contains("4.1.2") {
            r#"{"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}"#
        } else {
            r#"{"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}"#
        };
        Ok(ToolResult::Text(result.to_owned()))
    }
}

macro_rules! stream_response {
    ($session:expr, $prompt:expr) => {{
        let mut events = $session.subscribe();
        let send = $session.send($prompt);
        tokio::pin!(send);
        let mut sent = false;
        let mut idle = false;
        let mut received_delta = false;

        while !sent || !idle {
            tokio::select! {
                result = &mut send, if !sent => {
                    result?;
                    sent = true;
                }
                event = events.recv() => {
                    let event = event?;
                    match event.event_type.as_str() {
                        "assistant.message_delta" => {
                            if let Some(delta) = event.data.get("deltaContent").and_then(|value| value.as_str()) {
                                received_delta = true;
                                print!("{delta}");
                                io::stdout().flush()?;
                            }
                        }
                        "assistant.message" if !received_delta => {
                            if let Some(content) = event.data.get("content").and_then(|value| value.as_str()) {
                                print!("{content}");
                                io::stdout().flush()?;
                            }
                        }
                        "session.error" => {
                            let message = event.data.get("message").and_then(|value| value.as_str())
                                .unwrap_or("Copilot session failed");
                            return Err(std::io::Error::new(std::io::ErrorKind::Other, message.to_owned()).into());
                        }
                        "session.idle" => idle = true,
                        _ => {}
                    }
                }
            }
        }
        println!();
    }};
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let lookup = Tool::new("accessibility_rule_lookup")
        .with_description("Looks up read-only WCAG guidance maintained by this application.")
        .with_parameters(schema_for::<LookupParams>())
        .with_skip_permission(true)
        .with_handler(Arc::new(AccessibilityRuleLookup));

    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    config.tools = Some(vec![lookup]);
    config.available_tools = Some(vec!["accessibility_rule_lookup".to_owned()]);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Use accessibility_rule_lookup to explain WCAG 4.1.2.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

</details>
:::

:::language java
## Die Java-Nachschlagefunktion einbinden

### 1. Die typisierte Nachschlagefunktion hinzufügen

Fügen Sie diese Importe zu `src/main/java/workshop/AccessibilityReport.java` hinzu:

```java
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;
```

Fügen Sie diese Methode vor der schließenden Klammer der Klasse hinzu:

```java
private static String lookupRule(String query) {
    if (query.toLowerCase(java.util.Locale.ROOT).contains("4.1.2")) {
        return """
                {"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}""";
    }
    return """
            {"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}""";
}
```

### 2. Das Tool definieren und registrieren

Definieren Sie am Anfang von `main` das Tool und die Sitzungskonfiguration:

```java
var lookup = ToolDefinition.from(
        "accessibility_rule_lookup",
        "Looks up read-only WCAG guidance maintained by this application.",
        Param.of(String.class, "query",
                "The accessibility issue or WCAG criterion to look up."),
        AccessibilityReport::lookupRule).skipPermission(true);
var config = new SessionConfig()
        .setStreaming(true)
        .setTools(List.of(lookup))
        .setAvailableTools(List.of("accessibility_rule_lookup"))
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
```

Ersetzen Sie die Sitzungserstellung und den Prompt innerhalb des Clientblocks:

```java
var session = client.createSession(config).get();
var response = session.sendAndWait(new MessageOptions()
        .setPrompt("Use accessibility_rule_lookup to explain WCAG 4.1.2."))
        .get();
if (response == null) {
    throw new IllegalStateException("Copilot completed without an assistant message.");
}
System.out.println(response.getData().content());
```

`setTools` registriert die Implementierung. `setAvailableTools` ist die Zulassungsliste, die das
Modell aufrufen darf. `skipPermission(true)` ist absichtlich gesetzt, weil dieses Tool nur
anwendungseigene schreibgeschützte Daten zurückgibt. Behalten Sie den Berechtigungshandler aus
Schritt 1 bei, bis Schritt 4 ihn durch den bereichsgebundenen Playwright-Handler ersetzt. Die
Java-Implementierung verwendet eine Streaming-fähige Sitzung mit `sendAndWait`, daher gibt sie die
abgeschlossene Antwort aus, wenn der Durchlauf abgeschlossen ist.

## Ausführen

```bash
./mvnw compile exec:java
```

Die Antwort sollte das Suchergebnis für WCAG 4.1.2 verwenden:

```text
WCAG 4.1.2 Name, Role, Value ...
Associate each input with a visible label.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| `ToolDefinition` oder `Param` ist nicht aufgelöst | Fügen Sie die zwei oben gezeigten Copilot-Tool-Importe hinzu. |
| Das Modell kann das Tool nicht sehen | Behalten Sie `setTools` und `setAvailableTools` in derselben Sitzungskonfiguration bei. |
| Die Suche gibt keinen Treffer zurück | Fragen Sie ausdrücklich nach `4.1.2`. |
| Methodenreferenz schlägt fehl | Stellen Sie sicher, dass `lookupRule` `private static` ist und einen einzelnen `String` akzeptiert. |

</details>

<details>
<summary>Vollständige Implementierung von Schritt 3</summary>

Vergleichen Sie Ihre Version mit dieser vollständigen Implementierung von Schritt 3.

`AccessibilityReport.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.ToolDefinition;
import com.github.copilot.tool.Param;

import java.util.List;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        var lookup = ToolDefinition.from(
                "accessibility_rule_lookup",
                "Looks up read-only WCAG guidance maintained by this application.",
                Param.of(String.class, "query", "The accessibility issue or WCAG criterion to look up."),
                AccessibilityReport::lookupRule).skipPermission(true);
        var config = new SessionConfig()
                .setStreaming(true)
                .setTools(List.of(lookup))
                .setAvailableTools(List.of("accessibility_rule_lookup"))
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);

        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(config).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Use accessibility_rule_lookup to explain WCAG 4.1.2."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }

    private static String lookupRule(String query) {
        if (query.toLowerCase(java.util.Locale.ROOT).contains("4.1.2")) {
            return """
                    {"criterion":"4.1.2","title":"Name, Role, Value","recommendation":"Associate each input with a visible label."}""";
        }
        return """
                {"criterion":"No exact match","recommendation":"Verify the evidence and consult the WCAG reference."}""";
    }
}
```

</details>
:::

> **Sie sind bereit für Playwright, wenn:** die Antwort Kriterium 4.1.2 aus dem Anwendungskatalog verwendet.

## Verständnis prüfen

Sollte das Berechnen einer Bestellsumme aus anwendungseigenen Positionen ein lokales Tool oder ein
MCP-Server sein?

<details>
<summary>Antwort prüfen</summary>

In der Regel ein lokales Tool. Die Anwendung besitzt die Positionen und die deterministische
Berechnung, daher lässt sich eine prozessinterne Funktion leichter testen und überschreitet keine
Prozessgrenze.

</details>

## Weitere Informationen

- [Mit Hooks arbeiten](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  Callbacks, die die Runtime rund um jeden Toolaufruf aufruft, für Auditing oder eigene Richtlinien.
- [Hook nach der Toolnutzung](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  Prüfen oder Umschreiben eines Toolergebnisses, bevor das Modell es sieht.
- [Benutzerdefinierte Skills](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  Paketieren wiederverwendbarer Anweisungen, die zusammen mit den Tools geladen werden, die eine Sitzung registriert.

Fahren Sie mit [Schritt 4: Ein externes Tool sicher anbinden](04-mcp-safety.md) fort.
