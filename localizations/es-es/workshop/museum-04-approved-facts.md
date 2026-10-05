# Paso 4: Básalo en hechos aprobados

> **Tiempo:** 15 minutos

## Qué vas a crear

Hasta ahora, el conservador ha estado escribiendo desde la memoria del modelo. Eso es inaceptable
para un museo: una cartela de exposición es una afirmación institucional, y "el modelo lo sabía" no
es una fuente.

En este paso, el educador proporciona los hechos y la **aplicación** se los entrega al conservador a
través de una herramienta propia de la aplicación. Registras la herramienta `approved_fact_lookup`
ya preparada, la conviertes en la única herramienta que el modelo puede llamar y escribes un prompt
que ordena al conservador llamarla antes de escribir una sola palabra. También llamas al selector ya
preparado que permite al educador elegir uno de tres conjuntos de hechos aprobados o escribir el
suyo, y pones el ciclo de vida de la sesión en un pequeño ejecutor que reutilizan los pasos
posteriores.

## Por qué los hechos deben estar detrás de una herramienta, no dentro del prompt

Podrías pegar la lista de hechos en el texto del prompt. Muchas aplicaciones lo hacen. Pero entonces
los hechos son solo más palabras en una solicitud que el modelo puede leer de forma laxa, y cada
ejecución lleva todo el catálogo lo necesite o no el modelo.

