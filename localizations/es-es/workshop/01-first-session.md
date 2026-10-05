# Paso 1: Crea tu primera sesión de Copilot

> **Tiempo:** 10 minutos

## Qué vas a crear

Conectarás la aplicación de consola al runtime de Copilot, crearás una conversación, enviarás un
prompt e imprimirás la respuesta.

:::language dotnet
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de .NET que usa tu aplicación para ejecutar Copilot como agente.
El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `CopilotClient` conecta tu código C# con
ese runtime.

Un `CopilotSession` representa una conversación continuada. Contiene los mensajes y resultados de
herramientas que componen el contexto de la conversación. Mantén un cliente activo para la
aplicación y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `CopilotClient -> CopilotSession -> model response`.
:::

:::language nodejs
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de Node.js que usa tu aplicación para ejecutar Copilot como
agente. El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `CopilotClient` conecta tu código
TypeScript con ese runtime.

Una sesión de `createSession` representa una conversación continuada. Contiene los mensajes y
resultados de herramientas que componen el contexto de la conversación. Mantén un cliente activo
para la aplicación, y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `CopilotClient -> session -> model response`.
:::

:::language python
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de Python que usa tu aplicación para ejecutar Copilot como
agente. El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `CopilotClient` conecta tu código Python
con ese runtime.

Una sesión de `create_session` representa una conversación continuada. Contiene los mensajes y
resultados de herramientas que componen el contexto de la conversación. Mantén un cliente activo
para la aplicación, y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `CopilotClient -> session -> model response`.
:::

:::language go
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de Go que usa tu aplicación para ejecutar Copilot como agente.
El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `copilot.NewClient` conecta tu código Go
con ese runtime.

Una sesión de `CreateSession` representa una conversación continuada. Contiene los mensajes y
resultados de herramientas que componen el contexto de la conversación. Mantén un cliente activo
para la aplicación, y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `Client -> Session -> model response`.
:::

:::language rust
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de Rust que usa tu aplicación para ejecutar Copilot como agente.
El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `Client` conecta tu código Rust con ese
runtime.

Una sesión de `create_session` representa una conversación continuada. Contiene los mensajes y
resultados de herramientas que componen el contexto de la conversación. Mantén un cliente activo
para la aplicación, y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `Client -> session -> model response`.
:::

:::language java
## Conoce el GitHub Copilot SDK y el runtime

El **GitHub Copilot SDK** es la API de Java que usa tu aplicación para ejecutar Copilot como agente.
El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y administra herramientas. `CopilotClient` conecta tu código Java
con ese runtime.

Una sesión de `createSession` representa una conversación continuada. Contiene los mensajes y
resultados de herramientas que componen el contexto de la conversación. Mantén un cliente activo
para la aplicación, y crea una sesión para cada conversación independiente.

## Por qué los clientes y las sesiones permanecen separados

Mantener separadas esas responsabilidades permite que la conexión con el runtime sobreviva a
cualquier conversación concreta. También te da un pequeño ejemplo práctico antes de que entren en
escena el streaming y las herramientas.

En este punto, la aplicación de consola es simplemente `CopilotClient -> session -> model response`.
:::

## Inicia tu primera sesión de Copilot

:::language dotnet
Abre `Program.cs` y **sustituye todo el archivo**:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig
{
    OnPermissionRequest = PermissionHandler.ApproveAll,
});
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```

El ping verifica la conexión con el runtime. El envío de respuesta completada espera hasta que la
sesión queda inactiva, así que funciona bien cuando solo necesitas la respuesta final.
:::

:::language nodejs
Abre `src/index.ts` y **sustituye todo el archivo**:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({ onPermissionRequest: approveAll });
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
  } finally {
    await session.disconnect();
  }
} finally {
  await client.stop();
}
```

`sendAndWait` espera hasta que la sesión queda inactiva, así que funciona bien cuando solo necesitas
la respuesta final. Detén siempre la sesión y el cliente en bloques `finally` para que el runtime se
cierre limpiamente.
:::

:::language python
Abre `main.py` y **sustituye todo el archivo**:

```python
import asyncio

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```

