# Schritt 4: Auf freigegebene Fakten stützen

> **Dauer:** 15 Minuten

## Was Sie erstellen

Bis jetzt hat der Kurator aus dem Modellgedächtnis geschrieben. Für ein Museum ist das inakzeptabel:
Eine Ausstellungsbeschriftung ist eine institutionelle Aussage, und „das Modell wusste es“ ist keine
Quelle.

In diesem Schritt liefert die Lehrkraft die Fakten, und die **Anwendung** übergibt sie dem Kurator
über ein Tool, das ihr gehört. Sie registrieren das vorgefertigte Tool `approved_fact_lookup`,
machen es zum einzigen Tool, das das Modell aufrufen darf, und schreiben einen Prompt, der den
Kurator anweist, es aufzurufen, bevor er ein Wort schreibt. Außerdem rufen Sie die vorgefertigte
Auswahlfunktion auf, mit der die Lehrkraft einen von drei freigegebenen Faktensätzen auswählen oder
eigene Fakten eingeben kann, und legen den Sitzungslebenszyklus in einem kleinen Runner ab, den
spätere Schritte wiederverwenden.

## Warum die Fakten hinter ein Tool gehören, nicht in den Prompt

Sie könnten die Faktenliste in den Prompt-Text einfügen. Viele Anwendungen tun das. Dann sind die
Fakten aber nur weitere Wörter in einer Anfrage, die das Modell frei auslegen kann, und jeder
Durchlauf trägt den gesamten Katalog mit, ob das Modell ihn braucht oder nicht.

