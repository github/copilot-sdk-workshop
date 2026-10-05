# Étape 2 : Diffusez une réponse en streaming

> **Durée :** 10 minutes

## Ce que vous verrez

Vous allez configurer une session avec streaming activé et rendre la complétion visible. La plupart
des parcours de langage affichent le texte de réponse pendant que la session travaille encore. Le
parcours Java active la même configuration de session en streaming et affiche le message complet de
l'assistant renvoyé par `sendAndWait`.

## En quoi le streaming change l'expérience

[**Le streaming**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)
ne change pas la réponse. Il change le moment où une application abonnée au flux d'événements la
reçoit. Au lieu d'attendre un message terminé, la session émet des événements tout au long du tour :

- Les événements delta de message de l'assistant contiennent chaque nouveau fragment du texte de réponse.
- L'événement de message de l'assistant terminé contient le message complet.
- Un événement de session inactive signifie que le tour et tout travail d'outil sont terminés.
- Un événement d'erreur de session signale un tour en échec.

## Pourquoi la sortie progressive est plus agréable

Voir le texte arriver rend l'application plus réactive. Plus tard, le même flux d'événements
affichera l'activité des outils locaux et MCP.

Le flux de session est désormais `response deltas -> final message -> idle`.

:::language dotnet
## Diffusez la réponse en streaming en C#

### 1. Ajoutez l'utilitaire de streaming

Créez `Helpers/ResponseStreamer.cs` :

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

Le cas du message final traite un runtime qui se termine sans envoyer de deltas. Une erreur termine
la tâche avec une exception au lieu de ressembler à un tour réussi.

### 2. Utilisez l'utilitaire

Dans `Program.cs`, ajoutez `using HelloCopilotSDK.Helpers;`, puis remplacez le code de session et de
réponse par :

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

## Exécutez-le

```bash
dotnet run
```

Les puces doivent commencer à apparaître progressivement avant que le processus ne se termine :

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Le texte apparaît seulement à la fin | Vérifiez que `Streaming = true` se trouve dans le `SessionConfig` de cette session. |
| L'application se termine avant que le texte apparaisse | Vérifiez que l'utilitaire attend `completed.Task` après `SendAsync`. |
| Le texte est affiché deux fois | Conservez la garde `when !receivedDelta` sur `AssistantMessageEvent`. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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
## Diffusez la réponse en streaming en TypeScript

### 1. Inspectez l'utilitaire de streaming

Ouvrez `src/workshop.ts`. Le projet de départ exporte déjà `streamResponse`, qui s'abonne avec
`session.on`, affiche les deltas de l'assistant, conserve un recours au message final, rejette les
erreurs de session, et se résout quand la session est inactive :

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

Les branches de démarrage et de fin d'outil restent silencieuses dans cette étape et deviendront
utiles une fois que vous aurez enregistré des outils plus tard.

### 2. Intégrez l'utilitaire au point d'entrée

Remplacez `src/index.ts` par :

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

## Exécutez-le

```bash
npm start
```

La réponse d'une phrase doit commencer à apparaître progressivement via le callback d'événement :

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Le texte apparaît seulement à la fin | Vérifiez que `streaming: true` est passé à `createSession`. |
| Le processus se termine avant que le texte apparaisse | Vérifiez que `streamResponse` attend `session.idle` avant de se résoudre. |
| Le texte est affiché deux fois | Conservez la garde `!receivedDelta` sur la branche `assistant.message`. |
| Impossible de trouver le module `./workshop.js` | Importez l'utilitaire sous la forme `./workshop.js` même si le fichier source est `workshop.ts`. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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
## Diffusez la réponse en streaming en Python

### 1. Abonnez-vous aux événements de session

Remplacez `main.py` par un point d'entrée async qui active le streaming, traite
`AssistantMessageDeltaData`, conserve un recours `AssistantMessageData`, expose `SessionErrorData`
et attend `SessionIdleData` :

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

Le cas du message final traite un runtime qui se termine sans deltas. Une erreur de session définit
`error` et termine l'attente afin que le tour ne paraisse pas réussi.

## Exécutez-le

```bash
python main.py
```

Les puces doivent commencer à apparaître progressivement via le callback d'événement :

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Le texte apparaît seulement à la fin | Vérifiez que `streaming=True` est passé à `create_session`. |
| Le processus se termine avant que le texte apparaisse | Vérifiez que vous exécutez `await done.wait()` après `session.send`. |
| Le texte est affiché deux fois | Conservez la garde `not received_delta` sur `AssistantMessageData`. |
| Erreurs d'importation pour les événements de session | Importez les types d'événements depuis `copilot.session_events`. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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
## Diffusez la réponse en streaming en Go

