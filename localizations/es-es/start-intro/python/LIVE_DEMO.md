# Demostración en directo de GitHub Podcast: Python

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Crea un entorno en el proyecto inicial incluido antes de la sesión cronometrada:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

En macOS/Linux, usa `.venv/bin/python` en lugar de `.\.venv\Scripts\python.exe`.

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Empieza por `main.py`. Tiene deliberadamente marcadores de posición con nombre para `client`, `is_authenticated` y `session`. Deja en su sitio el controlador de eventos de streaming y la espera de finalización.

### 1. Inicia el cliente

Sustituye `client: CopilotClient` por:

```python
client = CopilotClient()
await client.start()
```

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `is_authenticated = False` y su bloque `if` por:

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea la sesión

Sustituye `session = None` por:

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

Amplía la importación del SDK al principio del archivo:

```python
from copilot import CopilotClient, PermissionHandler
```

Di: "La sesión es la conversación. He elegido el modelo, he habilitado el streaming y el controlador de eventos de abajo ya imprime cada fragmento de texto a medida que llega.

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Sustituye todo desde `# Step 5: Send the first message.` hasta el final de `main()` por este bloque
con sangría. Conserva el bloque `if __name__ == "__main__":` del módulo:

```python
    try:
        await session.send(
            "Hello world! In one sentence, say what the Copilot SDK helps a Python app do."
        )
        await asyncio.wait_for(done.wait(), timeout=60)
        if error is not None:
            raise error
        print()
    finally:
        await session.disconnect()
        await client.stop()
```

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, escuchar eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast.

Ejecuta este punto de control de Hello World desde `start-intro/python`:

```powershell
.\.venv\Scripts\python.exe main.py
```

En macOS/Linux:

```bash
.venv/bin/python main.py
```

Salida esperada: una respuesta de una frase transmitida en streaming, seguida de `SessionIdleData`, que completa el programa.

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, usa los auxiliares ya preparados para convertir la misma sesión en un flujo de trabajo de pódcast fundamentado.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Añade importaciones:

```python
from github_podcast_tools import (
    get_latest,
    get_latest_github_podcast_episodes,
    get_github_podcast_episode,
    pick_episode,
)
from model_selector import select_model
from permission_prompt import permission_prompt
```

Vuelve a acotar la importación del SDK, porque `permission_prompt` sustituye a `PermissionHandler` más abajo:

```python
from copilot import CopilotClient
```

Después de la comprobación de autenticación:

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Crea la sesión con herramientas:

```python
session = await client.create_session(
    model=model,
    streaming=True,
    tools=[get_github_podcast_episode, get_latest_github_podcast_episodes],
    available_tools=["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
    on_permission_request=permission_prompt,
    system_message={
        "mode": "replace",
        "content": "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
    },
)
```

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Le concedo dos capacidades limitadas y tipadas, las incluyo en la lista de permitidos por nombre y cambio el controlador de aprobar todo de Hello World por uno que me lo solicita, de modo que sigo siendo el punto de aprobación antes de que se ejecute una herramienta.

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa replace, no append. Mi aplicación proporciona la identidad completa del agente y la regla de base factual para esta sesión en lugar de heredar el prompt predeterminado.

### 3. Sustituye el prompt

Sustituye el prompt por:

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Mantén sin cambios el controlador de eventos, la espera de finalización y la limpieza. Sustituye
solo la llamada `session.send(...)` dentro del bloque `try` existente. Actualiza la línea de estado
del modelo para imprimir el `model` seleccionado.

Ejecuta el agente de pódcast completado desde la misma carpeta:

```powershell
.\.venv\Scripts\python.exe main.py
```

En macOS/Linux:

```bash
.venv/bin/python main.py
```

Hitos esperados: selección de modelo, selección de diez episodios, `[Tool call started]`, solicitud de aprobación, `[Tool call complete]` y después texto de lanzamiento transmitido en streaming.
