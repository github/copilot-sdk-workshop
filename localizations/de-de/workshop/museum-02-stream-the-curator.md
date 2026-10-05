# Schritt 2: Die Antwort des Kurators streamen

> **Dauer:** 10 Minuten

## Was Sie erstellen

Derselbe Prompt, aber die Antwort erscheint Wort für Wort, statt nach einer stillen Pause einzutreffen.

Sie schreiben keine Ereignisschleife. Das Starterprojekt liefert bereits einen Streaming-Drucker in
den vorgefertigten Kurator-Hilfsfunktionen mit: Er abonniert
[Sitzungsereignisse](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md),
schreibt jedes Delta in die Standardausgabe, meldet Tool-Aktivität, schlägt bei Sitzungsfehlern
fehl, erzwingt ein Timeout, meldet sich auf jedem Pfad ab und gibt den vollständigen Text zurück,
den er gesammelt hat. Ihre Aufgabe ist es, Streaming einzuschalten und ihn aufzurufen.

## Warum Streaming für einen Kurator wichtig ist

Ausstellungstext ist Prosa, die ein Mensch lesen und beurteilen muss. Wenn Sie zusehen, wie er
entsteht, erkennen Sie sofort, ob der Ton stimmt, ob das Modell auffüllt und ob es vom Thema
abdriftet — lange bevor der Lauf endet. Streaming gibt Ihnen außerdem eine Stelle, an der Sie
Tool-Aufrufe bemerken können; das ist ab Schritt 4 wichtig, wenn der Kurator das Fakten-Tool der
Anwendung aufrufen muss, bevor er etwas schreiben kann.

Die Hilfsfunktion gibt die ganze Antwort als Zeichenfolge zurück, sodass Sie ab hier immer den
fertigen Text prüfen können, nachdem der Stream endet.

## Blockierenden Aufruf durch den Streamer ersetzen

:::language dotnet
Öffnen Sie `Program.cs`. In diesem Schritt ändert sich eine Region.

