# Etapa 2: Transmita uma resposta em streaming

> **Tempo:** 10 minutos

## O que você verá

Você vai configurar uma sessão habilitada para streaming e tornar a conclusão visível. A maioria das
trilhas de linguagem imprime o texto da resposta enquanto a sessão ainda está trabalhando. A trilha
Java habilita a mesma configuração de sessão em streaming e imprime a mensagem concluída do
assistente retornada por `sendAndWait`.

## Como o streaming muda a experiência

[**Streaming**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)
não altera a resposta. Ele muda o momento em que um aplicativo que assina o fluxo de eventos a
recebe. Em vez de esperar por uma mensagem concluída, a sessão emite eventos durante todo o turno:

- Eventos de delta de mensagem do assistente contêm cada novo trecho do texto da resposta.
- O evento de mensagem concluída do assistente contém a mensagem completa.
- Um evento de sessão ociosa significa que o turno e qualquer trabalho de ferramenta terminaram.
- Um evento de erro de sessão relata um turno com falha.

## Por que a saída progressiva parece melhor

Ver o texto chegar faz o aplicativo parecer mais responsivo. Mais tarde, o mesmo fluxo de eventos
mostrará a atividade de ferramentas locais e MCP.

O fluxo da sessão agora é `response deltas -> final message -> idle`.

:::language dotnet
## Transmita a resposta em C#

### 1. Adicione o auxiliar de streaming

Crie `Helpers/ResponseStreamer.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

O caso de mensagem final lida com um runtime que conclui sem enviar deltas. Um erro conclui a tarefa
com uma exceção em vez de parecer um turno bem-sucedido.

### 2. Use o auxiliar

Em `Program.cs`, adicione `using HelloCopilotSDK.Helpers;`; depois, substitua o código da sessão e
da resposta por:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("\nCopilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

## Execute

```bash
dotnet run
```

Os itens com marcadores devem começar a aparecer progressivamente antes de o processo sair:

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| O texto aparece apenas no final | Confirme que `Streaming = true` está no `SessionConfig` desta sessão. |
| O aplicativo sai antes de o texto aparecer | Confirme que o auxiliar aguarda `completed.Task` após `SendAsync`. |
| O texto é impresso duas vezes | Mantenha a condição de guarda `when !receivedDelta` em `AssistantMessageEvent`. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`Helpers/ResponseStreamer.cs`:

```csharp
using GitHub.Copilot;

namespace HelloCopilotSDK.Helpers;

public static class ResponseStreamer
{
    public static async Task SendAndPrintAsync(CopilotSession session, string prompt)
    {
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var receivedDelta = false;

        using var subscription = session.On<SessionEvent>(sessionEvent =>
        {
            switch (sessionEvent)
            {
                case AssistantMessageDeltaEvent delta when !string.IsNullOrEmpty(delta.Data.DeltaContent):
                    receivedDelta = true;
                    Console.Write(delta.Data.DeltaContent);
                    break;
                case AssistantMessageEvent message when !receivedDelta:
                    Console.Write(message.Data.Content);
                    break;
                case SessionIdleEvent:
                    Console.WriteLine();
                    completed.TrySetResult();
                    break;
                case SessionErrorEvent error:
                    completed.TrySetException(new InvalidOperationException(error.Data.Message));
                    break;
            }
        });

        await session.SendAsync(new MessageOptions { Prompt = prompt });
        await completed.Task;
    }
}
```

`Program.cs`:

```csharp
using GitHub.Copilot;
using HelloCopilotSDK.Helpers;

Console.WriteLine("=== Streaming from Copilot ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}\n");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Streaming = true
});

Console.WriteLine("Copilot:");
await ResponseStreamer.SendAndPrintAsync(
    session,
    "Explain accessible names in three short bullet points.");