Python escucha eventos de sesión en lugar de llamar a un único auxiliar de respuesta completada.
Imprime el mensaje del asistente, trata los errores de sesión como fallos y espera al evento de
inactividad antes de salir.
:::

:::language go
Abre `main.go` y **sustituye todo el archivo**:

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
	})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```

`SendAndWait` espera hasta que la sesión queda inactiva, así que funciona bien cuando solo necesitas
la respuesta final. `defer` desconecta la sesión y detiene el cliente al salir.
:::

:::language rust
Abre `src/main.rs` y **sustituye todo el archivo**:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client
        .create_session(SessionConfig::default().with_permission_handler(permission::approve_all()))
        .await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```

`send_and_wait` espera hasta que la sesión queda inactiva, así que funciona bien cuando solo
necesitas la respuesta final. Desconecta la sesión y detén el cliente antes de devolver el control.
:::

:::language java
Abre `src/main/java/workshop/AccessibilityReport.java` y **sustituye todo el archivo**:

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client
                    .createSession(new SessionConfig().setOnPermissionRequest(PermissionHandler.APPROVE_ALL)).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
                    .get();
            if (response == null) {
                throw new IllegalStateException("Copilot completed without an assistant message.");
            }
            System.out.println(response.getData().content());
        }
    }
}
```

`sendAndWait` espera hasta que la sesión queda inactiva, así que funciona bien cuando solo necesitas
la respuesta final. El bloque try-with-resources cierra el cliente cuando `main` finaliza.
:::

Esta sesión establece un controlador de permisos y nada más, así que se ejecuta con la personalidad
predeterminada del SDK. El control que no has tocado es el
[mensaje del sistema](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message),
que tiene tres modos. `append` es el predeterminado: tu contenido se añade después del prompt
administrado por el SDK, y se conserva la personalidad predeterminada de la CLI junto con el
contexto del entorno, las instrucciones de herramientas y las barreras de seguridad que inyecta el
SDK. `replace` sustituye todo el prompt por tu contenido. `customize` sobrescribe secciones
individuales —tono, directrices, reglas de cambio de código y otras— mientras conserva el resto.
Este taller usa el valor predeterminado, así que todas las respuestas que veas proceden de la
personalidad estándar. Recurre a los otros dos modos cuando una aplicación necesite una voz o un
ámbito propios.

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
python main.py
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

:::language dotnet
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
=== First Copilot session ===

Connected to the Copilot runtime: ...

Copilot: An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language nodejs
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
This Copilot session is ready and waiting for your next prompt.
```
:::

:::language python
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language go
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language rust
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

:::language java
Tu respuesta exacta variará, pero la salida debería tener esta forma:

```text
An accessible name lets assistive technology identify the input's purpose.
```
:::

<details>
<summary>Solución de problemas de esta ejecución</summary>

| Síntoma | Solución |
|---|---|
| Error de autenticación o autorización | Ejecuta `copilot login` de nuevo y vuelve a ejecutar el proyecto. |
| No se encuentra el ejecutable del runtime | Define `COPILOT_CLI_BINARY_PATH` siguiendo las instrucciones de preparación. |
| La solicitud agota el tiempo de espera | Comprueba el acceso de red a GitHub Copilot y vuelve a intentarlo; este ejemplo no oculta el fallo. |

</details>

> **Ya estás listo para el streaming cuando:** el terminal imprime una respuesta completa de Copilot.

## Comprueba lo que has aprendido

¿Qué objeto debería vivir normalmente durante toda la vida de la aplicación y qué objeto posee el
contexto de una conversación?

:::language dotnet
<details>
<summary>Comprueba tu respuesta</summary>

Mantén `CopilotClient` durante toda la vida de la conexión con el runtime. Un `CopilotSession` posee
los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language nodejs
<details>
<summary>Comprueba tu respuesta</summary>

Mantén `CopilotClient` durante toda la vida de la conexión con el runtime. Una sesión de
`createSession` posee los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language python
<details>
<summary>Comprueba tu respuesta</summary>

Mantén `CopilotClient` durante toda la vida de la conexión con el runtime. Una sesión de
`create_session` posee los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language go
<details>
<summary>Comprueba tu respuesta</summary>

Mantén el cliente de `copilot.NewClient` durante toda la vida de la conexión con el runtime. Una
sesión de `CreateSession` posee los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language rust
<details>
<summary>Comprueba tu respuesta</summary>