Una [**herramienta local**](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#how-tools-work)
es diferente. Se ejecuta dentro de tu proceso, tu código decide qué devuelve y la transcripción
registra el momento en que el modelo la pidió. `approved_fact_lookup` es esa herramienta. No toma
argumentos y devuelve la lista limitada de hechos aprobados, así que dos ejecuciones con el mismo
conjunto de hechos hacen la misma pregunta y reciben la misma respuesta — la fundamentación se
mantiene determinista.

Los auxiliares ya contienen la herramienta y los límites. `boundFacts` recorta cada hecho, descarta
los vacíos y rechaza el lote cuando está vacío, tiene más de 20 hechos o contiene un hecho de más de
500 caracteres. La fábrica de herramientas aplica esos límites a cualquier cosa que reciba, así que
al modelo nunca se le puede entregar una lista sin límites. Los límites no son una cortesía: una
lista de hechos sin límites supone coste, latencia y superficie de ataque impredecibles.

`skip permission` está establecido en esta herramienta porque solo lee datos propios de la
aplicación que el educador acaba de aprobar en pantalla. El proceso externo de Wikipedia del Paso 6
recibe en cambio un límite de permisos.

Este es el equivalente para el museo de `accessibility_rule_lookup` en el itinerario de
accesibilidad: una herramienta local propia de la aplicación, sin argumentos, que entrega al modelo
datos seleccionados a los que no puede acceder de otro modo.

## Dos listas, dos funciones diferentes

Registrar una herramienta requiere dos ajustes, y confundirlos es el error más común en este taller:

- **`tools`** contiene la *implementación*. Aquí es donde el runtime sabe que existe una función llamada
  `approved_fact_lookup` y cómo ejecutarla.
- **`availableTools`** es la *lista de permitidos*. Nombra qué herramientas tiene permitido llamar el modelo en
  esta sesión. Una herramienta registrada pero no incluida en la lista de permitidos no se puede llamar.

Necesitas ambas. Nombrar solo `approved_fact_lookup` también excluye todas las demás herramientas:
esta sesión no ofrece lector de archivos, shell ni navegador.

El prompt es la tercera pieza, y es la más débil: *pide* al modelo que llame a la herramienta y que
use solo lo que devuelve la herramienta. El mensaje del sistema del Paso 3 no dice nada sobre
fuentes, así que este prompt es el primer lugar donde se indica al conservador de dónde proceden los
hechos. Un prompt no hace que la llamada ocurra, y no puede impedir una llamada. Mantén la
instrucción explícita "call `approved_fact_lookup` first" — en esta fase quieres que la llamada a la
herramienta sea fiable para poder verla.

**Mantén acotada la ejecución:** pasa explícitamente al ejecutor de la sesión el **tiempo de espera
de generación de 120 segundos ya existente** del auxiliar. El ejecutor devuelve el texto de la
exposición para validarlo más adelante, rechaza la salida en blanco y limpia la sesión y el cliente
aunque falle la transmisión en streaming. Estos son controles de la aplicación, no instrucciones
para el modelo.

## Registra la herramienta y crea el prompt

:::language dotnet
Abre `Program.cs`. En este paso cambian cinco regiones. La región `imports` ya tiene todo lo que
este paso necesita.

**INSERT** en la región `choose-facts` de `Program.cs`:

```csharp
    var approvedFacts = CuratorTerminal.ChooseApprovedFacts();
```

**REPLACE** en la región `generate` de `Program.cs`:

```csharp
    Console.WriteLine();
    await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);
```

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al
constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan
reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `Program.cs`:

```csharp
static string BuildExhibitPrompt() => $"""
    Create visitor-facing exhibit text about this application's approved subject.

    Call {CuratorFacts.ApprovedFactLookupName} first. Use only the facts it returns, and
    treat them as the complete source of truth for this exhibit.

    {CuratorPrompts.ExhibitStructure}
    """;
```

**INSERT** en la región `generation-config` de `Program.cs`:

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

**INSERT** en la región `session-runner` de `Program.cs`:

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

`RunSessionAsync` usa `CuratorStreamer.GenerationTimeout` de `Helpers/CuratorStreamer.cs` y libera
la sesión antes de detener el cliente en `finally`. `BuildExhibitPrompt` ya no recibe ningún hecho:
nombra la herramienta en su lugar. `CreateApprovedFactLookup` llama a `BoundFacts` internamente, así
que el límite se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `CuratorTerminal.ChooseApprovedFacts` enumera
los tres conjuntos de hechos, lee la elección, imprime los hechos y devuelve la lista limitada
cuando el educador los confirma o escribe los suyos. `CuratorPrompts.ExhibitStructure` es la
estructura fija de título, narrativa y preguntas; está en `Helpers/CuratorPrompts.cs` porque el Paso
5 comprueba esa misma estructura. `CuratorStreamer.SelectedModel` lee la variable de entorno
opcional `COPILOT_MODEL`.

**Mira dentro:** `Helpers/CuratorFacts.cs` contiene la herramienta, y merece la pena leerlo porque
es una definición de herramienta real y no simple código de infraestructura.
`CreateApprovedFactLookup` captura la lista limitada que el educador acaba de aprobar y la registra
mediante `CopilotTool.DefineTool` con el nombre `approved_fact_lookup`. El controlador no recibe
parámetros, así que el modelo no puede influir en lo que se devuelve — pregunta y recibe exactamente
esa lista. `SkipPermission = true` está establecido ahí mismo porque los datos son propios de la
aplicación. Los tres conjuntos de hechos y los límites `MaximumFactCount` (20) y `MaximumFactLength`
(500) que aplica `BoundFacts` están en el mismo archivo.
:::

:::language nodejs
Abre `src/index.ts`. En este paso cambian seis regiones, empezando por las importaciones que necesitan los nuevos auxiliares.

**REPLACE** en la región `imports` de `src/index.ts`:

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

**INSERT** en la región `choose-facts` de `src/index.ts`:

```typescript
    const approvedFacts = await chooseApprovedFacts();
```

**REPLACE** en la región `generate` de `src/index.ts`:

```typescript
    console.log();
    await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );
```

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al
constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan
reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `src/index.ts`:

```typescript
function buildExhibitPrompt(): string {
  return `Create visitor-facing exhibit text about this application's approved subject.

Call ${approvedFactLookupName} first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

${exhibitStructure}`;
}
```

**INSERT** en la región `generation-config` de `src/index.ts`:

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

**INSERT** en la región `session-runner` de `src/index.ts`:

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

`runSession` pasa `generationTimeoutMs` de `src/curator.ts` al streamer; sus bloques `finally`
anidados desconectan la sesión y detienen el cliente. `buildExhibitPrompt` ya no recibe ningún
hecho: nombra la herramienta en su lugar. `createApprovedFactLookup` llama a `boundFacts`
internamente, así que el límite se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `chooseApprovedFacts` enumera los tres conjuntos
de hechos, lee la elección, imprime los hechos y devuelve la lista limitada cuando el educador los
confirma o escribe los suyos. `exhibitStructure` es la estructura fija de título, narrativa y
preguntas; está en `src/curator.ts` porque el Paso 5 comprueba esa misma estructura. `selectedModel`
lee la variable de entorno opcional `COPILOT_MODEL`.

**Mira dentro:** `src/curator.ts` contiene la herramienta, y merece la pena leerlo porque es una
definición real de `defineTool` y no simple código de infraestructura. `createApprovedFactLookup`
captura la lista limitada que el educador acaba de aprobar y define `approved_fact_lookup` con
`parameters: { type: "object", properties: {}, additionalProperties: false }`, así que el modelo no
puede influir en lo que se devuelve — pregunta y recibe exactamente esa lista.
`skipPermission: true` está establecido ahí mismo porque los datos son propios de la aplicación. Los
tres conjuntos de hechos y los límites `maximumFactCount` (20) y `maximumFactLength` (500) que
aplica `boundFacts` están en el mismo archivo.
:::

:::language python
Abre `main.py`. En este paso cambian seis regiones.

**REPLACE** en la región `imports` de `main.py`:

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

**INSERT** en la región `choose-facts` de `main.py`:

```python
        facts = choose_approved_facts()
```

**REPLACE** en la región `generate` de `main.py`:

```python
        print()
        await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )
```

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al
constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan
reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `main.py`:

```python
def build_exhibit_prompt() -> str:
    return f"""Create visitor-facing exhibit text about this application's approved subject.

Call {APPROVED_FACT_LOOKUP_NAME} first. Use only the facts it returns, and treat them as
the complete source of truth for this exhibit.

{EXHIBIT_STRUCTURE}"""
```

**INSERT** en la región `generation-config` de `main.py`:

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

**INSERT** en la región `session-runner` de `main.py`:

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

`run_session` pasa `GENERATION_TIMEOUT_SECONDS` de `curator.py` al streamer; sus bloques `finally`
desconectan la sesión y detienen el cliente. `build_exhibit_prompt` ya no recibe ningún hecho:
nombra la herramienta en su lugar. `create_approved_fact_lookup` llama a `bound_facts` internamente,
así que el límite se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `choose_approved_facts` enumera los tres
conjuntos de hechos, lee la elección, imprime los hechos y devuelve la lista limitada cuando el
educador los confirma o escribe los suyos. `EXHIBIT_STRUCTURE` es la estructura fija de título,
narrativa y preguntas; está en `curator.py` porque el Paso 5 comprueba esa misma estructura.
`selected_model` lee la variable de entorno opcional `COPILOT_MODEL`; este SDK acepta `model=None`,
así que la configuración puede dejar la selección del modelo en manos del runtime.

**Mira dentro:** `curator.py` contiene la herramienta, y merece la pena leerlo porque es una
definición real de `@define_tool` y no simple código de infraestructura.
`create_approved_fact_lookup` captura la lista limitada que el educador acaba de aprobar y decora
una función anidada `approved_fact_lookup()` que no toma argumentos, así que el modelo no puede
influir en lo que se devuelve — pregunta y recibe exactamente esa lista. `skip_permission=True` está
establecido ahí mismo porque los datos son propios de la aplicación. Los tres conjuntos de hechos y
los límites `MAXIMUM_FACT_COUNT` (20) y `MAXIMUM_FACT_LENGTH` (500) que aplica `bound_facts` están
en el mismo archivo.
:::

:::language go
Abre `main.go`. En este paso cambian seis regiones.

**REPLACE** en la región `imports` de `main.go`:

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

**INSERT** en la región `choose-facts` de `main.go`:

```go
	facts, err := ChooseApprovedFacts()
	if err != nil {
		return err
	}
```

**REPLACE** en la región `generate` de `main.go`:

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

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al
constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan
reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `main.go`:

```go
func buildExhibitPrompt() string {
	return fmt.Sprintf(`Create visitor-facing exhibit text about this application's approved subject.

Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

%s`, ApprovedFactLookupName, ExhibitStructure)
}

```

**INSERT** en la región `generation-config` de `main.go`:

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

**INSERT** en la región `session-runner` de `main.go`:

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

`runSession` pasa `GenerationTimeout` de `curator.go` al streamer y usa `defer` para desconectar la
sesión antes de detener el cliente. `buildExhibitPrompt` ya no recibe ningún hecho: nombra la
herramienta en su lugar. `ApprovedFactLookup` llama a `BoundFacts` internamente, así que el límite
se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `ChooseApprovedFacts` en `curator.go` enumera
los tres conjuntos de hechos, lee la elección, imprime los hechos y devuelve la lista limitada
cuando el educador los confirma o escribe los suyos. `ExhibitStructure` es la estructura fija de
título, narrativa y preguntas; está en `curator.go` porque el Paso 5 comprueba esa misma estructura.
`SelectedModel` lee la variable de entorno opcional `COPILOT_MODEL`.

**Mira dentro:** `curator.go` contiene la herramienta, y merece la pena leerlo porque es una
definición real de `copilot.DefineTool` y no simple código de infraestructura. `ApprovedFactLookup`
captura la lista limitada que el educador acaba de aprobar y define un controlador cuyo tipo de
argumento es `struct{}`, así que el modelo no puede influir en lo que se devuelve — pregunta y
recibe exactamente esa lista. `lookup.SkipPermission = true` está establecido ahí mismo porque los
datos son propios de la aplicación. Los tres conjuntos de hechos y los límites `MaximumFactCount`
(20) y `MaximumFactLength` (500) que aplica `BoundFacts` están en el mismo archivo.
:::

:::language rust
Abre `src/main.rs`. En este paso cambian seis regiones.

**REPLACE** en la región `imports` de `src/main.rs`:

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

**INSERT** en la región `choose-facts` de `src/main.rs`:

```rust
    let facts = choose_approved_facts()?;
```

**REPLACE** en la región `generate` de `src/main.rs`:

```rust
    println!();
    run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;
```

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al
constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan
reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `src/main.rs`:

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

**INSERT** en la región `generation-config` de `src/main.rs`:

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

**INSERT** en la región `session-runner` de `src/main.rs`:

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

`run_session` pasa `GENERATION_TIMEOUT` de `src/lib.rs` al streamer y desconecta la sesión y detiene
el cliente antes de propagar errores. `build_exhibit_prompt` ya no recibe ningún hecho: nombra la
herramienta en su lugar. `approved_fact_lookup` llama a `bound_facts` internamente, así que el
límite se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `choose_approved_facts` enumera los tres
conjuntos de hechos, lee la elección, imprime los hechos y devuelve la lista limitada cuando el
educador los confirma o escribe los suyos. `EXHIBIT_STRUCTURE` es la estructura fija de título,
narrativa y preguntas; está en `src/lib.rs` porque el Paso 5 comprueba esa misma estructura.
`selected_model` lee la variable de entorno opcional `COPILOT_MODEL`.

**Mira dentro:** `src/lib.rs` contiene todo esto, y merece la pena leerlo porque es una definición
de herramienta real y no simple código de infraestructura. `approved_fact_lookup` captura la lista
limitada que el educador acaba de aprobar y crea una `Tool` cuyo esquema de parámetros es
`{"type": "object", "properties": {}, "additionalProperties": false}`, así que el modelo no puede
influir en lo que se devuelve — pregunta y recibe exactamente esa lista.
`.with_skip_permission(true)` está establecido ahí mismo porque los datos son propios de la
aplicación. Los tres conjuntos de hechos y los límites `MAXIMUM_FACT_COUNT` (20) y
`MAXIMUM_FACT_LENGTH` (500) que aplica `bound_facts` están en el mismo archivo.
:::

:::language java
Abre `src/main/java/workshop/MuseumExhibitStudio.java`. En este paso cambian seis regiones.

**REPLACE** en la región `imports` de `src/main/java/workshop/MuseumExhibitStudio.java`:

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

**INSERT** en la región `choose-facts` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        List<String> facts = CuratorTerminal.chooseApprovedFacts();
```

**REPLACE** en la región `generate` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        System.out.println();
        runSession(generationConfig(facts), buildExhibitPrompt(), CuratorStreamer.GENERATION_TIMEOUT);
```

El cliente y la sesión insertados directamente de los Pasos 1–3 salen de `generate`. Se mueven al constructor de configuración y al ejecutor de sesión de abajo, para que los pasos posteriores puedan reutilizarlos.

**INSERT** en la región `exhibit-prompt` de `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
    public static String buildExhibitPrompt() {
        return """
                Create visitor-facing exhibit text about this application's approved subject.

                Call %s first. Use only the facts it returns, and treat them as the complete source of truth for this exhibit.

                %s
                """.formatted(CuratorFacts.APPROVED_FACT_LOOKUP_NAME, CuratorPrompts.EXHIBIT_STRUCTURE);
    }
```

**INSERT** en la región `generation-config` de `src/main/java/workshop/MuseumExhibitStudio.java`:

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

**INSERT** en la región `session-runner` de `src/main/java/workshop/MuseumExhibitStudio.java`:

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

`runSession` usa `CuratorStreamer.GENERATION_TIMEOUT` de `CuratorStreamer.java` y cierra la sesión antes de detener el cliente en `finally`. `buildExhibitPrompt` ya no recibe ningún hecho: nombra la herramienta en su lugar. `approvedFactLookup` llama a `boundFacts` internamente, así que el límite se mantiene independientemente de quién cree la herramienta.

Tres llamadas auxiliares mantienen este paso breve. `CuratorTerminal.chooseApprovedFacts` enumera los tres conjuntos de hechos, lee la elección, imprime los hechos y devuelve la lista limitada cuando el educador los confirma o escribe los suyos. `CuratorPrompts.EXHIBIT_STRUCTURE` es la estructura fija de título, narrativa y preguntas; está en `CuratorPrompts.java` porque el Paso 5 comprueba esa misma estructura. `CuratorStreamer.withSelectedModel` lee la variable de entorno opcional `COPILOT_MODEL` y la aplica a la configuración de la sesión.

**Mira dentro:** `CuratorFacts.java` contiene la herramienta, y merece la pena leerlo porque es un `ToolDefinition` real en lugar de código de infraestructura. `approvedFactLookup` construye un `ApprovedFactReader` privado sobre la lista acotada que acaba de aprobar el educador y enlaza su método `read` sin argumentos, de modo que el modelo no puede controlar qué se devuelve: pregunta y recibe exactamente esa lista. `.skipPermission(true)` se establece ahí mismo porque los datos son propios de la aplicación. Los tres conjuntos de hechos y los límites `MAXIMUM_FACT_COUNT` (20) y `MAXIMUM_FACT_LENGTH` (500) que aplica `boundFacts` están en el mismo archivo.
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

La aplicación ahora te entrevista antes de escribir nada, y el conservador obtiene visiblemente sus
hechos antes de escribir una palabra:

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

La línea `[tool:start] approved_fact_lookup` es precisamente el objetivo de este paso. El
conservador no recordó el arrecife: pidió los hechos a tu aplicación, y tu aplicación respondió.

## Comprueba que la herramienta hace el trabajo

Vuelve a ejecutarla y elige el conjunto 1 o 3. La exposición cambia de tema por completo, y el
evento de herramienta vuelve a aparecer cada vez. Nada en el prompt cambió entre esas ejecuciones:
el mismo texto de prompt produjo una exposición sobre el Ejército de terracota porque la herramienta
devolvió datos diferentes. Esa es la diferencia entre un prompt que transporta datos y una
aplicación que los posee.

Después responde `n` en la confirmación, escribe dos o tres hechos propios y envía una línea en
blanco. El conservador escribe sobre tu tema en su lugar: los hechos que has escrito pasaron a la
herramienta, y la herramienta se los devolvió al modelo.

Prueba también el caso de error. Responde `n` y envía inmediatamente una línea en blanco sin
escribir ningún hecho. La ejecución se detiene con:

```text
Could not generate the exhibit: Provide at least one approved fact.
```

El selector de hechos acota lo que escriba el educador, y los límites rechazan una lista vacía, así
que nunca se creó ninguna sesión ni se envió ninguna solicitud. El controlador de errores incluido
con el proyecto inicial imprime el mensaje y sale con estado 1.

Una ejecución que supera su tiempo de espera se detiene del mismo modo en lugar de dejarte esperando indefinidamente:

```text
The curator did not respond in time. Try again.
```

El tiempo de espera normal es de 120 segundos; no cambia qué hechos ni herramientas puede usar el conservador.

## Comprueba lo que has aprendido

- Has registrado la herramienta en dos lugares. ¿Qué pasaría si pusieras `approved_fact_lookup` en la
  lista de herramientas pero la dejaras fuera de la lista de permitidos?
- El prompt dice "Call `approved_fact_lookup` first." ¿Esa frase garantiza que la llamada
  ocurra? ¿Qué fue lo que, en este paso, hizo que la herramienta estuviera *disponible* para llamarla?
- La herramienta no recibe argumentos y siempre devuelve la misma lista acotada para un conjunto de hechos determinado. ¿Qué
  perderías si recibiera un argumento de consulta de texto libre en su lugar?
- La estructura de salida se solicita en el prompt. ¿Qué ha verificado realmente hasta ahora que el modelo
  la haya seguido?

## Más información

- [Trabajar con hooks](https://github.com/github/copilot-sdk/blob/main/docs/features/hooks.md):
  callbacks que el runtime invoca alrededor de cada llamada a herramientas, para auditoría o directivas que controla tu código.
- [Hook posterior al uso de una herramienta](https://github.com/github/copilot-sdk/blob/main/docs/hooks/post-tool-use.md):
  inspeccionar o reescribir lo que devolvió una herramienta antes de que lo lea el modelo.
- [Limpieza de contexto y herramientas de terminal](https://github.com/github/copilot-sdk/blob/main/docs/features/context-management.md):
  lo que una herramienta puede hacer con la propia conversación, y por qué la mayoría de herramientas no debería hacerlo.

Continúa con [Comprueba la estructura](museum-06-prove-the-structure.md).