Ein [**lokales Tool**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
ist anders. Es läuft in Ihrem Prozess, Ihr Code entscheidet, was es zurückgibt, und das Transkript
zeichnet den Moment auf, in dem das Modell danach gefragt hat. `approved_fact_lookup` ist dieses
Tool. Es nimmt keine Argumente entgegen und gibt die begrenzte Liste freigegebener Fakten zurück,
sodass zwei Durchläufe mit demselben Faktensatz dieselbe Frage stellen und dieselbe Antwort erhalten
– die Fundierung bleibt deterministisch.

Die Hilfsfunktionen enthalten das Tool und die Grenzen bereits. `boundFacts` entfernt bei jedem Fakt
den Leerraum am Anfang und Ende, verwirft leere Einträge und lehnt den Batch ab, wenn er leer ist,
mehr als 20 Fakten enthält oder einen Fakt mit mehr als 500 Zeichen enthält. Die Tool-Factory wendet
diese Grenzen auf alles an, was sie erhält, sodass dem Modell nie eine unbegrenzte Liste übergeben
werden kann. Grenzen sind keine Höflichkeit: Eine unbegrenzte Faktenliste bedeutet unvorhersehbare
Kosten, Latenz und Angriffsfläche.

`skip permission` ist für dieses Tool gesetzt, weil es nur anwendungseigene Daten liest, die die
Lehrkraft gerade auf dem Bildschirm genehmigt hat. Der externe Wikipedia-Prozess in Schritt 6 erhält
stattdessen eine Berechtigungsgrenze.

Das ist das Museumsäquivalent zu `accessibility_rule_lookup` im Barrierefreiheits-Track: ein
anwendungseigenes lokales Tool ohne Argumente, das dem Modell kuratierte Daten übergibt, die es
sonst nicht erreichen kann.

## Zwei Listen, zwei unterschiedliche Aufgaben

Das Registrieren eines Tools erfordert zwei Einstellungen, und sie zu verwechseln ist der häufigste
Fehler in diesem Workshop:

- **`tools`** enthält die *Implementierung*. Hier erfährt die Runtime, dass eine Funktion namens
  `approved_fact_lookup` existiert und wie sie ausgeführt wird.
- **`availableTools`** ist die *Zulassungsliste*. Sie benennt, welche Tools das Modell in
  dieser Sitzung aufrufen darf. Ein Tool, das registriert, aber nicht zugelassen ist, kann nicht aufgerufen werden.

Sie brauchen beides. Wenn Sie nur `approved_fact_lookup` benennen, schließen Sie auch jedes andere
Tool aus: Diese Sitzung bietet keinen Dateileser, keine Shell und keinen Browser.

Der Prompt ist der dritte Baustein, und er ist der schwächste: Er *fordert* das Modell auf, das Tool
aufzurufen und nur das zu verwenden, was das Tool zurückgibt. Die Systemnachricht aus Schritt 3 sagt
nichts über Quellen, deshalb erfährt der Kurator erst in diesem Prompt, woher seine Fakten stammen.
Ein Prompt bewirkt den Aufruf nicht, und er kann einen Aufruf nicht stoppen. Behalten Sie die
ausdrückliche Anweisung "call `approved_fact_lookup` first" bei – in dieser Phase soll der
Tool-Aufruf zuverlässig sein, damit Sie ihn sehen können.

**Den Durchlauf begrenzen:** Übergeben Sie dem Sitzungs-Runner das vorhandene
**120-Sekunden-Generierungs-Timeout** der Hilfsfunktion ausdrücklich. Der Runner gibt den
Ausstellungstext zur späteren Validierung zurück, lehnt leere Ausgabe ab und räumt die Sitzung und
den Client auf, selbst wenn der Stream fehlschlägt. Das sind Kontrollmechanismen der Anwendung,
keine Anweisungen für das Modell.

## Das Tool registrieren und den Prompt erstellen

:::language dotnet
Öffnen Sie `Program.cs`. In diesem Schritt ändern sich fünf Regionen. Die Region `imports` enthält
bereits alles, was dieser Schritt benötigt.

**INSERT** in der Region `choose-facts` in `Program.cs`:

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

**REPLACE** in der Region `generate` in `Program.cs`:

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen.
Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit
spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `Program.cs`:

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

**INSERT** in der Region `generation-config` in `Program.cs`:

```csharp
SessionConfig GenerationConfig(IEnumerable<string?> approvedFacts) => new()
{
    ClientName = "museum-exhibit-studio",
    Model = CuratorStreamer.SelectedModel(),
    OnPermissionRequest = PermissionHandler.ApproveAll,
    Tools = [CuratorFacts.CreateApprovedFactLookup(approvedFacts)],
    AvailableTools = [CuratorFacts.ApprovedFactLookupName],
    Streaming = true,
    SystemMessage = new SystemMessageConfig
    {
        Mode = SystemMessageMode.Replace,
        Content = CuratorSystemMessages.Curator
    }
};
```

**INSERT** in der Region `session-runner` in `Program.cs`:

```csharp
static async Task<string> RunSessionAsync(SessionConfig config, string prompt, TimeSpan timeout)
{
    await using var client = new CopilotClient();
    try
    {
        await client.StartAsync();
        await using var session = await client.CreateSessionAsync(config);
        var content = await CuratorStreamer.StreamExhibitAsync(session, prompt, timeout);
        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("The curator returned no exhibit content.");
        }

        return content;
    }
    finally
    {
        await client.StopAsync();
    }
}
```

`RunSessionAsync` verwendet `CuratorStreamer.GenerationTimeout` aus `Helpers/CuratorStreamer.cs` und
gibt die Sitzung in `finally` frei, bevor der Client gestoppt wird. `BuildExhibitPrompt` nimmt jetzt
überhaupt keine Fakten mehr entgegen – es benennt stattdessen das Tool. `CreateApprovedFactLookup`
ruft intern `BoundFacts` auf, sodass die Begrenzung gilt, egal wer das Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `CuratorTerminal.ChooseApprovedFacts`
listet die drei Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste
zurück, sobald die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat.
`CuratorPrompts.ExhibitStructure` ist das feste Layout aus Titel, Erzählung und Fragen; es liegt in
`Helpers/CuratorPrompts.cs`, weil Schritt 5 dasselbe Layout prüft. `CuratorStreamer.SelectedModel`
liest die optionale Umgebungsvariable `COPILOT_MODEL`.

**Ein Blick hinein:** `Helpers/CuratorFacts.cs` enthält das Tool, und die Lektüre lohnt sich, weil
es sich um eine echte Tool-Definition handelt und nicht nur um Infrastrukturcode.
`CreateApprovedFactLookup` erfasst die begrenzte Liste, die die Lehrkraft gerade genehmigt hat, und
registriert sie über `CopilotTool.DefineTool` unter dem Namen `approved_fact_lookup`. Der Handler
nimmt keine Parameter entgegen, daher kann das Modell nicht steuern, was zurückkommt – es fragt, und
es erhält genau diese Liste. `SkipPermission = true` ist genau dort gesetzt, weil die Daten der
Anwendung gehören. Die drei Faktensätze und die von `BoundFacts` erzwungenen Grenzwerte
`MaximumFactCount` (20) und `MaximumFactLength` (500) befinden sich in derselben Datei.
:::

:::language nodejs
Öffnen Sie `src/index.ts`. In diesem Schritt ändern sich sechs Regionen, beginnend mit den Importen, die die neuen Hilfsfunktionen benötigen.

**REPLACE** in der Region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient, type SessionConfig } from "@github/copilot-sdk";
import {
  approvedFactLookupName,
  chooseApprovedFacts,
  closeTerminal,
  createApprovedFactLookup,
  describeFailure,
  exhibitStructure,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

**INSERT** in der Region `choose-facts` in `src/index.ts`:

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

**REPLACE** in der Region `generate` in `src/index.ts`:

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen.
Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit
spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `src/index.ts`:

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

**INSERT** in der Region `generation-config` in `src/index.ts`:

```typescript
function generationConfig(approvedFacts: Iterable<string>): SessionConfig {
  return {
    clientName: "museum-exhibit-studio",
    model: selectedModel(),
    onPermissionRequest: approveAll,
    tools: [createApprovedFactLookup(approvedFacts)],
    availableTools: [approvedFactLookupName],
    streaming: true,
    systemMessage: { mode: "replace", content: curatorSystemMessage },
  };
}
```

**INSERT** in der Region `session-runner` in `src/index.ts`:

```typescript
async function runSession(
  config: SessionConfig,
  prompt: string,
  timeout: number,
): Promise<string> {
  const client = new CopilotClient();
  try {
    await client.start();
    const session = await client.createSession(config);
    try {
      const content = await streamExhibit(session, prompt, timeout);
      if (!content.trim()) throw new Error("The curator returned no exhibit content.");
      return content;
    } finally {
      await session.disconnect();
    }
  } finally {
    await client.stop();
  }
}
```

`runSession` übergibt `generationTimeoutMs` aus `src/curator.ts` an den Streamer; die
verschachtelten `finally`-Blöcke trennen die Sitzung und stoppen den Client. `buildExhibitPrompt`
nimmt jetzt überhaupt keine Fakten mehr entgegen – es benennt stattdessen das Tool.
`createApprovedFactLookup` ruft intern `boundFacts` auf, sodass die Begrenzung gilt, egal wer das
Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `chooseApprovedFacts` listet die drei
Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste zurück, sobald
die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat. `exhibitStructure` ist das feste
Layout aus Titel, Erzählung und Fragen; es liegt in `src/curator.ts`, weil Schritt 5 dasselbe Layout
prüft. `selectedModel` liest die optionale Umgebungsvariable `COPILOT_MODEL`.

**Ein Blick hinein:** `src/curator.ts` enthält das Tool, und die Lektüre lohnt sich, weil es sich um
eine echte `defineTool`-Definition handelt und nicht nur um Infrastrukturcode.
`createApprovedFactLookup` erfasst die begrenzte Liste, die die Lehrkraft gerade genehmigt hat, und
definiert `approved_fact_lookup` mit
`parameters: { type: "object", properties: {}, additionalProperties: false }`, sodass das Modell
nicht steuern kann, was zurückkommt – es fragt, und es erhält genau diese Liste.
`skipPermission: true` ist genau dort gesetzt, weil die Daten der Anwendung gehören. Die drei
Faktensätze und die von `boundFacts` erzwungenen Grenzwerte `maximumFactCount` (20) und
`maximumFactLength` (500) befinden sich in derselben Datei.
:::

:::language python
Öffnen Sie `main.py`. In diesem Schritt ändern sich sechs Regionen.

**REPLACE** in der Region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys
from collections.abc import Iterable
from typing import Any

from copilot import CopilotClient, PermissionHandler

from curator import (
    APPROVED_FACT_LOOKUP_NAME,
    EXHIBIT_STRUCTURE,
    GENERATION_TIMEOUT_SECONDS,
    choose_approved_facts,
    create_approved_fact_lookup,
    describe_failure,
    selected_model,
    stream_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

**INSERT** in der Region `choose-facts` in `main.py`:

```python
        facts = choose_approved_facts()
```

**REPLACE** in der Region `generate` in `main.py`:

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen.
Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit
spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `main.py`:

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

**INSERT** in der Region `generation-config` in `main.py`:

```python
def generation_config(approved_facts: Iterable[str]) -> dict[str, Any]:
    return {
        "client_name": "museum-exhibit-studio",
        "model": selected_model(),
        "on_permission_request": PermissionHandler.approve_all,
        "tools": [create_approved_fact_lookup(approved_facts)],
        "available_tools": [APPROVED_FACT_LOOKUP_NAME],
        "streaming": True,
        "system_message": {"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
    }
```

**INSERT** in der Region `session-runner` in `main.py`:

```python
async def run_session(config: dict[str, Any], prompt: str, timeout: float) -> str:
    client = CopilotClient()
    try:
        await client.start()
        session = await client.create_session(**config)
        try:
            content = await stream_exhibit(session, prompt, timeout)
            if not content.strip():
                raise RuntimeError("The curator returned no exhibit content.")
            return content
        finally:
            await session.disconnect()
    finally:
        await client.stop()
```

`run_session` übergibt `GENERATION_TIMEOUT_SECONDS` aus `curator.py` an den Streamer; die
`finally`-Blöcke darin trennen die Sitzung und stoppen den Client. `build_exhibit_prompt` nimmt
jetzt überhaupt keine Fakten mehr entgegen – es benennt stattdessen das Tool.
`create_approved_fact_lookup` ruft intern `bound_facts` auf, sodass die Begrenzung gilt, egal wer
das Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `choose_approved_facts` listet die drei
Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste zurück, sobald
die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat. `EXHIBIT_STRUCTURE` ist das feste
Layout aus Titel, Erzählung und Fragen; es liegt in `curator.py`, weil Schritt 5 dasselbe Layout
prüft. `selected_model` liest die optionale Umgebungsvariable `COPILOT_MODEL`; dieses SDK akzeptiert
`model=None`, sodass die Konfiguration die Modellauswahl der Runtime überlassen kann.

**Ein Blick hinein:** `curator.py` enthält das Tool, und die Lektüre lohnt sich, weil es sich um
eine echte `@define_tool`-Definition handelt und nicht nur um Infrastrukturcode.
`create_approved_fact_lookup` erfasst die begrenzte Liste, die die Lehrkraft gerade genehmigt hat,
und dekoriert eine verschachtelte Funktion `approved_fact_lookup()`, die keine Argumente
entgegennimmt, sodass das Modell nicht steuern kann, was zurückkommt – es fragt, und es erhält genau
diese Liste. `skip_permission=True` ist genau dort gesetzt, weil die Daten der Anwendung gehören.
Die drei Faktensätze und die von `bound_facts` erzwungenen Grenzwerte `MAXIMUM_FACT_COUNT` (20) und
`MAXIMUM_FACT_LENGTH` (500) befinden sich in derselben Datei.
:::

:::language go
Öffnen Sie `main.go`. In diesem Schritt ändern sich sechs Regionen.

**REPLACE** in der Region `imports` in `main.go`:

```go
import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	copilot "github.com/github/copilot-sdk/go"
)

```

**INSERT** in der Region `choose-facts` in `main.go`:

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

**REPLACE** in der Region `generate` in `main.go`:

```go
	ctx := context.Background()
	workingDirectory, err := os.Getwd()
	if err != nil {
		return err
	}

	exhibitConfig, err := generationConfig(workingDirectory, facts)
	if err != nil {
		return err
	}

	fmt.Println()
	if _, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout); err != nil {
		return err
	}
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen.
Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit
spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `main.go`:

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

**INSERT** in der Region `generation-config` in `main.go`:

```go
func generationConfig(workingDirectory string, approvedFacts []string) (*copilot.SessionConfig, error) {
	lookup, err := ApprovedFactLookup(approvedFacts)
	if err != nil {
		return nil, err
	}

	return &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		Model:               SelectedModel(),
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Tools:               []copilot.Tool{lookup},
		AvailableTools:      []string{ApprovedFactLookupName},
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
		WorkingDirectory: workingDirectory,
	}, nil
}

```

**INSERT** in der Region `session-runner` in `main.go`:

```go
func runSession(
	ctx context.Context,
	config *copilot.SessionConfig,
	prompt string,
	timeout time.Duration,
) (string, error) {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return "", err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, config)
	if err != nil {
		return "", err
	}
	defer func() { _ = session.Disconnect() }()

	content, err := StreamExhibit(session, prompt, timeout)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(content) == "" {
		return "", errors.New("The curator returned no exhibit content.")
	}
	return content, nil
}