```

</details>
:::

:::language nodejs
## Transmita a resposta em TypeScript

### 1. Inspecione o auxiliar de streaming

Abra `src/workshop.ts`. O projeto inicial já exporta `streamResponse`, que assina com `session.on`,
imprime deltas do assistente, mantém um fallback de mensagem final, rejeita erros de sessão e
resolve quando a sessão fica ociosa:

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

Os ramos de início e conclusão de ferramenta permanecem silenciosos nesta etapa e se tornam úteis
quando você registrar ferramentas posteriormente.

### 2. Conecte o auxiliar ao ponto de entrada

Substitua `src/index.ts` por:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

## Execute

```bash
npm start
```

A resposta de uma frase deve começar a aparecer progressivamente pelo callback de evento:

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| O texto aparece apenas no final | Confirme que `streaming: true` é passado para `createSession`. |
| O processo sai antes de o texto aparecer | Confirme que `streamResponse` aguarda `session.idle` antes de resolver. |
| O texto é impresso duas vezes | Mantenha a condição de guarda `!receivedDelta` no ramo `assistant.message`. |
| Não é possível encontrar o módulo `./workshop.js` | Importe o auxiliar como `./workshop.js`, embora o arquivo de origem seja `workshop.ts`. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`src/workshop.ts` (`streamResponse`):

```typescript
export async function streamResponse(session: CopilotSession, prompt: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let receivedDelta = false;
    const unsubscribe = session.on((event) => {
      if (event.type === "assistant.message_delta" && event.data.deltaContent) {
        receivedDelta = true;
        process.stdout.write(event.data.deltaContent);
      } else if (event.type === "assistant.message" && !receivedDelta) {
        process.stdout.write(event.data.content);
      } else if (event.type === "tool.execution_start") {
        console.log(`\n[tool:start] ${event.data.toolName}`);
      } else if (event.type === "tool.execution_complete") {
        console.log(`[tool:done] success=${event.data.success}`);
      } else if (event.type === "session.error") {
        reject(new Error(event.data.message));
      } else if (event.type === "session.idle") {
        console.log();
        unsubscribe();
        resolve();
      }
    });
    void session.send({ prompt }).catch(reject);
  });
}
```

`src/index.ts`:

```typescript
import { CopilotClient } from "@github/copilot-sdk";
import { streamResponse } from "./workshop.js";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ streaming: true });
  try {
    await streamResponse(
      session,
      "Describe why streaming improves an interactive assistant in one sentence.",
    );
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
## Transmita a resposta em Python

### 1. Assine os eventos da sessão

Substitua `main.py` por um ponto de entrada assíncrono que habilite streaming, manipule
`AssistantMessageDeltaData`, mantenha um fallback de `AssistantMessageData`, exponha
`SessionErrorData` e aguarde `SessionIdleData`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import (
    AssistantMessageData,
    AssistantMessageDeltaData,
    SessionErrorData,
    SessionIdleData,
)


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send(
                "Explain accessible names in three short bullet points."
            )
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

O caso de mensagem final lida com um runtime que conclui sem deltas. Um erro de sessão define
`error` e conclui a espera para que o turno não pareça bem-sucedido.

## Execute

```bash
python main.py
```

Os itens com marcadores devem começar a aparecer progressivamente pelo callback de evento:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| O texto aparece apenas no final | Confirme que `streaming=True` é passado para `create_session`. |
| O processo sai antes de o texto aparecer | Confirme que você usa `await done.wait()` após `session.send`. |
| O texto é impresso duas vezes | Mantenha a condição de guarda `not received_delta` em `AssistantMessageData`. |
| Erros de importação para eventos de sessão | Importe os tipos de evento de `copilot.session_events`. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`main.py`:

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, AssistantMessageDeltaData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(streaming=True) as session:
            done = asyncio.Event()
            error: RuntimeError | None = None
            received_delta = False

            def on_event(event) -> None:
                nonlocal error, received_delta
                match event.data:
                    case AssistantMessageDeltaData(delta_content=delta) if delta:
                        received_delta = True
                        print(delta, end="", flush=True)
                    case AssistantMessageData(content=content) if content and not received_delta:
                        print(content)
                    case SessionErrorData(message=message):
                        error = RuntimeError(message)
                        done.set()
                    case SessionIdleData():
                        done.set()

            session.on(on_event)
            await session.send("Explain accessible names in three short bullet points.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

</details>
:::

:::language go
## Transmita a resposta em Go

### 1. Adicione o auxiliar de streaming

Em `main.go`, substitua o conteúdo do pacote por um auxiliar `streamResponse` que assina com
`session.On`, imprime `AssistantMessageDeltaData`, mantém um fallback de `AssistantMessageData` após
`SendAndWait` e retorna erros de envio:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func streamResponse(session *copilot.Session, prompt string) error {
	receivedDelta := false
	unsubscribe := session.On(func(event copilot.SessionEvent) {
		if delta, ok := event.Data.(*copilot.AssistantMessageDeltaData); ok {
			receivedDelta = true
			fmt.Print(delta.DeltaContent)
		}
	})
	defer unsubscribe()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{Prompt: prompt})
	if err == nil && !receivedDelta && response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Print(message.Content)
		}
	}
	fmt.Println()
	return err
}
```

### 2. Crie uma sessão em streaming e chame o auxiliar

Adicione `main` abaixo do auxiliar:

```go
func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