### 1. Ajoutez l'utilitaire de streaming

Dans `main.go`, remplacez le contenu du package par un utilitaire `streamResponse` qui s'abonne avec
`session.On`, affiche `AssistantMessageDeltaData`, conserve un recours `AssistantMessageData` après
`SendAndWait` et renvoie les erreurs d'envoi :

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

### 2. Créez une session en streaming et appelez l'utilitaire

Ajoutez `main` sous l'utilitaire :

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

## Exécutez-le

```bash
go run .
```

Les puces doivent commencer à apparaître progressivement via le callback d'événement :

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Le texte apparaît seulement à la fin | Vérifiez que `Streaming: copilot.Bool(true)` est défini sur `SessionConfig`. |
| Le processus se termine sans sortie | Vérifiez que `streamResponse` utilise `SendAndWait` et renvoie son erreur. |
| Le texte est affiché deux fois | Conservez la garde `!receivedDelta` avant d'afficher `AssistantMessageData`. |
| Erreurs de chemin d'importation | Utilisez `copilot "github.com/github/copilot-sdk/go"`. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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
## Diffusez la réponse en streaming en Rust

### 1. Ajoutez la macro utilitaire de streaming

Remplacez `src/main.rs` par une macro `stream_response!` qui appelle `session.subscribe()`, affiche
les deltas de l'assistant avec `tokio::select!`, conserve un recours au message final et attend que
l'envoi soit terminé et que `session.idle` se soit produit :

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

### 2. Créez une session en streaming et invoquez la macro

Ajoutez le point d'entrée async sous la macro :

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

## Exécutez-le

```bash
cargo run
```

Les puces doivent commencer à apparaître progressivement via l'abonnement aux événements :

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Le texte apparaît seulement à la fin | Vérifiez `config.streaming = Some(true)` avant `create_session`. |
| Le processus se termine avant que le texte apparaisse | Conservez la boucle `while !sent \|\| !idle` et attendez `session.idle`. |
| Le texte est affiché deux fois | Conservez la garde `if !received_delta` sur `"assistant.message"`. |
| La sortie semble mise en mémoire tampon | Videz stdout après chaque `print!` du contenu delta. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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
## Diffusez la réponse en streaming en Java

### 1. Activez le streaming sur la session

L'implémentation du SDK Java utilise un `SessionConfig` avec streaming activé et `sendAndWait`, puis
affiche le message complet de l'assistant. Remplacez
`src/main/java/workshop/AccessibilityReport.java` par :

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

`setStreaming(true)` maintient cette étape alignée avec les autres parcours de langage.
L'implémentation Java attend la réponse terminée de `sendAndWait` et affiche ce message complet
lorsque le tour se termine.

## Exécutez-le

```bash
./mvnw compile exec:java
```

La réponse terminée doit s'afficher avant que le processus ne se termine :

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Aucune réponse n'est affichée | Vérifiez que `setStreaming(true)` est activé sur `SessionConfig` et que vous appelez `sendAndWait`. |
| Le processus échoue avec une réponse null | Conservez la garde `response == null` et levez une exception lorsque le tour se termine sans message. |
| Maven ne trouve pas la classe principale | Exécutez depuis le dossier du projet de départ avec `./mvnw compile exec:java`. |

</details>

> **Vous êtes prêt à ajouter des outils quand :** le chemin de réponse configuré affiche une réponse et termine
> le tour sans masquer les erreurs de session.

<details>
<summary>Implémentation complète de l'étape 2</summary>

Comparez votre travail avec cette implémentation complète de l'étape 2.

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

## Vérifiez votre compréhension

Dans quel cas un envoi avec réponse complète serait-il préférable au streaming d'événements ?

<details>
<summary>Vérifiez votre réponse</summary>

Utilisez un envoi avec réponse complète pour le travail en arrière-plan ou du code simple de
requête/réponse qui n'a pas besoin de sortie progressive ni d'événements intermédiaires.

</details>

## En savoir plus

- [Pilotage et mise en file d'attente](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  envoi d'un autre message pendant qu'un tour est encore en cours, soit pour le rediriger, soit pour mettre du travail en file d'attente.
- [Limites de session](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  définition d'un budget d'AI Credits pour une session avant qu'elle commence à produire des tokens.
- [Métriques d'utilisation et de facturation](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  lecture du nombre de tokens, de l'utilisation de la fenêtre de contexte et du coût à partir du même flux d'événements.

Continuez avec [Étape 3 : Ajoutez des connaissances propres à l'application](03-local-tool.md).
