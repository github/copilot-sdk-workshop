# Demostración en directo de GitHub Podcast: Rust

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Descarga y comprueba las dependencias en el proyecto inicial incluido antes de la sesión cronometrada:

```powershell
cd start-intro/rust
cargo check --locked
```

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Empieza por `src\main.rs`. Tiene deliberadamente marcadores de posición con nombre para `client`, `is_authenticated` y la sesión.

Añade esta importación:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

Sustituye la importación existente de `SessionConfig`; conserva `std::io::{self, Write}`.

### 1. Inicia el cliente

Sustituye el marcador de posición del cliente por:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `let is_authenticated = false;` y su bloque `if` por:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea la sesión

Sustituye `let session_is_created = false;` y el bloque vacío `if session_is_created { ... }` por:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

Di: "La sesión es la conversación. Elegí el modelo y habilité el streaming."

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Bajo `// Step 5: Send the first message.`, sustituye las tres líneas de marcador de posición
`let _ = ...` por:

```rust
let prompt = "Hello world! In one sentence, say what the Copilot SDK helps a Rust app do.".to_owned();
let turn = async {
    let mut events = session.subscribe();
    let send = session.send(MessageOptions::new(prompt));
    tokio::pin!(send);
    let mut sent = false;
    let mut idle = false;
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
                        if let Some(delta) = event.data.get("deltaContent").and_then(|v| v.as_str()) {
                            print!("{delta}");
                            io::stdout().flush()?;
                        }
                    }
                    "tool.execution_start" => println!("\n[Tool call started] {}", event.data),
                    "tool.execution_complete" => println!("\n[Tool call complete]"),
                    "session.error" => {
                        return Err(format!("Copilot session failed: {}", event.data).into());
                    }
                    "session.idle" => idle = true,
                    _ => {}
                }
            }
        }
    }
    Ok::<(), Box<dyn std::error::Error>>(())
};
let result = tokio::time::timeout(Duration::from_secs(60), turn).await;
session.disconnect().await?;
client.stop().await?;
result??;
println!();
```

Conserva el `Ok(())` final. Este bucle proporciona la suscripción de streaming que falta, escucha
antes de enviar y espera tanto a que se complete el envío como a que la sesión quede inactiva.
Muestra los errores o un tiempo de espera de 60 segundos después de cerrar la sesión y el cliente.

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, suscribirse a eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast."

Ejecuta ahora este punto de control de Hello World desde la carpeta `rust`:

```powershell
cargo run --locked
```

Salida esperada: una respuesta de una frase transmitida en streaming a la terminal y, después, la salida del programa.

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, usa el código ya preparado de `src\workshop.rs` para convertir la misma sesión en un flujo de trabajo de pódcast fundamentado.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Añade:

```rust
mod workshop;
```

Añade `SystemMessageConfig` a la importación de tipos existente:

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

Después de la autenticación, antes de construir `config`:

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Crea la sesión:

```rust
let mut config = SessionConfig::default();
config.model = selected_model;
config.streaming = Some(true);
config.tools = Some(vec![workshop::episode_tool(), workshop::latest_episodes_tool()]);
config.available_tools = Some(vec![
    "get_github_podcast_episode".to_owned(),
    "get_latest_github_podcast_episodes".to_owned(),
]);
config.permission_handler = Some(workshop::permission_prompt());
config = config.with_system_message(
    SystemMessageConfig::new()
        .with_mode("replace")
        .with_content(
            "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
        ),
);
let session = client.create_session(config).await?;
```

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Concedo dos capacidades acotadas y tipadas, las incluyo en la lista de permitidos por nombre y sustituyo el controlador que aprueba todo de Hello World por `workshop::permission_prompt`, que deniega todo lo que no sea una de estas herramientas y me pregunta por stdin antes de ejecutar una."

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa replace, no append. Mi aplicación proporciona la identidad completa del agente y la regla de base factual para esta sesión en lugar de heredar el prompt predeterminado.

### 3. Sustituye el prompt

Sustituye solo la línea `let prompt = ...`. Mantén el bucle de streaming, el tiempo de espera y la
limpieza:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Ejecuta ahora el agente de pódcast completado desde la carpeta `rust`:

```powershell
cargo run --locked
```

Hitos esperados: selección del modelo, selección de diez episodios, ejecución de la herramienta, solicitud de aprobación y, después, texto de lanzamiento fundamentado.
