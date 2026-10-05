# Demonstração ao vivo do GitHub Podcast: Python

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Crie um ambiente no projeto inicial incluído antes da sessão cronometrada:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

No macOS/Linux, use `.venv/bin/python` em vez de `.\.venv\Scripts\python.exe`.

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Comece com `main.py`. Ele tem deliberadamente placeholders nomeados para `client`, `is_authenticated` e `session`. Deixe o manipulador de eventos de streaming e a espera de conclusão no lugar.

### 1. Inicie o cliente

Substitua `client: CopilotClient` por:

```python
client = CopilotClient()
await client.start()
```

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `is_authenticated = False` e seu bloco `if` por:

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie a sessão

Substitua `session = None` por:

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

Amplie a importação do SDK no topo do arquivo:

```python
from copilot import CopilotClient, PermissionHandler
```

Diga: "A sessão é a conversa. Escolhi o modelo, habilitei o streaming, e o manipulador de eventos abaixo já imprime cada fragmento de texto conforme ele chega."

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Substitua tudo de `# Step 5: Send the first message.` até o fim de `main()` por este bloco
indentado. Mantenha o bloco `if __name__ == "__main__":` do módulo:

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

Diga: "Esse é o formato básico: iniciar um cliente, criar uma sessão, ouvir eventos e enviar uma mensagem. Depois que esse loop funcionar, podemos evoluí-lo para o nosso agente de podcast."

Execute este checkpoint de Hello World a partir de `start-intro/python`:

```powershell
.\.venv\Scripts\python.exe main.py
```

No macOS/Linux:

```bash
.venv/bin/python main.py
```

Saída esperada: uma resposta de uma frase transmitida em streaming, seguida por `SessionIdleData` concluindo o programa.

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, use os auxiliares prontos para transformar a mesma sessão em um workflow de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Adicione importações:

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

Restrinja novamente a importação do SDK, já que `permission_prompt` substitui `PermissionHandler` abaixo:

```python
from copilot import CopilotClient
```

Depois da verificação de autenticação:

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Crie a sessão com ferramentas:

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

Diga: "O modelo não recebe acesso arbitrário ao meu aplicativo. Concedo duas capacidades estreitas e tipadas, incluo-as na lista de permissões pelo nome e troco o manipulador aprovar tudo do Hello World por um que me solicita confirmação, para que eu continue sendo o ponto de aprovação antes que uma ferramenta seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa replace, não append. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação desta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Substitua o prompt por:

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Mantenha o manipulador de eventos, a espera de conclusão e a limpeza inalterados. Substitua apenas a
chamada `session.send(...)` dentro do bloco `try` existente. Atualize a linha de status do modelo
para imprimir o `model` selecionado.

Execute o agente de podcast concluído a partir da mesma pasta:

```powershell
.\.venv\Scripts\python.exe main.py
```

No macOS/Linux:

```bash
.venv/bin/python main.py
```

Marcos esperados: seleção de modelo, seleção de dez episódios, `[Tool call started]`, prompt de aprovação, `[Tool call complete]` e então texto de lançamento transmitido em streaming.