```

`runSession` übergibt `GenerationTimeout` aus `curator.go` an den Streamer und verwendet `defer`, um
die Sitzung zu trennen, bevor der Client gestoppt wird. `buildExhibitPrompt` nimmt jetzt überhaupt
keine Fakten mehr entgegen – es benennt stattdessen das Tool. `ApprovedFactLookup` ruft intern
`BoundFacts` auf, sodass die Begrenzung gilt, egal wer das Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `ChooseApprovedFacts` in `curator.go`
listet die drei Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste
zurück, sobald die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat. `ExhibitStructure` ist
das feste Layout aus Titel, Erzählung und Fragen; es liegt in `curator.go`, weil Schritt 5 dasselbe
Layout prüft. `SelectedModel` liest die optionale Umgebungsvariable `COPILOT_MODEL`.

**Ein Blick hinein:** `curator.go` enthält das Tool, und die Lektüre lohnt sich, weil es sich um
eine echte `copilot.DefineTool`-Definition handelt und nicht nur um Infrastrukturcode.
`ApprovedFactLookup` erfasst die begrenzte Liste, die die Lehrkraft gerade genehmigt hat, und
definiert einen Handler, dessen Argumenttyp `struct{}` ist, sodass das Modell nicht steuern kann,
was zurückkommt – es fragt, und es erhält genau diese Liste. `lookup.SkipPermission = true` ist
genau dort gesetzt, weil die Daten der Anwendung gehören. Die drei Faktensätze und die von
`BoundFacts` erzwungenen Grenzwerte `MaximumFactCount` (20) und `MaximumFactLength` (500) befinden
sich in derselben Datei.
:::

:::language rust
Öffnen Sie `src/main.rs`. In diesem Schritt ändern sich sechs Regionen.

**REPLACE** in der Region `imports` in `src/main.rs`:

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, selected_model,
    stream_exhibit,
};
```

