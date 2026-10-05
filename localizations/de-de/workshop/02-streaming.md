# Schritt 2: Eine Antwort streamen

> **Dauer:** 10 Minuten

## Was Sie sehen werden

Sie konfigurieren eine Sitzung mit aktiviertem Streaming und machen die Antwortausgabe sichtbar. Die
meisten Sprachvarianten geben Antworttext aus, während die Sitzung noch arbeitet. Die Java-Variante
aktiviert dieselbe Streaming-Sitzungskonfiguration und gibt die abgeschlossene Assistentennachricht
aus, die `sendAndWait` zurückgibt.

## Wie Streaming die Erfahrung verändert

[**Streaming**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)
ändert die Antwort nicht. Es ändert den Zeitpunkt, zu dem eine Anwendung, die den Ereignisstream
abonniert hat, sie erhält. Statt auf eine abgeschlossene Nachricht zu warten, gibt die Sitzung
während des gesamten Durchlaufs Ereignisse aus:

- Delta-Ereignisse für Assistentennachrichten enthalten jedes neue Stück Antworttext.
- Das Ereignis für die abgeschlossene Assistentennachricht enthält die vollständige Nachricht.
- Ein Leerlaufereignis der Sitzung bedeutet, dass der Durchlauf und alle Toolausführungen abgeschlossen sind.
- Ein Sitzungsfehlerereignis meldet einen fehlgeschlagenen Durchlauf.

## Warum progressive Ausgabe sich besser anfühlt

Wenn Text sichtbar eintrifft, fühlt sich die Anwendung reaktionsschneller an. Später zeigt derselbe
Ereignisstream Aktivität von lokalen Tools und MCP-Tools.

Der Sitzungsablauf lautet jetzt `response deltas -> final message -> idle`.

:::language dotnet
## Die Antwort in C# streamen

### 1. Die Streaming-Hilfsfunktion hinzufügen

Erstellen Sie `Helpers/ResponseStreamer.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

Der Fall der finalen Nachricht behandelt eine Runtime, die abschließt, ohne Deltas zu senden. Ein
Fehler schließt die Aufgabe stattdessen mit einer Ausnahme ab, anstatt wie ein erfolgreicher
Durchlauf auszusehen.

### 2. Die Hilfsfunktion verwenden

Fügen Sie in `Program.cs` `using HelloCopilotSDK.Helpers;` hinzu, und ersetzen Sie dann den
Sitzungs- und Antwortcode durch:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("\nCopilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

## Ausführen

```bash
dotnet run
```

Die Aufzählungspunkte sollten nach und nach erscheinen, bevor der Prozess beendet wird:

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Text erscheint erst am Ende | Stellen Sie sicher, dass `Streaming = true` in der `SessionConfig` dieser Sitzung steht. |
| Der Prozess wird beendet, bevor Text erscheint | Stellen Sie sicher, dass die Hilfsfunktion nach `SendAsync` auf `completed.Task` wartet. |
| Text wird doppelt ausgegeben | Behalten Sie den `when !receivedDelta`-Guard für `AssistantMessageEvent` bei. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`Helpers/ResponseStreamer.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

