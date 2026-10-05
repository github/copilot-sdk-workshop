# Étape 5 : Vérifiez la structure

> **Durée :** 10 minutes

## Ce que vous allez créer

Un rapport PASS/FAIL imprimé sous chaque exposition. Deux lignes de nouveau code : capturez le texte
que l'exécuteur de session a déjà renvoyé, puis transmettez-le au validateur prêt à l'emploi.

## Ce que les vérifications déterministes peuvent prouver, et ce qu'elles ne peuvent pas prouver

Le validateur dans le module utilitaire est du code ordinaire qui ne contient aucun modèle. Pour un
même texte, il renvoie toujours le même verdict. Il vérifie :

- exactement un titre de niveau un
- une section `## Narrative`
- un récit de 100–140 mots
- une section `## Visitor questions` avec exactement trois éléments numérotés
- chaque élément numéroté se terminant par un point d'interrogation
- aucun vocabulaire interdit (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

C'est un contrat **structurel**, et il est réellement applicable. Ce n'est pas un contrat
**factuel**. Une exposition parfaitement structurée peut tout de même contenir une affirmation
qu'aucun fait approuvé ne soutient. Le rapport se termine en le disant, et cette phrase est la
limite honnête de cette application :

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

Vous n'écrivez pas le validateur. La leçon consiste à apprendre à *réagir* à un verdict automatique
— et à savoir exactement ce qu'il ne couvre pas.

## Connecter le validateur

:::language dotnet
Ouvrez `Program.cs`. Deux régions changent dans cette étape.

**REPLACE** dans la région `generate` de `Program.cs` :

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Un changement dans `generate` : le texte que `RunSessionAsync` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `Program.cs` :

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` se trouve déjà dans l'espace de noms `MuseumExhibitStudio.Helpers` que la région
`imports` importe, il n'y a donc rien de nouveau à ajouter en haut du fichier.

**À l'intérieur :** `Helpers/CuratorValidation.cs` est la réponse concrète à « c'est l'application
qui prouve cela, pas le modèle ». `ValidateExhibit` découpe le texte en lignes, compte les
correspondances de `TitlePattern`, localise les titres `## Narrative` et `## Visitor questions`,
compte les mots du récit avec `WordPattern`, collecte les éléments numérotés avec `QuestionPattern`,
et parcourt tout le texte à la recherche des cinq termes dans `ProhibitedVocabulary`. Chaque règle
échouée ajoute une phrase simple à `Errors`, et `FormatValidation` les affiche dans le rapport que
vous imprimez. Aucun modèle n'intervient à aucun moment.
:::

:::language nodejs
Ouvrez `src/index.ts`. Trois régions sont modifiées dans cette étape.

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
  formatValidation,
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
  validateExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

**REPLACE** dans la région `generate` de `src/index.ts` :

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Un changement dans `generate` : le texte que `runSession` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `src/index.ts` :

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

Les utilitaires de validation viennent de `src/curator.ts`, le seul changement en haut du fichier
est donc l'importation de l'utilitaire.

**À l'intérieur :** `src/curator.ts` est la réponse concrète à « c'est l'application qui prouve
cela, pas le modèle ». `validateExhibit` découpe le texte en lignes, compte les correspondances de
`titlePattern`, localise les titres `## Narrative` et `## Visitor questions`, compte les mots du
récit avec `wordPattern`, collecte les éléments numérotés avec `questionPattern`, et parcourt tout
le texte à la recherche des cinq termes dans `prohibitedVocabulary`. Chaque règle échouée ajoute une
phrase simple à `errors`, et `formatValidation` les affiche dans le rapport que vous imprimez. Aucun
modèle n'intervient à aucun moment.
:::

:::language python
Ouvrez `main.py`. Trois régions sont modifiées dans cette étape.

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
    format_validation,
    selected_model,
    stream_exhibit,
    validate_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

**REPLACE** dans la région `generate` de `main.py` :

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Un changement dans `generate` : le texte que `run_session` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `main.py` :

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` et `validate_exhibit` viennent de `curator.py`, la région imports nomme donc
désormais les deux utilitaires.

**À l'intérieur :** `curator.py` est la réponse concrète à « c'est l'application qui prouve cela,
pas le modèle ». `validate_exhibit` découpe le texte en lignes, compte les correspondances de
`_TITLE_PATTERN`, localise les titres `## Narrative` et `## Visitor questions`, compte les mots du
récit avec `_WORD_PATTERN`, collecte les éléments numérotés avec `_QUESTION_PATTERN`, et parcourt
tout le texte à la recherche des cinq termes dans `PROHIBITED_VOCABULARY`. Chaque règle échouée
ajoute une phrase simple à `errors`, et `format_validation` les affiche dans le rapport que vous
imprimez. Aucun modèle n'intervient à aucun moment.
:::

:::language go
Ouvrez `main.go`. Deux régions changent dans cette étape.

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
	exhibit, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout)
	if err != nil {
		return err
	}
```

Un changement dans `generate` : le texte que `runSession` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `main.go` :

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` et `ValidateExhibit` résident dans `curator.go`, dans le même package, il n'y a
donc aucune importation à ajouter.

