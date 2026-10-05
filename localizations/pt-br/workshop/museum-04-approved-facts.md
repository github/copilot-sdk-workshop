# Etapa 4: Fundamente em fatos aprovados

> **Tempo:** 15 minutos

## O que você vai criar

Até agora, o curador escreveu a partir da memória do modelo. Isso é inaceitável para um museu: uma
legenda de exposição é uma afirmação institucional, e "o modelo sabia" não é uma fonte.

Nesta etapa, o educador fornece os fatos e o **aplicativo** os entrega ao curador por meio de uma
ferramenta que ele possui. Você registra a ferramenta pronta `approved_fact_lookup`, faz dela a
única ferramenta que o modelo pode chamar e escreve um prompt que ordena ao curador chamá-la antes
de escrever uma palavra. Você também chama o seletor pronto que permite ao educador escolher um dos
três conjuntos de fatos aprovados ou digitar o próprio conjunto, e coloca o ciclo de vida da sessão
em um pequeno executor que as etapas posteriores reutilizam.

## Por que os fatos ficam por trás de uma ferramenta, não dentro do prompt

Você poderia colar a lista de fatos no texto do prompt. Muitos aplicativos fazem isso. Mas, nesse
caso, os fatos são apenas mais palavras em uma solicitação que o modelo pode ler de forma vaga, e
cada execução carrega o catálogo inteiro, quer o modelo precise dele ou não.

