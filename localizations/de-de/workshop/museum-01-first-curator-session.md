# Schritt 1: Ihre erste Kurator-Sitzung

> **Dauer:** 10 Minuten

## Was Sie erstellen

Echter Museumstext, in Ihrem Terminal, in etwa zehn Minuten. Sie stellen eine Verbindung zur
Copilot-Runtime her, öffnen eine Unterhaltung, senden einen einzelnen Prompt und geben aus, was
zurückkommt.

Keine Systemnachricht. Kein Faktenkatalog. Keine Tools. Keine Schnittstellen. Nichts, gegen das Sie
implementieren müssten — Sie rufen das SDK direkt auf. Abgesehen vom Fehlerhandler, den das
Starterprojekt bereits um Ihren Code legt, warten die vorgefertigten Kurator-Hilfsfunktionen, bis
Schritt 2 sie benötigt.

## Client und Sitzung kennenlernen

Die
[**Copilot-Runtime**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. Der **Client** verbindet Ihre Anwendung mit
dieser Runtime. Eine **Sitzung** ist eine fortlaufende Unterhaltung: Sie enthält die Nachrichten und
Tool-Ergebnisse, aus denen der Kontext besteht.

Halten Sie einen Client für eine Arbeitseinheit am Leben, und erstellen Sie dann für jede
unabhängige Unterhaltung eine Sitzung. Im Moment ist die Anwendung einfach
`client -> session -> printed response`.

## Berechtigungsanfragen vor dem Senden beantworten

Die Runtime entscheidet nicht selbst, ob ein Tool-Aufruf ausgeführt werden darf. Sie fragt die
Anwendung, und der
[Berechtigungshandler](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
der Sitzung antwortet. Wenn eine Sitzung ohne einen solchen Handler erstellt wird, wird die Anfrage
nicht abgelehnt — sie wird als Ereignis ausgegeben und bleibt zur manuellen Auflösung ausstehend,
sodass der Lauf anhält und auf eine Antwort wartet, die nie kommt.

Geben Sie dieser ersten Sitzung einen Handler, der alles genehmigt, damit jede Anfrage eine Antwort
erhält. Er genehmigt Anfragen, wenn verwaltete Einstellungen deaktiviert sind, und ist ein
Standardwert statt einer Sicherheitsmaßnahme: Schritt 4 zeigt, was diese Sitzung tatsächlich
einschränkt, und die Schritte 6 und 7 ersetzen ihn durch enge, bereichsgebundene Handler.

## Sitzung schreiben

Jeder Codeblock ab hier nennt eine Region in Ihrem Einstiegspunkt und sagt **INSERT** oder
**REPLACE**. INSERT füllt eine leere Region. REPLACE bedeutet: Löschen Sie, was zwischen den beiden
Markierungszeilen der Region steht, und fügen Sie dann den Inhalt ein. Die
[Vorbereitung](museum-00-preflight.md) zeigt die Markierungszeilen unter „Funktionsweise von
Änderungen“.

:::language dotnet
Öffnen Sie `Program.cs`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `Program.cs`:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;
```

**REPLACE** in der Region `banner` in `Program.cs`:

```csharp
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
```

**INSERT** in der Region `generate` in `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll
    });

    var response = await session.SendAndWaitAsync(
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

    if (response is null)
    {
        throw new InvalidOperationException("The curator returned no content.");
    }

    Console.WriteLine(response.Data.Content);

    await client.StopAsync();
```

`SendAndWaitAsync` blockiert, bis die Sitzung inaktiv wird, sodass Sie die fertige Antwort in einem
Aufruf erhalten. `await using` gibt die Sitzung und den Client beim Beenden frei.
`PermissionHandler.ApproveAll` kommt aus `GitHub.Copilot.Rpc`, deshalb ist das zweite `using`
vorhanden.

Das `try`/`catch`/`finally` um Ihre Regionen wurde mit dem Starterprojekt ausgeliefert. Wenn etwas
eine Ausnahme auslöst, gibt es eine Nachricht aus `CuratorTerminal.DescribeFailure` aus und beendet
sich mit einem Code ungleich null.

Die vorgefertigten Hilfsfunktionen, die Sie ab Schritt 2 aufrufen, befinden sich in
`Helpers/CuratorFacts.cs`, `Helpers/CuratorStreamer.cs`, `Helpers/CuratorValidation.cs`,
`Helpers/CuratorSafety.cs`, `Helpers/CuratorPrompts.cs`, `Helpers/CuratorSystemMessages.cs` und
`Helpers/CuratorTerminal.cs`. Sie bearbeiten diese Dateien nie — Sie lesen sie.
:::

:::language nodejs
Öffnen Sie `src/index.ts`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure } from "./curator.js";
```

**REPLACE** in der Region `banner` in `src/index.ts`:

```typescript
    console.log("=== Museum Exhibit Studio ===");
    console.log();
```

**INSERT** in der Region `generate` in `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
    });

    const response = await session.sendAndWait({
      prompt: "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
    });
    console.log(response?.data && "content" in response.data ? response.data.content : response);

    await session.disconnect();
    await client.stop();
```

`sendAndWait` blockiert, bis die Sitzung inaktiv wird, sodass Sie die fertige Antwort in einem
Aufruf erhalten. `approveAll` wird zusammen mit `CopilotClient` aus dem SDK importiert.

Das `try`/`catch`/`finally` um Ihre Regionen wurde mit dem Starterprojekt ausgeliefert. Wenn etwas
eine Ausnahme auslöst, gibt es eine Nachricht von `describeFailure` in `src/curator.ts` aus und
setzt einen Exitcode ungleich null.

Das vorgefertigte Hilfsmodul, das Sie ab Schritt 2 aufrufen, befindet sich in `src/curator.ts`, und
die Systemnachrichten, die Schritt 3 verwendet, befinden sich in `src/system-messages.ts`. Sie
bearbeiten diese Dateien nie — Sie lesen sie.
:::

:::language python
Öffnen Sie `main.py`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData

from curator import describe_failure
```

**REPLACE** in der Region `banner` in `main.py`:

```python
        print("=== Museum Exhibit Studio ===")
        print()
```

**INSERT** in der Region `generate` in `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
            ) as session:
                done = asyncio.Event()
                error: RuntimeError | None = None

                def on_event(event) -> None:
                    nonlocal error
                    match event.data:
                        case AssistantMessageData(content=content):
                            print(content)
                        case SessionErrorData(message=message):
                            error = RuntimeError(message)
                            done.set()
                        case SessionIdleData():
                            done.set()

                session.on(on_event)
                await session.send(
                    "Write two sentences of museum wall text about the Apollo 11 Moon landing."
                )
                await done.wait()
                if error is not None:
                    raise error
