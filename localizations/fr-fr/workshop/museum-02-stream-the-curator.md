# Étape 2 : Diffusez la réponse du conservateur en streaming

> **Durée :** 10 minutes

## Ce que vous allez créer

Le même prompt, mais la réponse apparaît mot à mot au lieu d'arriver après une pause silencieuse.

Vous n'écrirez pas de boucle d'événements. Le projet de départ fournit déjà un afficheur de
streaming dans les utilitaires de conservateur fournis : il s'abonne aux
[événements de session](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md),
écrit chaque delta sur la sortie standard, signale l'activité des outils, échoue en cas d'erreurs de
session, applique un délai d'expiration, se désabonne dans tous les chemins d'exécution et renvoie
le texte complet qu'il a accumulé. Votre travail consiste à activer le streaming et à l'appeler.

## Pourquoi le streaming compte pour un conservateur

Le texte d'exposition est une prose qu'un humain doit lire et juger. Le voir arriver vous indique
immédiatement si le style est juste, si le modèle fait du remplissage et s'il s'éloigne du sujet —
bien avant la fin de l'exécution. Le streaming vous donne aussi un point d'observation pour
remarquer les appels d'outil, ce qui compte à partir de l'Étape 4, quand le conservateur doit
appeler l'outil de faits de l'application avant de pouvoir écrire quoi que ce soit.

L'utilitaire renvoie toute la réponse sous forme de chaîne, donc à partir d'ici vous disposez
toujours du texte final à inspecter après la fin du flux.

## Remplacez l'appel bloquant par l'utilitaire de streaming

:::language dotnet
Ouvrez `Program.cs`. Une région est modifiée dans cette étape.

**REPLACE** dans la région `generate` de `Program.cs` :

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

Deux changements : `Streaming = true` dans la configuration de session, et
`CuratorStreamer.StreamExhibitAsync` à la place de `SendAndWaitAsync` et des lignes qui affichaient
sa réponse. Le gestionnaire d'autorisations de l'Étape 1 reste exactement là où il était.
L'utilitaire se trouve dans `Helpers/CuratorStreamer.cs` et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `Helpers/CuratorStreamer.cs` et lisez `StreamExhibitAsync` une fois.
C'est la boucle d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment
le streaming fonctionne réellement. Il s'abonne avec `session.On<SessionEvent>`, ajoute et écrit
chaque fragment `AssistantMessageDeltaEvent` dès son arrivée, affiche une ligne `[tool:start]` pour
chaque `ToolExecutionStartEvent` et une ligne `[tool:done]` pour chaque
`ToolExecutionCompleteEvent`, se termine sur `SessionIdleEvent` et échoue sur `SessionErrorEvent`.
Une mise en concurrence avec `Task.Delay` transforme le délai d'expiration en `TimeoutException`, et
l'abonnement est libéré dans tous les chemins d'exécution.
:::

:::language nodejs
Ouvrez `src/index.ts`. Deux régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `src/index.ts` :

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

**REPLACE** dans la région `generate` de `src/index.ts` :

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

Deux changements dans `generate` : `streaming: true` dans la configuration de session, et
`streamExhibit` à la place de `sendAndWait` et de la ligne qui affichait sa réponse. Le gestionnaire
d'autorisations de l'Étape 1 reste exactement là où il était. L'utilitaire se trouve dans
`src/curator.ts` et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `src/curator.ts` et lisez `streamExhibit` une fois. C'est la boucle
d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment le streaming
fonctionne réellement. Il s'abonne avec `session.on`, écrit chaque fragment
`assistant.message_delta` sur la sortie standard dès son arrivée, affiche une ligne `[tool:start]`
pour chaque événement `tool.execution_start` et une ligne `[tool:done]` pour chaque événement
`tool.execution_complete`, résout sa promesse sur `session.idle` et la rejette sur `session.error`.
Un `setTimeout` rejette si aucun des deux n'arrive jamais, et `finish` se désabonne dans tous les
chemins d'exécution.
:::

:::language python
Ouvrez `main.py`. Deux régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `main.py` :

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

**REPLACE** dans la région `generate` de `main.py` :

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

Tout l'écouteur d'événements de l'Étape 1 se résume à un seul appel. `stream_exhibit` se trouve dans
`curator.py`, effectue déjà la correspondance sur `AssistantMessageDeltaData`, `SessionErrorData` et
`SessionIdleData`, et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `curator.py` et lisez `stream_exhibit` une fois. C'est la boucle
d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment le streaming
fonctionne réellement. Il s'abonne avec `session.on`, affiche chaque fragment
`AssistantMessageDeltaData` dès son arrivée, affiche une ligne `[tool:start]` pour chaque
`ToolExecutionStartData` et une ligne `[tool:done]` pour chaque `ToolExecutionCompleteData`, définit
son événement `done` sur `SessionIdleData` et relance `SessionErrorData` sous forme de
`RuntimeError`. `asyncio.wait_for` applique le délai d'expiration, et un bloc `finally` se désabonne
dans tous les chemins d'exécution.
:::

:::language go
Ouvrez `main.go`. Une région est modifiée dans cette étape.

**REPLACE** dans la région `generate` de `main.go` :

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