Uma [**ferramenta local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
é diferente. Ela é executada dentro do seu processo, seu código decide o que ela retorna, e a
transcrição registra o momento em que o modelo a solicitou. `approved_fact_lookup` é essa
ferramenta. Ela não recebe argumentos e retorna a lista limitada de fatos aprovados; assim, duas
execuções no mesmo conjunto de fatos fazem a mesma pergunta e recebem a mesma resposta — a
fundamentação permanece determinística.

Os auxiliares já controlam a ferramenta e os limites. `boundFacts` remove espaços extras de cada
fato, descarta entradas em branco e rejeita o lote quando ele está vazio, tem mais de 20 fatos ou
contém um fato com mais de 500 caracteres. A fábrica de ferramentas aplica esses limites a tudo que
recebe, então o modelo nunca pode receber uma lista sem limites. Limites não são gentileza: uma
lista de fatos sem limites representa custo, latência e superfície de ataque imprevisíveis.

`skip permission` está definido nesta ferramenta porque ela só lê dados pertencentes ao aplicativo
que o educador acabou de aprovar na tela. O processo externo da Wikipedia na Etapa 6 recebe um
limite de permissão.

Este é o equivalente de museu de `accessibility_rule_lookup` na trilha de acessibilidade: uma
ferramenta local de zero argumentos, pertencente ao aplicativo, que entrega ao modelo dados
selecionados que ele não conseguiria acessar de outra forma.

## Duas listas, duas funções diferentes

Registrar uma ferramenta exige duas configurações, e confundi-las é o erro mais comum neste
workshop:

- **`tools`** carrega a *implementação*. É aqui que o runtime fica sabendo que existe uma função chamada
  `approved_fact_lookup` e como executá-la.
- **`availableTools`** é a *lista de permissões*. Ela nomeia quais ferramentas o modelo tem permissão para chamar
  nesta sessão. Uma ferramenta registrada, mas não incluída na lista de permissões, não pode ser chamada.

Você precisa das duas. Nomear apenas `approved_fact_lookup` também exclui todas as outras
ferramentas: esta sessão não oferece leitor de arquivos, shell nem navegador.

O prompt é a terceira peça, e é a mais fraca: ele *pede* ao modelo para chamar a ferramenta e usar
somente o que a ferramenta retorna. A mensagem de sistema da Etapa 3 não diz nada sobre fontes,
então este prompt é o primeiro lugar em que o curador recebe a indicação de onde vêm seus fatos. Um
prompt não faz a chamada acontecer, e não consegue impedir uma chamada. Mantenha a instrução
explícita "call `approved_fact_lookup` first" — nesta fase, você quer que a chamada de ferramenta
seja confiável para poder vê-la.

**Mantenha a execução limitada:** passe explicitamente o **tempo limite de geração de 120 segundos**
existente do auxiliar para o executor da sessão. O executor retorna o texto da exposição para
validação posterior, rejeita saída em branco e limpa a sessão e o cliente mesmo se o stream falhar.
Esses são controles do aplicativo, não instruções para o modelo.

## Registre a ferramenta e crie o prompt

:::language dotnet
Abra `Program.cs`. Cinco regiões mudam nesta etapa. A região `imports` já tem tudo que esta etapa
precisa.

**INSERT** na região `choose-facts` em `Program.cs`:

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

**REPLACE** na região `generate` em `Program.cs`:

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de
configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `Program.cs`:

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

**INSERT** na região `generation-config` em `Program.cs`:

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

**INSERT** na região `session-runner` em `Program.cs`:

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

`RunSessionAsync` usa `CuratorStreamer.GenerationTimeout` de `Helpers/CuratorStreamer.cs` e descarta
a sessão antes de parar o cliente em `finally`. `BuildExhibitPrompt` agora não recebe fato algum —
ele nomeia a ferramenta. `CreateApprovedFactLookup` chama `BoundFacts` internamente, então o limite
se mantém, não importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `CuratorTerminal.ChooseApprovedFacts` lista os
três conjuntos de fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o
educador os confirma ou digita os próprios fatos. `CuratorPrompts.ExhibitStructure` é o layout fixo
de título, narrativa e perguntas; ele fica em `Helpers/CuratorPrompts.cs` porque a Etapa 5 verifica
esse mesmo layout. `CuratorStreamer.SelectedModel` lê a variável de ambiente opcional
`COPILOT_MODEL`.

**Veja por dentro:** `Helpers/CuratorFacts.cs` contém a ferramenta, e vale a pena lê-lo porque é uma
definição real de ferramenta, não apenas código de infraestrutura. `CreateApprovedFactLookup`
captura a lista limitada que o educador acabou de aprovar e a registra por meio de
`CopilotTool.DefineTool` com o nome `approved_fact_lookup`. O manipulador não recebe parâmetros,
então o modelo não pode direcionar o que volta — ele pede e recebe exatamente essa lista.
`SkipPermission = true` está definido ali mesmo porque os dados pertencem ao aplicativo. Os três
conjuntos de fatos e os limites `MaximumFactCount` (20) e `MaximumFactLength` (500), impostos por
`BoundFacts`, estão no mesmo arquivo.
:::

:::language nodejs
Abra `src/index.ts`. Seis regiões mudam nesta etapa, começando pelas importações de que os novos auxiliares precisam.

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
  generationTimeoutMs,
  selectedModel,
  streamExhibit,
} from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

**INSERT** na região `choose-facts` em `src/index.ts`:

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

**REPLACE** na região `generate` em `src/index.ts`:

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de
configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `src/index.ts`:

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

**INSERT** na região `generation-config` em `src/index.ts`:

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

**INSERT** na região `session-runner` em `src/index.ts`:

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

`runSession` passa `generationTimeoutMs` de `src/curator.ts` para o streamer; seus blocos `finally`
aninhados desconectam a sessão e param o cliente. `buildExhibitPrompt` agora não recebe fato algum —
ele nomeia a ferramenta. `createApprovedFactLookup` chama `boundFacts` internamente, então o limite
se mantém, não importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `chooseApprovedFacts` lista os três conjuntos de
fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o educador os confirma
ou digita os próprios fatos. `exhibitStructure` é o layout fixo de título, narrativa e perguntas;
ele fica em `src/curator.ts` porque a Etapa 5 verifica esse mesmo layout. `selectedModel` lê a
variável de ambiente opcional `COPILOT_MODEL`.