**À l'intérieur :** `curator.go` est la réponse concrète à « c'est l'application qui prouve cela,
pas le modèle ». `ValidateExhibit` découpe le texte en lignes, compte les correspondances de modèle
de titre, localise les titres `## Narrative` et `## Visitor questions`, compte les mots du récit,
collecte les éléments numérotés, et parcourt le texte converti en minuscules à la recherche des cinq
termes dans `prohibitedVocabulary`. Chaque règle échouée ajoute une phrase simple à
`validation.Errors`, et `FormatValidation` les affiche dans le rapport que vous imprimez. Aucun
modèle n'intervient à aucun moment.
:::

:::language rust
Ouvrez `src/main.rs`. Trois régions sont modifiées dans cette étape.

**REPLACE** dans la région `imports` de `src/main.rs` :

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, CURATOR_SYSTEM_MESSAGE, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT,
    RuntimeError, approved_fact_lookup, choose_approved_facts, describe_failure, format_validation,
    selected_model, stream_exhibit, validate_exhibit,
};
```

**REPLACE** dans la région `generate` de `src/main.rs` :

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Un changement dans `generate` : le texte que `run_session` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `src/main.rs` :

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` et `validate_exhibit` viennent de `src/lib.rs`, la région `imports` les importe
donc avant l'impression du rapport.

**À l'intérieur :** `src/lib.rs` est la réponse concrète à « c'est l'application qui prouve cela,
pas le modèle ». `validate_exhibit` découpe le texte en lignes, compte les correspondances de modèle
de titre, localise les titres `## Narrative` et `## Visitor questions`, compte les mots du récit,
collecte les éléments numérotés, et parcourt le texte converti en minuscules à la recherche des cinq
termes dans `PROHIBITED_VOCABULARY`. Chaque règle échouée pousse une phrase simple dans `errors`, et
`format_validation` les affiche dans le rapport que vous imprimez. Aucun modèle n'intervient à aucun
moment.
:::

:::language java
Ouvrez `src/main/java/workshop/MuseumExhibitStudio.java`. Deux régions changent dans cette étape.

**REPLACE** dans la région `generate` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Un changement dans `generate` : le texte que `runSession` a déjà renvoyé est maintenant conservé dans `exhibit`.

**INSERT** dans la région `validate` de `src/main/java/workshop/MuseumExhibitStudio.java` :

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` se trouve dans le même package `workshop`, il n'y a donc rien de nouveau à ajouter en haut du fichier.

**À l'intérieur :** `CuratorValidation.java` est la réponse concrète à « c'est l'application qui prouve cela, pas le modèle ». `validateExhibit` découpe le texte en lignes, compte les correspondances de `TITLE_PATTERN`, localise les titres `## Narrative` et `## Visitor questions`, compte les mots du récit avec `WORD_PATTERN`, collecte les éléments numérotés avec `QUESTION_PATTERN`, et parcourt le texte converti en minuscules à la recherche des cinq termes dans `PROHIBITED_VOCABULARY`. Chaque règle échouée ajoute une phrase simple à `errors`, et `formatValidation` les affiche dans le rapport que vous imprimez. Aucun modèle n'intervient à aucun moment.
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

L'exposition se diffuse en streaming comme auparavant, puis un verdict apparaît en dessous :

```text
Structural checks passed.
- One level-one title: true
- Narrative section: true
- Narrative length: 126 words (within 100-140: true)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

Une exécution en échec est tout aussi instructive, et vous finirez par en voir une : la longueur du
récit est le coupable habituel :

```text
Structural checks found issues:
- One level-one title: true
- Narrative section: true
- Narrative length: 163 words (within 100-140: false)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none
  - The narrative must contain 100-140 words; found 163.

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

L'exécution se termine tout de même correctement. C'est volontaire : le rapport s'adresse à un
conservateur humain qui décide s'il faut publier, pas à un contrôle bloquant de compilation.
Réexécutez l'exposition, ou resserrez la liste de faits, puis réessayez.

Forcez volontairement un échec pour voir la règle de vocabulaire se déclencher. Fournissez votre propre fait unique :

```text
The museum's ticketing terminal was installed in 1998.
```

L'exposition répétera le mot `terminal`, et le rapport le signalera : la vérification lit la sortie,
pas votre intention.

## Vérifiez votre compréhension

- Le rapport indique que la structure a réussi. Que ne vous a-t-il *pas* dit sur l'exposition ?
- Un échec structurel n'arrête pas le programme. Quand serait-il juste d'en faire un échec bloquant, et
  quand serait-ce une erreur ?
- Le validateur est déterministe. Pourquoi cela compte-t-il davantage pour un musée qu'un relecteur basé sur un modèle
  légèrement plus intelligent ?

## En savoir plus

- [Hook de soumission du prompt utilisateur](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md) :
  vérifier ou rejeter un prompt dans le code avant que le runtime l'envoie.
- [Hook de transformation du prompt utilisateur](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md) :
  lire le prompt destiné au modèle que le runtime a réellement construit.
- [Vue d'ensemble des hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md) :
  où chaque hook se situe dans un tour, si vous voulez une vérification que le runtime applique plutôt qu'une vérification que vous exécutez
  après coup.

Continuez avec [Faites des recherches avec Wikipedia MCP](museum-07-wikipedia-research.md).