Deux changements : `Streaming: copilot.Bool(true)` dans la configuration de session, et
`StreamExhibit` à la place de `SendAndWait` et des lignes qui affichaient sa réponse. Le
gestionnaire d'autorisations de l'Étape 1 reste exactement là où il était. L'utilitaire se trouve
dans `curator.go` et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `curator.go` et lisez `StreamExhibit` une fois. C'est la boucle
d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment le streaming
fonctionne réellement. Il s'abonne avec `session.On`, affiche chaque fragment
`AssistantMessageDeltaData` dès son arrivée, affiche une ligne `[tool:start]` pour chaque
`ToolExecutionStartData` et une ligne `[tool:done]` pour chaque `ToolExecutionCompleteData`, et
enregistre tout `SessionErrorData` afin de le renvoyer comme erreur. Il attend ensuite
`session.SendAndWait` dans un `context.WithTimeout` construit à partir du délai d'expiration que
vous transmettez, et un `unsubscribe` différé s'exécute dans tous les chemins d'exécution.
:::

:::language rust
Ouvrez `src/main.rs`. Deux régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `src/main.rs` :

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

**REPLACE** dans la région `generate` de `src/main.rs` :

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

Deux changements dans `generate` : `config.streaming = Some(true)`, et `stream_exhibit` à la place
de `send_and_wait` et des lignes qui affichaient sa réponse. Le gestionnaire d'autorisations de
l'Étape 1 reste exactement là où il était. `stream_exhibit` comme `GENERATION_TIMEOUT` proviennent
du crate `museum_exhibit_studio` dans `src/lib.rs`, et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `src/lib.rs` et lisez `stream_exhibit` une fois. C'est la boucle
d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment le streaming
fonctionne réellement. Il s'abonne avec `session.subscribe`, affiche et vide chaque fragment
`assistant.message_delta` dès son arrivée, affiche une ligne `[tool:start]` pour chaque événement
`tool.execution_start` et une ligne `[tool:done]` pour chaque événement `tool.execution_complete`,
se termine sur `session.idle` et renvoie une erreur sur `session.error`. Il surveille simultanément
le futur d'envoi, le flux d'événements et une échéance, donc le délai d'expiration que vous
transmettez s'applique même si aucun événement n'arrive jamais.
:::

:::language java
Ouvrez `src/main/java/workshop/MuseumExhibitStudio.java`. Une région est modifiée dans cette étape.

**REPLACE** dans la région `generate` de `src/main/java/workshop/MuseumExhibitStudio.java` :

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

Deux changements : `setStreaming(true)` dans la configuration de session, et `CuratorStreamer.streamExhibit` à la place de `sendAndWait` et des lignes qui affichaient sa réponse. Le gestionnaire d'autorisations de l'Étape 1 reste exactement là où il était. L'utilitaire se trouve dans `CuratorStreamer.java` à côté de votre fichier, et vous ne le modifiez jamais.

**À l'intérieur :** ouvrez `CuratorStreamer.java` et lisez `streamExhibit` une fois. C'est la boucle d'événements du SDK, et c'est l'endroit le plus clair de l'atelier pour voir comment le streaming fonctionne réellement. Il enregistre un écouteur par type d'événement : `AssistantMessageDeltaEvent` affiche et accumule chaque fragment à son arrivée, `ToolExecutionStartEvent` et `ToolExecutionCompleteEvent` affichent les lignes `[tool:start]` et `[tool:done]`, `SessionIdleEvent` termine la ligne, et `SessionErrorEvent` est capturé puis relancé. Le délai d'expiration que vous transmettez est transmis à `session.sendAndWait` en millisecondes, et chaque abonnement est fermé dans un bloc `finally`.
:::

## Exécutez-le

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

Le même type de réponse apparaît, mais cette fois vous la voyez s'écrire :

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

Le texte s'allonge sur place au lieu d'apparaître d'un seul coup, et le programme quitte peu après
le dernier mot. Si vous ne voyez rien avant la toute fin, la session ne diffuse pas en streaming :
vérifiez que vous avez défini l'indicateur de streaming dans la configuration de session.

## Vérifiez votre compréhension

- Le streaming est activé conceptuellement à deux endroits : la configuration de session et le code qui lit
  les événements. Lequel avez-vous écrit, et lequel appartenait déjà à l'utilitaire ?
- L'utilitaire renvoie le texte complet de la réponse même s'il l'a aussi affiché. Pourquoi cette valeur de retour
  sera-t-elle importante à l'Étape 5 ?
- Si le modèle ne devient jamais inactif, qu'est-ce qui empêche votre programme d'attendre éternellement ?

## En savoir plus

- [Pilotage et mise en file d'attente](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md) :
  envoyer un autre message pendant qu'un tour est encore en streaming, au lieu d'attendre qu'il se termine.
- [Métriques d'utilisation et de facturation](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md) :
  lire le nombre de tokens et le coût depuis les mêmes événements auxquels l'afficheur est déjà abonné.
- [Effacement du contexte](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md) :
  remplacer une conversation dans une session que vous voulez continuer à utiliser.

Passez à [Donnez une voix au conservateur](museum-03-curator-voice.md).
