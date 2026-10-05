# Demonstração ao vivo do The GitHub Podcast: Java

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Compile as dependências no projeto inicial incluído antes da sessão cronometrada:

```powershell
cd start-intro/java
./mvnw compile
```

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Comece com `src\main\java\demo\CopilotSdkLiveDemo.java`. Ele tem placeholders nomeados de propósito para `client`, `isAuthenticated` e `session`.

### 1. Inicie o cliente

Substitua `CopilotClient client;` por:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

Este bloco de recurso permanece aberto até a etapa 4 adicionar sua chave de fechamento. Conclua
todas as quatro edições antes de executar.

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `boolean isAuthenticated = false;` por:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie a sessão

Substitua o placeholder de sessão por:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

Adicione estas importações:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

Substitua os comentários em `// Step 4: Stream events from the assistant.` por:

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

Isso fornece o manipulador de streaming onde o projeto inicial o marcou. O bloco de recurso da
sessão também permanece aberto até a etapa 4.

Diga: "A sessão é a conversa. Escolhi o modelo e habilitei o streaming."

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Em `// Step 5: Send the first message.`, remova o placeholder `var config` e sua proteção
`if (session != null)`. Substitua-os por:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

As duas chaves de fechamento encerram os blocos de recursos da sessão e do cliente das etapas 3 e 1.
Mantenha as chaves de fechamento existentes do método e da classe.

Diga: "Esse é o formato básico: iniciar um cliente, criar uma sessão, ouvir eventos e enviar uma mensagem. Depois que esse loop funcionar, podemos evoluí-lo para o nosso agente de podcast."

Execute este checkpoint de Hello World agora a partir da pasta `java`:

```powershell
./mvnw compile exec:java
```

Saída esperada: uma resposta de uma frase transmitida em streaming. `sendAndWait` aguarda a
conclusão e propaga erros; os blocos de recursos fecham ambos os recursos do SDK.

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, use as classes auxiliares prontas para transformar a mesma sessão em um workflow de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Adicione importações para `com.github.copilot.rpc.SystemMessageConfig` e
`com.github.copilot.SystemMessageMode`. Mantenha `java.util.List` do Ato um. A importação de
`PermissionHandler` deixa de ser usada quando `PermissionPrompt` a substitui abaixo.

Dentro do bloco de recursos do cliente, depois da autenticação e antes de `var config`:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Crie as ferramentas:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

Substitua `var config` e sua cadeia de builder, mantendo o bloco
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

Diga: "O modelo não obtém acesso arbitrário ao meu aplicativo. Eu concedo duas capacidades restritas e tipadas, coloco-as na lista de permissões pelo nome e substituo o manipulador que aprova tudo do Hello World por `PermissionPrompt`, que nega qualquer coisa que não seja uma dessas ferramentas e me pergunta no stdin antes que uma delas seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa REPLACE, não APPEND. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação para esta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Substitua apenas o argumento de `.setPrompt(...)` no envio com limite existente:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

Atualize a linha de status do modelo para imprimir `selectedModel`. Mantenha as assinaturas, a
espera de 60 segundos e ambos os blocos de recursos inalterados.

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Execute o Podcast Agent concluído agora a partir da pasta `java`:

```powershell
./mvnw compile exec:java
```

Marcos esperados: seleção de modelo, seleção de dez episódios, execução de ferramenta, prompt de aprovação e, então, texto de lançamento fundamentado.
