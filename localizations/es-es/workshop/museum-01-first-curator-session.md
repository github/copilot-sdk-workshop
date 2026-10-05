# Paso 1: Tu primera sesión de conservador

> **Tiempo:** 10 minutos

## Qué vas a crear

Texto de museo real, en tu terminal, en unos diez minutos. Te conectas al runtime de Copilot, abres
una conversación, envías un único prompt e imprimes lo que devuelve.

Sin mensaje del sistema. Sin catálogo de hechos. Sin herramientas. Sin interfaces. No hay nada
contra lo que implementar: llamas al SDK directamente. Aparte del controlador de errores que el
proyecto inicial ya envuelve alrededor de tu código, los auxiliares ya preparados del conservador
esperan hasta que el Paso 2 los necesite.

## Conoce el cliente y la sesión

El [**runtime de Copilot**](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
recibe prompts, llama a modelos y gestiona herramientas. El **cliente** conecta tu aplicación a ese
runtime. Una **sesión** es una conversación continua: contiene los mensajes y resultados de
herramientas que forman el contexto.

Mantén vivo un cliente durante una tarea y luego crea una sesión para cada conversación
independiente. Ahora mismo, la aplicación es simplemente `client -> session -> printed response`.

## Responde a las solicitudes de permiso antes de enviar

El runtime no decide por sí solo si puede ejecutarse una llamada de herramienta. Se lo pregunta a la
aplicación, y el [controlador de permisos](https://github.com/github/copilot-sdk/blob/main/docs/hooks/pre-tool-use.md)
de la sesión es quien responde. Cuando se crea una sesión sin uno, la solicitud no se deniega: se
emite como un evento y queda pendiente para resolución manual, de modo que la ejecución se detiene y
espera una respuesta que nunca llega.

Dale a esta primera sesión un controlador que apruebe todo para que cada solicitud tenga respuesta.
Aprueba las solicitudes cuando la configuración administrada está deshabilitada, y es un valor
predeterminado en lugar de una medida de seguridad: el Paso 4 muestra lo que realmente restringe
esta sesión, y los Pasos 6 y 7 lo sustituyen por controladores limitados y con alcance acotado.

## Escribe la sesión

A partir de aquí, cada bloque de código nombra una región en tu punto de entrada y dice **INSERT** o
**REPLACE**. INSERT rellena una región vacía. REPLACE significa eliminar lo que hay entre las dos
líneas marcadoras de la región y luego pegar. La [preparación](museum-00-preflight.md) muestra las
líneas marcadoras en "Cómo funcionan las ediciones".

:::language dotnet
Abre `Program.cs`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `Program.cs`:

```csharp
using GitHub.Copilot;
using GitHub.Copilot.Rpc;
using MuseumExhibitStudio.Helpers;
```

**REPLACE** en la región `banner` de `Program.cs`:

```csharp
    Console.WriteLine("=== Museum Exhibit Studio ===");
    Console.WriteLine();
```

**INSERT** en la región `generate` de `Program.cs`:

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

`SendAndWaitAsync` bloquea hasta que la sesión queda inactiva, así que obtienes la respuesta
completa en una sola llamada. `await using` libera la sesión y el cliente al salir.
`PermissionHandler.ApproveAll` proviene de `GitHub.Copilot.Rpc`, por eso está ahí el segundo
`using`.

El `try`/`catch`/`finally` alrededor de tus regiones venía con el proyecto inicial. Si algo lanza
una excepción, imprime un mensaje de `CuratorTerminal.DescribeFailure` y sale con un código distinto
de cero.

Los auxiliares ya preparados que empiezas a llamar en el Paso 2 están en `Helpers/CuratorFacts.cs`,
`Helpers/CuratorStreamer.cs`, `Helpers/CuratorValidation.cs`, `Helpers/CuratorSafety.cs`,
`Helpers/CuratorPrompts.cs`, `Helpers/CuratorSystemMessages.cs` y `Helpers/CuratorTerminal.cs`.
Nunca editas esos archivos: los lees.
:::

:::language nodejs
Abre `src/index.ts`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure } from "./curator.js";
```

**REPLACE** en la región `banner` de `src/index.ts`:

```typescript
    console.log("=== Museum Exhibit Studio ===");
    console.log();
```

**INSERT** en la región `generate` de `src/index.ts`:

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

`sendAndWait` bloquea hasta que la sesión queda inactiva, así que obtienes la respuesta completa en
una sola llamada. `approveAll` se importa desde el SDK junto con `CopilotClient`.

El `try`/`catch`/`finally` alrededor de tus regiones venía con el proyecto inicial. Si algo lanza
una excepción, imprime un mensaje de `describeFailure` en `src/curator.ts` y establece un código de
salida distinto de cero.

El módulo auxiliar ya preparado que empiezas a llamar en el Paso 2 está en `src/curator.ts`, y los
mensajes del sistema que usa el Paso 3 están en `src/system-messages.ts`. Nunca editas esos
archivos: los lees.
:::

:::language python
Abre `main.py`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler
from copilot.session_events import AssistantMessageData, SessionErrorData, SessionIdleData

from curator import describe_failure
```

**REPLACE** en la región `banner` de `main.py`:

```python
        print("=== Museum Exhibit Studio ===")
        print()
```

**INSERT** en la región `generate` de `main.py`:

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

Python escucha eventos de sesión en lugar de llamar a un auxiliar bloqueante. Imprime el mensaje del
asistente, trata un error de sesión como un fallo y espera a que quede inactiva antes de salir. El
Paso 2 sustituye toda esta escucha por una llamada a un auxiliar.

El `try`/`except` alrededor de tus regiones venía con el proyecto inicial. Si algo lanza una
excepción, imprime un mensaje de `describe_failure` en `curator.py` y sale con un código distinto de
cero.

`curator.py`, junto a este archivo, es el módulo auxiliar ya preparado que empiezas a llamar en el
Paso 2, y `system_messages.py` contiene los mensajes del sistema que usa el Paso 3. Nunca editas
esos archivos: los lees.
:::

:::language go
Abre `main.go`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `main.go`:

```go
import (
	"context"
	"fmt"
	"os"

	copilot "github.com/github/copilot-sdk/go"
)

```

**REPLACE** en la región `banner` de `main.go`:

```go
	fmt.Println("=== Museum Exhibit Studio ===")
	fmt.Println()
```

**INSERT** en la región `generate` de `main.go`:

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

`SendAndWait` bloquea hasta que la sesión queda inactiva, así que obtienes la respuesta completa en
una sola llamada. La limpieza diferida desconecta la sesión y detiene el cliente al salir.
`copilot.PermissionHandler.ApproveAll` responde a las solicitudes de permiso para que la ejecución
no se quede bloqueada.

El envoltorio `main`/`run` y el controlador de errores alrededor de tus regiones venían con el
proyecto inicial. Si algo devuelve un error, `main` imprime un mensaje de `DescribeFailure` en
`curator.go` y sale con un código distinto de cero.

Los auxiliares ya preparados que empiezas a llamar en el Paso 2 están en `curator.go`, y los
mensajes del sistema que usa el Paso 3 están en `system_messages.go`. Nunca editas esos archivos:
los lees.
:::

:::language rust
Abre `src/main.rs`. En este paso cambian tres regiones.

**REPLACE** en la región `imports` de `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{RuntimeError, describe_failure};
```

**REPLACE** en la región `banner` de `src/main.rs`:

```rust
    println!("=== Museum Exhibit Studio ===");
    println!();
```

**INSERT** en la región `generate` de `src/main.rs`:

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

`send_and_wait` bloquea hasta que la sesión queda inactiva, así que obtienes la respuesta completa
en una sola llamada. `with_permission_handler(permission::approve_all())` evita que las solicitudes
de herramientas se queden bloqueadas mientras la sesión todavía es sencilla.

El envoltorio `main`, la función `run`, el código de salida y el controlador de errores alrededor de
tus regiones venían con el proyecto inicial. Si algo genera un error, el envoltorio imprime un
mensaje de `describe_failure` en `src/lib.rs` y sale con un código distinto de cero.

Los auxiliares ya preparados que empiezas a llamar en el Paso 2 están en `src/lib.rs`, y los
mensajes del sistema que usa el Paso 3 están en `src/system_messages.rs`. Nunca editas esos
archivos: los lees.
:::

:::language java
Abre `src/main/java/workshop/MuseumExhibitStudio.java`. En este paso cambian tres regiones.

**INSERT** en la región `imports` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
```

**REPLACE** en la región `banner` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println("=== Museum Exhibit Studio ===");
        System.out.println();
```

**INSERT** en la región `generate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

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

`sendAndWait` bloquea hasta que la sesión queda inactiva, así que obtienes la respuesta completa en una sola llamada. El cliente se cierra cuando sale el bloque try-with-resources, y la sesión se cierra antes de que se ejecute `client.stop().get()`. `PermissionHandler.APPROVE_ALL` proviene de `com.github.copilot.rpc`, por eso está ahí esa importación.

El andamiaje `main`/`run`, el `try`/`catch`/`finally` de nivel superior y la gestión del código de salida venían con el proyecto inicial. Si algo lanza una excepción, el controlador de errores imprime un mensaje mediante `CuratorTerminal.describeFailure` y sale con un código distinto de cero.

Los auxiliares ya preparados que empiezas a llamar en el Paso 2 están junto a tu archivo en `src/main/java/workshop/`: `CuratorFacts.java`, `CuratorStreamer.java`, `CuratorValidation.java`, `CuratorSafety.java`, `CuratorPrompts.java`, `CuratorSystemMessages.java` y `CuratorTerminal.java`. Nunca editas esos archivos: los lees.
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

Tu redacción exacta variará, pero la salida tiene esta forma:

```text
=== Museum Exhibit Studio ===

The Apollo 11 mission carried three astronauts toward the Moon in July 1969. Days later,
two of them stepped onto its surface while the world listened.
```

Llegan dos frases de prosa con aire museístico después de una breve pausa. Todavía no se transmite
nada en streaming, todavía no se impone ningún tono, y nada impide que el modelo vaya más allá del
tema sobre el que has preguntado. Esos son los tres pasos siguientes.

## Comprueba lo que has aprendido

- ¿Qué contiene la sesión que no contiene el cliente?
- La respuesta llegó de golpe después de una pausa. ¿Qué parte del código actual causa eso?
- La sesión respondió a todas las solicitudes de permiso en lugar de dejarlas pendientes. ¿Eso hizo que la
  sesión fuera más segura, o solo hizo que pudiera terminar?
- Nada en este paso restringe lo que el modelo puede afirmar sobre Apollo 11. ¿Qué es lo único que
  mantiene la respuesta más o menos centrada en el tema ahora mismo?

## Más información

- [Crea tu primera aplicación con Copilot](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started):
  el tutorial de GitHub con el mismo primer cliente, la misma sesión y el mismo prompt.
- [Reanudación y persistencia de sesiones](https://github.com/github/copilot-sdk/blob/main/docs/features/session-persistence.md):
  qué conserva una sesión y cómo retomar una conversación más adelante.
- [Autenticación](https://github.com/github/copilot-sdk/blob/main/docs/auth/README.md):
  las credenciales que puede usar un cliente cuando ya has pasado de `copilot login`.

Continúa con [Transmite la respuesta del conservador en streaming](museum-02-stream-the-curator.md).