Mantén `Client` durante toda la vida de la conexión con el runtime. Una sesión de `create_session`
posee los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language java
<details>
<summary>Comprueba tu respuesta</summary>

Mantén `CopilotClient` durante toda la vida de la conexión con el runtime. Una sesión de
`createSession` posee los mensajes y el contexto de herramientas de una conversación.

</details>
:::

:::language dotnet
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```csharp
using GitHub.Copilot;

Console.WriteLine("=== First Copilot session ===\n");

await using var client = new CopilotClient();
await client.StartAsync();

var ping = await client.PingAsync("workshop");
Console.WriteLine($"Connected to the Copilot runtime: {ping.Message}");

await using var session = await client.CreateSessionAsync(new SessionConfig());
var response = await session.SendAndWaitAsync(
    "In one sentence, explain why an accessible name matters for a form input.");

if (response is null)
{
    throw new InvalidOperationException("Copilot completed without an assistant message.");
}

Console.WriteLine($"\nCopilot: {response.Data.Content}");
```
</details>
:::

:::language nodejs
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```typescript
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
try {
  const session = await client.createSession({});
  try {
    const response = await session.sendAndWait({ prompt: "Reply with one sentence confirming this Copilot session is ready." });
    console.log(response?.data && "content" in response.data ? response.data.content : response);
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
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```python
import asyncio

from copilot import CopilotClient
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData


async def main() -> None:
    async with CopilotClient() as client:
        async with await client.create_session() as session:
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
            await session.send("In one sentence, explain why an accessible name matters for a form input.")
            await done.wait()
            if error is not None:
                raise error


if __name__ == "__main__":
    asyncio.run(main())
```
</details>
:::

:::language go
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```go
package main

import (
	"context"
	"fmt"

	copilot "github.com/github/copilot-sdk/go"
)

func main() {
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(context.Background()); err != nil {
		panic(err)
	}
	defer client.Stop()

	session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{})
	if err != nil {
		panic(err)
	}
	defer session.Disconnect()

	response, err := session.SendAndWait(context.Background(), copilot.MessageOptions{
		Prompt: "In one sentence, explain why an accessible name matters for a form input.",
	})
	if err != nil {
		panic(err)
	}
	if response != nil {
		if message, ok := response.Data.(*copilot.AssistantMessageData); ok {
			fmt.Println(message.Content)
		}
	}
}
```
</details>
:::

:::language rust
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::start(ClientOptions::default()).await?;
    let session = client.create_session(SessionConfig::default()).await?;
    let response = session
        .send_and_wait(MessageOptions::new(
            "In one sentence, explain why an accessible name matters for a form input.",
        ))
        .await?;

    if let Some(message) = response {
        if let Some(content) = message.data.get("content").and_then(|value| value.as_str()) {
            println!("{content}");
        }
    }

    session.disconnect().await?;
    client.stop().await?;
    Ok(())
}
```
</details>
:::

:::language java
<details>
<summary>Implementación completa del Paso 1</summary>

Compara tu trabajo con esta implementación completa del Paso 1.

```java
package workshop;

import com.github.copilot.CopilotClient;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.SessionConfig;

public final class AccessibilityReport {
    private AccessibilityReport() {
    }

    public static void main(String[] args) throws Exception {
        try (var client = new CopilotClient()) {
            client.start().get();
            var session = client.createSession(new SessionConfig()).get();
            var response = session.sendAndWait(new MessageOptions()
                    .setPrompt("In one sentence, explain why an accessible name matters for a form input."))
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

## Más información

- [Crea tu primera aplicación con Copilot](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  tutorial de GitHub para el mismo primer cliente, la misma sesión y el mismo prompt.
- [Reanudación y persistencia de sesiones](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  cómo se conserva el estado de conversación de una sesión y cómo reanudarla después de un reinicio.
- [Borrado del contexto](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  sustituir la conversación dentro de una sesión sin crear otra nueva.
- [Autenticación](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  las credenciales que puede usar un cliente cuando vas más allá de `copilot login`.

Continúa con [Paso 2: Transmite una respuesta en streaming](02-streaming.md).
