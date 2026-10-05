# Paso 2: Transmite una respuesta en streaming

> **Tiempo:** 10 minutos

## Qué verás

Configurarás una sesión con streaming habilitado y harás visible la finalización. La mayoría de las
rutas de lenguaje imprimen el texto de respuesta mientras la sesión aún está trabajando. La ruta de
Java habilita la misma configuración de sesión con streaming e imprime el mensaje completado del
asistente que devuelve `sendAndWait`.

## Cómo cambia el streaming la experiencia

El
[**streaming**](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md)
no cambia la respuesta. Cambia cuándo la recibe una aplicación que se suscribe al flujo de eventos.
En lugar de esperar a un único mensaje completado, la sesión emite eventos durante todo el turno:

- Los eventos delta del mensaje del asistente contienen cada nuevo fragmento de texto de respuesta.
- El evento de mensaje completado del asistente contiene el mensaje completo.
- Un evento de sesión inactiva significa que el turno y cualquier trabajo de herramienta han terminado.
- Un evento de error de sesión notifica un turno con errores.

## Por qué la salida progresiva resulta mejor

Ver cómo llega el texto hace que la aplicación parezca más ágil. Más adelante, el mismo flujo de
eventos mostrará la actividad de herramientas locales y MCP.

El flujo de la sesión ahora es `response deltas -> final message -> idle`.

:::language dotnet
## Transmite la respuesta en streaming en C#

### 1. Añade el auxiliar de streaming

Crea `Helpers/ResponseStreamer.cs`:

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

El caso de mensaje final gestiona un runtime que se completa sin enviar deltas. Un error completa la
tarea con una excepción en lugar de parecer un turno correcto.

### 2. Usa el auxiliar

En `Program.cs`, añade `using HelloCopilotSDK.Helpers;` y después sustituye el código de la sesión y
de la respuesta por:

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

## Ejecútalo

```bash
dotnet run
```

Las viñetas deberían empezar a aparecer progresivamente antes de que salga el proceso:

```text
Connected to the Copilot runtime: ...

Copilot:
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| El texto aparece solo al final | Confirma que `Streaming = true` esté en el `SessionConfig` de esta sesión. |
| La aplicación sale antes de que aparezca el texto | Confirma que el auxiliar espere `completed.Task` después de `SendAsync`. |
| El texto se imprime dos veces | Mantén la protección `when !receivedDelta` en `AssistantMessageEvent`. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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
## Transmite la respuesta en streaming en TypeScript

### 1. Inspecciona el auxiliar de streaming

Abre `src/workshop.ts`. El proyecto inicial ya exporta `streamResponse`, que se suscribe con
`session.on`, imprime los deltas del asistente, mantiene una reserva de mensaje final, rechaza los
errores de sesión y se resuelve cuando la sesión queda inactiva:

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

Las ramas de inicio y finalización de herramientas permanecen silenciosas en este paso y serán
útiles cuando registres herramientas más adelante.

### 2. Conecta el auxiliar al punto de entrada

Sustituye `src/index.ts` por:

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

## Ejecútalo

```bash
npm start
```

La respuesta de una sola frase debería empezar a aparecer progresivamente mediante el callback de eventos:

```text
Streaming shows partial answers as soon as tokens arrive, so the assistant feels responsive while it works.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| El texto aparece solo al final | Confirma que `streaming: true` se pase a `createSession`. |
| El proceso sale antes de que aparezca el texto | Confirma que `streamResponse` espere a `session.idle` antes de resolverse. |
| El texto se imprime dos veces | Mantén la protección `!receivedDelta` en la rama `assistant.message`. |
| No se encuentra el módulo `./workshop.js` | Importa el auxiliar como `./workshop.js`, aunque el archivo de origen sea `workshop.ts`. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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
## Transmite la respuesta en streaming en Python

### 1. Suscríbete a eventos de sesión

Sustituye `main.py` por un punto de entrada asíncrono que habilite el streaming, gestione
`AssistantMessageDeltaData`, mantenga una reserva de `AssistantMessageData`, muestre
`SessionErrorData` y espere a `SessionIdleData`:

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

El caso de mensaje final gestiona un runtime que se completa sin deltas. Un error de sesión
establece `error` y completa la espera para que el turno no parezca correcto.

## Ejecútalo

```bash
python main.py
```

Las viñetas deberían empezar a aparecer progresivamente mediante el callback de eventos:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| El texto aparece solo al final | Confirma que `streaming=True` se pase a `create_session`. |
| El proceso sale antes de que aparezca el texto | Confirma que haces `await done.wait()` después de `session.send`. |
| El texto se imprime dos veces | Mantén la protección `not received_delta` en `AssistantMessageData`. |
| Errores de importación para eventos de sesión | Importa los tipos de evento desde `copilot.session_events`. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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
## Transmite la respuesta en streaming en Go

