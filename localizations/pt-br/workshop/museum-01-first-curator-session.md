# Etapa 1: Sua primeira sessão de curador

> **Tempo:** 10 minutos

## O que você vai criar

Texto de museu real, no seu terminal, em cerca de dez minutos. Você se conecta ao runtime do
Copilot, abre uma conversa, envia um único prompt e imprime o que volta.

Sem mensagem de sistema. Sem catálogo de fatos. Sem ferramentas. Sem interfaces. Nenhum contrato
para implementar — você chama o SDK diretamente. Além do manipulador de erros que o projeto inicial
já envolve ao redor do seu código, os auxiliares prontos do curador aguardam até a Etapa 2 precisar
deles.

## Conheça o cliente e a sessão

O [**runtime do Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recebe prompts, chama modelos e gerencia ferramentas. O **cliente** conecta seu aplicativo a esse
runtime. Uma **sessão** é uma conversa contínua: ela contém as mensagens e os resultados de
ferramentas que compõem o contexto.

Mantenha um cliente ativo para uma parte do trabalho e crie uma sessão para cada conversa
independente. Neste momento, o aplicativo é simplesmente `client -> session -> printed response`.

## Responda às solicitações de permissão antes de enviar

O runtime não decide sozinho se uma chamada de ferramenta pode ser executada. Ele pergunta ao
aplicativo, e o [manipulador de permissões](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
da sessão é quem responde. Quando uma sessão é criada sem um, a solicitação não é negada — ela é
emitida como um evento e deixada pendente para resolução manual, então a execução para e espera por
uma resposta que nunca chega.

Dê a esta primeira sessão um manipulador que aprova tudo para que toda solicitação tenha uma
resposta. Ele aprova solicitações quando as configurações gerenciadas estão desabilitadas, e é um
padrão, não uma medida de segurança: a Etapa 4 mostra o que realmente restringe esta sessão, e as
Etapas 6 e 7 o substituem por manipuladores estreitos e com escopo definido.

## Escreva a sessão

Cada bloco de código daqui em diante nomeia uma região no seu ponto de entrada e diz **INSERT** ou
**REPLACE**. INSERT preenche uma região vazia. REPLACE significa excluir o que está entre as duas
linhas marcadoras da região e depois colar. A [preparação](museum-00-preflight.md) mostra as linhas
marcadoras em "Como as edições funcionam".

:::language dotnet
Abra `Program.cs`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `Program.cs`:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;
```

**REPLACE** na região `banner` em `Program.cs`:

```csharp
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
```

**INSERT** na região `generate` em `Program.cs`:

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

`SendAndWaitAsync` bloqueia até a sessão ficar ociosa, então você obtém a resposta finalizada em uma
só chamada. `await using` descarta a sessão e o cliente na saída. `PermissionHandler.ApproveAll` vem
de `GitHub.Copilot.Rpc`, por isso o segundo `using` está ali.

O `try`/`catch`/`finally` ao redor das suas regiões veio com o projeto inicial. Se algo lançar uma
exceção, ele imprime uma mensagem de `CuratorTerminal.DescribeFailure` e sai com um código diferente
de zero.

Os auxiliares prontos que você começa a chamar na Etapa 2 ficam em `Helpers/CuratorFacts.cs`,
`Helpers/CuratorStreamer.cs`, `Helpers/CuratorValidation.cs`, `Helpers/CuratorSafety.cs`,
`Helpers/CuratorPrompts.cs`, `Helpers/CuratorSystemMessages.cs` e `Helpers/CuratorTerminal.cs`. Você
nunca edita esses arquivos — você os lê.
:::

:::language nodejs
Abra `src/index.ts`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure } from "./curator.js";
```

**REPLACE** na região `banner` em `src/index.ts`:

```typescript
    console.log("=== Museum Exhibit Studio ===");
    console.log();
```

**INSERT** na região `generate` em `src/index.ts`:

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

`sendAndWait` bloqueia até a sessão ficar ociosa, então você obtém a resposta finalizada em uma só
chamada. `approveAll` é importado do SDK junto com `CopilotClient`.

O `try`/`catch`/`finally` ao redor das suas regiões veio com o projeto inicial. Se algo lançar uma
exceção, ele imprime uma mensagem de `describeFailure` em `src/curator.ts` e define um código de
saída diferente de zero.

O módulo auxiliar pronto que você começa a chamar na Etapa 2 fica em `src/curator.ts`, e as
mensagens de sistema que a Etapa 3 usa ficam em `src/system-messages.ts`. Você nunca edita esses
arquivos — você os lê.
:::

:::language python
Abra `main.py`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData

from curator import describe_failure
```

**REPLACE** na região `banner` em `main.py`:

```python
        print("=== Museum Exhibit Studio ===")
        print()
```

**INSERT** na região `generate` em `main.py`:

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

Python escuta eventos da sessão em vez de chamar um auxiliar bloqueante. Imprima a mensagem do
assistente, trate um erro de sessão como falha e espere a ociosidade antes de sair. A Etapa 2
substitui este listener inteiro por uma chamada auxiliar.

O `try`/`except` ao redor das suas regiões veio com o projeto inicial. Se algo lançar uma exceção,
ele imprime uma mensagem de `describe_failure` em `curator.py` e sai com um código diferente de
zero.

`curator.py` ao lado deste arquivo é o módulo auxiliar pronto que você começa a chamar na Etapa 2, e
`system_messages.py` contém as mensagens de sistema que a Etapa 3 usa. Você nunca edita esses
arquivos — você os lê.
:::

:::language go
Abra `main.go`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `main.go`:

```go
import (
	"context"
	"fmt"
	"os"

	copilot "github.com/github/copilot-sdk/go"
)

```

**REPLACE** na região `banner` em `main.go`:

```go
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
```

**INSERT** na região `generate` em `main.go`:

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

`SendAndWait` bloqueia até a sessão ficar ociosa, então você obtém a resposta finalizada em uma só
chamada. A limpeza adiada desconecta a sessão e para o cliente na saída.
`copilot.PermissionHandler.ApproveAll` responde às solicitações de permissão para que a execução não
trave.

O wrapper `main`/`run` e o manipulador de erros ao redor das suas regiões vieram com o projeto
inicial. Se algo retornar um erro, `main` imprime uma mensagem de `DescribeFailure` em `curator.go`
e sai com um código diferente de zero.

Os auxiliares prontos que você começa a chamar na Etapa 2 ficam em `curator.go`, e as mensagens de
sistema que a Etapa 3 usa ficam em `system_messages.go`. Você nunca edita esses arquivos — você os
lê.
:::

:::language rust
Abra `src/main.rs`. Três regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{RuntimeError, describe_failure};
```

**REPLACE** na região `banner` em `src/main.rs`:

```rust
    println!("=== Museum Exhibit Studio ===");
    println!();
```

**INSERT** na região `generate` em `src/main.rs`:

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

`send_and_wait` bloqueia até a sessão ficar ociosa, então você obtém a resposta finalizada em uma só
chamada. `with_permission_handler(permission::approve_all())` impede que solicitações de ferramentas
travem enquanto a sessão ainda é simples.

O wrapper `main`, a função `run`, o código de saída e o manipulador de erros ao redor das suas
regiões vieram com o projeto inicial. Se algo lançar uma exceção, o wrapper imprime uma mensagem de
`describe_failure` em `src/lib.rs` e sai com um código diferente de zero.

Os auxiliares prontos que você começa a chamar na Etapa 2 ficam em `src/lib.rs`, e as mensagens de
sistema que a Etapa 3 usa ficam em `src/system_messages.rs`. Você nunca edita esses arquivos — você
os lê.
:::

:::language java
Abra `src/main/java/workshop/MuseumExhibitStudio.java`. Três regiões mudam nesta etapa.

**INSERT** na região `imports` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
```

**REPLACE** na região `banner` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();
```

**INSERT** na região `generate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

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

`sendAndWait` bloqueia até a sessão ficar ociosa, então você obtém a resposta finalizada em uma só chamada. O cliente é fechado quando o bloco try-with-resources termina, e a sessão é fechada antes de `client.stop().get()` ser executado. `PermissionHandler.APPROVE_ALL` vem de `com.github.copilot.rpc`, por isso essa importação está ali.

A estrutura `main`/`run`, o `try`/`catch`/`finally` de nível superior e o tratamento do código de saída vieram com o projeto inicial. Se algo lançar uma exceção, o manipulador de erros imprime uma mensagem por meio de `CuratorTerminal.describeFailure` e sai com um código diferente de zero.

Os auxiliares prontos que você começa a chamar na Etapa 2 ficam ao lado do seu arquivo em `src/main/java/workshop/`: `CuratorFacts.java`, `CuratorStreamer.java`, `CuratorValidation.java`, `CuratorSafety.java`, `CuratorPrompts.java`, `CuratorSystemMessages.java` e `CuratorTerminal.java`. Você nunca edita esses arquivos — você os lê.
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

Sua formulação exata vai variar, mas a saída tem este formato:

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

Duas frases de prosa com cara de museu chegam depois de uma breve pausa. Nada é transmitido em
streaming ainda, nenhum tom é imposto ainda, e nada impede o modelo de ir além do assunto que você
perguntou. Esses são os próximos três passos.

## Verifique seu entendimento

- O que a sessão contém que o cliente não contém?
- A resposta chegou inteira de uma vez após uma pausa. Qual parte do código atual causa isso?
- A sessão respondeu a todas as solicitações de permissão em vez de deixá-las pendentes. Isso tornou a
  sessão mais segura ou apenas permitiu que ela terminasse?
- Nada nesta etapa restringe o que o modelo pode afirmar sobre a Apollo 11. Qual é a única coisa que
  mantém a resposta mais ou menos no assunto agora?

## Saiba mais

- [Crie seu primeiro aplicativo com Copilot](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  o tutorial do GitHub para o mesmo primeiro cliente, sessão e prompt.
- [Retomada e persistência da sessão](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  o que uma sessão mantém e como retomar uma conversa depois.
- [Autenticação](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  as credenciais que um cliente pode usar depois que você passar de `copilot login`.

Continue para [Transmita o curador em streaming](museum-02-stream-the-curator.md).