```

Python lauscht auf Sitzungsereignisse, statt eine blockierende Hilfsfunktion aufzurufen. Geben Sie
die Assistentennachricht aus, behandeln Sie einen Sitzungsfehler als Fehler und warten Sie vor dem
Beenden, bis die Sitzung inaktiv ist. Schritt 2 ersetzt diesen gesamten Listener durch einen
Hilfsfunktionsaufruf.

Das `try`/`except` um Ihre Regionen wurde mit dem Starterprojekt ausgeliefert. Wenn etwas eine
Ausnahme auslöst, gibt es eine Nachricht von `describe_failure` in `curator.py` aus und beendet sich
mit einem Code ungleich null.

`curator.py` neben dieser Datei ist das vorgefertigte Hilfsmodul, das Sie ab Schritt 2 aufrufen, und
`system_messages.py` enthält die Systemnachrichten, die Schritt 3 verwendet. Sie bearbeiten diese
Dateien nie — Sie lesen sie.
:::

:::language go
Öffnen Sie `main.go`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `main.go`:

```go
import (
	"context"
	"fmt"
	"os"

	copilot "github.com/github/copilot-sdk/go"
)

```

**REPLACE** in der Region `banner` in `main.go`:

```go
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
```

**INSERT** in der Region `generate` in `main.go`:

```go
	ctx := context.Background()
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	response, err := session.SendAndWait(ctx, copilot.MessageOptions{
		Prompt: "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
	})
	if err != nil {
		return err
	}
	if response == nil {
		return fmt.Errorf("The curator returned no content.")
	}
	if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
		fmt.Println(message.Content)
	}
```

`SendAndWait` blockiert, bis die Sitzung inaktiv wird, sodass Sie die fertige Antwort in einem
Aufruf erhalten. Die verzögerte Bereinigung trennt die Sitzung und stoppt den Client beim Beenden.
`copilot.PermissionHandler.ApproveAll` beantwortet Berechtigungsanfragen, damit der Lauf nicht
hängen bleibt.

Der `main`/`run`-Wrapper und der Fehlerhandler um Ihre Regionen wurden mit dem Starterprojekt
ausgeliefert. Wenn etwas einen Fehler zurückgibt, gibt `main` eine Nachricht von `DescribeFailure`
in `curator.go` aus und beendet sich mit einem Code ungleich null.

Die vorgefertigten Hilfsfunktionen, die Sie ab Schritt 2 aufrufen, befinden sich in `curator.go`,
und die Systemnachrichten, die Schritt 3 verwendet, befinden sich in `system_messages.go`. Sie
bearbeiten diese Dateien nie — Sie lesen sie.
:::

:::language rust
Öffnen Sie `src/main.rs`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{RuntimeError, describe_failure};
```

