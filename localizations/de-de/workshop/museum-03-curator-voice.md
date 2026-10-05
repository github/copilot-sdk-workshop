# Schritt 3: Dem Kurator eine Stimme geben

> **Dauer:** 10 Minuten

## Was Sie erstellen

Derselbe Streaming-Aufruf und dasselbe Thema — aber die Antwort klingt jetzt nach Museum statt nach
Chatbot. Sie geben der Sitzung eine [Systemnachricht](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)
und schalten die Sitzung in den Replace-Modus. Außerdem bitten Sie um fünf Sätze statt um zwei,
damit genügend Text vorhanden ist, um den Unterschied zu hören.

Dies ist der erste Teil einer **anwendungseigenen Richtlinie**. Der Prompt gehört zu den
Aufgabendaten, die sich bei jedem Lauf ändern. Die Systemnachricht ist eine dauerhafte Festlegung
dazu, wer dieser Agent ist, worüber er sprechen darf und welche Form seine Ausgabe hat.

## Replace-Modus und was eine Systemnachricht kann und nicht kann

Die meisten SDK-Sitzungen starten mit einer allgemeinen Persona für Coding-Assistenten. Der
`replace`-Modus verwirft sie und installiert Ihre eigene, sodass der Kurator kein Coding-Assistent
mit Museumshut ist. Verwenden Sie `append`, wenn Sie die Standardpersona erweitern möchten;
verwenden Sie `replace`, wenn die Standardpersona für die Aufgabe falsch ist. Für einen
Museumskurator ist sie falsch.

Es gibt einen dritten Modus. `customize` überschreibt einzelne Abschnitte des vom SDK verwalteten
Prompts – Tonfall, Richtlinien, Regeln für Codeänderungen und andere –, während der Rest erhalten
bleibt. So können Sie bestimmte Teile ändern, ohne alles noch einmal auszuformulieren. Verwenden Sie
ihn, wenn der Standardprompt größtenteils passt und nur wenige Abschnitte nicht passen. Im
Standardmodus `append` fügt das SDK Umgebungskontext, Tool-Anweisungen und Sicherheitsleitplanken
automatisch ein, und die CLI-Persona bleibt erhalten; `replace` gibt Ihnen die volle Kontrolle und
verzichtet auf diese Abschnitte. Deshalb nennt die Nachricht, die Sie gleich verwenden, ihren
eigenen Umfang und ihre Grenzen ausdrücklich.

Eine Systemnachricht ist **eine Leitlinie, keine Durchsetzung**. Sie prägt Tonfall, Umfang und
Struktur und hält das Modell deutlich davon ab, abzuschweifen. Sie kann keinen Tool-Aufruf stoppen,
keine Ausführungsdauer begrenzen und nicht beweisen, dass eine Aussage wahr ist. Dafür braucht es
die Zulassungsliste, ein Timeout und Validierung – die Schritte 4 und 5.

## Was die Systemnachricht des Kurators sagt

Die Runtime sendet die Systemnachricht vor jedem Prompt in der Sitzung. Ein Prompt ist eine einzelne
Anfrage; die Systemnachricht ist die dauerhafte Anweisung, unter der jede Anfrage beantwortet wird.
Dies ist die Systemnachricht, unter der der Kurator ab diesem Schritt läuft:

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

Jeder Absatz hat eine Aufgabe:

- **Rolle.** Die erste Zeile macht das Modell zu einem Kurator. Im replace-Modus ist sie die einzige verbliebene Persona.
- **Stimme.** Der zweite Absatz legt Zielgruppe und Tonfall fest.
- **Umfang.** Der dritte Absatz schließt Softwarethemen und Gespräche über die eigenen Anweisungen aus und
  weist den Kurator an, keinen Zugriff zu behaupten, den er nicht hat.
- **Ausgabe.** Der letzte Absatz sorgt dafür, dass der Kurator die Struktur befolgt, die ein Prompt verlangt, und
  nichts darum herum ausgibt.

Die Nachricht sagt nichts darüber, woher Fakten stammen, deshalb schreibt der Kurator vorerst aus
dem Modellgedächtnis. Schritt 4 schließt diese Lücke mit einem Tool, das der Anwendung gehört, und
einem Prompt, der dem Kurator vorgibt, es zu verwenden.

## Der Sitzung die Systemnachricht des Kurators geben

Die Nachricht ist lang, und sie ist Text, der der Anwendung gehört, statt Code, den Sie tippen
müssen. Deshalb liegt sie zusammen mit den anderen Systemnachrichten in einer vorgefertigten
Hilfsdatei. Ihre Aufgabe in diesem Schritt ist die Konfiguration: eine Einstellung, die die
Nachricht im replace-Modus installiert.

:::language dotnet
Öffnen Sie `Program.cs`. In diesem Schritt ändert sich eine Region.

Die obige Nachricht ist bereits als `CuratorSystemMessages.Curator` in
`Helpers/CuratorSystemMessages.cs` für Sie geschrieben.

