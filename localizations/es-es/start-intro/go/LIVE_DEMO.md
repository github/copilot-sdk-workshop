# Demostración en vivo de The GitHub Podcast: Go

## Antes de la sesión

1. Ejecuta `copilot auth login` si este equipo aún no está autenticado.
2. Descarga las dependencias en el proyecto inicial incluido antes de la sesión cronometrada:

```powershell
cd start-intro/go
go mod download
go mod verify
```

## Presentación de la demostración

Di: "Estamos creando un agente de pódcast para The GitHub Podcast. Nos permitirá elegir un episodio real, recuperar metadatos verificados del feed RSS oficial y convertir esos hechos en texto para redes sociales seguro para patrocinadores.

Di: "Empezaremos con la conversación más pequeña posible del Copilot SDK y después le daremos un propósito, una identidad y herramientas propias de la aplicación.

## Primer acto: Hello World

Empieza por `main.go`. Tiene deliberadamente marcadores de posición con nombre para `client`, `isAuthenticated` y `session`. Deja el controlador de eventos en su sitio.

### 1. Inicia el cliente

Sustituye `var client *copilot.Client` y el `_ = client` siguiente por:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

Di: "El cliente es mi conexión con el runtime de Copilot. Lo inicio explícitamente para que la aplicación controle su ciclo de vida.

### 2. Comprueba la autenticación

Sustituye `isAuthenticated := false` por:

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

Di: "Antes de crear una sesión, puedo preguntarle al runtime si este equipo ha iniciado sesión.

### 3. Crea la sesión

Sustituye el marcador de posición de la sesión por:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               preferredModel,
	Streaming:           copilot.Bool(true),
	AvailableTools:      []string{},
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Di: "La sesión es la conversación. He elegido el modelo, he habilitado el streaming y el controlador de eventos de abajo imprime cada fragmento de texto a medida que llega.

Di: "El controlador responde a las solicitudes de permisos. La lista de permitidos de herramientas vacía elimina las capacidades de herramientas para este ejercicio; aprobar todo por sí solo no es un límite de seguridad.

### 4. Envía Hello World

Añade `"time"` a las importaciones. Debajo de `// Step 5: Send the first message.`, sustituye
`_ = context.Background()` por:

```go
ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
defer cancel()
if _, err := session.SendAndWait(ctx, copilot.MessageOptions{
	Prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Go app do.",
}); err != nil {
	panic(err)
}
fmt.Println()
```

Mantén la suscripción a eventos existente. No llames también a `streamResponse`; ese auxiliar añade
una segunda suscripción e imprimiría dos veces cada fragmento de texto.

Di: "Esa es la forma básica: iniciar un cliente, crear una sesión, escuchar eventos y enviar un mensaje. Cuando este bucle funcione, podremos convertirlo en nuestro agente de pódcast.

Ejecuta ahora este punto de control de Hello World desde la carpeta `go`:

```powershell
go run .
```

Salida esperada: una respuesta de una frase transmitida en streaming, seguida de `SendAndWait` completando el turno.

## Segundo acto: conviértelo en un agente de pódcast

Después de Hello World, usa los auxiliares ya escritos de `helpers.go` y `permission_prompt.go` para convertir la misma sesión en un flujo de trabajo de pódcast basado en hechos.

Di: "La conversación funciona. Ahora la convertiremos en nuestro agente de pódcast: un asistente enfocado que puede investigar un episodio seleccionado de GitHub Podcast y preparar texto de lanzamiento sin inventar hechos.

### 1. Deja que el presentador elija

Después de la autenticación y antes de crear la sesión:

```go
selectedModel, err := selectModel(context.Background(), client, preferredModel)
if err != nil {
	panic(err)
}
latestEpisodes, err := getLatestEpisodes()
if err != nil {
	panic(err)
}
selectedEpisode, err := pickEpisode(latestEpisodes)
if err != nil {
	panic(err)
}
```

Di: "Esto mantiene la demostración en vivo. Puedo elegir un modelo en la sala y después elegir entre los diez episodios reales más recientes de GitHub Podcast. Esa selección se convierte en el encargo del agente de pódcast.

### 2. Dale capacidades a la sesión

Crea las herramientas:

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

Crea la sesión:

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{episodeTool, latestEpisodesTool},
	AvailableTools:      []string{"get_github_podcast_episode", "get_latest_github_podcast_episodes"},
	OnPermissionRequest: permissionPrompt,
	SystemMessage: &copilot.SystemMessageConfig{
		Mode:    "replace",
		Content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Di: "El modelo no obtiene acceso arbitrario a mi aplicación. Le concedo dos capacidades limitadas y tipadas, las incluyo en la lista de permitidos por nombre y cambio el controlador de aprobar todo de Hello World por `permissionPrompt` en `permission_prompt.go`, que deniega cualquier cosa que no sea una de estas herramientas y me pregunta por stdin antes de que se ejecute una.

Di: "Estas herramientas son lo que hace que esto sea un agente en lugar de un chatbot genérico: puede actuar sobre una fuente de datos de confianza que controla mi aplicación.

Di: "El mensaje del sistema usa replace, no append. Mi aplicación proporciona la identidad completa del agente y la regla de base factual para esta sesión en lugar de heredar el prompt predeterminado.

### 3. Sustituye el prompt

Crea el prompt justo antes del envío acotado existente:

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

Cambia el campo de `MessageOptions` a `Prompt: prompt`. Actualiza la línea de estado del modelo para
imprimir `selectedModel`. Mantén la suscripción existente, el contexto acotado, la comprobación de
errores y la limpieza diferida; no añadas una segunda suscripción.

Di: "El agente decide llamar a la herramienta de episodios, yo apruebo la búsqueda de solo lectura y su respuesta se basa en el feed oficial en lugar de en detalles inventados.

Ejecuta ahora el agente de pódcast completado desde la carpeta `go`:

```powershell
go run .
```

Hitos esperados: selección de modelo, selección de diez episodios, `[Tool call started]`, solicitud de aprobación, `[Tool call complete]` y después texto de lanzamiento transmitido en streaming.