**REPLACE** in der Region `generate` in `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Zwei Änderungen: `Streaming = true` in der Sitzungskonfiguration und
`CuratorStreamer.StreamExhibitAsync` anstelle von `SendAndWaitAsync` und den Zeilen, die dessen
Antwort ausgegeben haben. Der Berechtigungshandler aus Schritt 1 bleibt genau dort, wo er war. Die
Hilfsfunktion befindet sich in `Helpers/CuratorStreamer.cs`, und Sie bearbeiten sie nie.

**Ein Blick hinein:** Öffnen Sie `Helpers/CuratorStreamer.cs` und lesen Sie `StreamExhibitAsync`
einmal. Es ist die SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen,
wie Streaming tatsächlich funktioniert. Sie abonniert mit `session.On<SessionEvent>`, hängt jeden
`AssistantMessageDeltaEvent`-Chunk an und schreibt ihn in dem Moment, in dem er eintrifft, gibt für
jedes `ToolExecutionStartEvent` eine `[tool:start]`-Zeile und für jedes `ToolExecutionCompleteEvent`
eine `[tool:done]`-Zeile aus, schließt bei `SessionIdleEvent` ab und schlägt bei `SessionErrorEvent`
fehl. Ein `Task.Delay`-Rennen verwandelt das Timeout in eine `TimeoutException`, und das Abonnement
wird auf jedem Pfad freigegeben.
:::

:::language nodejs
Öffnen Sie `src/index.ts`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

**REPLACE** in der Region `generate` in `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
    });

    await streamExhibit(
      session,
      "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Zwei Änderungen in `generate`: `streaming: true` in der Sitzungskonfiguration und `streamExhibit`
anstelle von `sendAndWait` und der Zeile, die dessen Antwort ausgegeben hat. Der
Berechtigungshandler aus Schritt 1 bleibt genau dort, wo er war. Die Hilfsfunktion befindet sich in
`src/curator.ts`, und Sie bearbeiten sie nie.

**Ein Blick hinein:** Öffnen Sie `src/curator.ts` und lesen Sie `streamExhibit` einmal. Es ist die
SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen, wie Streaming
tatsächlich funktioniert. Sie abonniert mit `session.on`, schreibt jeden
`assistant.message_delta`-Chunk in die Standardausgabe, sobald er eintrifft, gibt für jedes
`tool.execution_start`-Ereignis eine `[tool:start]`-Zeile und für jedes
`tool.execution_complete`-Ereignis eine `[tool:done]`-Zeile aus, löst ihr Promise bei `session.idle`
auf und lehnt bei `session.error` ab. Ein `setTimeout` lehnt ab, wenn keines von beiden je
eintrifft, und `finish` meldet sich auf jedem Pfad ab.
:::

:::language python
Öffnen Sie `main.py`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

**REPLACE** in der Region `generate` in `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
            ) as session:
                await stream_exhibit(
                    session,
                    "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

Der gesamte Ereignis-Listener aus Schritt 1 schrumpft auf einen Aufruf zusammen. `stream_exhibit`
befindet sich in `curator.py`, führt bereits das Matching für `AssistantMessageDeltaData`,
`SessionErrorData` und `SessionIdleData` aus, und Sie bearbeiten es nie.

**Ein Blick hinein:** Öffnen Sie `curator.py` und lesen Sie `stream_exhibit` einmal. Es ist die
SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen, wie Streaming
tatsächlich funktioniert. Sie abonniert mit `session.on`, gibt jeden
`AssistantMessageDeltaData`-Chunk in dem Moment aus, in dem er eintrifft, gibt für jedes
`ToolExecutionStartData` eine `[tool:start]`-Zeile und für jedes `ToolExecutionCompleteData` eine
`[tool:done]`-Zeile aus, setzt ihr `done`-Ereignis bei `SessionIdleData` und löst `SessionErrorData`
erneut als `RuntimeError` aus. `asyncio.wait_for` wendet das Timeout an, und ein `finally`-Block
meldet sich auf jedem Pfad ab.
:::

:::language go
Öffnen Sie `main.go`. In diesem Schritt ändert sich eine Region.

**REPLACE** in der Region `generate` in `main.go`:

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
		Streaming:           copilot.Bool(true),
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write two sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Zwei Änderungen: `Streaming: copilot.Bool(true)` in der Sitzungskonfiguration und `StreamExhibit`
anstelle von `SendAndWait` und den Zeilen, die dessen Antwort ausgegeben haben. Der
Berechtigungshandler aus Schritt 1 bleibt genau dort, wo er war. Die Hilfsfunktion befindet sich in
`curator.go`, und Sie bearbeiten sie nie.

**Ein Blick hinein:** Öffnen Sie `curator.go` und lesen Sie `StreamExhibit` einmal. Es ist die
SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen, wie Streaming
tatsächlich funktioniert. Sie abonniert mit `session.On`, gibt jeden
`AssistantMessageDeltaData`-Chunk in dem Moment aus, in dem er eintrifft, gibt für jedes
`ToolExecutionStartData` eine `[tool:start]`-Zeile und für jedes `ToolExecutionCompleteData` eine
`[tool:done]`-Zeile aus und zeichnet jedes `SessionErrorData` auf, um es als Fehler zurückzugeben.
Anschließend wartet sie auf `session.SendAndWait` innerhalb eines `context.WithTimeout`, das aus dem
übergebenen Timeout erstellt wird, und ein verzögertes `unsubscribe` wird auf jedem Pfad ausgeführt.
:::

:::language rust
Öffnen Sie `src/main.rs`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `imports` in `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

**REPLACE** in der Region `generate` in `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Zwei Änderungen in `generate`: `config.streaming = Some(true)` und `stream_exhibit` anstelle von
`send_and_wait` und den Zeilen, die dessen Antwort ausgegeben haben. Der Berechtigungshandler aus
Schritt 1 bleibt genau dort, wo er war. Sowohl `stream_exhibit` als auch `GENERATION_TIMEOUT` kommen
aus dem `museum_exhibit_studio`-Crate in `src/lib.rs`, und Sie bearbeiten es nie.

**Ein Blick hinein:** Öffnen Sie `src/lib.rs` und lesen Sie `stream_exhibit` einmal. Es ist die
SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen, wie Streaming
tatsächlich funktioniert. Sie abonniert mit `session.subscribe`, gibt jeden
`assistant.message_delta`-Chunk aus und leert den Puffer in dem Moment, in dem er eintrifft, gibt
für jedes `tool.execution_start`-Ereignis eine `[tool:start]`-Zeile und für jedes
`tool.execution_complete`-Ereignis eine `[tool:done]`-Zeile aus, beendet bei `session.idle` und gibt
bei `session.error` einen Fehler zurück. Sie pollt den Sendefuture, den Ereignisstream und eine
Frist gemeinsam, sodass das übergebene Timeout auch gilt, wenn nie ein Ereignis eintrifft.
:::

:::language java
Öffnen Sie `src/main/java/workshop/MuseumExhibitStudio.java`. In diesem Schritt ändert sich eine Region.

**REPLACE** in der Region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)).get();

                CuratorStreamer.streamExhibit(session,
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Zwei Änderungen: `setStreaming(true)` in der Sitzungskonfiguration und `CuratorStreamer.streamExhibit` anstelle von `sendAndWait` und den Zeilen, die dessen Antwort ausgegeben haben. Der Berechtigungshandler aus Schritt 1 bleibt genau dort, wo er war. Die Hilfsfunktion befindet sich in `CuratorStreamer.java` neben Ihrer Datei, und Sie bearbeiten sie nie.

**Ein Blick hinein:** Öffnen Sie `CuratorStreamer.java` und lesen Sie `streamExhibit` einmal. Es ist die SDK-Ereignisschleife, und dies ist die klarste Stelle im Workshop, um zu sehen, wie Streaming tatsächlich funktioniert. Sie registriert je Ereignistyp einen Listener: `AssistantMessageDeltaEvent` gibt jeden Chunk aus und sammelt ihn, sobald er eintrifft, `ToolExecutionStartEvent` und `ToolExecutionCompleteEvent` geben die `[tool:start]`- und `[tool:done]`-Zeilen aus, `SessionIdleEvent` beendet die Zeile, und `SessionErrorEvent` wird erfasst und erneut ausgelöst. Das übergebene Timeout geht in Millisekunden an `session.sendAndWait`, und jedes Abonnement wird in einem `finally`-Block geschlossen.
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

Die gleiche Art von Antwort erscheint, aber dieses Mal sehen Sie beim Schreiben zu:

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

Der Text wächst an Ort und Stelle, statt auf einmal zu erscheinen, und das Programm beendet sich
kurz nach dem letzten Wort. Wenn Sie bis ganz zum Schluss nichts sehen, streamt die Sitzung nicht —
prüfen Sie, ob Sie das Streaming-Flag in der Sitzungskonfiguration gesetzt haben.

## Verständnis prüfen

- Streaming wird konzeptionell an zwei Stellen eingeschaltet: in der Sitzungskonfiguration und im Code, der
  Ereignisse liest. Welche haben Sie geschrieben, und welche gehörte bereits der Hilfsfunktion?
- Die Hilfsfunktion gibt den vollständigen Antworttext zurück, obwohl sie ihn auch ausgegeben hat. Warum wird dieser Rückgabewert
  in Schritt 5 wichtig sein?
- Wenn das Modell nie inaktiv wird, was hält Ihr Programm davon ab, ewig zu warten?

## Weitere Informationen

- [Steuerung und Warteschlangen](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  eine weitere Nachricht senden, während ein Turn noch gestreamt wird, statt auf sein Ende zu warten.
- [Nutzungs- und Abrechnungsmetriken](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  Tokenanzahlen und Kosten aus denselben Ereignissen lesen, die der Drucker bereits abonniert hat.
- [Kontextbereinigung](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  eine Unterhaltung innerhalb einer Sitzung ersetzen, die Sie weiter verwenden möchten.

Weiter mit [Dem Kurator eine Stimme geben](museum-03-curator-voice.md).
