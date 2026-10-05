# Demostración en vivo de The GitHub Podcast

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Trabaja en el proyecto inicial incluido y restaura las dependencias antes de la sesión cronometrada:

```powershell
cd start-intro/dotnet
dotnet restore
```

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Empieza por `Program.cs`. Tiene deliberadamente marcadores de posición con nombre para `client`, `isAuthenticated` y `session`. Deja en su sitio el controlador de eventos de streaming y la espera de finalización.

### 1. Inicia el cliente

Sustituye `CopilotClient client;` por:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `var isAuthenticated = false;` por:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea la sesión

Añade `using GitHub.Copilot.Rpc;` al principio. Sustituye `CopilotSession session = null!;` por:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

Di: "La sesión es la conversación. He elegido el modelo, he habilitado el streaming y el controlador de eventos de abajo ya imprime cada fragmento de texto a medida que llega.

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Debajo de `// Step 5: Send the first message.`, escribe:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

Sustituye el `await complete.Task;` final por:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

El controlador de eventos existente ya está proporcionado; no es un quinto ejercicio de edición.
Imprime deltas, muestra errores de sesión y termina cuando queda inactivo. `await using` cierra el
cliente y la sesión después de la ejecución.

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, escuchar eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast.

Salida esperada: una respuesta de una frase transmitida en streaming, seguida del `SessionIdleEvent` existente que completa el programa.

Ejecuta este punto de control de Hello World desde `start-intro/dotnet`:

```powershell
dotnet run
```

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, añade los auxiliares ya escritos de `Helpers` y `Tools` para convertir la misma sesión en un flujo de trabajo de pódcast basado en hechos.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Añade las directivas using de los auxiliares ya escritos:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

Después de la autenticación y antes de la señal de finalización y la sesión, añade un selector y
selecciona uno de los diez episodios más recientes:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Crea las herramientas propias de la aplicación:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Sustituye los campos de `SessionConfig` de Hello World por estos, manteniendo
`await using var session = await client.CreateSessionAsync(...)`:

```csharp
Model = model,
Streaming = true,
Tools = [episodeTool, latestEpisodesTool],
AvailableTools = ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
OnPermissionRequest = PermissionPrompt.RequestAsync,
SystemMessage = new SystemMessageConfig
{
    Mode = SystemMessageMode.Replace,
    Content = "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."
}
```

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Le concedo dos capacidades limitadas y tipadas, las incluyo en la lista de permitidos por nombre y cambio el controlador de aprobar todo de Hello World por uno que me lo solicita, de modo que sigo siendo el punto de aprobación antes de que se ejecute una herramienta.

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa Replace, no Append. Mi aplicación proporciona la identidad completa del agente y la regla de base factual para esta sesión en lugar de heredar el prompt predeterminado.

### 3. Sustituye el prompt

Sustituye Hello World por la solicitud del episodio seleccionado y basado en hechos:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Hitos esperados: selección de modelo, selección de diez episodios, `[Tool call started]`, solicitud de aprobación, `[Tool call complete]` y después texto de lanzamiento transmitido en streaming.

Actualiza la línea de estado del modelo para usar el `model` seleccionado, no `Model`. Mantén el
controlador de eventos, la espera de finalización acotada y las declaraciones `await using`.

Ejecuta el agente de pódcast completado desde la misma carpeta:

```powershell
dotnet run
```
