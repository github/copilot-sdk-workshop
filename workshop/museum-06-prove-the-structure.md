# Step 5: Prove the structure

> **Time:** 10 minutes

## What you'll build

A PASS/FAIL report printed under every exhibit. Two lines of new code: capture the text the session
runner already returned, then hand it to the pre-built validator.

## What deterministic checks can and cannot prove

The validator in the helper module is ordinary code with no model in it. Given the same text it
always returns the same verdict. It checks:

- exactly one level-one title
- a `## Narrative` section
- a narrative of 100–140 words
- a `## Visitor questions` section with exactly three numbered items
- every numbered item ending in a question mark
- no prohibited vocabulary (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

That is a **structural** contract, and it is genuinely enforceable. It is not a **factual** one.
A perfectly structured exhibit can still contain a claim no approved fact supports. The report ends
by saying so, and that sentence is the honest boundary of this application:

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

You are not writing the validator. Learning to *react* to a machine verdict — and to know exactly
what it does not cover — is the lesson.

## Wire the validator

:::language dotnet
Open `Program.cs`. Two regions change in this step.

**REPLACE** region `generate` in `Program.cs`:

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

One change in `generate`: the text `RunSessionAsync` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `Program.cs`:

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` is already in the `MuseumExhibitStudio.Helpers` namespace the `imports` region
brings in, so there is nothing new to add at the top of the file.

**Look inside:** `Helpers/CuratorValidation.cs` is the concrete answer to "the application proves
this, not the model". `ValidateExhibit` splits the text into lines, counts `TitlePattern` matches,
locates the `## Narrative` and `## Visitor questions` headings, counts narrative words with
`WordPattern`, collects numbered items with `QuestionPattern`, and scans the whole text for the
five terms in `ProhibitedVocabulary`. Each failed rule appends a plain sentence to `Errors`, and
`FormatValidation` renders those into the report you print. No model is involved at any point.
:::

:::language nodejs
Open `src/index.ts`. Three regions change in this step.

**REPLACE** region `imports` in `src/index.ts`:

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
```

**REPLACE** region `generate` in `src/index.ts`:

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

One change in `generate`: the text `runSession` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `src/index.ts`:

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

The validation helpers come from `src/curator.ts`, so the only top-of-file change is the helper
import.

**Look inside:** `src/curator.ts` is the concrete answer to "the application proves this, not the
model". `validateExhibit` splits the text into lines, counts `titlePattern` matches, locates the
`## Narrative` and `## Visitor questions` headings, counts narrative words with `wordPattern`,
collects numbered items with `questionPattern`, and scans the whole text for the five terms in
`prohibitedVocabulary`. Each failed rule appends a plain sentence to `errors`, and
`formatValidation` renders those into the report you print. No model is involved at any point.
:::

:::language python
Open `main.py`. Three regions change in this step.

**REPLACE** region `imports` in `main.py`:

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
```

**REPLACE** region `generate` in `main.py`:

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

One change in `generate`: the text `run_session` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `main.py`:

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` and `validate_exhibit` come from `curator.py`, so the imports region now names
both helpers.

**Look inside:** `curator.py` is the concrete answer to "the application proves this, not the
model". `validate_exhibit` splits the text into lines, counts `_TITLE_PATTERN` matches, locates the
`## Narrative` and `## Visitor questions` headings, counts narrative words with `_WORD_PATTERN`,
collects numbered items with `_QUESTION_PATTERN`, and scans the whole text for the five terms in
`PROHIBITED_VOCABULARY`. Each failed rule appends a plain sentence to `errors`, and
`format_validation` renders those into the report you print. No model is involved at any point.
:::

:::language go
Open `main.go`. Two regions change in this step.

**REPLACE** region `generate` in `main.go`:

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

One change in `generate`: the text `runSession` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `main.go`:

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` and `ValidateExhibit` live in `curator.go` in the same package, so there is no
import to add.

**Look inside:** `curator.go` is the concrete answer to "the application proves this, not the
model". `ValidateExhibit` splits the text into lines, counts title-pattern matches, locates the
`## Narrative` and `## Visitor questions` headings, counts narrative words, collects numbered
items, and scans the lowercased text for the five terms in `prohibitedVocabulary`. Each failed rule
appends a plain sentence to `validation.Errors`, and `FormatValidation` renders those into the
report you print. No model is involved at any point.
:::

:::language rust
Open `src/main.rs`. Three regions change in this step.

**REPLACE** region `imports` in `src/main.rs`:

```rust
use std::time::Duration;

use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    APPROVED_FACT_LOOKUP_NAME, EXHIBIT_STRUCTURE, GENERATION_TIMEOUT, RuntimeError,
    approved_fact_lookup, choose_approved_facts, describe_failure, format_validation,
    selected_model, stream_exhibit, validate_exhibit,
};
```

**REPLACE** region `generate` in `src/main.rs`:

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

One change in `generate`: the text `run_session` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `src/main.rs`:

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` and `validate_exhibit` come from `src/lib.rs`, so the `imports` region brings
them in before the report is printed.

**Look inside:** `src/lib.rs` is the concrete answer to "the application proves this, not the
model". `validate_exhibit` splits the text into lines, counts title-pattern matches, locates the
`## Narrative` and `## Visitor questions` headings, counts narrative words, collects numbered
items, and scans the lowercased text for the five terms in `PROHIBITED_VOCABULARY`. Each failed
rule pushes a plain sentence onto `errors`, and `format_validation` renders those into the report
you print. No model is involved at any point.
:::

:::language java
Open `src/main/java/workshop/MuseumExhibitStudio.java`. Two regions change in this step.

**REPLACE** region `generate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

One change in `generate`: the text `runSession` already returned is now kept in `exhibit`.

**INSERT** region `validate` in `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` sits in the same `workshop` package, so there is nothing new to add at the top of the file.

**Look inside:** `CuratorValidation.java` is the concrete answer to "the application proves this, not the model". `validateExhibit` splits the text into lines, counts `TITLE_PATTERN` matches, locates the `## Narrative` and `## Visitor questions` headings, counts narrative words with `WORD_PATTERN`, collects numbered items with `QUESTION_PATTERN`, and scans the lowercased text for the five terms in `PROHIBITED_VOCABULARY`. Each failed rule adds a plain sentence to `errors`, and `formatValidation` renders those into the report you print. No model is involved at any point.
:::

## Run it

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

The exhibit streams as before, and then a verdict appears under it:

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

A failing run is just as informative, and you will see one eventually — narrative length is the
usual culprit:

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

The run still exits successfully. That is deliberate: the report is for a human curator deciding
whether to publish, not a build gate. Rerun the exhibit, or tighten the fact list, and try again.

Force a failure on purpose to see the vocabulary rule fire. Supply your own single fact:

```text
The museum's ticketing terminal was installed in 1998.
```

The exhibit will repeat the word `terminal`, and the report flags it — the check reads the output,
not your intent.

## Check your understanding

- The report says the structure passed. What has it *not* told you about the exhibit?
- Structural failure does not stop the program. When would making it a hard failure be right, and
  when would it be wrong?
- The validator is deterministic. Why does that matter more for a museum than a slightly smarter
  model-based reviewer would?

## Learn more

- [User prompt submitted hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  checking or rejecting a prompt in code before the runtime sends it.
- [User prompt transformed hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  reading the model-facing prompt the runtime actually built.
- [Hooks overview](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md):
  where each hook sits in a turn, if you want a check the runtime enforces rather than one you run
  afterwards.

Continue to [Research with Wikipedia MCP](museum-07-wikipedia-research.md).
