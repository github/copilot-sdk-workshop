# Demostración en directo de GitHub Podcast: Node.js

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Instala las dependencias en el proyecto inicial incluido antes de la sesión cronometrada:

```powershell
cd start-intro/nodejs
npm ci
```

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Abre `src\index.ts`. Tiene marcadores de posición para `client`, la autenticación, `session` y el primer prompt.

### 1. Inicia el cliente

Sustituye `let client: CopilotClient;` por:

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

El bloque `try` permanece abierto hasta que el paso 4 añade su bloque `finally`. Completa las cuatro
ediciones antes de ejecutar.

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `const isAuthenticated = false;` y el bloque `if` siguiente por:

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea una sesión de streaming

Sustituye `let session: CopilotSession;` por:

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

Añade `approveAll` a la importación del SDK al principio del archivo:

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

Di: "La sesión es la conversación. He elegido el modelo, he habilitado el streaming y el controlador de eventos de abajo ya imprime cada fragmento de texto a medida que llega.

El bloque `try` de la sesión también permanece abierto hasta el paso 4. Deja el controlador de
streaming existente en su sitio.

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Debajo de `// Step 5: Send the first message.`, escribe:

```typescript
await session.sendAndWait({
    prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Node.js app do.",
}, 60_000);
console.log();
} finally {
  await session.disconnect();
}
} finally {
  await client.stop();
}
```

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, escuchar eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast.

Ejecuta ahora este punto de control de Hello World desde la carpeta `nodejs`:

```powershell
npm start
```

Salida esperada: una respuesta de una frase transmitida en streaming, seguida de que `sendAndWait`
complete el turno. Propaga los errores de sesión y limita la espera a 60 segundos. Los dos bloques
`finally` cierran la sesión y el cliente.

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, usa los auxiliares ya preparados de `src` para convertir la misma sesión en un flujo de trabajo de pódcast fundamentado.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Añade importaciones:

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

Quita `approveAll` de la importación del SDK, porque `permissionPrompt` lo sustituye más abajo:

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

Dentro del bloque `try` del cliente, después de la autenticación y antes de crear la sesión, añade:

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Sustituye la configuración de la sesión por:

```typescript
const session = await client.createSession({
  model: selectedModel,
  streaming: true,
  tools: [episodeTool, latestEpisodesTool],
  availableTools: ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
  onPermissionRequest: permissionPrompt,
  systemMessage: {
    mode: "replace",
    content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
  },
});
```

Mantén el bloque `try` de la sesión después de esta configuración.

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Le concedo dos capacidades limitadas y tipadas, las incluyo en la lista de permitidos por nombre y cambio el controlador de aprobar todo de Hello World por uno que me lo solicita, de modo que sigo siendo el punto de aprobación antes de que se ejecute una herramienta.

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa replace, no append. Mi aplicación proporciona la identidad completa del agente y la regla de base factual para esta sesión en lugar de heredar el prompt predeterminado.

### 3. Sustituye el prompt

Sustituye solo el prompt de la llamada `sendAndWait` existente por:

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Ejecuta ahora el agente de pódcast completado desde la carpeta `nodejs`:

```powershell
npm start
```

Hitos esperados: selección de modelo, selección de diez episodios, `[Tool call started]`, solicitud de aprobación, `[Tool call complete]` y después texto de lanzamiento transmitido en streaming.

Actualiza la línea de estado del modelo para usar `selectedModel`. Mantén el controlador de eventos,
el tiempo de espera de 60 segundos y ambos bloques `finally`.
