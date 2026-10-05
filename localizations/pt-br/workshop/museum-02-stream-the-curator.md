# Etapa 2: Transmita o curador em streaming

> **Tempo:** 10 minutos

## O que você vai criar

O mesmo prompt, mas a resposta aparece palavra por palavra em vez de chegar depois de uma pausa silenciosa.

Você não escreverá um loop de eventos. O projeto inicial já inclui uma rotina de impressão em
streaming nos auxiliares prontos do curador: ela assina
[eventos de sessão](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md),
escreve cada delta na saída padrão, relata a atividade de ferramentas, falha em erros de sessão,
impõe um tempo limite, cancela a assinatura em todos os caminhos e retorna o texto completo que
acumulou. Seu trabalho é ativar o streaming e chamá-la.

## Por que o streaming é importante para um curador

Texto de exposição é prosa que uma pessoa precisa ler e julgar. Ver esse texto chegar mostra
imediatamente se o tom está certo, se o modelo está adicionando conteúdo supérfluo e se está se
afastando do assunto — muito antes de a execução terminar. O streaming também oferece um lugar para
perceber chamadas de ferramenta, o que importa a partir da Etapa 4, quando o curador precisa chamar
a ferramenta de fatos do aplicativo antes de poder escrever qualquer coisa.

O auxiliar retorna a resposta inteira como uma string, então daqui em diante você sempre tem o texto
finalizado para inspecionar depois que o stream termina.

## Troque a chamada bloqueante pelo streamer

:::language dotnet
Abra `Program.cs`. Uma região muda nesta etapa.

