# Demonstração ao vivo do GitHub Podcast: Node.js

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Instale as dependências no projeto inicial incluído antes da sessão cronometrada:

```powershell
cd start-intro/nodejs
npm ci
```

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Abra `src\index.ts`. Ele tem placeholders para `client`, autenticação, `session` e o primeiro prompt.

### 1. Inicie o cliente

Substitua `let client: CopilotClient;` por:

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

O bloco `try` permanece aberto até que a etapa 4 adicione o bloco `finally`. Conclua todas as quatro
edições antes de executar.

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `const isAuthenticated = false;` e o bloco `if` seguinte por:

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie uma sessão de streaming

Substitua `let session: CopilotSession;` por:

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

Adicione `approveAll` à importação do SDK no topo do arquivo:

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

Diga: "A sessão é a conversa. Escolhi o modelo, habilitei o streaming, e o manipulador de eventos abaixo já imprime cada fragmento de texto conforme ele chega."

O bloco `try` da sessão também permanece aberto até a etapa 4. Deixe o manipulador de streaming
existente no lugar.

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Abaixo de `// Step 5: Send the first message.`, digite:

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

Diga: "Esse é o formato básico: iniciar um cliente, criar uma sessão, ouvir eventos e enviar uma mensagem. Depois que esse loop funcionar, podemos evoluí-lo para o nosso agente de podcast."

Execute este checkpoint de Hello World agora a partir da pasta `nodejs`:

```powershell
npm start
```

Saída esperada: uma resposta de uma frase transmitida em streaming, seguida pela conclusão do turno
por `sendAndWait`. Ele propaga erros de sessão e limita a espera a 60 segundos. Os dois blocos
`finally` fecham a sessão e o cliente.

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, use os auxiliares prontos em `src` para transformar a mesma sessão em um workflow de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Adicione importações:

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

Remova `approveAll` da importação do SDK, já que `permissionPrompt` o substitui abaixo:

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

Dentro do bloco `try` do cliente, depois da autenticação e antes da criação da sessão, adicione:

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Substitua a configuração da sessão por:

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

Mantenha o bloco `try` da sessão depois desta configuração.

Diga: "O modelo não recebe acesso arbitrário ao meu aplicativo. Concedo duas capacidades estreitas e tipadas, incluo-as na lista de permissões pelo nome e troco o manipulador aprovar tudo do Hello World por um que me solicita confirmação, para que eu continue sendo o ponto de aprovação antes que uma ferramenta seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa replace, não append. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação desta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Substitua apenas o prompt na chamada `sendAndWait` existente por:

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Execute o Podcast Agent concluído agora a partir da pasta `nodejs`:

```powershell
npm start
```

Marcos esperados: seleção de modelo, seleção de dez episódios, `[Tool call started]`, prompt de aprovação, `[Tool call complete]` e então texto de lançamento transmitido em streaming.

Atualize a linha de status do modelo para usar `selectedModel`. Mantenha o manipulador de eventos, o
tempo limite de 60 segundos e ambos os blocos `finally`.