**REPLACE** in der Region `banner` in `src/main.rs`:

```rust
    println!("=== Museum Exhibit Studio ===");
    println!();
```

**INSERT** in der Region `generate` in `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    let session = client.create_session(config).await?;

    let response = session
        .send_and_wait(MessageOptions::new(
            "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
```

`send_and_wait` blockiert, bis die Sitzung inaktiv wird, sodass Sie die fertige Antwort in einem
Aufruf erhalten. `with_permission_handler(permission::approve_all())` verhindert, dass Tool-Anfragen
hängen bleiben, solange die Sitzung noch einfach ist.

Der `main`-Wrapper, die `run`-Funktion, der Exitcode und der Fehlerhandler um Ihre Regionen wurden
mit dem Starterprojekt ausgeliefert. Wenn etwas eine Ausnahme auslöst, gibt der Wrapper eine
Nachricht von `describe_failure` in `src/lib.rs` aus und beendet sich mit einem Code ungleich null.

Die vorgefertigten Hilfsfunktionen, die Sie ab Schritt 2 aufrufen, befinden sich in `src/lib.rs`,
und die Systemnachrichten, die Schritt 3 verwendet, befinden sich in `src/system_messages.rs`. Sie
bearbeiten diese Dateien nie — Sie lesen sie.
:::

:::language java
Öffnen Sie `src/main/java/workshop/MuseumExhibitStudio.java`. In diesem Schritt ändern sich drei Regionen.

**INSERT** in der Region `imports` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
```

**REPLACE** in der Region `banner` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();
```

**INSERT** in der Region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();

                var response = session.sendAndWait(new MessageOptions().setPrompt(
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.")).get();
                if (response == null) {
                    throw new IllegalStateException("The curator returned no content.");
                }
                System.out.println(response.getData().content());
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

`sendAndWait` blockiert, bis die Sitzung inaktiv wird, sodass Sie die fertige Antwort in einem Aufruf erhalten. Der Client wird geschlossen, wenn der try-with-resources-Block endet, und die Sitzung wird geschlossen, bevor `client.stop().get()` ausgeführt wird. `PermissionHandler.APPROVE_ALL` kommt aus `com.github.copilot.rpc`, deshalb ist dieser Import vorhanden.

Das `main`/`run`-Gerüst, das oberste `try`/`catch`/`finally` und die Exitcode-Behandlung wurden mit dem Starterprojekt ausgeliefert. Wenn etwas eine Ausnahme auslöst, gibt der Fehlerhandler eine Nachricht über `CuratorTerminal.describeFailure` aus und beendet sich mit einem Code ungleich null.

Die vorgefertigten Hilfsfunktionen, die Sie ab Schritt 2 aufrufen, liegen neben Ihrer Datei in `src/main/java/workshop/`: `CuratorFacts.java`, `CuratorStreamer.java`, `CuratorValidation.java`, `CuratorSafety.java`, `CuratorPrompts.java`, `CuratorSystemMessages.java` und `CuratorTerminal.java`. Sie bearbeiten diese Dateien nie — Sie lesen sie.
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

Ihre genaue Formulierung wird variieren, aber die Ausgabe hat diese Form:

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

Nach einer kurzen Pause treffen zwei Sätze museumstypischer Prosa ein. Noch wird nichts gestreamt,
noch wird kein Ton erzwungen, und nichts hindert das Modell daran, über das angefragte Thema
hinauszugehen. Das sind die nächsten drei Schritte.

## Verständnis prüfen

- Was enthält die Sitzung, was der Client nicht enthält?
- Die Antwort kam nach einer Pause auf einmal an. Welcher Teil des aktuellen Codes verursacht das?
- Die Sitzung hat jede Berechtigungsanfrage beantwortet, statt sie ausstehend zu lassen. Hat das die
  Sitzung sicherer gemacht oder nur dafür gesorgt, dass sie abschließen konnte?
- Nichts in diesem Schritt schränkt ein, was das Modell über Apollo 11 behaupten darf. Was sorgt im Moment allein dafür, dass
  die Antwort grob beim Thema bleibt?

## Weitere Informationen

- [Ihre erste Copilot-gestützte App erstellen](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  GitHubs Tutorial für denselben ersten Client, dieselbe Sitzung und denselben Prompt.
- [Sitzungsfortsetzung und Persistenz](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  was eine Sitzung beibehält und wie Sie eine Unterhaltung später wieder aufnehmen.
- [Authentifizierung](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  die Anmeldedaten, die ein Client verwenden kann, sobald Sie über `copilot login` hinausgehen.

Weiter mit [Die Antwort des Kurators streamen](museum-02-stream-the-curator.md).