**REPLACE** na região `generate` em `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Duas alterações: `Streaming = true` na configuração da sessão e `CuratorStreamer.StreamExhibitAsync`
no lugar de `SendAndWaitAsync` e das linhas que imprimiam essa resposta. O manipulador de permissões
da Etapa 1 permanece exatamente onde estava. O auxiliar fica em `Helpers/CuratorStreamer.cs`, e você
nunca o edita.

**Veja por dentro:** abra `Helpers/CuratorStreamer.cs` e leia `StreamExhibitAsync` uma vez. Ele é o
loop de eventos do SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente
funciona. Ele assina com `session.On<SessionEvent>`, acrescenta e escreve cada trecho de
`AssistantMessageDeltaEvent` no momento em que chega, imprime uma linha `[tool:start]` para cada
`ToolExecutionStartEvent` e uma linha `[tool:done]` para cada `ToolExecutionCompleteEvent`, conclui
em `SessionIdleEvent` e falha em `SessionErrorEvent`. Uma disputa com `Task.Delay` transforma o
tempo limite em um `TimeoutException`, e a assinatura é descartada em todos os caminhos.
:::

:::language nodejs
Abra `src/index.ts`. Duas regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

**REPLACE** na região `generate` em `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
    });

    await streamExhibit(
      session,
      "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Duas alterações em `generate`: `streaming: true` na configuração da sessão e `streamExhibit` no
lugar de `sendAndWait` e da linha que imprimia sua resposta. O manipulador de permissões da Etapa 1
permanece exatamente onde estava. O auxiliar fica em `src/curator.ts`, e você nunca o edita.

**Veja por dentro:** abra `src/curator.ts` e leia `streamExhibit` uma vez. Ele é o loop de eventos
do SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente funciona. Ele
assina com `session.on`, escreve cada trecho de `assistant.message_delta` na saída padrão no momento
em que chega, imprime uma linha `[tool:start]` para cada evento `tool.execution_start` e uma linha
`[tool:done]` para cada evento `tool.execution_complete`, resolve a promise em `session.idle` e
rejeita em `session.error`. Um `setTimeout` rejeita se nenhum dos dois chegar, e `finish` cancela a
assinatura em todos os caminhos.
:::

:::language python
Abra `main.py`. Duas regiões mudam nesta etapa.

**REPLACE** na região `imports` em `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

**REPLACE** na região `generate` em `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
            ) as session:
                await stream_exhibit(
                    session,
                    "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

Todo o listener de eventos da Etapa 1 se reduz a uma chamada. `stream_exhibit` fica em `curator.py`,
já faz a correspondência com `AssistantMessageDeltaData`, `SessionErrorData` e `SessionIdleData`, e
você nunca o edita.

**Veja por dentro:** abra `curator.py` e leia `stream_exhibit` uma vez. Ele é o loop de eventos do
SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente funciona. Ele
assina com `session.on`, imprime cada trecho de `AssistantMessageDeltaData` no momento em que chega,
imprime uma linha `[tool:start]` para cada `ToolExecutionStartData` e uma linha `[tool:done]` para
cada `ToolExecutionCompleteData`, define seu evento `done` em `SessionIdleData` e relança
`SessionErrorData` como um `RuntimeError`. `asyncio.wait_for` aplica o tempo limite, e um bloco
`finally` cancela a assinatura em todos os caminhos.
:::

:::language go
Abra `main.go`. Uma região muda nesta etapa.

**REPLACE** na região `generate` em `main.go`:

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
		Streaming:           copilot.Bool(true),
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write two sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Duas alterações: `Streaming: copilot.Bool(true)` na configuração da sessão e `StreamExhibit` no
lugar de `SendAndWait` e das linhas que imprimiam sua resposta. O manipulador de permissões da Etapa
1 permanece exatamente onde estava. O auxiliar fica em `curator.go`, e você nunca o edita.

**Veja por dentro:** abra `curator.go` e leia `StreamExhibit` uma vez. Ele é o loop de eventos do
SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente funciona. Ele
assina com `session.On`, imprime cada trecho de `AssistantMessageDeltaData` no momento em que chega,
imprime uma linha `[tool:start]` para cada `ToolExecutionStartData` e uma linha `[tool:done]` para
cada `ToolExecutionCompleteData`, e registra qualquer `SessionErrorData` para retornar como erro. Em
seguida, ele espera em `session.SendAndWait` dentro de um `context.WithTimeout` criado a partir do
tempo limite que você passa, e um `unsubscribe` adiado é executado em todos os caminhos.
:::

:::language rust
Abra `src/main.rs`. Duas regiões mudam nesta etapa.

**REPLACE** na região `imports` em `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

**REPLACE** na região `generate` em `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write two sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Duas alterações em `generate`: `config.streaming = Some(true)` e `stream_exhibit` no lugar de
`send_and_wait` e das linhas que imprimiam sua resposta. O manipulador de permissões da Etapa 1
permanece exatamente onde estava. Tanto `stream_exhibit` quanto `GENERATION_TIMEOUT` vêm do crate
`museum_exhibit_studio` em `src/lib.rs`, e você nunca edita esse arquivo.

**Veja por dentro:** abra `src/lib.rs` e leia `stream_exhibit` uma vez. Ele é o loop de eventos do
SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente funciona. Ele
assina com `session.subscribe`, imprime e faz flush de cada trecho de `assistant.message_delta` no
momento em que chega, imprime uma linha `[tool:start]` para cada evento `tool.execution_start` e uma
linha `[tool:done]` para cada evento `tool.execution_complete`, finaliza em `session.idle` e retorna
um erro em `session.error`. Ele faz polling do future de envio, do stream de eventos e de um prazo
em conjunto, para que o tempo limite que você passa valha mesmo que nenhum evento jamais chegue.
:::

:::language java
Abra `src/main/java/workshop/MuseumExhibitStudio.java`. Uma região muda nesta etapa.

**REPLACE** na região `generate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)).get();

                CuratorStreamer.streamExhibit(session,
                        "Write two sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Duas alterações: `setStreaming(true)` na configuração da sessão e `CuratorStreamer.streamExhibit` no lugar de `sendAndWait` e das linhas que imprimiam sua resposta. O manipulador de permissões da Etapa 1 permanece exatamente onde estava. O auxiliar fica em `CuratorStreamer.java` ao lado do seu arquivo, e você nunca o edita.

**Veja por dentro:** abra `CuratorStreamer.java` e leia `streamExhibit` uma vez. Ele é o loop de eventos do SDK, e este é o lugar mais claro no workshop para ver como o streaming realmente funciona. Ele registra um listener por tipo de evento: `AssistantMessageDeltaEvent` imprime e acumula cada trecho à medida que chega, `ToolExecutionStartEvent` e `ToolExecutionCompleteEvent` imprimem as linhas `[tool:start]` e `[tool:done]`, `SessionIdleEvent` encerra a linha, e `SessionErrorEvent` é capturado e relançado. O tempo limite que você passa vai para `session.sendAndWait` em milissegundos, e toda assinatura é fechada em um bloco `finally`.
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

O mesmo tipo de resposta aparece, mas desta vez você a vê sendo escrita:

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

O texto cresce no lugar em vez de aparecer inteiro de uma vez, e o programa sai pouco depois da
última palavra. Se você não vir nada até o fim, a sessão não está transmitindo em streaming —
verifique se definiu a flag de streaming na configuração da sessão.

## Verifique seu entendimento

- O streaming é ativado em dois lugares conceitualmente: a configuração da sessão e o código que lê
  eventos. Qual deles você escreveu, e qual deles já pertencia ao auxiliar?
- O auxiliar retorna o texto completo da resposta, embora também o tenha impresso. Por que esse valor
  de retorno importará na Etapa 5?
- Se o modelo nunca ficar ocioso, o que impede seu programa de esperar para sempre?

## Saiba mais

- [Direcionamento e enfileiramento](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  enviar outra mensagem enquanto um turno ainda está sendo transmitido em streaming, em vez de esperar que ele termine.
- [Métricas de uso e cobrança](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  ler contagens de tokens e custo a partir dos mesmos eventos que a rotina de impressão já assina.
- [Limpeza de contexto](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  substituir uma conversa dentro de uma sessão que você quer continuar usando.

Continue para [Dê uma voz ao curador](museum-03-curator-voice.md).