**INSERT** in der Region `choose-facts` in `src/main.rs`:

```rust
    let facts = choose_approved_facts()?;
```

**REPLACE** in der Region `generate` in `src/main.rs`:

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen.
Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit
spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `src/main.rs`:

```rust
fn build_exhibit_prompt() -> String {
    format!(
        r#"Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"#
    )
}
```

**INSERT** in der Region `generation-config` in `src/main.rs`:

```rust
fn generation_config(approved_facts: &[String]) -> Result<SessionConfig, RuntimeError> {
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.model = selected_model();
    config.tools = Some(vec![approved_fact_lookup(approved_facts)?]);
    config.available_tools = Some(vec![APPROVED_FACT_LOOKUP_NAME.to_owned()]);
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    Ok(config)
}
```

**INSERT** in der Region `session-runner` in `src/main.rs`:

```rust
async fn run_session(
    config: SessionConfig,
    prompt: String,
    timeout: Duration,
) -> Result<String, RuntimeError> {
    let client = Client::start(ClientOptions::default()).await?;
    let session_result = async {
        let session = client.create_session(config).await?;
        let stream_result = stream_exhibit(&session, prompt, timeout).await;
        let disconnect_result = session.disconnect().await;
        match (stream_result, disconnect_result) {
            (Ok(content), Ok(())) => Ok(content),
            (Err(error), _) => Err(error),
            (Ok(_), Err(error)) => Err(Box::new(error) as RuntimeError),
        }
    }
    .await;
    let stop_result = client.stop().await;
    let content = match (session_result, stop_result) {
        (Ok(content), Ok(())) => content,
        (Err(error), _) => return Err(error),
        (Ok(_), Err(error)) => return Err(Box::new(error) as RuntimeError),
    };
    if content.trim().is_empty() {
        return Err("The curator returned no exhibit content.".into());
    }
    Ok(content)
}
```

