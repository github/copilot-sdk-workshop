# Etapa 5: Comprove a estrutura

> **Tempo:** 10 minutos

## O que você vai criar

Um relatório PASS/FAIL impresso abaixo de cada exposição. Duas linhas de código novo: capture o
texto que o executor de sessão já retornou e entregue-o ao validador pronto.

## O que as verificações determinísticas podem e não podem comprovar

O validador no módulo auxiliar é código comum, sem nenhum modelo envolvido. Dado o mesmo texto, ele
sempre retorna o mesmo veredito. Ele verifica:

- exatamente um título de nível um
- uma seção `## Narrative`
- uma narrativa de 100–140 palavras
- uma seção `## Visitor questions` com exatamente três itens numerados
- todo item numerado terminando com um ponto de interrogação
- nenhum vocabulário proibido (`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

Esse é um contrato **estrutural**, e é realmente aplicável. Ele não é **factual**. Uma exposição
perfeitamente estruturada ainda pode conter uma afirmação que nenhum fato aprovado sustenta. O
relatório termina dizendo isso, e essa frase é o limite honesto deste aplicativo:

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

Você não está escrevendo o validador. Aprender a *reagir* a um veredito de máquina — e saber
exatamente o que ele não cobre — é a lição.

## Conecte o validador

:::language dotnet
Abra `Program.cs`. Duas regiões mudam nesta etapa.

**REPLACE** na região `generate` em `Program.cs`:

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

Uma mudança em `generate`: o texto que `RunSessionAsync` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `Program.cs`:

```csharp
    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));
```

`CuratorValidation` já está no namespace `MuseumExhibitStudio.Helpers` que a região `imports` traz,
então não há nada novo a adicionar no topo do arquivo.

**Veja por dentro:** `Helpers/CuratorValidation.cs` é a resposta concreta a "o aplicativo comprova
isso, não o modelo". `ValidateExhibit` divide o texto em linhas, conta as correspondências de
`TitlePattern`, localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta as palavras da
narrativa com `WordPattern`, coleta itens numerados com `QuestionPattern` e examina todo o texto em
busca dos cinco termos em `ProhibitedVocabulary`. Cada regra que falha acrescenta uma frase simples
a `Errors`, e `FormatValidation` renderiza essas frases no relatório que você imprime. Nenhum modelo
está envolvido em momento algum.
:::

:::language nodejs
Abra `src/index.ts`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/index.ts`:

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

**REPLACE** na região `generate` em `src/index.ts`:

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

Uma mudança em `generate`: o texto que `runSession` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `src/index.ts`:

```typescript
    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

Os auxiliares de validação vêm de `src/curator.ts`, então a única mudança no topo do arquivo é a
importação do auxiliar.

**Veja por dentro:** `src/curator.ts` é a resposta concreta a "o aplicativo comprova isso, não o
modelo". `validateExhibit` divide o texto em linhas, conta as correspondências de `titlePattern`,
localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta as palavras da narrativa com
`wordPattern`, coleta itens numerados com `questionPattern` e examina todo o texto em busca dos
cinco termos em `prohibitedVocabulary`. Cada regra que falha acrescenta uma frase simples a
`errors`, e `formatValidation` renderiza essas frases no relatório que você imprime. Nenhum modelo
está envolvido em momento algum.
:::

:::language python
Abra `main.py`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `main.py`:

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

**REPLACE** na região `generate` em `main.py`:

```python
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

Uma mudança em `generate`: o texto que `run_session` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `main.py`:

```python
        print()
        print(format_validation(validate_exhibit(exhibit)))
```

`format_validation` e `validate_exhibit` vêm de `curator.py`, então a região de imports agora nomeia
ambos os auxiliares.

**Veja por dentro:** `curator.py` é a resposta concreta a "o aplicativo comprova isso, não o
modelo". `validate_exhibit` divide o texto em linhas, conta as correspondências de `_TITLE_PATTERN`,
localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta as palavras da narrativa com
`_WORD_PATTERN`, coleta itens numerados com `_QUESTION_PATTERN` e examina todo o texto em busca dos
cinco termos em `PROHIBITED_VOCABULARY`. Cada regra que falha acrescenta uma frase simples a
`errors`, e `format_validation` renderiza essas frases no relatório que você imprime. Nenhum modelo
está envolvido em momento algum.
:::

:::language go
Abra `main.go`. Duas regiões mudam nesta etapa.

**REPLACE** na região `generate` em `main.go`:

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

