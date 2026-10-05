# Schritt 1: Die erste Copilot-Sitzung erstellen

> **Dauer:** 10 Minuten

## Was Sie erstellen

Sie verbinden die Konsolenanwendung mit der Copilot-Laufzeit, erstellen eine Unterhaltung, senden
einen Prompt und geben die Antwort aus.

:::language dotnet
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die .NET-API, mit der Ihre Anwendung Copilot als Agent ausführt. Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `CopilotClient` verbindet Ihren C#-Code mit
dieser Laufzeit.

Eine `CopilotSession` stellt eine fortlaufende Unterhaltung dar. Sie enthält die Nachrichten und
Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client für die
Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `CopilotClient -> CopilotSession -> model response`.
:::

:::language nodejs
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die Node.js-API, mit der Ihre Anwendung Copilot als Agent ausführt.
Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `CopilotClient` verbindet Ihren
TypeScript-Code mit dieser Laufzeit.

Eine Sitzung aus `createSession` stellt eine fortlaufende Unterhaltung dar. Sie enthält die
Nachrichten und Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client
für die Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `CopilotClient -> session -> model response`.
:::

:::language python
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die Python-API, mit der Ihre Anwendung Copilot als Agent ausführt.
Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `CopilotClient` verbindet Ihren Python-Code
mit dieser Laufzeit.

Eine Sitzung aus `create_session` stellt eine fortlaufende Unterhaltung dar. Sie enthält die
Nachrichten und Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client
für die Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `CopilotClient -> session -> model response`.
:::

:::language go
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die Go-API, mit der Ihre Anwendung Copilot als Agent ausführt. Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `copilot.NewClient` verbindet Ihren Go-Code
mit dieser Laufzeit.

Eine Sitzung aus `CreateSession` stellt eine fortlaufende Unterhaltung dar. Sie enthält die
Nachrichten und Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client
für die Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `Client -> Session -> model response`.
:::

:::language rust
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die Rust-API, mit der Ihre Anwendung Copilot als Agent ausführt. Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `Client` verbindet Ihren Rust-Code mit
dieser Laufzeit.

Eine Sitzung aus `create_session` stellt eine fortlaufende Unterhaltung dar. Sie enthält die
Nachrichten und Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client
für die Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `Client -> session -> model response`.
:::

:::language java
## GitHub Copilot SDK und Laufzeit kennenlernen

Das **GitHub Copilot SDK** ist die Java-API, mit der Ihre Anwendung Copilot als Agent ausführt. Die
[**Copilot-Laufzeit**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
empfängt Prompts, ruft Modelle auf und verwaltet Tools. `CopilotClient` verbindet Ihren Java-Code
mit dieser Laufzeit.

Eine Sitzung aus `createSession` stellt eine fortlaufende Unterhaltung dar. Sie enthält die
Nachrichten und Tool-Ergebnisse, die den Kontext der Unterhaltung bilden. Behalten Sie einen Client
für die Anwendung bei und erstellen Sie dann für jede unabhängige Unterhaltung eine Sitzung.

## Warum Clients und Sitzungen getrennt bleiben

Wenn diese Verantwortlichkeiten getrennt bleiben, kann die Laufzeitverbindung länger bestehen als
jede einzelne Unterhaltung. Außerdem erhalten Sie ein kleines funktionierendes Beispiel, bevor
Streaming und Tools ins Spiel kommen.

Zu diesem Zeitpunkt ist die Konsolen-App einfach `CopilotClient -> session -> model response`.
:::

## Ihre erste Copilot-Sitzung starten

:::language dotnet
Öffnen Sie `Program.cs` und **ersetzen Sie die gesamte Datei**:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
});
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```

Der Ping überprüft die Laufzeitverbindung. Der Sendevorgang für eine vollständige Antwort wartet,
bis die Sitzung inaktiv wird. Deshalb eignet er sich gut, wenn Sie nur die fertige Antwort
benötigen.
:::

:::language nodejs
Öffnen Sie `src/index.ts` und **ersetzen Sie die gesamte Datei**:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ onPermissionRequest: approveAll });
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`sendAndWait` wartet, bis die Sitzung inaktiv wird. Deshalb eignet es sich gut, wenn Sie nur die
fertige Antwort benötigen. Beenden Sie die Sitzung und den Client immer in `finally`-Blöcken, damit
die Laufzeit sauber herunterfährt.
:::

:::language python
Öffnen Sie `main.py` und **ersetzen Sie die gesamte Datei**:

```python
import asyncio

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Python lauscht auf Sitzungsereignisse, statt eine einzelne Hilfsfunktion für vollständige Antworten
aufzurufen. Geben Sie die Assistentennachricht aus, behandeln Sie Sitzungsfehler als Fehlschläge und
warten Sie vor dem Beenden auf das Inaktivitätsereignis.
:::