**REPLACE** in der Region `generate` in `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true,
        SystemMessage = new SystemMessageConfig
        {
            Mode = SystemMessageMode.Replace,
            Content = CuratorSystemMessages.Curator
        }
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine `SystemMessage` im
replace-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei
an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was
Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `Helpers/CuratorSystemMessages.cs` enthält alle Systemnachrichten, die diese
Anwendung verwendet, sodass der lange Text aus `Program.cs` herausbleibt. `Curator` ist die
Nachricht, die Sie gerade an die Sitzung übergeben haben. `CuratorWithResearch` und `Research` sind
für Schritt 6 vorhanden. Der Streaming-Aufruf und sein 120-Sekunden-Standardwert stammen beide aus
`Helpers/CuratorStreamer.cs`, wo `GenerationTimeout` und `ResearchTimeout` deklariert sind.
:::

:::language nodejs
Öffnen Sie `src/index.ts`. In diesem Schritt ändern sich zwei Regionen.

Die obige Nachricht ist bereits als `curatorSystemMessage` in `src/system-messages.ts` für Sie
geschrieben.

**REPLACE** in der Region `imports` in `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

Eine neue Zeile: der Import aus `./system-messages.js`.

**REPLACE** in der Region `generate` in `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
      systemMessage: { mode: "replace", content: curatorSystemMessage },
    });

    await streamExhibit(
      session,
      "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine `systemMessage` im
replace-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei
an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was
Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `src/system-messages.ts` enthält alle Systemnachrichten, die diese Anwendung
verwendet, sodass der lange Text aus `src/index.ts` herausbleibt. `curatorSystemMessage` ist die
Nachricht, die Sie gerade an die Sitzung übergeben haben. `curatorWithResearchSystemMessage` und
`researchSystemMessage` sind für Schritt 6 vorhanden. `streamExhibit` und sein
120-Sekunden-Standardwert, `generationTimeoutMs`, sind beide in `src/curator.ts` deklariert,
zusammen mit dem 90-sekündigen `researchTimeoutMs`, das Schritt 6 verwendet.
:::

:::language python
Öffnen Sie `main.py`. In diesem Schritt ändern sich zwei Regionen.

Die obige Nachricht ist bereits als `CURATOR_SYSTEM_MESSAGE` in `system_messages.py` für Sie geschrieben.

**REPLACE** in der Region `imports` in `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

Eine neue Zeile: der Import aus `system_messages`.

**REPLACE** in der Region `generate` in `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
                system_message={"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
            ) as session:
                await stream_exhibit(
                    session,
                    "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine `system_message` im
replace-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei
an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was
Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `system_messages.py` enthält alle Systemnachrichten, die diese Anwendung
verwendet, sodass der lange Text aus `main.py` herausbleibt. `CURATOR_SYSTEM_MESSAGE` ist die
Nachricht, die Sie gerade an die Sitzung übergeben haben. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` und
`RESEARCH_SYSTEM_MESSAGE` sind für Schritt 6 vorhanden. `stream_exhibit` und sein
120-Sekunden-Standardwert, `GENERATION_TIMEOUT_SECONDS`, sind beide in `curator.py` deklariert,
zusammen mit dem 90-sekündigen `RESEARCH_TIMEOUT_SECONDS`, das Schritt 6 verwendet.
:::

:::language go
Öffnen Sie `main.go`. In diesem Schritt ändert sich eine Region.

Die obige Nachricht ist bereits als `CuratorSystemMessage` in `system_messages.go` für Sie
geschrieben; die Datei liegt im selben `main`-Paket.

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
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write five sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine `SystemMessage` im
replace-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei
an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was
Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `system_messages.go` enthält alle Systemnachrichten, die diese Anwendung
verwendet, sodass der lange Text aus `main.go` herausbleibt. `CuratorSystemMessage` ist die
Nachricht, die Sie gerade an die Sitzung übergeben haben. `CuratorWithResearchSystemMessage` und
`ResearchSystemMessage` sind für Schritt 6 vorhanden. `GenerationTimeout` ist die
120-Sekunden-Konstante, die neben `StreamExhibit` in `curator.go` deklariert ist, zusammen mit dem
90-sekündigen `ResearchTimeout`, das Schritt 6 verwendet.
:::

:::language rust
Öffnen Sie `src/main.rs`. In diesem Schritt ändern sich zwei Regionen.

Die obige Nachricht ist bereits als `CURATOR_SYSTEM_MESSAGE` in `src/system_messages.rs` für Sie
geschrieben; die Crate `museum_exhibit_studio` exportiert sie erneut.