## Execute

```bash
go run .
```

Os itens com marcadores devem começar a aparecer progressivamente pelo callback de evento:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| O texto aparece apenas no final | Confirme que `Streaming: copilot.Bool(true)` está definido em `SessionConfig`. |
| O processo sai sem saída | Confirme que `streamResponse` usa `SendAndWait` e retorna seu erro. |
| O texto é impresso duas vezes | Mantenha a condição de guarda `!receivedDelta` antes de imprimir `AssistantMessageData`. |
| Erros de caminho de importação | Use `copilot "github.com/github/copilot-sdk/go"`. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`main.go`:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func streamResponse(session *copilot.Session, prompt string) error {
	receivedDelta := false
	unsubscribe := session.On(func(event copilot.SessionEvent) {
		if delta, ok := event.Data.(*copilot.AssistantMessageDeltaData); ok {
			receivedDelta = true
			fmt.Print(delta.DeltaContent)
		}
	})
	defer unsubscribe()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{Prompt: prompt})
	if err == nil && !receivedDelta && response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Print(message.Content)
		}
	}
	fmt.Println()
	return err
}

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		Streaming: copilot.Bool(true),
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	if err := streamResponse(session, "Explain accessible names in three short bullet points."); err != nil {
		panic(err)
	}
}
```

</details>
:::

:::language rust
## Transmita a resposta em Rust

### 1. Adicione a macro auxiliar de streaming

Substitua `src/main.rs` por uma macro `stream_response!` que chama `session.subscribe()`, imprime
deltas do assistente com `tokio::select!`, mantém um fallback de mensagem final e aguarda até que
tanto a conclusão do envio quanto `session.idle` tenham ocorrido:

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

macro_rules! stream_response {
    ($session:expr, $prompt:expr) => {{
        let mut events = $session.subscribe();
        let send = $session.send($prompt);
        tokio::pin!(send);
        let mut sent = false;
        let mut idle = false;
        let mut received_delta = false;

        while !sent || !idle {
            tokio::select! {
                result = &mut send, if !sent => {
                    result?;
                    sent = true;
                }
                event = events.recv() => {
                    let event = event?;
                    match event.event_type.as_str() {
                        "assistant.message_delta" => {
                            if let Some(delta) = event.data.get("deltaContent").and_then(|value| value.as_str()) {
                                received_delta = true;
                                print!("{delta}");
                                io::stdout().flush()?;
                            }
                        }
                        "assistant.message" if !received_delta => {
                            if let Some(content) = event.data.get("content").and_then(|value| value.as_str()) {
                                print!("{content}");
                                io::stdout().flush()?;
                            }
                        }
                        "session.error" => {
                            let message = event.data.get("message").and_then(|value| value.as_str())
                                .unwrap_or("Copilot session failed");
                            return Err(std::io::Error::new(std::io::ErrorKind::Other, message.to_owned()).into());
                        }
                        "session.idle" => idle = true,
                        _ => {}
                    }
                }
            }
        }
        println!();
    }};
}
```

### 2. Crie uma sessão em streaming e invoque a macro

Adicione o ponto de entrada assíncrono abaixo da macro:

```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

## Execute

```bash
cargo run
```

Os itens com marcadores devem começar a aparecer progressivamente pela assinatura de eventos:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| O texto aparece apenas no final | Confirme `config.streaming = Some(true)` antes de `create_session`. |
| O processo sai antes de o texto aparecer | Mantenha o loop `while !sent \|\| !idle` e aguarde `session.idle`. |
| O texto é impresso duas vezes | Mantenha a condição de guarda `if !received_delta` em `"assistant.message"`. |
| A saída parece estar em buffer | Faça flush de stdout após cada `print!` de conteúdo de delta. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`src/main.rs`:

```rust
use std::io::{self, Write};

