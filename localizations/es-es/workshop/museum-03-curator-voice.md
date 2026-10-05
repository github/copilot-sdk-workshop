# Paso 3: Dale voz al conservador

> **Tiempo:** 10 minutos

## Qué vas a crear

La misma llamada en streaming y el mismo tema, pero ahora la respuesta suena como un museo en lugar
de como un chatbot. Le das a la sesión un [mensaje del sistema](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)
y la cambias al modo replace. También pides cinco frases en lugar de dos, así que hay suficiente
texto para notar la diferencia.

Esta es la primera parte de la **política propia de la aplicación**. El prompt son datos de la tarea
que cambian en cada ejecución. El mensaje del sistema es una declaración duradera de quién es este
agente, de qué puede hablar y qué forma tiene su salida.

## Modo replace y qué puede y no puede hacer un mensaje del sistema

La mayoría de las sesiones del SDK empiezan con una personalidad de asistente de programación de
propósito general. El modo `replace` la descarta e instala la tuya, así que el conservador no es un
asistente de programación con sombrero de museo. Usa `append` cuando quieras ampliar la personalidad
predeterminada; usa `replace` cuando la personalidad predeterminada no sea adecuada para la tarea.
Para un conservador de museo no lo es.

Hay un tercer modo. `customize` invalida secciones individuales del prompt gestionado por el SDK —
tono, directrices, reglas de cambios de código y otras — mientras conserva el resto, para que puedas
cambiar partes concretas sin volver a indicar todo el contenido. Úsalo cuando el prompt
predeterminado sea casi correcto y solo unas pocas secciones no lo sean. En el modo `append`
predeterminado, el SDK inserta automáticamente el contexto del entorno, las instrucciones de
herramientas y las barreras de seguridad, y se mantiene la persona del CLI; `replace` te da control
total y renuncia a esas secciones, por eso el mensaje que vas a usar indica explícitamente su propio
alcance y límites.

Un mensaje del sistema es **orientación, no imposición**. Define el tono, el alcance y la
estructura, y disuade firmemente al modelo de desviarse. No puede detener una llamada a una
herramienta, limitar un tiempo de ejecución ni demostrar que una afirmación es verdadera. Para eso
hacen falta la lista de permitidos, un tiempo de espera y validación — Pasos 4 y 5.

## Qué dice el mensaje del sistema del conservador

El runtime envía el mensaje del sistema antes de cada prompt de la sesión. Un prompt es una
solicitud; el mensaje del sistema es la instrucción permanente bajo la que se responde a cada
solicitud. Este es el mensaje bajo el que se ejecuta el conservador a partir de este paso:

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

Cada párrafo cumple una función:

- **Rol.** La primera línea asigna al modelo el rol de conservador. En modo replace es la única persona que queda.
- **Voz.** El segundo párrafo establece el público y el tono.
- **Alcance.** El tercer párrafo descarta los temas de software y hablar sobre sus propias instrucciones, e
  indica al conservador que no afirme tener acceso del que no dispone.
- **Salida.** El último párrafo hace que el conservador siga cualquier estructura que pida un prompt y
  no devuelva nada fuera de ella.

El mensaje no dice nada sobre de dónde proceden los hechos, así que por ahora el conservador escribe
a partir de la memoria del modelo. El Paso 4 cierra esa brecha con una herramienta propia de la
aplicación y un prompt que indica al conservador que la use.

## Dale a la sesión el mensaje del sistema del conservador

El mensaje es largo, y es texto propio de la aplicación en lugar de código que tengas que escribir,
así que se incluye en un archivo auxiliar ya preparado con los demás mensajes del sistema. Tu
trabajo en este paso es la configuración: un ajuste que instala el mensaje en modo replace.

:::language dotnet
Abre `Program.cs`. En este paso cambia una región.

El mensaje anterior ya está escrito para ti como `CuratorSystemMessages.Curator` en
`Helpers/CuratorSystemMessages.cs`.