**Veja por dentro:** `src/curator.ts` contém a ferramenta, e vale a pena lê-lo porque é uma
definição real de `defineTool`, não apenas código de infraestrutura. `createApprovedFactLookup`
captura a lista limitada que o educador acabou de aprovar e define `approved_fact_lookup` com
`parameters: { type: "object", properties: {}, additionalProperties: false }`, então o modelo não
pode direcionar o que volta — ele pede e recebe exatamente essa lista. `skipPermission: true` está
definido ali mesmo porque os dados pertencem ao aplicativo. Os três conjuntos de fatos e os limites
`maximumFactCount` (20) e `maximumFactLength` (500), impostos por `boundFacts`, estão no mesmo
arquivo.
:::

:::language python
Abra `main.py`. Seis regiões mudam nesta etapa.

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
    selected_model,
    stream_exhibit,
)
from system_messages import CURATOR_SYSTEM_MESSAGE
```

**INSERT** na região `choose-facts` em `main.py`:

```python
        facts = choose_approved_facts()
```

**REPLACE** na região `generate` em `main.py`:

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de
configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `main.py`:

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

**INSERT** na região `generation-config` em `main.py`:

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

**INSERT** na região `session-runner` em `main.py`:

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

`run_session` passa `GENERATION_TIMEOUT_SECONDS` de `curator.py` para o streamer; seus blocos
`finally` desconectam a sessão e param o cliente. `build_exhibit_prompt` agora não recebe fato algum
— ele nomeia a ferramenta. `create_approved_fact_lookup` chama `bound_facts` internamente, então o
limite se mantém, não importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `choose_approved_facts` lista os três conjuntos de
fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o educador os confirma
ou digita os próprios fatos. `EXHIBIT_STRUCTURE` é o layout fixo de título, narrativa e perguntas;
ele fica em `curator.py` porque a Etapa 5 verifica esse mesmo layout. `selected_model` lê a variável
de ambiente opcional `COPILOT_MODEL`; este SDK aceita `model=None`, então a configuração pode deixar
a seleção do modelo para o runtime.

**Veja por dentro:** `curator.py` contém a ferramenta, e vale a pena lê-lo porque é uma definição
real de `@define_tool`, não apenas código de infraestrutura. `create_approved_fact_lookup` captura a
lista limitada que o educador acabou de aprovar e decora uma `approved_fact_lookup()` aninhada que
não recebe argumentos, então o modelo não pode direcionar o que volta — ele pede e recebe exatamente
essa lista. `skip_permission=True` está definido ali mesmo porque os dados pertencem ao aplicativo.
Os três conjuntos de fatos e os limites `MAXIMUM_FACT_COUNT` (20) e `MAXIMUM_FACT_LENGTH` (500),
impostos por `bound_facts`, estão no mesmo arquivo.
:::

:::language go
Abra `main.go`. Seis regiões mudam nesta etapa.

**REPLACE** na região `imports` em `main.go`:

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

**INSERT** na região `choose-facts` em `main.go`:

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

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
	if _, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout); err != nil {
		return err
	}
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de
configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `main.go`:

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

**INSERT** na região `generation-config` em `main.go`:

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

**INSERT** na região `session-runner` em `main.go`:

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

`runSession` passa `GenerationTimeout` de `curator.go` para o streamer e usa `defer` para
desconectar a sessão antes de parar o cliente. `buildExhibitPrompt` agora não recebe fato algum —
ele nomeia a ferramenta. `ApprovedFactLookup` chama `BoundFacts` internamente, então o limite se
mantém, não importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `ChooseApprovedFacts` em `curator.go` lista os
três conjuntos de fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o
educador os confirma ou digita os próprios fatos. `ExhibitStructure` é o layout fixo de título,
narrativa e perguntas; ele fica em `curator.go` porque a Etapa 5 verifica esse mesmo layout.
`SelectedModel` lê a variável de ambiente opcional `COPILOT_MODEL`.

**Veja por dentro:** `curator.go` contém a ferramenta, e vale a pena lê-lo porque é uma definição
real de `copilot.DefineTool`, não apenas código de infraestrutura. `ApprovedFactLookup` captura a
lista limitada que o educador acabou de aprovar e define um manipulador cujo tipo de argumento é
`struct{}`, então o modelo não pode direcionar o que volta — ele pede e recebe exatamente essa
lista. `lookup.SkipPermission = true` está definido ali mesmo porque os dados pertencem ao
aplicativo. Os três conjuntos de fatos e os limites `MaximumFactCount` (20) e `MaximumFactLength`
(500), impostos por `BoundFacts`, estão no mesmo arquivo.
:::

:::language rust
Abra `src/main.rs`. Seis regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/main.rs`:

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