**REPLACE** in der Region `imports` in `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

**REPLACE** in der Region `generate` in `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Zwei neue Namen in `imports`: `SystemMessageConfig` aus dem SDK und `CURATOR_SYSTEM_MESSAGE` aus der
Crate. Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine `system_message` im
replace-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei
an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was
Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `src/system_messages.rs` enthält alle Systemnachrichten, die diese Anwendung
verwendet, sodass der lange Text aus `src/main.rs` herausbleibt. `CURATOR_SYSTEM_MESSAGE` ist die
Nachricht, die Sie gerade an die Sitzung übergeben haben. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` und
`RESEARCH_SYSTEM_MESSAGE` sind für Schritt 6 vorhanden. `GENERATION_TIMEOUT` ist die
120-Sekunden-Konstante, die neben `stream_exhibit` in `src/lib.rs` deklariert ist, zusammen mit dem
90-sekündigen `RESEARCH_TIMEOUT`, das Schritt 6 verwendet.
:::

:::language java
Öffnen Sie `src/main/java/workshop/MuseumExhibitStudio.java`. In diesem Schritt ändern sich zwei Regionen.

Die obige Nachricht ist bereits als `CuratorSystemMessages.CURATOR` in `CuratorSystemMessages.java` geschrieben, direkt neben Ihrer Datei.

**REPLACE** in der Region `imports` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

**REPLACE** in der Region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)
                        .setSystemMessage(new SystemMessageConfig()
                                .setMode(SystemMessageMode.REPLACE)
                                .setContent(CuratorSystemMessages.CURATOR))).get();

                CuratorStreamer.streamExhibit(session,
                        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Zwei neue Importe: `SystemMessageMode` und `SystemMessageConfig`. Zwei Änderungen in `generate`. Die Sitzungskonfiguration erhält eine Systemnachricht im `replace`-Modus, mit der vorgefertigten Nachricht als Inhalt. Der Prompt fordert fünf Sätze statt zwei an, damit genug Text vorhanden ist, um die Stimme zu hören. Alles andere in der Region ist das, was Schritt 2 dort hinterlassen hat.

**Ein Blick hinein:** `CuratorSystemMessages.java` enthält alle Systemnachrichten, die diese Anwendung verwendet, sodass der lange Text aus Ihrem Einstiegspunkt herausbleibt. `CURATOR` ist die Nachricht, die Sie gerade an die Sitzung übergeben haben. `CURATOR_WITH_RESEARCH` und `RESEARCH` sind für Schritt 6 vorhanden. Der `CuratorStreamer.streamExhibit`-Aufruf mit zwei Argumenten, den Sie verwenden, wendet `GENERATION_TIMEOUT` an, die 120-Sekunden-Konstante, die in `CuratorStreamer.java` deklariert ist, zusammen mit `RESEARCH_TIMEOUT`, der 90-sekündigen Konstante, die Schritt 6 verwendet.
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

Der Ton ändert sich sichtbar. Vergleichen Sie eine Antwort aus Schritt 2 mit einer Antwort aus Schritt 3:

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath. A third kept watch from
        lunar orbit. They stayed on the surface for less than a day. What they carried home was
        small: rock, film, and a new sense of how far people could go.
```

Die Antwort ist länger, weil Sie fünf Sätze angefordert haben. Achten Sie auf die Stimme: Die
Vorbemerkung verschwindet, das Register wird gehobener, und die Antwort bietet nicht mehr an,
weiterzuhelfen.

## Den Prompt ändern

Testen Sie nun den Absatz zum Umfang mit einer Frage, die der standardmäßige Coding-Assistent gerne
beantworten würde. Ändern Sie in Ihrer Region `generate` den Prompt-Text in:

```text
Tell me about how git worktrees work.
```

Führen Sie es erneut aus. Ihre genaue Formulierung wird abweichen, aber der Kurator lehnt ab und
lenkt zurück zur Ausstellungsarbeit, statt git zu erklären. Die Systemnachricht hat ihm vorgegeben,
nicht über Softwareentwicklung, Programmierung, Terminals oder Repositorys zu sprechen, und im
replace-Modus bleibt keine Coding-Persona übrig, die antworten könnte.

Nichts in der Runtime hat diese Ablehnung erzwungen. Das Modell hat diese Leitlinie befolgt, und
Leitlinien prägen Verhalten, ohne etwas zu autorisieren oder zu verbieten. Behalten Sie diese
Unterscheidung für Schritt 4 im Blick, und setzen Sie den Prompt anschließend wieder auf den
Apollo-11-Text mit fünf Sätzen zurück.

## Verständnis prüfen

- Warum `replace` statt `append` für diesen Agenten?
- Nennen Sie eine Sache, die die Systemnachricht zuverlässig verbessert, und eine Sache, die sie nicht garantieren kann.
- Die Systemnachricht legt Stimme und Umfang des Kurators fest, sagt aber nichts über Quellen. Woher bezieht
  das Modell die Apollo-11-Details gerade, und warum ist das für ein Museum ein Problem?

## Weitere Informationen

- [SDK- und CLI-Kompatibilität](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  bestätigt, dass `systemMessage` sowohl append als auch replace unterstützt und was jedes SDK außerdem verfügbar macht.
- [Benutzerdefinierte Agenten](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md):
  einem benannten Agenten eine eigene Systemnachricht und eigene, abgegrenzte Tools geben.
- [Benutzerdefinierte Skills](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  dauerhafte Anweisungen als wiederverwendbare Module verpacken, statt als eine lange Nachricht.

Weiter mit [Auf freigegebene Fakten stützen](museum-04-approved-facts.md).