`run_session` übergibt `GENERATION_TIMEOUT` aus `src/lib.rs` an den Streamer und trennt die Sitzung
und stoppt den Client, bevor Fehler weitergegeben werden. `build_exhibit_prompt` nimmt jetzt
überhaupt keine Fakten mehr entgegen – es benennt stattdessen das Tool. `approved_fact_lookup` ruft
intern `bound_facts` auf, sodass die Begrenzung gilt, egal wer das Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `choose_approved_facts` listet die drei
Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste zurück, sobald
die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat. `EXHIBIT_STRUCTURE` ist das feste
Layout aus Titel, Erzählung und Fragen; es liegt in `src/lib.rs`, weil Schritt 5 dasselbe Layout
prüft. `selected_model` liest die optionale Umgebungsvariable `COPILOT_MODEL`.

**Ein Blick hinein:** `src/lib.rs` enthält all dies, und die Lektüre lohnt sich, weil es sich um
eine echte Tool-Definition handelt und nicht nur um Infrastrukturcode. `approved_fact_lookup`
erfasst die begrenzte Liste, die die Lehrkraft gerade genehmigt hat, und erstellt ein `Tool`, dessen
Parameterschema `{"type": "object", "properties": {}, "additionalProperties": false}` ist, sodass
das Modell nicht steuern kann, was zurückkommt – es fragt, und es erhält genau diese Liste.
`.with_skip_permission(true)` ist genau dort gesetzt, weil die Daten der Anwendung gehören. Die drei
Faktensätze und die von `bound_facts` erzwungenen Grenzwerte `MAXIMUM_FACT_COUNT` (20) und
`MAXIMUM_FACT_LENGTH` (500) befinden sich in derselben Datei.
:::

