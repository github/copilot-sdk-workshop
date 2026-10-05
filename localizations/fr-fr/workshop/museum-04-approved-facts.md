# Étape 4 : Appuyez-vous sur des faits approuvés

> **Durée :** 15 minutes

## Ce que vous allez créer

Jusqu'ici, le conservateur écrivait à partir de la mémoire du modèle. C'est inacceptable pour un
musée : un cartel d'exposition est une affirmation institutionnelle, et « le modèle le savait »
n'est pas une source.

Dans cette étape, l'éducateur fournit les faits et l'**application** les remet au conservateur par
l'intermédiaire d'un outil qui lui appartient. Vous enregistrez l'outil `approved_fact_lookup` prêt
à l'emploi, en faites le seul outil que le modèle est autorisé à appeler, et écrivez un prompt qui
ordonne au conservateur de l'appeler avant d'écrire un mot. Vous appelez aussi le sélecteur prêt à
l'emploi qui permet à l'éducateur de choisir l'un des trois ensembles de faits approuvés ou de
saisir les siens, et vous placez le cycle de vie de la session dans un petit exécuteur de session
que les étapes suivantes réutilisent.

## Pourquoi les faits doivent se trouver derrière un outil, et non dans le prompt

Vous pourriez coller la liste des faits dans le texte du prompt. Beaucoup d'applications le font.
Mais les faits sont alors simplement des mots supplémentaires dans une demande que le modèle est
libre de lire approximativement, et chaque exécution transporte tout le catalogue, que le modèle en
ait besoin ou non.

