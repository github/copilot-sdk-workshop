# Schritt 5: Die Struktur prüfen

> **Dauer:** 10 Minuten

## Was Sie erstellen

Ein PASS/FAIL-Bericht, der unter jeder Ausstellung ausgegeben wird. Zwei Zeilen neuer Code: Erfassen
Sie den Text, den der Sitzungs-Runner bereits zurückgegeben hat, und übergeben Sie ihn dann an den
vorgefertigten Validator.

## Was deterministische Prüfungen belegen können und was nicht

Der Validator im Hilfsmodul ist gewöhnlicher Code ohne Modell darin. Bei demselben Text gibt er
immer dasselbe Urteil zurück. Er prüft:

- genau eine Überschrift erster Ebene
- einen Abschnitt `## Narrative`
- eine Erzählung mit 100–140 Wörtern
- einen Abschnitt `## Visitor questions` mit genau drei nummerierten Einträgen
- jeden nummerierten Eintrag, der mit einem Fragezeichen endet
- kein verbotenes Vokabular (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

Das ist ein **struktureller** Kontrakt, und er ist wirklich durchsetzbar. Es ist kein **faktischer**
Kontrakt. Eine perfekt strukturierte Ausstellung kann trotzdem eine Behauptung enthalten, die von
keinem freigegebenen Fakt gestützt wird. Der Bericht endet mit genau diesem Hinweis, und dieser Satz
ist die ehrliche Grenze dieser Anwendung:

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

Sie schreiben den Validator nicht selbst. Die Lektion besteht darin, auf ein maschinelles Urteil zu
*reagieren* – und genau zu wissen, was es nicht abdeckt.

## Den Validator anbinden

:::language dotnet
Öffnen Sie `Program.cs`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `generate` in `Program.cs`:

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Eine Änderung in `generate`: Der Text, den `RunSessionAsync` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `Program.cs`:

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` befindet sich bereits im Namespace `MuseumExhibitStudio.Helpers`, den die Region
`imports` einbindet. Daher müssen Sie am Dateianfang nichts Neues hinzufügen.

**Ein Blick hinein:** `Helpers/CuratorValidation.cs` ist die konkrete Antwort auf „die Anwendung
beweist das, nicht das Modell“. `ValidateExhibit` teilt den Text in Zeilen auf, zählt Treffer von
`TitlePattern`, findet die Überschriften `## Narrative` und `## Visitor questions`, zählt mit
`WordPattern` die Wörter der Erzählung, sammelt nummerierte Einträge mit `QuestionPattern` und
durchsucht den gesamten Text nach den fünf Begriffen in `ProhibitedVocabulary`. Jede fehlgeschlagene
Regel fügt einen einfachen Satz an `Errors` an, und `FormatValidation` rendert diese Sätze in den
Bericht, den Sie ausgeben. Zu keinem Zeitpunkt ist ein Modell beteiligt.
:::

:::language nodejs
Öffnen Sie `src/index.ts`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `src/index.ts`:

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

**REPLACE** in der Region `generate` in `src/index.ts`:

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Eine Änderung in `generate`: Der Text, den `runSession` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `src/index.ts`:

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

Die Validierungshilfen stammen aus `src/curator.ts`. Daher ist die einzige Änderung am Dateianfang
der Hilfsimport.

**Ein Blick hinein:** `src/curator.ts` ist die konkrete Antwort auf „die Anwendung beweist das,
nicht das Modell“. `validateExhibit` teilt den Text in Zeilen auf, zählt Treffer von `titlePattern`,
findet die Überschriften `## Narrative` und `## Visitor questions`, zählt mit `wordPattern` die
Wörter der Erzählung, sammelt nummerierte Einträge mit `questionPattern` und durchsucht den gesamten
Text nach den fünf Begriffen in `prohibitedVocabulary`. Jede fehlgeschlagene Regel fügt einen
einfachen Satz an `errors` an, und `formatValidation` rendert diese Sätze in den Bericht, den Sie
ausgeben. Zu keinem Zeitpunkt ist ein Modell beteiligt.
:::

:::language python
Öffnen Sie `main.py`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `main.py`:

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

**REPLACE** in der Region `generate` in `main.py`:

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Eine Änderung in `generate`: Der Text, den `run_session` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `main.py`:

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` und `validate_exhibit` stammen aus `curator.py`, daher nennt die Imports-Region
jetzt beide Hilfsfunktionen.

**Ein Blick hinein:** `curator.py` ist die konkrete Antwort auf „die Anwendung beweist das, nicht
das Modell“. `validate_exhibit` teilt den Text in Zeilen auf, zählt Treffer von `_TITLE_PATTERN`,
findet die Überschriften `## Narrative` und `## Visitor questions`, zählt mit `_WORD_PATTERN` die
Wörter der Erzählung, sammelt nummerierte Einträge mit `_QUESTION_PATTERN` und durchsucht den
gesamten Text nach den fünf Begriffen in `PROHIBITED_VOCABULARY`. Jede fehlgeschlagene Regel fügt
einen einfachen Satz an `errors` an, und `format_validation` rendert diese Sätze in den Bericht, den
Sie ausgeben. Zu keinem Zeitpunkt ist ein Modell beteiligt.
:::

:::language go
Öffnen Sie `main.go`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `generate` in `main.go`:

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

Eine Änderung in `generate`: Der Text, den `runSession` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `main.go`:

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` und `ValidateExhibit` befinden sich in `curator.go` im selben Paket. Daher müssen
Sie keinen Import hinzufügen.

**Ein Blick hinein:** `curator.go` ist die konkrete Antwort auf „die Anwendung beweist das, nicht
das Modell“. `ValidateExhibit` teilt den Text in Zeilen auf, zählt Treffer des Titelmusters, findet
die Überschriften `## Narrative` und `## Visitor questions`, zählt Wörter in der Erzählung, sammelt
nummerierte Einträge und durchsucht den in Kleinschreibung umgewandelten Text nach den fünf
Begriffen in `prohibitedVocabulary`. Jede fehlgeschlagene Regel fügt einen einfachen Satz an
`validation.Errors` an, und `FormatValidation` rendert diese Sätze in den Bericht, den Sie ausgeben.
Zu keinem Zeitpunkt ist ein Modell beteiligt.
:::

:::language rust
Öffnen Sie `src/main.rs`. In diesem Schritt ändern sich drei Regionen.

**REPLACE** in der Region `imports` in `src/main.rs`:

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

**REPLACE** in der Region `generate` in `src/main.rs`:

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Eine Änderung in `generate`: Der Text, den `run_session` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `src/main.rs`:

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` und `validate_exhibit` stammen aus `src/lib.rs`, daher bindet die Region
`imports` sie ein, bevor der Bericht ausgegeben wird.

**Ein Blick hinein:** `src/lib.rs` ist die konkrete Antwort auf „die Anwendung beweist das, nicht
das Modell“. `validate_exhibit` teilt den Text in Zeilen auf, zählt Treffer des Titelmusters, findet
die Überschriften `## Narrative` und `## Visitor questions`, zählt Wörter in der Erzählung, sammelt
nummerierte Einträge und durchsucht den in Kleinschreibung umgewandelten Text nach den fünf
Begriffen in `PROHIBITED_VOCABULARY`. Jede fehlgeschlagene Regel fügt einen einfachen Satz zu
`errors` hinzu, und `format_validation` rendert diese Sätze in den Bericht, den Sie ausgeben. Zu
keinem Zeitpunkt ist ein Modell beteiligt.
:::

:::language java
Öffnen Sie `src/main/java/workshop/MuseumExhibitStudio.java`. In diesem Schritt ändern sich zwei Regionen.

**REPLACE** in der Region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Eine Änderung in `generate`: Der Text, den `runSession` bereits zurückgegeben hat, wird jetzt in `exhibit` gespeichert.

**INSERT** in der Region `validate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` befindet sich im selben Paket `workshop`. Daher müssen Sie am Dateianfang nichts Neues hinzufügen.

**Ein Blick hinein:** `CuratorValidation.java` ist die konkrete Antwort auf „die Anwendung beweist das, nicht das Modell“. `validateExhibit` teilt den Text in Zeilen auf, zählt Treffer von `TITLE_PATTERN`, findet die Überschriften `## Narrative` und `## Visitor questions`, zählt mit `WORD_PATTERN` die Wörter der Erzählung, sammelt nummerierte Einträge mit `QUESTION_PATTERN` und durchsucht den in Kleinschreibung umgewandelten Text nach den fünf Begriffen in `PROHIBITED_VOCABULARY`. Jede fehlgeschlagene Regel fügt einen einfachen Satz an `errors` an, und `formatValidation` rendert diese Sätze in den Bericht, den Sie ausgeben. Zu keinem Zeitpunkt ist ein Modell beteiligt.
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

Die Ausstellung wird wie zuvor gestreamt, und danach erscheint ein Urteil darunter:

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

Ein fehlgeschlagener Durchlauf ist genauso aufschlussreich, und irgendwann werden Sie einen sehen –
die Länge der Erzählung ist meist der Grund:

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

Der Durchlauf wird trotzdem erfolgreich beendet. Das ist beabsichtigt: Der Bericht ist für einen
menschlichen Kurator gedacht, der entscheidet, ob veröffentlicht wird, nicht als Build-Gate. Führen
Sie die Ausstellung erneut aus, oder grenzen Sie die Faktenliste enger ein, und versuchen Sie es
noch einmal.

Erzwingen Sie absichtlich einen Fehler, um zu sehen, wie die Vokabularregel anschlägt. Geben Sie einen einzelnen eigenen Fakt an:

```text
The museum's ticketing terminal was installed in 1998.
```

Die Ausstellung wiederholt das Wort `terminal`, und der Bericht markiert es – die Prüfung liest die
Ausgabe, nicht Ihre Absicht.

## Verständnis prüfen

- Der Bericht sagt, dass die Struktur bestanden hat. Was hat er Ihnen über die Ausstellung *nicht* gesagt?
- Ein Strukturfehler stoppt das Programm nicht. Wann wäre es richtig, daraus einen harten Fehler zu
  machen, und wann wäre es falsch?
- Der Validator ist deterministisch. Warum ist das für ein Museum wichtiger als ein etwas intelligenterer
  modellbasierter Prüfer?

## Weitere Informationen

- [Hook für übermittelte Benutzer-Prompts](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  einen Prompt im Code prüfen oder ablehnen, bevor die Runtime ihn sendet.
- [Hook für transformierte Benutzer-Prompts](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  den modellseitigen Prompt lesen, den die Runtime tatsächlich erstellt hat.
- [Hooks-Übersicht](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md):
  an welcher Stelle in einer Unterhaltungsrunde jeder Hook greift, wenn Sie eine Prüfung möchten, die die Runtime erzwingt,
  statt einer Prüfung, die Sie erst danach ausführen.

Weiter mit [Mit Wikipedia MCP recherchieren](museum-07-wikipedia-research.md).