use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};

macro_rules! stream_response {
    ($session:expr, $prompt:expr) => {{
        let mut events = $session.subscribe();
        let send = $session.send($prompt);
        tokio::pin!(send);
        let mut sent = false;
        let mut idle = false;
        let mut received_delta = false;

        while !sent || !idle {
            tokio::select! {
                result = &mut send, if !sent => {
                    result?;
                    sent = true;
                }
                event = events.recv() => {
                    let event = event?;
                    match event.event_type.as_str() {
                        "assistant.message_delta" => {
                            if let Some(delta) = event.data.get("deltaContent").and_then(|value| value.as_str()) {
                                received_delta = true;
                                print!("{delta}");
                                io::stdout().flush()?;
                            }
                        }
                        "assistant.message" if !received_delta => {
                            if let Some(content) = event.data.get("content").and_then(|value| value.as_str()) {
                                print!("{content}");
                                io::stdout().flush()?;
                            }
                        }
                        "session.error" => {
                            let message = event.data.get("message").and_then(|value| value.as_str())
                                .unwrap_or("Copilot session failed");
                            return Err(std::io::Error::new(std::io::ErrorKind::Other, message.to_owned()).into());
                        }
                        "session.idle" => idle = true,
                        _ => {}
                    }
                }
            }
        }
        println!();
    }};
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default();
    config.streaming = Some(true);
    let session = client.create_session(config).await?;

    stream_response!(
        session,
        "Explain accessible names in three short bullet points.".to_owned()
    );
    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

</details>
:::

:::language java
## Transmita a resposta em Java

### 1. Habilite streaming na sessão

A implementação do Java SDK usa um `SessionConfig` com streaming habilitado e `sendAndWait`; depois,
imprime a mensagem concluída do assistente. Substitua
`src/main/java/workshop/AccessibilityReport.java` por:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`setStreaming(true)` mantém esta etapa alinhada às outras trilhas de linguagem. A implementação Java
aguarda a resposta concluída de `sendAndWait` e imprime essa mensagem completa quando o turno
termina.

## Execute

```bash
./mvnw compile exec:java
```

A resposta concluída deve ser impressa antes de o processo sair:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solução de problemas desta execução</summary>

| Sintoma | Correção |
|---|---|
| Nenhuma resposta é impressa | Confirme que `setStreaming(true)` está em `SessionConfig` e que você chama `sendAndWait`. |
| O processo falha com uma resposta nula | Mantenha a guarda `response == null` e lance uma exceção quando o turno concluir sem uma mensagem. |
| Maven não consegue encontrar a classe principal | Execute a partir da pasta do projeto inicial com `./mvnw compile exec:java`. |

</details>

> **Você estará pronto para adicionar ferramentas quando:** o caminho de resposta configurado imprimir uma resposta e concluir
> o turno sem ocultar erros da sessão.

<details>
<summary>Implementação completa da Etapa 2</summary>

Compare seu trabalho com esta implementação completa da Etapa 2.

`src/main/java/workshop/AccessibilityReport.java`:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()
                    .setStreaming(true)
                    .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("Explain accessible names in three short bullet points."))
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

## Verifique seu entendimento

Quando um envio com resposta concluída seria uma escolha melhor do que streaming de eventos?

<details>
<summary>Verifique sua resposta</summary>

Use um envio com resposta concluída para trabalho em segundo plano ou código simples de
solicitação/resposta que não precise de saída progressiva nem de eventos intermediários.

</details>

## Saiba mais

- [Direcionamento e enfileiramento](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  enviar outra mensagem enquanto um turno ainda está em execução, seja para redirecioná-lo ou para enfileirar trabalho.
- [Limites de sessão](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  definir um orçamento de AI Credits para uma sessão antes que ela comece a produzir tokens.
- [Métricas de uso e cobrança](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  ler contagens de tokens, uso da janela de contexto e custo do mesmo fluxo de eventos.

Continue para [Etapa 3: Adicione conhecimento pertencente ao aplicativo](03-local-tool.md).
