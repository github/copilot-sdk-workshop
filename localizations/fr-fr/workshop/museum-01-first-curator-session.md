# Étape 1 : Votre première session de conservateur

> **Durée :** 10 minutes

## Ce que vous allez créer

Du vrai texte de musée, dans votre terminal, en une dizaine de minutes. Vous vous connectez au
runtime Copilot, ouvrez une conversation, envoyez un seul prompt et affichez ce qui revient.

Pas de message système. Pas de catalogue de faits. Pas d'outils. Pas d'interfaces. Rien contre quoi
implémenter — vous appelez directement le SDK. À part le gestionnaire d'erreurs que le projet de
départ enveloppe déjà autour de votre code, les utilitaires de conservateur fournis attendent que
l'Étape 2 en ait besoin.

## Découvrez le client et la session

Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. Le **client** connecte votre application
à ce runtime. Une **session** est une conversation continue : elle contient les messages et les
résultats d'outils qui constituent le contexte.

Gardez un client actif pour une tâche, puis créez une session pour chaque conversation indépendante.
Pour l'instant, l'application est simplement `client -> session -> printed response`.

## Répondez aux demandes d'autorisation avant d'envoyer

Le runtime ne décide pas seul si un appel d'outil peut s'exécuter. Il demande à l'application, et le
[gestionnaire d'autorisations](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
de la session répond. Quand une session est créée sans lui, la demande n'est pas refusée : elle est
émise comme un événement et laissée en attente pour une résolution manuelle ; l'exécution s'arrête
donc et attend une réponse qui n'arrive jamais.

Donnez à cette première session un gestionnaire qui approuve tout afin que chaque demande ait une
réponse. Il approuve les demandes lorsque les paramètres gérés sont désactivés, et il s'agit d'une
valeur par défaut plutôt que d'une mesure de sécurité : l'Étape 4 montre ce qui contraint réellement
cette session, et les Étapes 6 et 7 le remplacent par des gestionnaires restreints, au périmètre
défini.

## Écrivez la session

À partir d'ici, chaque bloc de code nomme une région dans votre point d'entrée et indique **INSERT**
ou **REPLACE**. INSERT remplit une région vide. REPLACE signifie : supprimez ce qui se trouve entre
les deux lignes de marqueur de la région, puis collez. La [préparation](museum-00-preflight.md)
montre les lignes de marqueur sous « Fonctionnement des modifications ».

:::language dotnet
Ouvrez `Program.cs`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `Program.cs` :

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;
```

**REPLACE** dans la région `banner` de `Program.cs` :

```csharp
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
```

**INSERT** dans la région `generate` de `Program.cs` :

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

`SendAndWaitAsync` bloque jusqu'à ce que la session devienne inactive, vous obtenez donc la réponse
finale en un seul appel. `await using` libère la session et le client à la sortie.
`PermissionHandler.ApproveAll` vient de `GitHub.Copilot.Rpc`, c'est pourquoi le second `using` est
là.

Le `try`/`catch`/`finally` autour de vos régions était fourni avec le projet de départ. Si quoi que
ce soit lève une exception, il affiche un message provenant de `CuratorTerminal.DescribeFailure` et
quitte avec un code de sortie différent de zéro.

Les utilitaires fournis que vous commencez à appeler à l'Étape 2 se trouvent dans
`Helpers/CuratorFacts.cs`, `Helpers/CuratorStreamer.cs`, `Helpers/CuratorValidation.cs`,
`Helpers/CuratorSafety.cs`, `Helpers/CuratorPrompts.cs`, `Helpers/CuratorSystemMessages.cs` et
`Helpers/CuratorTerminal.cs`. Vous ne modifiez jamais ces fichiers : vous les lisez.
:::

:::language nodejs
Ouvrez `src/index.ts`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `src/index.ts` :

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure } from "./curator.js";
```

**REPLACE** dans la région `banner` de `src/index.ts` :

```typescript
    console.log("=== Museum Exhibit Studio ===");
    console.log();
```

**INSERT** dans la région `generate` de `src/index.ts` :

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

`sendAndWait` bloque jusqu'à ce que la session devienne inactive, vous obtenez donc la réponse
finale en un seul appel. `approveAll` est importé depuis le SDK avec `CopilotClient`.

Le `try`/`catch`/`finally` autour de vos régions était fourni avec le projet de départ. Si quoi que
ce soit lève une exception, il affiche un message provenant de `describeFailure` dans
`src/curator.ts` et définit un code de sortie différent de zéro.

Le module utilitaire fourni que vous commencez à appeler à l'Étape 2 se trouve dans
`src/curator.ts`, et les messages système que l'Étape 3 utilise se trouvent dans
`src/system-messages.ts`. Vous ne modifiez jamais ces fichiers : vous les lisez.
:::

:::language python
Ouvrez `main.py`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `main.py` :

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData

from curator import describe_failure
```

**REPLACE** dans la région `banner` de `main.py` :

```python
        print("=== Museum Exhibit Studio ===")
        print()
```

**INSERT** dans la région `generate` de `main.py` :

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

Python écoute les événements de session plutôt que d'appeler un utilitaire bloquant. Affichez le
message de l'assistant, traitez une erreur de session comme un échec et attendez l'inactivité avant
de quitter. L'Étape 2 remplace tout cet écouteur par un seul appel utilitaire.

Le `try`/`except` autour de vos régions était fourni avec le projet de départ. Si quoi que ce soit
lève une exception, il affiche un message provenant de `describe_failure` dans `curator.py` et
quitte avec un code de sortie différent de zéro.

`curator.py` situé à côté de ce fichier est le module utilitaire fourni que vous commencez à appeler
à l'Étape 2, et `system_messages.py` contient les messages système que l'Étape 3 utilise. Vous ne
modifiez jamais ces fichiers : vous les lisez.
:::

:::language go
Ouvrez `main.go`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `main.go` :

```go
import (
	"context"
	"fmt"
	"os"

	copilot "github.com/github/copilot-sdk/go"
)

```

**REPLACE** dans la région `banner` de `main.go` :

```go
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
```

**INSERT** dans la région `generate` de `main.go` :

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

`SendAndWait` bloque jusqu'à ce que la session devienne inactive, vous obtenez donc la réponse
finale en un seul appel. Le nettoyage différé déconnecte la session et arrête le client à la sortie.
`copilot.PermissionHandler.ApproveAll` répond aux demandes d'autorisation afin que l'exécution ne
reste pas bloquée.

Le wrapper `main`/`run` et le gestionnaire d'erreurs autour de vos régions étaient fournis avec le
projet de départ. Si quoi que ce soit renvoie une erreur, `main` affiche un message provenant de
`DescribeFailure` dans `curator.go` et quitte avec un code de sortie différent de zéro.

Les utilitaires fournis que vous commencez à appeler à l'Étape 2 se trouvent dans `curator.go`, et
les messages système que l'Étape 3 utilise se trouvent dans `system_messages.go`. Vous ne modifiez
jamais ces fichiers : vous les lisez.
:::

:::language rust
Ouvrez `src/main.rs`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `src/main.rs` :

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{RuntimeError, describe_failure};
```

**REPLACE** dans la région `banner` de `src/main.rs` :

```rust
    println!("=== Museum Exhibit Studio ===");
    println!();
```

**INSERT** dans la région `generate` de `src/main.rs` :

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

`send_and_wait` bloque jusqu'à ce que la session devienne inactive, vous obtenez donc la réponse
finale en un seul appel. `with_permission_handler(permission::approve_all())` empêche les demandes
d'outil de rester bloquées tant que la session est encore simple.

Le wrapper `main`, la fonction `run`, le code de sortie et le gestionnaire d'erreurs autour de vos
régions étaient fournis avec le projet de départ. Si quoi que ce soit lève une exception, le wrapper
affiche un message provenant de `describe_failure` dans `src/lib.rs` et quitte avec un code de
sortie différent de zéro.

Les utilitaires fournis que vous commencez à appeler à l'Étape 2 se trouvent dans `src/lib.rs`, et
les messages système que l'Étape 3 utilise se trouvent dans `src/system_messages.rs`. Vous ne
modifiez jamais ces fichiers : vous les lisez.
:::

:::language java
Ouvrez `src/main/java/workshop/MuseumExhibitStudio.java`. Trois régions sont modifiées dans cette étape.

**INSERT** dans la région `imports` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
```

**REPLACE** dans la région `banner` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();
```

**INSERT** dans la région `generate` de `src/main/java/workshop/MuseumExhibitStudio.java` :

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

`sendAndWait` bloque jusqu'à ce que la session devienne inactive, vous obtenez donc la réponse finale en un seul appel. Le client se ferme lorsque le bloc try-with-resources se termine, et la session est fermée avant l'exécution de `client.stop().get()`. `PermissionHandler.APPROVE_ALL` vient de `com.github.copilot.rpc`, c'est pourquoi cet import est présent.

Le squelette `main`/`run`, le `try`/`catch`/`finally` de niveau supérieur et la gestion du code de sortie étaient fournis avec le projet de départ. Si quoi que ce soit lève une exception, le gestionnaire d'erreurs affiche un message via `CuratorTerminal.describeFailure` et quitte avec un code de sortie différent de zéro.

Les utilitaires fournis que vous commencez à appeler à l'Étape 2 se trouvent à côté de votre fichier dans `src/main/java/workshop/` : `CuratorFacts.java`, `CuratorStreamer.java`, `CuratorValidation.java`, `CuratorSafety.java`, `CuratorPrompts.java`, `CuratorSystemMessages.java` et `CuratorTerminal.java`. Vous ne modifiez jamais ces fichiers : vous les lisez.
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

Votre formulation exacte variera, mais la sortie a cette forme :

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

Deux phrases de prose au style muséal arrivent après une courte pause. Rien n'est encore diffusé en
streaming, aucun style n'est encore imposé, et rien n'empêche le modèle de déborder du sujet
demandé. Ce sont les trois étapes suivantes.

## Vérifiez votre compréhension

- Que contient la session que le client ne contient pas ?
- La réponse est arrivée d'un seul coup après une pause. Quelle partie du code actuel provoque cela ?
- La session a répondu à chaque demande d'autorisation au lieu de la laisser en attente. Cela a-t-il rendu la
  session plus sûre, ou seulement capable d'aller au bout ?
- Rien dans cette étape ne limite ce que le modèle peut affirmer à propos d'Apollo 11. Quelle est la seule chose
  qui garde la réponse globalement dans le sujet pour l'instant ?

## En savoir plus

- [Créez votre première application propulsée par Copilot](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started) :
  le tutoriel de GitHub pour le même premier client, la même première session et le même prompt.
- [Reprise et persistance de session](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md) :
  ce qu'une session conserve et comment reprendre une conversation plus tard.
- [Authentification](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md) :
  les identifiants qu'un client peut utiliser une fois que vous dépassez `copilot login`.

Passez à [Diffusez la réponse du conservateur en streaming](museum-02-stream-the-curator.md).