**INSERT** na região `choose-facts` em `src/main.rs`:

```rust
    let facts = choose_approved_facts()?;
```

**REPLACE** na região `generate` em `src/main.rs`:

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de
configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `src/main.rs`:

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

**INSERT** na região `generation-config` em `src/main.rs`:

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

**INSERT** na região `session-runner` em `src/main.rs`:

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

`run_session` passa `GENERATION_TIMEOUT` de `src/lib.rs` para o streamer, desconecta a sessão e para
o cliente antes de propagar erros. `build_exhibit_prompt` agora não recebe fato algum — ele nomeia a
ferramenta. `approved_fact_lookup` chama `bound_facts` internamente, então o limite se mantém, não
importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `choose_approved_facts` lista os três conjuntos de
fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o educador os confirma
ou digita os próprios fatos. `EXHIBIT_STRUCTURE` é o layout fixo de título, narrativa e perguntas;
ele fica em `src/lib.rs` porque a Etapa 5 verifica esse mesmo layout. `selected_model` lê a variável
de ambiente opcional `COPILOT_MODEL`.

**Veja por dentro:** `src/lib.rs` contém tudo isso, e vale a pena lê-lo porque é uma definição real
de ferramenta, não apenas código de infraestrutura. `approved_fact_lookup` captura a lista limitada
que o educador acabou de aprovar e cria uma `Tool` cujo esquema de parâmetros é
`{"type": "object", "properties": {}, "additionalProperties": false}`, então o modelo não pode
direcionar o que volta — ele pede e recebe exatamente essa lista. `.with_skip_permission(true)` está
definido ali mesmo porque os dados pertencem ao aplicativo. Os três conjuntos de fatos e os limites
`MAXIMUM_FACT_COUNT` (20) e `MAXIMUM_FACT_LENGTH` (500), impostos por `bound_facts`, estão no mesmo
arquivo.
:::

:::language java
Abra `src/main/java/workshop/MuseumExhibitStudio.java`. Seis regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/main/java/workshop/MuseumExhibitStudio.java`:

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

**INSERT** na região `choose-facts` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

**REPLACE** na região `generate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

O cliente e a sessão inline das Etapas 1–3 saem de `generate`. Eles passam para o construtor de configuração e o executor de sessão abaixo, para que as etapas posteriores possam reutilizá-los.

**INSERT** na região `exhibit-prompt` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

**INSERT** na região `generation-config` em `src/main/java/workshop/MuseumExhibitStudio.java`:

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

**INSERT** na região `session-runner` em `src/main/java/workshop/MuseumExhibitStudio.java`:

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

`runSession` usa `CuratorStreamer.GENERATION_TIMEOUT` de `CuratorStreamer.java` e fecha a sessão antes de parar o cliente em `finally`. `buildExhibitPrompt` agora não recebe fato algum — ele nomeia a ferramenta. `approvedFactLookup` chama `boundFacts` internamente, então o limite se mantém, não importa quem construa a ferramenta.

Três chamadas auxiliares mantêm esta etapa curta. `CuratorTerminal.chooseApprovedFacts` lista os três conjuntos de fatos, lê a escolha, imprime os fatos e retorna a lista limitada depois que o educador os confirma ou digita os próprios fatos. `CuratorPrompts.EXHIBIT_STRUCTURE` é o layout fixo de título, narrativa e perguntas; ele fica em `CuratorPrompts.java` porque a Etapa 5 verifica esse mesmo layout. `CuratorStreamer.withSelectedModel` lê a variável de ambiente opcional `COPILOT_MODEL` e a aplica à configuração da sessão.