`Program.cs`:

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Streaming from Copilot ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("Copilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

</details>
:::

:::language nodejs
## Die Antwort in TypeScript streamen

### 1. Die Streaming-Hilfsfunktion überprüfen

Öffnen Sie `src/workshop.ts`. Das Starterprojekt exportiert bereits `streamResponse`, das sich mit
`session.on` registriert, Assistenten-Deltas ausgibt, einen Fallback für die finale Nachricht
beibehält, Sitzungsfehler per Ablehnung weitergibt und bei Leerlauf auflöst:

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

Die Zweige für Tool-Start und Tool-Abschluss bleiben in diesem Schritt still und werden nützlich,
sobald Sie später Tools registrieren.

### 2. Die Hilfsfunktion in den Einstiegspunkt einbinden

Ersetzen Sie `src/index.ts` durch:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

## Ausführen

```bash
npm start
```

Die Ein-Satz-Antwort sollte nach und nach über den Ereignis-Callback erscheinen:

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Text erscheint erst am Ende | Stellen Sie sicher, dass `streaming: true` an `createSession` übergeben wird. |
| Der Prozess wird beendet, bevor Text erscheint | Stellen Sie sicher, dass `streamResponse` vor dem Auflösen auf `session.idle` wartet. |
| Text wird doppelt ausgegeben | Behalten Sie den `!receivedDelta`-Guard im `assistant.message`-Zweig bei. |
| Modul `./workshop.js` kann nicht gefunden werden | Importieren Sie die Hilfsfunktion als `./workshop.js`, obwohl die Quelldatei `workshop.ts` ist. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`src/workshop.ts` (`streamResponse`):

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
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
## Die Antwort in Python streamen

### 1. Sitzungsereignisse abonnieren

Ersetzen Sie `main.py` durch einen asynchronen Einstiegspunkt, der Streaming aktiviert,
`AssistantMessageDeltaData` verarbeitet, einen `AssistantMessageData`-Fallback beibehält,
`SessionErrorData` sichtbar macht und auf `SessionIdleData` wartet:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
)


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
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
                "Explain accessible names in three short bullet points."
            )
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Der Fall der finalen Nachricht behandelt eine Runtime, die ohne Deltas abschließt. Ein
Sitzungsfehler setzt `error` und beendet das Warten, damit der Durchlauf nicht erfolgreich aussieht.

## Ausführen

```bash
python main.py
```