Uma mudança em `generate`: o texto que `runSession` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `main.go`:

```go
	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
```

`FormatValidation` e `ValidateExhibit` ficam em `curator.go` no mesmo pacote, então não há import a
adicionar.

**Veja por dentro:** `curator.go` é a resposta concreta a "o aplicativo comprova isso, não o
modelo". `ValidateExhibit` divide o texto em linhas, conta correspondências do padrão de título,
localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta palavras da narrativa, coleta
itens numerados e examina o texto em minúsculas em busca dos cinco termos em `prohibitedVocabulary`.
Cada regra que falha acrescenta uma frase simples a `validation.Errors`, e `FormatValidation`
renderiza essas frases no relatório que você imprime. Nenhum modelo está envolvido em momento algum.
:::

:::language rust
Abra `src/main.rs`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/main.rs`:

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

**REPLACE** na região `generate` em `src/main.rs`:

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

Uma mudança em `generate`: o texto que `run_session` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `src/main.rs`:

```rust
    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));
```

`format_validation` e `validate_exhibit` vêm de `src/lib.rs`, então a região `imports` os traz antes
de o relatório ser impresso.

**Veja por dentro:** `src/lib.rs` é a resposta concreta a "o aplicativo comprova isso, não o
modelo". `validate_exhibit` divide o texto em linhas, conta correspondências do padrão de título,
localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta palavras da narrativa, coleta
itens numerados e examina o texto em minúsculas em busca dos cinco termos em
`PROHIBITED_VOCABULARY`. Cada regra que falha adiciona uma frase simples a `errors`, e
`format_validation` renderiza essas frases no relatório que você imprime. Nenhum modelo está
envolvido em momento algum.
:::

:::language java
Abra `src/main/java/workshop/MuseumExhibitStudio.java`. Duas regiões mudam nesta etapa.

**REPLACE** na região `generate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        String exhibit = runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

Uma mudança em `generate`: o texto que `runSession` já retornou agora é mantido em `exhibit`.

**INSERT** na região `validate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation` fica no mesmo pacote `workshop`, então não há nada novo a adicionar no topo do arquivo.

**Veja por dentro:** `CuratorValidation.java` é a resposta concreta a "o aplicativo comprova isso, não o modelo". `validateExhibit` divide o texto em linhas, conta correspondências de `TITLE_PATTERN`, localiza os cabeçalhos `## Narrative` e `## Visitor questions`, conta palavras da narrativa com `WORD_PATTERN`, coleta itens numerados com `QUESTION_PATTERN` e examina o texto em minúsculas em busca dos cinco termos em `PROHIBITED_VOCABULARY`. Cada regra que falha adiciona uma frase simples a `errors`, e `formatValidation` renderiza essas frases no relatório que você imprime. Nenhum modelo está envolvido em momento algum.
:::

## Execute

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

A exposição é transmitida em streaming como antes e, em seguida, um veredito aparece abaixo dela:

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

Uma execução com falha é igualmente informativa, e você verá uma em algum momento — o comprimento da
narrativa costuma ser o culpado:

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

A execução ainda termina com êxito. Isso é deliberado: o relatório é para um curador humano decidir
se publica, não um bloqueio de compilação. Execute a exposição novamente, ou restrinja a lista de
fatos, e tente outra vez.

Force uma falha de propósito para ver a regra de vocabulário disparar. Forneça um único fato próprio:

```text
The museum's ticketing terminal was installed in 1998.
```

A exposição repetirá a palavra `terminal`, e o relatório a sinalizará — a verificação lê a saída,
não a sua intenção.

## Verifique seu entendimento

- O relatório diz que a estrutura passou. O que ele *não* disse sobre a exposição?
- Uma falha estrutural não interrompe o programa. Quando torná-la uma falha bloqueante seria correto, e
  quando seria errado?
- O validador é determinístico. Por que isso importa mais para um museu do que importaria um revisor baseado em modelo
  um pouco mais inteligente?

## Saiba mais

- [Hook de envio do prompt do usuário](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  verificar ou rejeitar um prompt no código antes que o runtime o envie.
- [Hook de transformação do prompt do usuário](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  ler o prompt voltado ao modelo que o runtime realmente construiu.
- [Visão geral dos hooks](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md):
  onde cada hook fica em um turno, se você quiser uma verificação que o runtime imponha em vez de uma que você executa
  depois.

Continue para [Pesquise com o Wikipedia MCP](museum-07-wikipedia-research.md).