**Veja por dentro:** `CuratorFacts.java` contém a ferramenta, e vale a pena ler esse arquivo porque a ferramenta é uma `ToolDefinition` real, não apenas infraestrutura. `approvedFactLookup` cria um `ApprovedFactReader` privado sobre a lista limitada que o educador acabou de aprovar e vincula o método `read` sem argumentos dele, então o modelo não pode influenciar o que é retornado — o modelo pede e recebe exatamente essa lista. `.skipPermission(true)` é definido ali mesmo porque os dados pertencem ao aplicativo. Os três conjuntos de fatos e os limites `MAXIMUM_FACT_COUNT` (20) e `MAXIMUM_FACT_LENGTH` (500) aplicados por `boundFacts` estão no mesmo arquivo.
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

Agora o aplicativo entrevista você antes de escrever qualquer coisa, e o curador busca visivelmente
os fatos antes de escrever uma palavra:

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

A linha `[tool:start] approved_fact_lookup` é o ponto principal desta etapa. O curador não se
lembrou do recife — ele pediu os fatos ao seu aplicativo, e o aplicativo respondeu.

## Comprove que a ferramenta está fazendo o trabalho

Execute novamente e escolha o conjunto 1 ou 3. A exposição muda de assunto completamente, e o evento
da ferramenta aparece de novo a cada vez. Nada no prompt mudou entre essas execuções: o mesmo texto
do prompt gerou uma exposição sobre o Exército de Terracota porque a ferramenta retornou dados
diferentes. Essa é a diferença entre um prompt que carrega dados e um aplicativo que é dono deles.

Em seguida, responda `n` na confirmação, digite dois ou três fatos próprios e envie uma linha em
branco. O curador escreve sobre o seu assunto em vez disso — os fatos digitados entraram na
ferramenta, e a ferramenta os devolveu ao modelo.

Experimente também o caso de falha. Responda `n` e envie imediatamente uma linha em branco sem
digitar nenhum fato. A execução é interrompida com:

```text
Could not generate the exhibit: Provide at least one approved fact.
```

O seletor de fatos limita tudo o que o educador digita, e os limites rejeitam uma lista vazia,
portanto nenhuma sessão chegou a ser criada e nenhuma solicitação foi enviada. O manipulador de
erros incluído no projeto inicial imprime a mensagem e sai com status 1.

Uma execução que excede seu tempo limite é interrompida da mesma forma, em vez de deixar você esperando indefinidamente:

```text
The curator did not respond in time. Try again.
```

O tempo limite normal é 120 segundos; ele não altera quais fatos ou ferramentas o curador pode usar.

## Verifique seu entendimento

- Você registrou a ferramenta em dois lugares. O que aconteceria se colocasse `approved_fact_lookup` na
  lista de ferramentas, mas a deixasse fora da lista de permissões?
- O prompt diz "Call `approved_fact_lookup` first." Essa frase garante que a chamada
  aconteça? O que nesta etapa tornou a ferramenta *disponível* para ser chamada?
- A ferramenta não recebe argumentos e sempre retorna a mesma lista limitada para um determinado conjunto de fatos. O que
  você perderia se ela recebesse um argumento de consulta de texto livre em vez disso?
- A estrutura de saída é solicitada no prompt. O que realmente verificou que o modelo
  a seguiu até agora?

## Saiba mais

- [Como trabalhar com hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  retornos de chamada que o runtime invoca ao redor de cada chamada de ferramenta, para auditoria ou política que pertence ao seu código.
- [Hook pós-uso de ferramenta](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspecionar ou reescrever o que uma ferramenta retornou antes de o modelo ler.
- [Limpeza de contexto e ferramentas de terminal](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  o que uma ferramenta pode fazer com a própria conversa, e por que a maioria das ferramentas não deveria fazer isso.

Continue para [Comprove a estrutura](museum-06-prove-the-structure.md).