Die Aufzählungspunkte sollten nach und nach über den Ereignis-Callback erscheinen:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Text erscheint erst am Ende | Stellen Sie sicher, dass `streaming=True` an `create_session` übergeben wird. |
| Der Prozess wird beendet, bevor Text erscheint | Stellen Sie sicher, dass Sie nach `session.send` `await done.wait()` ausführen. |
| Text wird doppelt ausgegeben | Behalten Sie den `not received_delta`-Guard für `AssistantMessageData` bei. |
| Importfehler für Sitzungsereignisse | Importieren Sie die Ereignistypen aus `copilot.session_events`. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`main.py`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
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
            await session.send("Explain accessible names in three short bullet points.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Die Antwort in Go streamen

### 1. Die Streaming-Hilfsfunktion hinzufügen

Ersetzen Sie in `main.go` den Paketinhalt durch eine `streamResponse`-Hilfsfunktion, die sich mit
`session.On` registriert, `AssistantMessageDeltaData` ausgibt, nach `SendAndWait` einen
`AssistantMessageData`-Fallback beibehält und Sendefehler zurückgibt:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

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
```

### 2. Eine Streaming-Sitzung erstellen und die Hilfsfunktion aufrufen

Fügen Sie `main` unter der Hilfsfunktion hinzu:

```go
func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

## Ausführen

```bash
go run .
```

Die Aufzählungspunkte sollten nach und nach über den Ereignis-Callback erscheinen:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Text erscheint erst am Ende | Stellen Sie sicher, dass `Streaming: copilot.Bool(true)` in `SessionConfig` festgelegt ist. |
| Der Prozess wird ohne Ausgabe beendet | Stellen Sie sicher, dass `streamResponse` `SendAndWait` verwendet und dessen Fehler zurückgibt. |
| Text wird doppelt ausgegeben | Behalten Sie den `!receivedDelta`-Guard vor der Ausgabe von `AssistantMessageData` bei. |
| Importpfadfehler | Verwenden Sie `copilot "github.com/github/copilot-sdk/go"`. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`main.go`:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

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
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

</details>
:::

:::language rust
## Die Antwort in Rust streamen

### 1. Das Streaming-Hilfsmakro hinzufügen

Ersetzen Sie `src/main.rs` durch ein `stream_response!`-Makro, das `session.subscribe()` aufruft,
Assistenten-Deltas mit `tokio::select!` ausgibt, einen Fallback für die finale Nachricht beibehält
und wartet, bis sowohl der Sendeabschluss als auch `session.idle` erfolgt sind:

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

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
```

### 2. Eine Streaming-Sitzung erstellen und das Makro aufrufen

Fügen Sie den asynchronen Einstiegspunkt unter dem Makro hinzu:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

## Ausführen

```bash
cargo run
```

Die Aufzählungspunkte sollten nach und nach über das Ereignisabonnement erscheinen:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Text erscheint erst am Ende | Stellen Sie sicher, dass `config.streaming = Some(true)` vor `create_session` festgelegt ist. |
| Der Prozess wird beendet, bevor Text erscheint | Behalten Sie die `while !sent \|\| !idle`-Schleife bei und warten Sie auf `session.idle`. |
| Text wird doppelt ausgegeben | Behalten Sie den `if !received_delta`-Guard für `"assistant.message"` bei. |
| Ausgabe wirkt gepuffert | Führen Sie nach jedem `print!` von Delta-Inhalt einen Flush für stdout aus. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`src/main.rs`:

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

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
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

</details>
:::

:::language java
## Die Antwort in Java streamen

### 1. Streaming für die Sitzung aktivieren

Die Java-SDK-Implementierung verwendet eine `SessionConfig` mit aktiviertem Streaming und
`sendAndWait` und gibt dann die abgeschlossene Assistentennachricht aus. Ersetzen Sie
`src/main/java/workshop/AccessibilityReport.java` durch:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`setStreaming(true)` hält diesen Schritt mit den anderen Sprachvarianten abgestimmt. Die
Java-Implementierung wartet auf die abgeschlossene Antwort von `sendAndWait` und gibt diese
vollständige Nachricht aus, wenn der Durchlauf abgeschlossen ist.

## Ausführen

```bash
./mvnw compile exec:java
```

Die abgeschlossene Antwort sollte ausgegeben werden, bevor der Prozess beendet wird:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Es wird keine Antwort ausgegeben | Stellen Sie sicher, dass `setStreaming(true)` in `SessionConfig` festgelegt ist und Sie `sendAndWait` aufrufen. |
| Der Prozess schlägt mit einer Null-Antwort fehl | Behalten Sie den `response == null`-Guard bei und lösen Sie eine Ausnahme aus, wenn der Durchlauf ohne Nachricht abgeschlossen wird. |
| Maven kann die Hauptklasse nicht finden | Führen Sie den Befehl im Starterverzeichnis mit `./mvnw compile exec:java` aus. |

</details>

> **Sie können Tools hinzufügen, wenn:** der konfigurierte Antwortpfad eine Antwort ausgibt und den Durchlauf abschließt,
> ohne Sitzungsfehler auszublenden.

<details>
<summary>Vollständige Implementierung von Schritt 2</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 2.

`src/main/java/workshop/AccessibilityReport.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

</details>
:::

## Verständnis prüfen

Wann ist ein Sendeaufruf mit abgeschlossener Antwort eine bessere Wahl als Ereignisstreaming?

<details>
<summary>Antwort prüfen</summary>

Verwenden Sie einen Sendeaufruf mit abgeschlossener Antwort für Hintergrundarbeit oder einfachen
Anfrage/Antwort-Code, der keine progressive Ausgabe oder Zwischenereignisse benötigt.

</details>

## Weitere Informationen

- [Steuerung und Warteschlangen](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  Senden einer weiteren Nachricht, während ein Durchlauf noch läuft, entweder um ihn umzuleiten oder Arbeit in die Warteschlange einzureihen.
- [Sitzungslimits](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  Festlegen eines AI Credits-Budgets für eine Sitzung, bevor sie beginnt, Token zu erzeugen.
- [Nutzungs- und Abrechnungsmetriken](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  Lesen von Tokenzahlen, Nutzung des Kontextfensters und Kosten aus demselben Ereignisstream.

Fahren Sie mit [Schritt 3: Anwendungseigenes Wissen hinzufügen](03-local-tool.md) fort.
