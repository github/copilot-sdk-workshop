# Paso 5: Comprueba la estructura

> **Tiempo:** 10 minutos

## Qué vas a crear

Un informe PASS/FAIL impreso debajo de cada exposición. Dos líneas de código nuevo: captura el texto
que el ejecutor de sesiones ya devolvía y pásaselo al validador ya preparado.

## Qué pueden y qué no pueden demostrar las comprobaciones deterministas

El validador del módulo auxiliar es código normal sin ningún modelo dentro. Dado el mismo texto,
siempre devuelve el mismo veredicto. Comprueba:

- exactamente un título de nivel uno
- una sección `## Narrative`
- una narración de 100–140 palabras
- una sección `## Visitor questions` con exactamente tres elementos numerados
- que todos los elementos numerados terminen en signo de interrogación
- sin vocabulario prohibido (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

Eso es un contrato **estructural**, y es realmente exigible. No es uno **fáctico**. Una exposición
perfectamente estructurada aún puede contener una afirmación que ningún hecho aprobado respalde. El
informe termina indicándolo, y esa frase es el límite honesto de esta aplicación:

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

No estás escribiendo el validador. Aprender a *reaccionar* a un veredicto de una máquina —y saber
exactamente qué no cubre— es la lección.

## Conecta el validador

:::language dotnet
Abre `Program.cs`. En este paso cambian dos regiones.

**REPLACE** en la región `generate` de `Program.cs`:

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Un cambio en `generate`: el texto que `RunSessionAsync` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `Program.cs`:

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` ya está en el espacio de nombres `MuseumExhibitStudio.Helpers` que incorpora la
región `imports`, así que no hay nada nuevo que añadir al principio del archivo.

**Mira dentro:** `Helpers/CuratorValidation.cs` es la respuesta concreta a "la aplicación lo
demuestra, no el modelo". `ValidateExhibit` divide el texto en líneas, cuenta las coincidencias de
`TitlePattern`, localiza los encabezados `## Narrative` y `## Visitor questions`, cuenta las
palabras de la narración con `WordPattern`, recopila elementos numerados con `QuestionPattern` y
examina todo el texto en busca de los cinco términos de `ProhibitedVocabulary`. Cada regla fallida
añade una frase sencilla a `Errors`, y `FormatValidation` las convierte en el informe que imprimes.
No interviene ningún modelo en ningún momento.
:::

:::language nodejs
Abre `src/index.ts`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `src/index.ts`:

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

**REPLACE** en la región `generate` de `src/index.ts`:

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Un cambio en `generate`: el texto que `runSession` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `src/index.ts`:

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

Los auxiliares de validación proceden de `src/curator.ts`, así que el único cambio al principio del
archivo es la importación de auxiliares.

**Mira dentro:** `src/curator.ts` es la respuesta concreta a "la aplicación lo demuestra, no el
modelo". `validateExhibit` divide el texto en líneas, cuenta las coincidencias de `titlePattern`,
localiza los encabezados `## Narrative` y `## Visitor questions`, cuenta las palabras de la
narración con `wordPattern`, recopila elementos numerados con `questionPattern` y examina todo el
texto en busca de los cinco términos de `prohibitedVocabulary`. Cada regla fallida añade una frase
sencilla a `errors`, y `formatValidation` las convierte en el informe que imprimes. No interviene
ningún modelo en ningún momento.
:::

:::language python
Abre `main.py`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `main.py`:

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

**REPLACE** en la región `generate` de `main.py`:

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Un cambio en `generate`: el texto que `run_session` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `main.py`:

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` y `validate_exhibit` proceden de `curator.py`, así que la región de
importaciones ahora incluye ambos auxiliares.

**Mira dentro:** `curator.py` es la respuesta concreta a "la aplicación lo demuestra, no el modelo".
`validate_exhibit` divide el texto en líneas, cuenta las coincidencias de `_TITLE_PATTERN`, localiza
los encabezados `## Narrative` y `## Visitor questions`, cuenta las palabras de la narración con
`_WORD_PATTERN`, recopila elementos numerados con `_QUESTION_PATTERN` y examina todo el texto en
busca de los cinco términos de `PROHIBITED_VOCABULARY`. Cada regla fallida añade una frase sencilla
a `errors`, y `format_validation` las convierte en el informe que imprimes. No interviene ningún
modelo en ningún momento.
:::

:::language go
Abre `main.go`. En este paso cambian dos regiones.

**REPLACE** en la región `generate` de `main.go`:

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

Un cambio en `generate`: el texto que `runSession` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `main.go`:

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` y `ValidateExhibit` viven en `curator.go` en el mismo paquete, así que no hay
ninguna importación que añadir.

**Mira dentro:** `curator.go` es la respuesta concreta a "la aplicación lo demuestra, no el modelo".
`ValidateExhibit` divide el texto en líneas, cuenta coincidencias de patrones de título, localiza
los encabezados `## Narrative` y `## Visitor questions`, cuenta las palabras de la narración,
recopila elementos numerados y examina el texto en minúsculas en busca de los cinco términos de
`prohibitedVocabulary`. Cada regla fallida añade una frase sencilla a `validation.Errors`, y
`FormatValidation` las convierte en el informe que imprimes. No interviene ningún modelo en ningún
momento.
:::

:::language rust
Abre `src/main.rs`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `src/main.rs`:

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

**REPLACE** en la región `generate` de `src/main.rs`:

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Un cambio en `generate`: el texto que `run_session` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `src/main.rs`:

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` y `validate_exhibit` proceden de `src/lib.rs`, así que la región `imports` los
incorpora antes de que se imprima el informe.

**Mira dentro:** `src/lib.rs` es la respuesta concreta a "la aplicación lo demuestra, no el modelo".
`validate_exhibit` divide el texto en líneas, cuenta coincidencias de patrones de título, localiza
los encabezados `## Narrative` y `## Visitor questions`, cuenta las palabras de la narración,
recopila elementos numerados y examina el texto en minúsculas en busca de los cinco términos de
`PROHIBITED_VOCABULARY`. Cada regla fallida añade una frase sencilla a `errors`, y
`format_validation` las convierte en el informe que imprimes. No interviene ningún modelo en ningún
momento.
:::

:::language java
Abre `src/main/java/workshop/MuseumExhibitStudio.java`. En este paso cambian dos regiones.

**REPLACE** en la región `generate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Un cambio en `generate`: el texto que `runSession` ya devolvía ahora se conserva en `exhibit`.

**INSERT** en la región `validate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` está en el mismo paquete `workshop`, así que no hay nada nuevo que añadir al principio del archivo.

**Mira dentro:** `CuratorValidation.java` es la respuesta concreta a "la aplicación lo demuestra, no el modelo". `validateExhibit` divide el texto en líneas, cuenta las coincidencias de `TITLE_PATTERN`, localiza los encabezados `## Narrative` y `## Visitor questions`, cuenta las palabras de la narración con `WORD_PATTERN`, recopila elementos numerados con `QUESTION_PATTERN` y examina el texto en minúsculas en busca de los cinco términos de `PROHIBITED_VOCABULARY`. Cada regla fallida añade una frase sencilla a `errors`, y `formatValidation` las convierte en el informe que imprimes. No interviene ningún modelo en ningún momento.
:::

## Ejecútalo

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

La exposición se transmite en streaming como antes, y después aparece un veredicto debajo:

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

Una ejecución fallida es igual de informativa, y acabarás viendo una: la longitud de la narración es
la culpable habitual:

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

La ejecución sigue terminando correctamente. Es deliberado: el informe es para un conservador humano
que decide si publicar, no una condición que bloquee la compilación. Vuelve a ejecutar la exposición
o ajusta la lista de hechos, e inténtalo de nuevo.

Fuerza un fallo a propósito para ver cómo se activa la regla de vocabulario. Proporciona un único hecho propio:

```text
The museum's ticketing terminal was installed in 1998.
```

La exposición repetirá la palabra `terminal`, y el informe la señalará: la comprobación lee la
salida, no tu intención.

## Comprueba lo que has aprendido

- El informe dice que la estructura ha pasado. ¿Qué *no* te ha dicho sobre la exposición?
- Un fallo estructural no detiene el programa. ¿Cuándo sería correcto convertirlo en un fallo bloqueante, y
  cuándo sería incorrecto?
- El validador es determinista. ¿Por qué importa eso más en un museo que un revisor basado en un modelo
  un poco más inteligente?

## Más información

- [Hook de prompt de usuario enviado](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  comprobar o rechazar un prompt en el código antes de que el runtime lo envíe.
- [Hook de prompt de usuario transformado](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  leer el prompt que recibe el modelo y que el runtime ha creado realmente.
- [Información general sobre hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md):
  dónde se sitúa cada hook en un turno, si quieres una comprobación que el runtime aplique en lugar de una que ejecutes
  después.

Continúa con [Investiga con Wikipedia MCP](museum-07-wikipedia-research.md).
