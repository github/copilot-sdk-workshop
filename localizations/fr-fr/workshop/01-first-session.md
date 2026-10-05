# Étape 1 : Créez votre première session Copilot

> **Durée :** 10 minutes

## Ce que vous allez créer

Vous connecterez l'application console au runtime Copilot, créerez une conversation, enverrez un
prompt et afficherez la réponse.

:::language dotnet
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API .NET que votre application utilise pour exécuter Copilot en tant
qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `CopilotClient` connecte votre code C# à
ce runtime.

Un `CopilotSession` représente une conversation qui se poursuit. Il contient les messages et les
résultats d'outils qui constituent le contexte de la conversation. Conservez un client actif pour
l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `CopilotClient -> CopilotSession -> model response`.
:::

:::language nodejs
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API Node.js que votre application utilise pour exécuter Copilot en
tant qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `CopilotClient` connecte votre code
TypeScript à ce runtime.

Une session issue de `createSession` représente une conversation qui se poursuit. Elle contient les
messages et les résultats d'outils qui constituent le contexte de la conversation. Conservez un
client actif pour l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `CopilotClient -> session -> model response`.
:::

:::language python
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API Python que votre application utilise pour exécuter Copilot en
tant qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `CopilotClient` connecte votre code
Python à ce runtime.

Une session issue de `create_session` représente une conversation qui se poursuit. Elle contient les
messages et les résultats d'outils qui constituent le contexte de la conversation. Conservez un
client actif pour l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `CopilotClient -> session -> model response`.
:::

:::language go
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API Go que votre application utilise pour exécuter Copilot en tant
qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `copilot.NewClient` connecte votre code
Go à ce runtime.

Une session issue de `CreateSession` représente une conversation qui se poursuit. Elle contient les
messages et les résultats d'outils qui constituent le contexte de la conversation. Conservez un
client actif pour l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `Client -> Session -> model response`.
:::

:::language rust
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API Rust que votre application utilise pour exécuter Copilot en tant
qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `Client` connecte votre code Rust à ce
runtime.

Une session issue de `create_session` représente une conversation qui se poursuit. Elle contient les
messages et les résultats d'outils qui constituent le contexte de la conversation. Conservez un
client actif pour l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `Client -> session -> model response`.
:::

:::language java
## Découvrez le GitHub Copilot SDK et le runtime