### 1. Añade el auxiliar de streaming

En `main.go`, sustituye el contenido del paquete por un auxiliar `streamResponse` que se suscriba
con `session.On`, imprima `AssistantMessageDeltaData`, mantenga una reserva de
`AssistantMessageData` después de `SendAndWait` y devuelva errores de envío:

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

### 2. Crea una sesión con streaming y llama al auxiliar

Añade `main` debajo del auxiliar:

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

## Ejecútalo

```bash
go run .
```

Las viñetas deberían empezar a aparecer progresivamente mediante el callback de eventos:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| El texto aparece solo al final | Confirma que `Streaming: copilot.Bool(true)` esté definido en `SessionConfig`. |
| El proceso sale sin salida | Confirma que `streamResponse` use `SendAndWait` y devuelva su error. |
| El texto se imprime dos veces | Mantén la protección `!receivedDelta` antes de imprimir `AssistantMessageData`. |
| Errores de ruta de importación | Usa `copilot "github.com/github/copilot-sdk/go"`. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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
## Transmite la respuesta en streaming en Rust

### 1. Añade la macro auxiliar de streaming

Sustituye `src/main.rs` por una macro `stream_response!` que llame a `session.subscribe()`, imprima
los deltas del asistente con `tokio::select!`, mantenga una reserva de mensaje final y espere hasta
que se hayan producido tanto la finalización del envío como `session.idle`:

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

### 2. Crea una sesión con streaming e invoca la macro

Añade el punto de entrada asíncrono debajo de la macro:

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

## Ejecútalo

```bash
cargo run
```

Las viñetas deberían empezar a aparecer progresivamente mediante la suscripción a eventos:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| El texto aparece solo al final | Confirma que `config.streaming = Some(true)` esté antes de `create_session`. |
| El proceso sale antes de que aparezca el texto | Mantén el bucle `while !sent \|\| !idle` y espera a `session.idle`. |
| El texto se imprime dos veces | Mantén la protección `if !received_delta` en `"assistant.message"`. |
| La salida parece almacenada en búfer | Vacía stdout después de cada `print!` de contenido delta. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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
## Transmite la respuesta en streaming en Java

### 1. Habilita el streaming en la sesión

La implementación del SDK de Java usa un `SessionConfig` con streaming habilitado y `sendAndWait`, y
después imprime el mensaje completado del asistente. Sustituye
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

`setStreaming(true)` mantiene este paso alineado con las rutas de los demás lenguajes. La
implementación de Java espera la respuesta completada de `sendAndWait` e imprime ese mensaje
completo cuando termina el turno.

## Ejecútalo

```bash
./mvnw compile exec:java
```

La respuesta completada debería imprimirse antes de que salga el proceso:

```text
- Gives a control a programmatic identity.
- Helps screen-reader users understand its purpose.
- Connects visible labels to form controls.
```

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Corrección |
|---|---|
| No se imprime ninguna respuesta | Confirma que `setStreaming(true)` esté en `SessionConfig` y que llamas a `sendAndWait`. |
| El proceso falla con una respuesta nula | Mantén la protección `response == null` y lanza una excepción cuando el turno se complete sin mensaje. |
| Maven no encuentra la clase principal | Ejecuta desde la carpeta del proyecto inicial con `./mvnw compile exec:java`. |

</details>

> **Estarás listo para añadir herramientas cuando:** la ruta de respuesta configurada imprima una
> respuesta y complete el turno sin ocultar los errores de sesión.

<details>
<summary>Implementación completa del Paso 2</summary>

Compara tu trabajo con esta implementación completa del Paso 2.

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

## Comprueba lo que has aprendido

¿Cuándo sería mejor un envío con respuesta completada que el streaming de eventos?

<details>
<summary>Comprueba tu respuesta</summary>

Usa un envío con respuesta completada para trabajo en segundo plano o código sencillo de
solicitud/respuesta que no necesite salida progresiva ni eventos intermedios.

</details>

## Más información

- [Orientación y puesta en cola](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  enviar otro mensaje mientras un turno aún se está ejecutando, ya sea para redirigirlo o para poner
  trabajo en cola.
- [Límites de sesión](https://github.com/github/copilot-sdk/blob/main/docs/features/session-limits.md):
  aplicar un presupuesto de AI Credits a una sesión antes de que empiece a producir tokens.
- [Métricas de uso y facturación](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  leer recuentos de tokens, uso de la ventana de contexto y coste desde el mismo flujo de eventos.

Continúa con [Paso 3: Añade conocimiento propio de la aplicación](03-local-tool.md).