**REPLACE** en la región `generate` de `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true,
        SystemMessage = new SystemMessageConfig
        {
            Mode = SystemMessageMode.Replace,
            Content = CuratorSystemMessages.Curator
        }
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Dos cambios en `generate`. La configuración de la sesión recibe un `SystemMessage` en modo replace,
con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay
suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `Helpers/CuratorSystemMessages.cs` contiene todos los mensajes del sistema que usa
esta aplicación, así que el texto largo queda fuera de `Program.cs`. `Curator` es el que acabas de
pasar a la sesión. `CuratorWithResearch` y `Research` están ahí para el Paso 6. La llamada de
streaming y su valor predeterminado de 120 segundos proceden de `Helpers/CuratorStreamer.cs`, donde
se declaran `GenerationTimeout` y `ResearchTimeout`.
:::

:::language nodejs
Abre `src/index.ts`. En este paso cambian dos regiones.

El mensaje anterior ya está escrito para ti como `curatorSystemMessage` en `src/system-messages.ts`.

**REPLACE** en la región `imports` de `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

Una línea nueva: la importación desde `./system-messages.js`.

**REPLACE** en la región `generate` de `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
      systemMessage: { mode: "replace", content: curatorSystemMessage },
    });

    await streamExhibit(
      session,
      "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Dos cambios en `generate`. La configuración de la sesión recibe un `systemMessage` en modo replace,
con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay
suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `src/system-messages.ts` contiene todos los mensajes del sistema que usa esta
aplicación, así que el texto largo queda fuera de `src/index.ts`. `curatorSystemMessage` es el que
acabas de pasar a la sesión. `curatorWithResearchSystemMessage` y `researchSystemMessage` están ahí
para el Paso 6. `streamExhibit` y su valor predeterminado de 120 segundos, `generationTimeoutMs`, se
declaran ambos en `src/curator.ts`, junto al `researchTimeoutMs` de 90 segundos que usa el Paso 6.
:::

:::language python
Abre `main.py`. En este paso cambian dos regiones.

El mensaje anterior ya está escrito para ti como `CURATOR_SYSTEM_MESSAGE` en `system_messages.py`.

**REPLACE** en la región `imports` de `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

Una línea nueva: la importación desde `system_messages`.

**REPLACE** en la región `generate` de `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
                system_message={"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
            ) as session:
                await stream_exhibit(
                    session,
                    "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

Dos cambios en `generate`. La configuración de la sesión recibe un `system_message` en modo replace,
con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay
suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `system_messages.py` contiene todos los mensajes del sistema que usa esta
aplicación, así que el texto largo queda fuera de `main.py`. `CURATOR_SYSTEM_MESSAGE` es el que
acabas de pasar a la sesión. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` y `RESEARCH_SYSTEM_MESSAGE`
están ahí para el Paso 6. `stream_exhibit` y su valor predeterminado de 120 segundos,
`GENERATION_TIMEOUT_SECONDS`, se declaran ambos en `curator.py`, junto al `RESEARCH_TIMEOUT_SECONDS`
de 90 segundos que usa el Paso 6.
:::

:::language go
Abre `main.go`. En este paso cambia una región.

El mensaje anterior ya está escrito para ti como `CuratorSystemMessage` en `system_messages.go`, que
está en el mismo paquete `main`.

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
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write five sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Dos cambios en `generate`. La configuración de la sesión recibe un `SystemMessage` en modo replace,
con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay
suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `system_messages.go` contiene todos los mensajes del sistema que usa esta
aplicación, así que el texto largo queda fuera de `main.go`. `CuratorSystemMessage` es el que acabas
de pasar a la sesión. `CuratorWithResearchSystemMessage` y `ResearchSystemMessage` están ahí para el
Paso 6. `GenerationTimeout` es la constante de 120 segundos declarada junto a `StreamExhibit` en
`curator.go`, junto al `ResearchTimeout` de 90 segundos que usa el Paso 6.
:::

:::language rust
Abre `src/main.rs`. En este paso cambian dos regiones.

El mensaje anterior ya está escrito para ti como `CURATOR_SYSTEM_MESSAGE` en
`src/system_messages.rs`, que el crate `museum_exhibit_studio` reexporta.

