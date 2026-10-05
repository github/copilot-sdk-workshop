# Demonstração ao vivo do The GitHub Podcast

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Trabalhe no projeto inicial incluído e restaure as dependências antes da sessão cronometrada:

```powershell
cd start-intro/dotnet
dotnet restore
```

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Comece com `Program.cs`. Ele tem placeholders nomeados de propósito para `client`, `isAuthenticated` e `session`. Deixe o manipulador de eventos de streaming e a espera de conclusão no lugar.

### 1. Inicie o cliente

Substitua `CopilotClient client;` por:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `var isAuthenticated = false;` por:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie a sessão

Adicione `using GitHub.Copilot.Rpc;` no topo. Substitua `CopilotSession session = null!;` por:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

Diga: "A sessão é a conversa. Escolhi o modelo, habilitei o streaming, e o manipulador de eventos abaixo já imprime cada fragmento de texto conforme ele chega."

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Abaixo de `// Step 5: Send the first message.`, digite:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

Substitua o `await complete.Task;` final por:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

O manipulador de eventos existente já é fornecido; ele não é um quinto exercício de edição. Ele
imprime deltas, expõe erros de sessão e termina quando fica ocioso. `await using` fecha o cliente e
a sessão após a execução.

Diga: "Esse é o formato básico: iniciar um cliente, criar uma sessão, ouvir eventos e enviar uma mensagem. Depois que esse loop funcionar, podemos evoluí-lo para o nosso agente de podcast."

Saída esperada: uma resposta em streaming de uma frase, seguida pelo `SessionIdleEvent` existente concluindo o programa.

Execute este checkpoint de Hello World a partir de `start-intro/dotnet`:

```powershell
dotnet run
```

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, adicione os auxiliares pré-escritos em `Helpers` e `Tools` para transformar a mesma sessão em um fluxo de trabalho de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Adicione usings para os auxiliares pré-escritos:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

Após a autenticação, antes do sinal de conclusão e da sessão, adicione um seletor e selecione um dos
dez episódios mais recentes:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Crie as ferramentas pertencentes ao aplicativo:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Substitua os campos de `SessionConfig` do Hello World por estes, mantendo
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

Diga: "O modelo não recebe acesso arbitrário ao meu aplicativo. Concedo duas capacidades estreitas e tipadas, incluo-as na lista de permissões pelo nome e troco o manipulador aprovar tudo do Hello World por um que me solicita confirmação, para que eu continue sendo o ponto de aprovação antes que uma ferramenta seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa Replace, não Append. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação desta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Substitua Hello World pela solicitação fundamentada do episódio selecionado:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Marcos esperados: seleção de modelo, seleção de dez episódios, `[Tool call started]`, prompt de aprovação, `[Tool call complete]` e então texto de lançamento transmitido em streaming.

Atualize a linha de status do modelo para usar o `model` selecionado, não `Model`. Mantenha o
manipulador de eventos, a espera de conclusão delimitada e as declarações `await using`.

Execute o agente de podcast concluído a partir da mesma pasta:

```powershell
dotnet run
```