:::language java
Öffnen Sie `src/main/java/workshop/MuseumExhibitStudio.java`. In diesem Schritt ändern sich sechs Regionen.

**REPLACE** in der Region `imports` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;

import java.time.Duration;
import java.util.List;
```

**INSERT** in der Region `choose-facts` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

**REPLACE** in der Region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Der Inline-Client und die Inline-Sitzung aus den Schritten 1–3 werden aus `generate` herausgenommen. Sie werden in den Konfigurations-Builder und den darunterstehenden Sitzungs-Runner verschoben, damit spätere Schritte sie wiederverwenden können.

**INSERT** in der Region `exhibit-prompt` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

**INSERT** in der Region `generation-config` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    private static SessionConfig generationConfig(Iterable<String> approvedFacts) {
        SessionConfig config = new SessionConfig()
                .setClientName("museum-exhibit-studio")
                .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                .setTools(List.of(CuratorFacts.approvedFactLookup(approvedFacts)))
                .setAvailableTools(List.of(CuratorFacts.APPROVED_FACT_LOOKUP_NAME))
                .setStreaming(true)
                .setSystemMessage(new SystemMessageConfig()
                        .setMode(SystemMessageMode.REPLACE)
                        .setContent(CuratorSystemMessages.CURATOR));
        return CuratorStreamer.withSelectedModel(config);
    }
```

