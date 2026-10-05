# Paso 2: Transmite la respuesta del conservador en streaming

> **Tiempo:** 10 minutos

## Qué vas a crear

El mismo prompt, pero la respuesta aparece palabra a palabra en lugar de llegar tras una pausa silenciosa.

No escribirás un bucle de eventos. El proyecto inicial ya incluye un impresor en streaming en los
auxiliares de conservador ya preparados: se suscribe a
[eventos de sesión](https://github.com/github/copilot-sdk/blob/main/docs/features/streaming-events.md),
escribe cada delta en la salida estándar, informa de la actividad de las herramientas, falla ante
errores de sesión, aplica un tiempo de espera, cancela la suscripción en todas las rutas y devuelve
el texto completo que ha acumulado. Tu trabajo es activar el streaming y llamarlo.

## Por qué el streaming importa para un conservador

El texto de la exposición es prosa que una persona tiene que leer y juzgar. Ver cómo llega te indica
de inmediato si el tono es correcto, si el modelo está rellenando y si se está desviando del tema,
mucho antes de que termine la ejecución. El streaming también te da un punto donde detectar llamadas
de herramientas, lo que importa a partir del Paso 4, cuando el conservador tiene que llamar a la
herramienta de hechos de la aplicación antes de poder escribir nada.

El auxiliar devuelve toda la respuesta como una cadena, así que a partir de aquí siempre tienes el
texto completo para inspeccionarlo después de que termine el streaming.

## Cambia la llamada bloqueante por el auxiliar de streaming

:::language dotnet
Abre `Program.cs`. En este paso cambia una región.

**REPLACE** en la región `generate` de `Program.cs`:

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

Dos cambios: `Streaming = true` en la configuración de sesión, y
`CuratorStreamer.StreamExhibitAsync` en lugar de `SendAndWaitAsync` y de las líneas que imprimían su
respuesta. El controlador de permisos del Paso 1 permanece exactamente donde estaba. El auxiliar
está en `Helpers/CuratorStreamer.cs` y nunca lo editas.

**Mira dentro:** abre `Helpers/CuratorStreamer.cs` y lee `StreamExhibitAsync` una vez. Es el bucle
de eventos del SDK, y este es el lugar más claro del taller para ver cómo funciona realmente el
streaming. Se suscribe con `session.On<SessionEvent>`, añade y escribe cada fragmento de
`AssistantMessageDeltaEvent` en cuanto llega, imprime una línea `[tool:start]` por cada
`ToolExecutionStartEvent` y una línea `[tool:done]` por cada `ToolExecutionCompleteEvent`, completa
en `SessionIdleEvent` y produce error en `SessionErrorEvent`. Una carrera con `Task.Delay` convierte
el tiempo de espera en una `TimeoutException`, y la suscripción se desecha en todas las rutas.
:::

:::language nodejs
Abre `src/index.ts`. En este paso cambian dos regiones.

**REPLACE** en la región `imports` de `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
```

**REPLACE** en la región `generate` de `src/index.ts`:

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

Dos cambios en `generate`: `streaming: true` en la configuración de sesión, y `streamExhibit` en
lugar de `sendAndWait` y de la línea que imprimía su respuesta. El controlador de permisos del Paso
1 permanece exactamente donde estaba. El auxiliar está en `src/curator.ts` y nunca lo editas.

**Mira dentro:** abre `src/curator.ts` y lee `streamExhibit` una vez. Es el bucle de eventos del
SDK, y este es el lugar más claro del taller para ver cómo funciona realmente el streaming. Se
suscribe con `session.on`, escribe cada fragmento de `assistant.message_delta` en la salida estándar
en cuanto llega, imprime una línea `[tool:start]` por cada evento `tool.execution_start` y una línea
`[tool:done]` por cada evento `tool.execution_complete`, resuelve su promesa en `session.idle` y la
rechaza en `session.error`. Un `setTimeout` rechaza si ninguno de los dos llega nunca, y `finish`
cancela la suscripción en todas las rutas.
:::

:::language python
Abre `main.py`. En este paso cambian dos regiones.

**REPLACE** en la región `imports` de `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
```

**REPLACE** en la región `generate` de `main.py`:

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

Toda la escucha de eventos del Paso 1 se reduce a una llamada. `stream_exhibit` está en
`curator.py`, ya se encarga de discriminar `AssistantMessageDeltaData`, `SessionErrorData` y
`SessionIdleData`, y nunca lo editas.

**Mira dentro:** abre `curator.py` y lee `stream_exhibit` una vez. Es el bucle de eventos del SDK, y
este es el lugar más claro del taller para ver cómo funciona realmente el streaming. Se suscribe con
`session.on`, imprime cada fragmento de `AssistantMessageDeltaData` en cuanto llega, imprime una
línea `[tool:start]` por cada `ToolExecutionStartData` y una línea `[tool:done]` por cada
`ToolExecutionCompleteData`, establece su evento `done` en `SessionIdleData` y vuelve a lanzar
`SessionErrorData` como `RuntimeError`. `asyncio.wait_for` aplica el tiempo de espera, y un bloque
`finally` cancela la suscripción en todas las rutas.
:::

:::language go
Abre `main.go`. En este paso cambia una región.

**REPLACE** en la región `generate` de `main.go`:

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

Dos cambios: `Streaming: copilot.Bool(true)` en la configuración de sesión, y `StreamExhibit` en
lugar de `SendAndWait` y de las líneas que imprimían su respuesta. El controlador de permisos del
Paso 1 permanece exactamente donde estaba. El auxiliar está en `curator.go` y nunca lo editas.

**Mira dentro:** abre `curator.go` y lee `StreamExhibit` una vez. Es el bucle de eventos del SDK, y
este es el lugar más claro del taller para ver cómo funciona realmente el streaming. Se suscribe con
`session.On`, imprime cada fragmento de `AssistantMessageDeltaData` en cuanto llega, imprime una
línea `[tool:start]` por cada `ToolExecutionStartData` y una línea `[tool:done]` por cada
`ToolExecutionCompleteData`, y registra cualquier `SessionErrorData` para devolverlo como error.
Después espera en `session.SendAndWait` dentro de un `context.WithTimeout` construido a partir del
tiempo de espera que pasas, y un `unsubscribe` diferido se ejecuta en todas las rutas.
:::

:::language rust
Abre `src/main.rs`. En este paso cambian dos regiones.

**REPLACE** en la región `imports` de `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::SessionConfig;
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit};
```

**REPLACE** en la región `generate` de `src/main.rs`:

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

Dos cambios en `generate`: `config.streaming = Some(true)`, y `stream_exhibit` en lugar de
`send_and_wait` y de las líneas que imprimían su respuesta. El controlador de permisos del Paso 1
permanece exactamente donde estaba. Tanto `stream_exhibit` como `GENERATION_TIMEOUT` vienen del
crate `museum_exhibit_studio` en `src/lib.rs`, y nunca lo editas.

**Mira dentro:** abre `src/lib.rs` y lee `stream_exhibit` una vez. Es el bucle de eventos del SDK, y
este es el lugar más claro del taller para ver cómo funciona realmente el streaming. Se suscribe con
`session.subscribe`, imprime cada fragmento de `assistant.message_delta` y vacía el búfer en cuanto
llega, imprime una línea `[tool:start]` por cada evento `tool.execution_start` y una línea
`[tool:done]` por cada evento `tool.execution_complete`, finaliza en `session.idle` y devuelve un
error en `session.error`. Sondea a la vez el future de envío, el stream de eventos y una fecha
límite, así que el tiempo de espera que pasas se respeta aunque nunca llegue ningún evento.
:::

:::language java
Abre `src/main/java/workshop/MuseumExhibitStudio.java`. En este paso cambia una región.

**REPLACE** en la región `generate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

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

Dos cambios: `setStreaming(true)` en la configuración de sesión, y `CuratorStreamer.streamExhibit` en lugar de `sendAndWait` y de las líneas que imprimían su respuesta. El controlador de permisos del Paso 1 permanece exactamente donde estaba. El auxiliar está en `CuratorStreamer.java` junto a tu archivo, y nunca lo editas.

**Mira dentro:** abre `CuratorStreamer.java` y lee `streamExhibit` una vez. Es el bucle de eventos del SDK, y este es el lugar más claro del taller para ver cómo funciona realmente el streaming. Registra un listener por tipo de evento: `AssistantMessageDeltaEvent` imprime y acumula cada fragmento a medida que llega, `ToolExecutionStartEvent` y `ToolExecutionCompleteEvent` imprimen las líneas `[tool:start]` y `[tool:done]`, `SessionIdleEvent` termina la línea, y `SessionErrorEvent` se captura y se vuelve a lanzar. El tiempo de espera que pasas va a `session.sendAndWait` en milisegundos, y cada suscripción se cierra en un bloque `finally`.
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

Aparece el mismo tipo de respuesta, pero esta vez ves cómo se escribe:

```text
=== Museum Exhibit Studio ===

In July 1969, three astronauts left Earth aboard Apollo 11... 
```

El texto crece en el mismo sitio en lugar de aparecer de golpe, y el programa sale poco después de
la última palabra. Si no ves nada hasta el final, la sesión no está transmitiendo en streaming:
comprueba que has establecido la marca de streaming en la configuración de sesión.

## Comprueba lo que has aprendido

- ¿Cuál de los dos lugares donde se activa conceptualmente el streaming escribiste tú: la configuración de sesión o el código que lee
  eventos, y de cuál se encargaba ya el auxiliar?
- ¿Por qué importará en el paso 5 que el auxiliar devuelva el texto completo de la respuesta aunque también lo imprimiera?
- ¿Qué impide que el programa espere para siempre si el modelo nunca queda inactivo?

## Más información

- [Direccionamiento y puesta en cola](https://github.com/github/copilot-sdk/blob/main/docs/features/steering-and-queueing.md):
  enviar otro mensaje mientras un turno todavía se está transmitiendo en streaming, en lugar de esperar a que termine.
- [Métricas de uso y facturación](https://github.com/github/copilot-sdk/blob/main/docs/features/usage-and-billing.md):
  leer los recuentos de tokens y el coste a partir de los mismos eventos a los que el impresor ya está suscrito.
- [Borrado de contexto](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  reemplazar una conversación dentro de una sesión que quieres seguir usando.

Continúa con [Dale voz al conservador](museum-03-curator-voice.md).