Un [**outil local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
est différent. Il s'exécute dans votre processus, votre code décide ce qu'il renvoie, et la
transcription consigne le moment où le modèle l'a demandé. `approved_fact_lookup` est cet outil. Il
ne prend aucun argument et renvoie la liste bornée des faits approuvés ; ainsi, deux exécutions sur
le même ensemble de faits posent la même question et obtiennent la même réponse — l'ancrage reste
déterministe.

Les utilitaires possèdent déjà l'outil et les limites. `boundFacts` supprime les espaces aux
extrémités de chaque fait, élimine les entrées vides et rejette le lot lorsqu'il est vide, contient
plus de 20 faits ou contient un fait de plus de 500 caractères. La fabrique d'outil applique ces
limites à tout ce qu'on lui donne ; le modèle ne peut donc jamais recevoir une liste sans bornes.
Les limites ne sont pas une question de politesse : une liste de faits sans bornes représente un
coût, une latence, et une surface d'attaque imprévisibles.

`skip permission` est défini sur cet outil, car il lit uniquement des données propres à
l'application que l'éducateur vient d'approuver à l'écran. Le processus Wikipedia externe de l'étape
6 reçoit plutôt une limite d'autorisation.

C'est l'équivalent, côté musée, de `accessibility_rule_lookup` dans le parcours accessibilité : un
outil local sans argument, propre à l'application, qui remet au modèle des données sélectionnées
auxquelles il ne peut pas accéder autrement.

## Deux listes, deux rôles différents

L'enregistrement d'un outil nécessite deux paramètres, et les confondre est l'erreur la plus
fréquente dans cet atelier :

- **`tools`** transporte l'*implémentation*. C'est là que le runtime apprend qu'une fonction appelée
  `approved_fact_lookup` existe et comment l'exécuter.
- **`availableTools`** est la *liste d'autorisation*. Elle nomme les outils que le modèle est autorisé à appeler dans
  cette session. Un outil enregistré mais absent de la liste d'autorisation ne peut pas être appelé.

Vous avez besoin des deux. Ne nommer que `approved_fact_lookup` exclut aussi tous les autres
outils : cette session ne propose ni lecteur de fichiers, ni shell, ni navigateur.

Le prompt est le troisième élément, et c'est le plus faible : il *demande* au modèle d'appeler
l'outil et de n'utiliser que ce que l'outil renvoie. Le message système de l'étape 3 ne dit rien sur
les sources, donc ce prompt est le premier endroit où l'on indique au conservateur d'où viennent ses
faits. Un prompt ne force pas l'appel à se produire, et il ne peut pas arrêter un appel. Conservez
l'instruction explicite "call `approved_fact_lookup` first" — à ce stade, vous voulez que l'appel
d'outil soit fiable afin de pouvoir le voir.

**Maintenez l'exécution bornée :** transmettez explicitement le **délai d'expiration de génération
de 120 secondes** existant de l'utilitaire à l'exécuteur de session. L'exécuteur renvoie le texte de
l'exposition pour une validation ultérieure, rejette les sorties vides, et nettoie la session et le
client même si le streaming échoue. Ce sont des contrôles de l'application, pas des instructions
destinées au modèle.

## Enregistrez l'outil et construisez le prompt

:::language dotnet
Ouvrez `Program.cs`. Cinq régions changent dans cette étape. La région `imports` contient déjà tout
ce dont cette étape a besoin.

**INSERT** dans la région `choose-facts` de `Program.cs` :

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

**REPLACE** dans la région `generate` de `Program.cs` :

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans
le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes
puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `Program.cs` :

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

**INSERT** dans la région `generation-config` de `Program.cs` :

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

**INSERT** dans la région `session-runner` de `Program.cs` :

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

`RunSessionAsync` utilise `CuratorStreamer.GenerationTimeout` depuis `Helpers/CuratorStreamer.cs` et
libère la session avant d'arrêter le client dans `finally`. `BuildExhibitPrompt` ne prend plus aucun
fait — il nomme l'outil à la place. `CreateApprovedFactLookup` appelle `BoundFacts` en interne, si
bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `CuratorTerminal.ChooseApprovedFacts` liste
les trois ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois
que l'éducateur les confirme ou saisit les siens. `CuratorPrompts.ExhibitStructure` est la structure
fixe de titre, de récit et de questions ; elle se trouve dans `Helpers/CuratorPrompts.cs`, car
l'étape 5 vérifie cette même structure. `CuratorStreamer.SelectedModel` lit la variable
d'environnement facultative `COPILOT_MODEL`.

**À l'intérieur :** `Helpers/CuratorFacts.cs` contient l'outil, et il vaut la peine de le lire parce
que c'est une vraie définition d'outil plutôt que du code d'infrastructure.
`CreateApprovedFactLookup` capture la liste bornée que l'éducateur vient d'approuver et l'enregistre
via `CopilotTool.DefineTool` sous le nom `approved_fact_lookup`. Le gestionnaire ne prend aucun
paramètre ; le modèle ne peut donc pas orienter ce qui revient — il demande, et il reçoit exactement
cette liste. `SkipPermission = true` est défini à cet endroit précis parce que les données sont
propres à l'application. Les trois ensembles de faits et les limites `MaximumFactCount` (20) et
`MaximumFactLength` (500) appliquées par `BoundFacts` se trouvent dans le même fichier.
:::

:::language nodejs
Ouvrez `src/index.ts`. Six régions changent dans cette étape, à commencer par les imports dont les nouveaux utilitaires ont besoin.

**REPLACE** dans la région `imports` de `src/index.ts` :

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

**INSERT** dans la région `choose-facts` de `src/index.ts` :

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

**REPLACE** dans la région `generate` de `src/index.ts` :

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans
le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes
puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `src/index.ts` :

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

**INSERT** dans la région `generation-config` de `src/index.ts` :

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

**INSERT** dans la région `session-runner` de `src/index.ts` :

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

`runSession` transmet `generationTimeoutMs` depuis `src/curator.ts` au diffuseur en streaming ; ses
blocs `finally` imbriqués déconnectent la session et arrêtent le client. `buildExhibitPrompt` ne
prend désormais plus aucun fait — il nomme l'outil à la place. `createApprovedFactLookup` appelle
`boundFacts` en interne, si bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `chooseApprovedFacts` liste les trois
ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois que
l'éducateur les confirme ou saisit les siens. `exhibitStructure` est la structure fixe de titre, de
récit et de questions ; elle se trouve dans `src/curator.ts`, car l'étape 5 vérifie cette même
structure. `selectedModel` lit la variable d'environnement facultative `COPILOT_MODEL`.

**À l'intérieur :** `src/curator.ts` contient l'outil, et il vaut la peine de le lire parce que
c'est une vraie définition `defineTool` plutôt que du code d'infrastructure.
`createApprovedFactLookup` capture la liste bornée que l'éducateur vient d'approuver et définit
`approved_fact_lookup` avec
`parameters: { type: "object", properties: {}, additionalProperties: false }`, si bien que le modèle
ne peut pas orienter ce qui revient — il demande, et il reçoit exactement cette liste.
`skipPermission: true` est défini à cet endroit précis parce que les données sont propres à
l'application. Les trois ensembles de faits et les limites `maximumFactCount` (20) et
`maximumFactLength` (500) appliquées par `boundFacts` se trouvent dans le même fichier.
:::

:::language python
Ouvrez `main.py`. Six régions changent dans cette étape.

**REPLACE** dans la région `imports` de `main.py` :

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

**INSERT** dans la région `choose-facts` de `main.py` :

```python
        facts = choose_approved_facts()
```

**REPLACE** dans la région `generate` de `main.py` :

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans
le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes
puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `main.py` :

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

**INSERT** dans la région `generation-config` de `main.py` :

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

**INSERT** dans la région `session-runner` de `main.py` :

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

`run_session` transmet `GENERATION_TIMEOUT_SECONDS` depuis `curator.py` au diffuseur en streaming ;
ses blocs `finally` déconnectent la session et arrêtent le client. `build_exhibit_prompt` ne prend
désormais plus aucun fait — il nomme l'outil à la place. `create_approved_fact_lookup` appelle
`bound_facts` en interne, si bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `choose_approved_facts` liste les trois
ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois que
l'éducateur les confirme ou saisit les siens. `EXHIBIT_STRUCTURE` est la structure fixe de titre, de
récit et de questions ; elle se trouve dans `curator.py`, car l'étape 5 vérifie cette même
structure. `selected_model` lit la variable d'environnement facultative `COPILOT_MODEL` ; ce SDK
accepte `model=None`, la configuration peut donc laisser le choix du modèle au runtime.

**À l'intérieur :** `curator.py` contient l'outil, et il vaut la peine de le lire parce que c'est
une vraie définition `@define_tool` plutôt que du code d'infrastructure.
`create_approved_fact_lookup` capture la liste bornée que l'éducateur vient d'approuver et décore
une fonction `approved_fact_lookup()` imbriquée qui ne prend aucun argument, si bien que le modèle
ne peut pas orienter ce qui revient — il demande, et il reçoit exactement cette liste.
`skip_permission=True` est défini à cet endroit précis parce que les données sont propres à
l'application. Les trois ensembles de faits et les limites `MAXIMUM_FACT_COUNT` (20) et
`MAXIMUM_FACT_LENGTH` (500) appliquées par `bound_facts` se trouvent dans le même fichier.
:::

:::language go
Ouvrez `main.go`. Six régions changent dans cette étape.

**REPLACE** dans la région `imports` de `main.go` :

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

**INSERT** dans la région `choose-facts` de `main.go` :

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

**REPLACE** dans la région `generate` de `main.go` :

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

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans
le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes
puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `main.go` :

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

**INSERT** dans la région `generation-config` de `main.go` :

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

**INSERT** dans la région `session-runner` de `main.go` :

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

`runSession` transmet `GenerationTimeout` depuis `curator.go` au diffuseur en streaming et utilise
`defer` pour déconnecter la session avant d'arrêter le client. `buildExhibitPrompt` ne prend
désormais plus aucun fait — il nomme l'outil à la place. `ApprovedFactLookup` appelle `BoundFacts`
en interne, si bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `ChooseApprovedFacts` dans `curator.go` liste
les trois ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois
que l'éducateur les confirme ou saisit les siens. `ExhibitStructure` est la structure fixe de titre,
de récit et de questions ; elle se trouve dans `curator.go`, car l'étape 5 vérifie cette même
structure. `SelectedModel` lit la variable d'environnement facultative `COPILOT_MODEL`.

**À l'intérieur :** `curator.go` contient l'outil, et il vaut la peine de le lire parce que c'est
une vraie définition `copilot.DefineTool` plutôt que du code d'infrastructure. `ApprovedFactLookup`
capture la liste bornée que l'éducateur vient d'approuver et définit un gestionnaire dont le type
d'argument est `struct{}`, si bien que le modèle ne peut pas orienter ce qui revient — il demande,
et il reçoit exactement cette liste. `lookup.SkipPermission = true` est défini à cet endroit précis
parce que les données sont propres à l'application. Les trois ensembles de faits et les limites
`MaximumFactCount` (20) et `MaximumFactLength` (500) appliquées par `BoundFacts` se trouvent dans le
même fichier.
:::

:::language rust
Ouvrez `src/main.rs`. Six régions changent dans cette étape.

**REPLACE** dans la région `imports` de `src/main.rs` :

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

**INSERT** dans la région `choose-facts` de `src/main.rs` :

```rust
    let facts = choose_approved_facts()?;
```

**REPLACE** dans la région `generate` de `src/main.rs` :

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans
le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes
puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `src/main.rs` :

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

**INSERT** dans la région `generation-config` de `src/main.rs` :

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

**INSERT** dans la région `session-runner` de `src/main.rs` :

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

`run_session` transmet `GENERATION_TIMEOUT` depuis `src/lib.rs` au diffuseur en streaming et
déconnecte la session puis arrête le client avant de propager les erreurs. `build_exhibit_prompt` ne
prend désormais plus aucun fait — il nomme l'outil à la place. `approved_fact_lookup` appelle
`bound_facts` en interne, si bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `choose_approved_facts` liste les trois
ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois que
l'éducateur les confirme ou saisit les siens. `EXHIBIT_STRUCTURE` est la structure fixe de titre, de
récit et de questions ; elle se trouve dans `src/lib.rs`, car l'étape 5 vérifie cette même
structure. `selected_model` lit la variable d'environnement facultative `COPILOT_MODEL`.

**À l'intérieur :** `src/lib.rs` contient tout cela, et il vaut la peine de le lire parce que c'est
une vraie définition d'outil plutôt que du code d'infrastructure. `approved_fact_lookup` capture la
liste bornée que l'éducateur vient d'approuver et construit un `Tool` dont le schéma de paramètres
est `{"type": "object", "properties": {}, "additionalProperties": false}`, si bien que le modèle ne
peut pas orienter ce qui revient — il demande, et il reçoit exactement cette liste.
`.with_skip_permission(true)` est défini à cet endroit précis parce que les données sont propres à
l'application. Les trois ensembles de faits et les limites `MAXIMUM_FACT_COUNT` (20) et
`MAXIMUM_FACT_LENGTH` (500) appliquées par `bound_facts` se trouvent dans le même fichier.
:::

:::language java
Ouvrez `src/main/java/workshop/MuseumExhibitStudio.java`. Six régions changent dans cette étape.

**REPLACE** dans la région `imports` de `src/main/java/workshop/MuseumExhibitStudio.java` :

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

**INSERT** dans la région `choose-facts` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

**REPLACE** dans la région `generate` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Le client et la session définis directement aux étapes 1 à 3 quittent `generate`. Ils passent dans le générateur de configuration et l'exécuteur de session ci-dessous, afin que les étapes suivantes puissent les réutiliser.

**INSERT** dans la région `exhibit-prompt` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

**INSERT** dans la région `generation-config` de `src/main/java/workshop/MuseumExhibitStudio.java` :

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

**INSERT** dans la région `session-runner` de `src/main/java/workshop/MuseumExhibitStudio.java` :

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

`runSession` utilise `CuratorStreamer.GENERATION_TIMEOUT` depuis `CuratorStreamer.java` et ferme la session avant d'arrêter le client dans `finally`. `buildExhibitPrompt` ne prend désormais plus aucun fait — il nomme l'outil à la place. `approvedFactLookup` appelle `boundFacts` en interne, si bien que les limites s'appliquent peu importe qui construit l'outil.

Trois appels d'utilitaire gardent cette étape courte. `CuratorTerminal.chooseApprovedFacts` liste les trois ensembles de faits, lit le choix, affiche les faits, et renvoie la liste bornée une fois que l'éducateur les confirme ou saisit les siens. `CuratorPrompts.EXHIBIT_STRUCTURE` est la structure fixe de titre, de récit et de questions ; elle se trouve dans `CuratorPrompts.java`, car l'étape 5 vérifie cette même structure. `CuratorStreamer.withSelectedModel` lit la variable d'environnement facultative `COPILOT_MODEL` et l'applique à la configuration de session.

**À l'intérieur :** `CuratorFacts.java` contient l'outil, et il vaut la peine de le lire parce que c'est une vraie `ToolDefinition` plutôt que du code d'infrastructure. `approvedFactLookup` construit un `ApprovedFactReader` privé sur la liste bornée que l'éducateur vient d'approuver et lie sa méthode `read` sans argument ; le modèle ne peut donc pas orienter ce qui revient — il demande, et il reçoit exactement cette liste. `.skipPermission(true)` est défini à cet endroit précis parce que les données sont propres à l'application. Les trois ensembles de faits et les limites `MAXIMUM_FACT_COUNT` (20) et `MAXIMUM_FACT_LENGTH` (500) appliquées par `boundFacts` se trouvent dans le même fichier.
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

L'application vous interroge désormais avant d'écrire quoi que ce soit, et le conservateur récupère
visiblement ses faits avant d'écrire un mot :

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

La ligne `[tool:start] approved_fact_lookup` est tout l'intérêt de cette étape. Le conservateur ne
s'est pas souvenu du récif : il a demandé les faits à votre application, et votre application a
répondu.

## Vérifier que l'outil fait le travail

Exécutez-le à nouveau et choisissez l'ensemble 1 ou 3. L'exposition change complètement de sujet, et
l'événement d'outil réapparaît à chaque fois. Rien n'a changé dans le prompt entre ces exécutions :
le même texte de prompt a produit une exposition sur l'armée de terre cuite parce que l'outil a
renvoyé des données différentes. C'est la différence entre un prompt qui transporte des données et
une application qui les possède.

Répondez ensuite `n` lors de la confirmation, saisissez deux ou trois faits de votre cru, puis
soumettez une ligne vide. Le conservateur écrit alors sur votre sujet : les faits que vous avez
saisis sont entrés dans l'outil, et l'outil les a remis au modèle.

Essayez aussi le cas d'échec. Répondez `n` et soumettez immédiatement une ligne vide sans saisir de
faits. L'exécution s'arrête avec :

```text
Could not generate the exhibit: Provide at least one approved fact.
```

Le sélecteur de faits borne tout ce que l'éducateur saisit, et les limites rejettent une liste
vide ; aucune session n'a donc jamais été créée et aucune requête n'a été envoyée. Le gestionnaire
d'erreurs fourni avec le projet de départ affiche le message et se termine avec l'état 1.

Une exécution qui dépasse son délai d'expiration s'arrête de la même façon au lieu de vous laisser attendre indéfiniment :

```text
The curator did not respond in time. Try again.
```

Le délai d'expiration normal est de 120 secondes ; il ne change pas les faits ni les outils que le conservateur peut utiliser.

## Vérifiez votre compréhension

- Vous avez enregistré l'outil à deux endroits. Que se passerait-il si vous mettiez `approved_fact_lookup` dans la
  liste d'outils mais pas dans la liste d'autorisation ?
- Le prompt dit "Call `approved_fact_lookup` first." Cette phrase garantit-elle que l'appel
  se produit ? Dans cette étape, qu'est-ce qui a rendu l'outil *disponible* pour être appelé ?
- L'outil ne prend aucun argument et renvoie toujours la même liste bornée pour un ensemble de faits donné. Que
  perdriez-vous s'il prenait plutôt un argument de requête en texte libre ?
- La structure de sortie est demandée dans le prompt. Qu'est-ce qui a effectivement vérifié que le modèle
  l'a suivie jusqu'ici ?

## En savoir plus

- [Travailler avec les hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md) :
  fonctions de rappel que le runtime invoque autour de chaque appel d'outil, pour l'audit ou la règle que votre code possède.
- [Hook après utilisation d'un outil](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md) :
  inspecter ou réécrire ce qu'un outil a renvoyé avant que le modèle le lise.
- [Effacement du contexte et outils de terminal](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md) :
  ce qu'un outil peut faire à la conversation elle-même, et pourquoi la plupart des outils ne devraient pas le faire.

Continuez avec [Vérifiez la structure](museum-06-prove-the-structure.md).