**INSERT** in der Region `session-runner` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    private static String runSession(SessionConfig config, String prompt, Duration timeout) throws Exception {
        try (var client = new CopilotClient()) {
            CopilotSession session = null;
            try {
                client.start().get();
                session = client.createSession(config).get();
                String content = CuratorStreamer.streamExhibit(session, prompt, timeout);
                if (content == null || content.isBlank()) {
                    throw new IllegalStateException("The curator returned no exhibit content.");
                }
                return content;
            } finally {
                try {
                    if (session != null) {
                        session.close();
                    }
                } finally {
                    client.stop().get();
                }
            }
        }
    }
```

`runSession` verwendet `CuratorStreamer.GENERATION_TIMEOUT` aus `CuratorStreamer.java` und schließt die Sitzung in `finally`, bevor der Client gestoppt wird. `buildExhibitPrompt` nimmt jetzt überhaupt keine Fakten mehr entgegen – es benennt stattdessen das Tool. `approvedFactLookup` ruft intern `boundFacts` auf, sodass die Begrenzung gilt, egal wer das Tool erstellt.

Drei Aufrufe von Hilfsfunktionen halten diesen Schritt kurz. `CuratorTerminal.chooseApprovedFacts` listet die drei Faktensätze auf, liest die Auswahl, gibt die Fakten aus und gibt die begrenzte Liste zurück, sobald die Lehrkraft sie bestätigt oder eigene Fakten eingegeben hat. `CuratorPrompts.EXHIBIT_STRUCTURE` ist das feste Layout aus Titel, Erzählung und Fragen; es liegt in `CuratorPrompts.java`, weil Schritt 5 dasselbe Layout prüft. `CuratorStreamer.withSelectedModel` liest die optionale Umgebungsvariable `COPILOT_MODEL` und wendet sie auf die Sitzungskonfiguration an.

**Ein Blick hinein:** `CuratorFacts.java` enthält das Tool, und ein Blick hinein lohnt sich, weil es sich um eine echte `ToolDefinition` und nicht um bloßen Verdrahtungscode handelt. `approvedFactLookup` erstellt über die begrenzte Liste, die die Lehrkraft gerade freigegeben hat, einen privaten `ApprovedFactReader` und bindet dessen argumentlose `read`-Methode ein. So kann das Modell nicht steuern, was zurückkommt – es fragt, und es erhält genau diese Liste. `.skipPermission(true)` wird direkt dort festgelegt, weil die Daten der Anwendung gehören. Die drei Faktensätze sowie die von `boundFacts` erzwungenen Grenzen `MAXIMUM_FACT_COUNT` (20) und `MAXIMUM_FACT_LENGTH` (500) befinden sich in derselben Datei.
:::

## Ausführen

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start
```
:::
:::language python
```bash
.venv/bin/python main.py
```
:::
:::language go
```bash
go run .
```
:::
:::language rust
```bash
cargo run
```
:::
:::language java
```bash
./mvnw compile exec:java
```
:::

Die Anwendung befragt Sie jetzt, bevor sie etwas schreibt, und der Kurator ruft sichtbar seine
Fakten ab, bevor er ein Wort schreibt:

```text
=== Museum Exhibit Studio ===

Approved fact sets:
1. Apollo 11
2. Great Barrier Reef
3. Terracotta Army

Choose a fact set [1-3, default 1]: 2
1. The Great Barrier Reef lies off the coast of Queensland, Australia.
2. It stretches for about 2,300 kilometres.
3. It is made up of more than 2,900 individual reefs.
4. It was added to the UNESCO World Heritage List in 1981.
5. Rising sea temperatures have caused repeated coral bleaching events.

Use these facts? [Y/n]: y

[tool:start] approved_fact_lookup
[tool:done] success=true

# A Reef the Size of a Country
## Narrative
Off the Queensland coast, more than two thousand nine hundred reefs...
## Visitor questions
1. ...
```

