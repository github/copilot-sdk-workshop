# Demonstração ao vivo do The GitHub Podcast: Go

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Baixe as dependências no projeto inicial incluído antes da sessão cronometrada:

```powershell
cd start-intro/go
go mod download
go mod verify
```

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Comece com `main.go`. Ele tem placeholders nomeados de propósito para `client`, `isAuthenticated` e `session`. Deixe o manipulador de eventos no lugar.

### 1. Inicie o cliente

Substitua `var client *copilot.Client` e o `_ = client` seguinte por:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `isAuthenticated := false` por:

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie a sessão

Substitua o placeholder de sessão por:

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

Diga: "A sessão é a conversa. Escolhi o modelo, habilitei o streaming, e o manipulador de eventos abaixo imprime cada fragmento de texto conforme ele chega."

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Adicione `"time"` às importações. Abaixo de `// Step 5: Send the first message.`, substitua
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

Mantenha a assinatura de evento existente. Não chame também `streamResponse`; esse auxiliar adiciona
uma segunda assinatura e imprimiria cada fragmento de texto duas vezes.

Diga: "Esse é o formato básico: iniciar um cliente, criar uma sessão, ouvir eventos e enviar uma mensagem. Depois que esse loop funcionar, podemos evoluí-lo para o nosso agente de podcast."

Execute agora este checkpoint de Hello World a partir da pasta `go`:

```powershell
go run .
```

Saída esperada: uma resposta em streaming de uma frase, seguida por `SendAndWait` concluindo o turno.

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, use os auxiliares pré-escritos em `helpers.go` e `permission_prompt.go` para transformar a mesma sessão em um fluxo de trabalho de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Após a autenticação e antes de criar a sessão:

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

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Crie as ferramentas:

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

Crie a sessão:

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

Diga: "O modelo não recebe acesso arbitrário ao meu aplicativo. Concedo duas capacidades estreitas e tipadas, incluo-as na lista de permissões pelo nome e troco o manipulador aprovar tudo do Hello World por `permissionPrompt` em `permission_prompt.go`, que nega qualquer coisa que não seja uma dessas ferramentas e me pergunta no stdin antes que uma delas seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa replace, não append. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação desta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Monte o prompt imediatamente antes do envio delimitado existente:

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

Altere o campo `MessageOptions` para `Prompt: prompt`. Atualize a linha de status do modelo para
imprimir `selectedModel`. Mantenha a assinatura existente, o contexto delimitado, a verificação de
erro e a limpeza adiada; não adicione uma segunda assinatura.

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Execute agora o agente de podcast concluído a partir da pasta `go`:

```powershell
go run .
```

Marcos esperados: seleção de modelo, seleção de dez episódios, `[Tool call started]`, prompt de aprovação, `[Tool call complete]` e então texto de lançamento transmitido em streaming.