:::language go
Öffnen Sie `main.go` und **ersetzen Sie die gesamte Datei**:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```

`SendAndWait` wartet, bis die Sitzung inaktiv wird. Deshalb eignet es sich gut, wenn Sie nur die
fertige Antwort benötigen. `defer` trennt beim Beenden die Sitzung und stoppt den Client.
:::

:::language rust
Öffnen Sie `src/main.rs` und **ersetzen Sie die gesamte Datei**:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client
        .create_session(SessionConfig::default().with_permission_handler(permission::approve_all()))
        .await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

`send_and_wait` wartet, bis die Sitzung inaktiv wird. Deshalb eignet es sich gut, wenn Sie nur die
fertige Antwort benötigen. Trennen Sie die Sitzung und stoppen Sie den Client, bevor Sie
zurückkehren.
:::

:::language java
Öffnen Sie `src/main/java/workshop/AccessibilityReport.java` und **ersetzen Sie die gesamte Datei**:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client
                    .createSession(new SessionConfig().setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`sendAndWait` wartet, bis die Sitzung inaktiv wird. Deshalb eignet es sich gut, wenn Sie nur die
fertige Antwort benötigen. Der try-with-resources-Block schließt den Client, wenn `main` beendet
wird.
:::

Diese Sitzung legt einen Berechtigungshandler fest und sonst nichts, daher läuft sie mit der
Standardpersona des SDK. Die Stellschraube, an der Sie nicht gedreht haben, ist die
[Systemnachricht](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message),
die drei Modi hat. `append` ist die Standardeinstellung: Ihre Inhalte werden nach dem vom SDK
verwalteten Prompt hinzugefügt, und die Standard-CLI-Persona bleibt zusammen mit dem
Umgebungskontext, den Tool-Anweisungen und den Sicherheitsleitplanken erhalten, die das SDK einfügt.
`replace` ersetzt den gesamten Prompt durch Ihre Inhalte. `customize` überschreibt einzelne
Abschnitte — Ton, Richtlinien, Regeln für Codeänderungen und andere — und bewahrt den Rest. Dieser
Workshop bleibt bei der Standardeinstellung, deshalb stammt jede Antwort, die Sie sehen, von der
Standardpersona. Verwenden Sie die beiden anderen Modi, wenn eine Anwendung eine eigene Stimme oder
einen eigenen Geltungsbereich benötigt.

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
python main.py
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

:::language dotnet
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
=== First Copilot session ===

Connected to the Copilot runtime: ...

Copilot: An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language nodejs
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
This Copilot session is ready and waiting for your next prompt.
```
:::

:::language python
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language go
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language rust
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language java
Ihre genaue Antwort kann abweichen, aber die Ausgabe sollte diese Form haben:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

<details>
<summary>Problembehandlung für diese Ausführung</summary>

| Symptom | Behebung |
|---|---|
| Authentifizierungs- oder Autorisierungsfehler | Führen Sie `copilot login` erneut aus, und führen Sie dann das Projekt erneut aus. |
| Runtime-Ausführungsdatei nicht gefunden | Legen Sie `COPILOT_CLI_BINARY_PATH` mit den Vorbereitungsanweisungen fest. |
| Zeitüberschreitung bei der Anforderung | Prüfen Sie den Netzwerkzugriff auf GitHub Copilot und versuchen Sie es erneut; dieses Beispiel verbirgt den Fehler nicht. |

</details>

> **Sie sind bereit für das Streaming, wenn:** das Terminal eine vollständige Copilot-Antwort ausgibt.

## Verständnis prüfen

Welches Objekt sollte in der Regel für die Lebensdauer der Anwendung bestehen bleiben, und welches
Objekt besitzt den Kontext einer Unterhaltung?

:::language dotnet
<details>
<summary>Antwort prüfen</summary>

Behalten Sie `CopilotClient` für die Lebensdauer der Laufzeitverbindung bei. Eine `CopilotSession`
besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language nodejs
<details>
<summary>Antwort prüfen</summary>

Behalten Sie `CopilotClient` für die Lebensdauer der Laufzeitverbindung bei. Eine Sitzung aus
`createSession` besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language python
<details>
<summary>Antwort prüfen</summary>

Behalten Sie `CopilotClient` für die Lebensdauer der Laufzeitverbindung bei. Eine Sitzung aus
`create_session` besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language go
<details>
<summary>Antwort prüfen</summary>

Behalten Sie den Client aus `copilot.NewClient` für die Lebensdauer der Laufzeitverbindung bei. Eine
Sitzung aus `CreateSession` besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language rust
<details>
<summary>Antwort prüfen</summary>

Behalten Sie `Client` für die Lebensdauer der Laufzeitverbindung bei. Eine Sitzung aus
`create_session` besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language java
<details>
<summary>Antwort prüfen</summary>

Behalten Sie `CopilotClient` für die Lebensdauer der Laufzeitverbindung bei. Eine Sitzung aus
`createSession` besitzt die Nachrichten und den Tool-Kontext für eine Unterhaltung.

</details>
:::

:::language dotnet
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```csharp
using GitHub.Copilot;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig());
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```
</details>
:::

:::language nodejs
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```typescript
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({});
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
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
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session() as session:
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```
</details>
:::

:::language go
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```
</details>
:::

:::language rust
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client.create_session(SessionConfig::default()).await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
</details>
:::

:::language java
<details>
<summary>Vollständige Implementierung von Schritt 1</summary>

Vergleichen Sie Ihre Arbeit mit dieser vollständigen Implementierung von Schritt 1.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
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

## Weitere Informationen

- [Ihre erste Copilot-gestützte App erstellen](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  GitHubs Tutorial für denselben ersten Client, dieselbe Sitzung und denselben Prompt.
- [Sitzungsfortsetzung und Persistenz](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  wie der Gesprächszustand einer Sitzung erhalten bleibt und wie Sie sie nach einem Neustart fortsetzen.
- [Kontext löschen](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  Ersetzen der Unterhaltung innerhalb einer Sitzung, ohne eine neue zu erstellen.
- [Authentifizierung](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  die Anmeldeinformationen, die ein Client verwenden kann, sobald Sie über `copilot login` hinausgehen.

Fahren Sie mit [Schritt 2: Eine Antwort streamen](02-streaming.md) fort.