Le **GitHub Copilot SDK** est l'API Java que votre application utilise pour exécuter Copilot en tant
qu'agent. Le
[**runtime Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
reçoit les prompts, appelle des modèles et gère les outils. `CopilotClient` connecte votre code Java
à ce runtime.

Une session issue de `createSession` représente une conversation qui se poursuit. Elle contient les
messages et les résultats d'outils qui constituent le contexte de la conversation. Conservez un
client actif pour l'application, puis créez une session pour chaque conversation indépendante.

## Pourquoi les clients et les sessions restent séparés

Séparer ces responsabilités permet à la connexion au runtime de se poursuivre au-delà d'une
conversation donnée. Cela vous donne aussi un petit exemple fonctionnel avant l'arrivée du streaming
et des outils.

À ce stade, l'application console est simplement `CopilotClient -> session -> model response`.
:::

## Lancez votre première session Copilot

:::language dotnet
Ouvrez `Program.cs` et **remplacez l'intégralité du fichier** :

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

Le ping vérifie la connexion au runtime. L'envoi avec réponse complète attend que la session
devienne inactive ; il convient donc bien lorsque vous n'avez besoin que de la réponse terminée.
:::

:::language nodejs
Ouvrez `src/index.ts` et **remplacez l'intégralité du fichier** :

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

`sendAndWait` attend que la session devienne inactive ; il convient donc bien lorsque vous n'avez
besoin que de la réponse terminée. Arrêtez toujours la session et le client dans des blocs `finally`
afin que le runtime s'arrête proprement.
:::

:::language python
Ouvrez `main.py` et **remplacez l'intégralité du fichier** :

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

Python écoute les événements de session au lieu d'appeler un unique utilitaire de réponse complète.
Affichez le message de l'assistant, traitez les erreurs de session comme des échecs et attendez
l'événement d'inactivité avant de quitter.
:::

:::language go
Ouvrez `main.go` et **remplacez l'intégralité du fichier** :

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

`SendAndWait` attend que la session devienne inactive ; il convient donc bien lorsque vous n'avez
besoin que de la réponse terminée. `defer` déconnecte la session et arrête le client au moment de
quitter.
:::

:::language rust
Ouvrez `src/main.rs` et **remplacez l'intégralité du fichier** :

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

`send_and_wait` attend que la session devienne inactive ; il convient donc bien lorsque vous n'avez
besoin que de la réponse terminée. Déconnectez la session et arrêtez le client avant de retourner.
:::

:::language java
Ouvrez `src/main/java/workshop/AccessibilityReport.java` et **remplacez l'intégralité du fichier** :

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

`sendAndWait` attend que la session devienne inactive ; il convient donc bien lorsque vous n'avez
besoin que de la réponse terminée. Le bloc try-with-resources ferme le client lorsque `main` se
termine.
:::

Cette session définit un gestionnaire d'autorisations et rien d'autre ; elle s'exécute donc avec la
persona par défaut du SDK. Le réglage auquel vous n'avez pas touché est le
[message système](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message),
qui possède trois modes. `append` est la valeur par défaut : votre contenu est ajouté après le
prompt géré par le SDK, et la persona CLI par défaut est conservée avec le contexte d'environnement,
les instructions d'outils et les garde-fous de sécurité que le SDK injecte. `replace` remplace
l'intégralité du prompt par votre contenu. `customize` remplace des sections individuelles, comme le
style, les consignes, les règles de modification du code et d'autres, tout en conservant le reste.
Cet atelier reste sur la valeur par défaut ; chaque réponse que vous voyez provient donc de la
persona standard. Utilisez les deux autres modes lorsqu'une application a besoin d'une voix ou d'un
périmètre propres.

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
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
=== First Copilot session ===

Connected to the Copilot runtime: ...

Copilot: An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language nodejs
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
This Copilot session is ready and waiting for your next prompt.
```
:::

:::language python
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language go
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language rust
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language java
Votre réponse exacte variera, mais la sortie doit avoir cette forme :

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

<details>
<summary>Dépannage de cette exécution</summary>

| Symptôme | Correction |
|---|---|
| Erreur d'authentification ou d'autorisation | Exécutez à nouveau `copilot login`, puis relancez le projet. |
| Exécutable du runtime introuvable | Définissez `COPILOT_CLI_BINARY_PATH` à l'aide des instructions de préparation. |
| La requête arrive à expiration | Vérifiez l'accès réseau à GitHub Copilot et réessayez ; cet exemple ne masque pas l'échec. |

</details>

> **Tout est prêt pour le streaming lorsque :** le terminal affiche une réponse Copilot complète.

## Vérifiez votre compréhension

Quel objet doit généralement vivre pendant toute la durée de vie de l'application, et quel objet
possède le contexte d'une conversation ?

:::language dotnet
<details>
<summary>Vérifiez votre réponse</summary>

Conservez `CopilotClient` pendant toute la durée de vie de la connexion au runtime. Un
`CopilotSession` possède les messages et le contexte d'outils pour une conversation.

</details>
:::

:::language nodejs
<details>
<summary>Vérifiez votre réponse</summary>

Conservez `CopilotClient` pendant toute la durée de vie de la connexion au runtime. Une session
issue de `createSession` possède les messages et le contexte d'outils pour une conversation.

</details>
:::

:::language python
<details>
<summary>Vérifiez votre réponse</summary>

Conservez `CopilotClient` pendant toute la durée de vie de la connexion au runtime. Une session
issue de `create_session` possède les messages et le contexte d'outils pour une conversation.

</details>
:::

:::language go
<details>
<summary>Vérifiez votre réponse</summary>

Conservez le client issu de `copilot.NewClient` pendant toute la durée de vie de la connexion au
runtime. Une session issue de `CreateSession` possède les messages et le contexte d'outils pour une
conversation.

</details>
:::

:::language rust
<details>
<summary>Vérifiez votre réponse</summary>

Conservez `Client` pendant toute la durée de vie de la connexion au runtime. Une session issue de
`create_session` possède les messages et le contexte d'outils pour une conversation.

</details>
:::

:::language java
<details>
<summary>Vérifiez votre réponse</summary>

Conservez `CopilotClient` pendant toute la durée de vie de la connexion au runtime. Une session
issue de `createSession` possède les messages et le contexte d'outils pour une conversation.

</details>
:::

:::language dotnet
<details>
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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
<summary>Implémentation complète de l'étape 1</summary>

Comparez votre travail avec cette implémentation complète de l'étape 1.

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

## En savoir plus

- [Créez votre première application propulsée par Copilot](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  le tutoriel de GitHub pour le même premier client, la même session et le même prompt.
- [Reprise et persistance de session](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  comment l'état de conversation d'une session est conservé, et comment la reprendre après un redémarrage.
- [Effacement du contexte](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  remplacement de la conversation dans une session sans en créer une nouvelle.
- [Authentification](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  les identifiants qu'un client peut utiliser une fois que vous avez dépassé `copilot login`.

Continuez avec [Étape 2 : Diffusez une réponse en streaming](02-streaming.md).
