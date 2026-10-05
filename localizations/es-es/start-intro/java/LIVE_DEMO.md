# Demostración en vivo de The GitHub Podcast: Java

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Compila las dependencias en el proyecto inicial incluido antes de la sesión cronometrada:

```powershell
cd start-intro/java
./mvnw compile
```

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Empieza por `src\main\java\demo\CopilotSdkLiveDemo.java`. Tiene deliberadamente marcadores de posición con nombre para `client`, `isAuthenticated` y `session`.

### 1. Inicia el cliente

Sustituye `CopilotClient client;` por:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

Este bloque de recurso permanece abierto hasta que el paso 4 añade su llave de cierre. Completa las
cuatro ediciones antes de ejecutar.

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `boolean isAuthenticated = false;` por:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea la sesión

Sustituye el marcador de posición de la sesión por:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

Añade estas importaciones:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

Sustituye los comentarios debajo de `// Step 4: Stream events from the assistant.` por:

```java
session.on(AssistantMessageDeltaEvent.class, event -> {
    String delta = event.getData().deltaContent();
    if (delta != null) {
        System.out.print(delta);
    }
});
session.on(ToolExecutionStartEvent.class, event ->
        System.out.println("\n[Tool call started] " + event.getData().toolName()));
session.on(ToolExecutionCompleteEvent.class, event ->
        System.out.println("\n[Tool call complete]"));
```

Esto proporciona el controlador de streaming donde el proyecto inicial lo había marcado. El bloque
de recurso de la sesión también permanece abierto hasta el paso 4.

Di: "La sesión es la conversación. Elegí el modelo y habilité el streaming."

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Bajo `// Step 5: Send the first message.`, elimina el marcador de posición `var config` y su
protección `if (session != null)`. Sustitúyelos por:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

Las dos llaves de cierre finalizan los bloques de recursos de sesión y cliente de los pasos 3 y 1.
Conserva las llaves de cierre de método y clase existentes.

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, escuchar eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast.

Ejecuta ahora este punto de control de Hello World desde la carpeta `java`:

```powershell
./mvnw compile exec:java
```

Salida esperada: una respuesta de una frase transmitida en streaming. `sendAndWait` espera a que se
complete y propaga los errores; los bloques de recursos cierran ambos recursos del SDK.

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, usa las clases auxiliares ya preparadas para convertir la misma sesión en un flujo de trabajo de pódcast fundamentado.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Añade importaciones para `com.github.copilot.rpc.SystemMessageConfig` y
`com.github.copilot.SystemMessageMode`. Mantén `java.util.List` del Primer acto. La importación de
`PermissionHandler` ya no se usa cuando `PermissionPrompt` lo sustituye más abajo.

Dentro del bloque de recursos del cliente, después de la autenticación y antes de `var config`:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Crea las herramientas:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

Sustituye `var config` y su cadena del builder, conservando el bloque
`try (var session = client.createSession(config).get())` existente:

```java
var config = new SessionConfig()
        .setModel(selectedModel)
        .setStreaming(true)
        .setTools(List.of(episodeTool, latestEpisodesTool))
        .setAvailableTools(List.of("get_github_podcast_episode", "get_latest_github_podcast_episodes"))
        .setOnPermissionRequest(PermissionPrompt.HANDLER)
        .setSystemMessage(new SystemMessageConfig()
                .setMode(SystemMessageMode.REPLACE)
                .setContent("You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."));
```

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Concedo dos capacidades acotadas y tipadas, las incluyo en la lista de permitidos por nombre y sustituyo el controlador que aprueba todo de Hello World por `PermissionPrompt`, que deniega todo lo que no sea una de estas herramientas y me pregunta por stdin antes de ejecutar una."

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa REPLACE, no APPEND. Mi aplicación proporciona la identidad completa del agente y la regla de fundamentación para esta sesión en lugar de heredar el prompt predeterminado."

### 3. Sustituye el prompt

Sustituye solo el argumento de `.setPrompt(...)` en el envío acotado existente:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

Actualiza la línea de estado del modelo para imprimir `selectedModel`. Mantén sin cambios las
suscripciones, la espera de 60 segundos y ambos bloques de recursos.

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Ejecuta ahora el agente de pódcast completado desde la carpeta `java`:

```powershell
./mvnw compile exec:java
```

Hitos esperados: selección del modelo, selección de diez episodios, ejecución de la herramienta, solicitud de aprobación y, después, texto de lanzamiento fundamentado.