Die Zeile `[tool:start] approved_fact_lookup` ist der Kern dieses Schritts. Der Kurator hat sich
nicht an das Riff erinnert – er hat Ihre Anwendung nach den Fakten gefragt, und Ihre Anwendung hat
geantwortet.

## Belegen, dass das Tool die Arbeit erledigt

Führen Sie die Anwendung erneut aus, und wählen Sie Faktensatz 1 oder 3. Die Ausstellung wechselt
das Thema vollständig, und das Tool-Ereignis erscheint jedes Mal wieder. Zwischen diesen Durchläufen
hat sich nichts am Prompt geändert: Derselbe Prompt-Text hat eine Ausstellung zur Terrakotta-Armee
erzeugt, weil das Tool andere Daten zurückgegeben hat. Das ist der Unterschied zwischen einem
Prompt, der Daten mitführt, und einer Anwendung, der sie gehören.

Antworten Sie dann bei der Bestätigung mit `n`, geben Sie zwei oder drei eigene Fakten ein, und
senden Sie eine Leerzeile ab. Der Kurator schreibt stattdessen über Ihr Thema – Ihre eingegebenen
Fakten sind in das Tool geflossen, und das Tool hat sie an das Modell zurückgegeben.

Probieren Sie auch den Fehlerfall aus. Antworten Sie mit `n`, und senden Sie sofort eine Leerzeile
ab, ohne Fakten einzugeben. Der Durchlauf endet mit:

```text
Could not generate the exhibit: Provide at least one approved fact.
```

Die Faktenauswahl begrenzt alles, was die Lehrkraft eingibt, und die Grenzen weisen eine leere Liste
zurück. Daher wurde überhaupt keine Sitzung erstellt und keine Anfrage gesendet. Der mit dem
Starterprojekt ausgelieferte Fehlerhandler gibt die Meldung aus und beendet das Programm mit Status 1.

Ein Durchlauf, der sein Timeout überschreitet, endet auf dieselbe Weise, statt Sie unbegrenzt warten zu lassen:

```text
The curator did not respond in time. Try again.
```

Das normale Timeout beträgt 120 Sekunden. Es ändert nicht, welche Fakten oder Tools der Kurator verwenden darf.

## Verständnis prüfen

- Sie haben das Tool an zwei Stellen registriert. Was würde passieren, wenn Sie `approved_fact_lookup` in die
  Tool-Liste aufnehmen, es aber aus der Zulassungsliste weglassen?
- Im Prompt steht "Call `approved_fact_lookup` first." Garantiert dieser Satz, dass der Aufruf
  erfolgt? Was hat in diesem Schritt das Tool überhaupt erst *verfügbar* gemacht, sodass es aufgerufen werden kann?
- Das Tool nimmt keine Argumente an und gibt für einen bestimmten Faktensatz immer dieselbe
  begrenzte Liste zurück. Was würden Sie verlieren, wenn es stattdessen ein Freitext-Abfrageargument annähme?
- Die Ausgabestruktur wird im Prompt angefordert. Wodurch wurde bisher tatsächlich überprüft, dass das Modell
  ihr gefolgt ist?

## Weitere Informationen

- [Mit Hooks arbeiten](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  Callbacks, die die Runtime rund um jeden Tool-Aufruf ausführt, für Audits oder für Richtlinien, die Ihr Code verantwortet.
- [Post-tool-use-Hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  prüfen oder umschreiben, was ein Tool zurückgegeben hat, bevor das Modell es liest.
- [Kontextbereinigung und Terminal-Tools](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  was ein Tool mit der Unterhaltung selbst tun kann und warum die meisten Tools das nicht tun sollten.

Weiter mit [Die Struktur prüfen](museum-06-prove-the-structure.md).