**REPLACE** en la región `imports` de `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

**REPLACE** en la región `generate` de `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Dos nombres nuevos en `imports`: `SystemMessageConfig` del SDK y `CURATOR_SYSTEM_MESSAGE` del crate.
Dos cambios en `generate`. La configuración de la sesión recibe un `system_message` en modo replace,
con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay
suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `src/system_messages.rs` contiene todos los mensajes del sistema que usa esta
aplicación, así que el texto largo queda fuera de `src/main.rs`. `CURATOR_SYSTEM_MESSAGE` es el que
acabas de pasar a la sesión. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` y `RESEARCH_SYSTEM_MESSAGE`
están ahí para el Paso 6. `GENERATION_TIMEOUT` es la constante de 120 segundos declarada junto a
`stream_exhibit` en `src/lib.rs`, junto al `RESEARCH_TIMEOUT` de 90 segundos que usa el Paso 6.
:::

:::language java
Abre `src/main/java/workshop/MuseumExhibitStudio.java`. En este paso cambian dos regiones.

El mensaje anterior ya está escrito para ti como `CuratorSystemMessages.CURATOR` en `CuratorSystemMessages.java`, junto a tu archivo.

**REPLACE** en la región `imports` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

**REPLACE** en la región `generate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)
                        .setSystemMessage(new SystemMessageConfig()
                                .setMode(SystemMessageMode.REPLACE)
                                .setContent(CuratorSystemMessages.CURATOR))).get();

                CuratorStreamer.streamExhibit(session,
                        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Dos importaciones nuevas: `SystemMessageMode` y `SystemMessageConfig`. Dos cambios en `generate`. La configuración de la sesión recibe un mensaje del sistema en modo `replace`, con el mensaje ya preparado como contenido. El prompt pide cinco frases en lugar de dos, así que hay suficiente texto para oír la voz. Todo lo demás de la región es lo que dejó allí el Paso 2.

**Mira dentro:** `CuratorSystemMessages.java` contiene todos los mensajes del sistema que usa esta aplicación, así que el texto largo queda fuera de tu punto de entrada. `CURATOR` es el que acabas de pasar a la sesión. `CURATOR_WITH_RESEARCH` y `RESEARCH` están ahí para el Paso 6. El `CuratorStreamer.streamExhibit` de dos argumentos que estás llamando aplica `GENERATION_TIMEOUT`, la constante de 120 segundos declarada en `CuratorStreamer.java` junto al `RESEARCH_TIMEOUT` de 90 segundos que usa el Paso 6.
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

El tono cambia de forma visible. Compara una respuesta del Paso 2 con una respuesta del Paso 3:

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath. A third kept watch from
        lunar orbit. They stayed on the surface for less than a day. What they carried home was
        small: rock, film, and a new sense of how far people could go.
```

La respuesta es más larga porque has pedido cinco frases. El cambio que debes notar es la voz:
desaparece el prefacio, el registro se eleva y la respuesta deja de ofrecer ayuda adicional.

## Cambia el prompt

Ahora prueba el párrafo de alcance con una pregunta que el asistente de programación predeterminado
respondería sin problema. En la región `generate`, cambia el texto del prompt a:

```text
Tell me about how git worktrees work.
```

Ejecútalo de nuevo. Tu redacción exacta variará, pero el conservador rechaza la pregunta y redirige
hacia el trabajo de exposición en lugar de explicar git. El mensaje del sistema le indicó que no
hablara de ingeniería de software, programación, terminales ni repositorios, y en modo replace no
queda ninguna persona de programación para responder.

Nada en el runtime impuso esa negativa. El modelo siguió la orientación, y la orientación da forma
al comportamiento sin autorizar ni prohibir nada. Ten presente esa distinción para el Paso 4 y,
después, restablece el prompt al texto de Apollo 11 de cinco frases.

## Comprueba lo que has aprendido

- ¿Por qué `replace` en lugar de `append` para este agente?
- Nombra algo que el mensaje del sistema mejore de forma fiable y algo que no pueda garantizar.
- El mensaje del sistema establece la voz y el alcance del conservador, pero no dice nada sobre las fuentes. En el caso de Apollo 11, ¿de dónde obtiene
  ahora mismo el modelo los detalles y por qué eso es un problema para un museo?

## Más información

- [Compatibilidad del SDK y el CLI](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  confirma que `systemMessage` admite tanto append como replace, y qué más expone cada SDK.
- [Agentes personalizados](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md):
  dar a un agente con nombre su propio prompt del sistema y sus propias herramientas con alcance limitado.
- [Skills personalizadas](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  empaquetar instrucciones duraderas como módulos reutilizables en lugar de un mensaje largo.

Continúa con [Básalo en hechos aprobados](museum-04-approved-facts.md).
