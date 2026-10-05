# Demonstração ao vivo do GitHub Podcast: Rust

## Antes da sessão

1. Execute `copilot auth login` se esta máquina ainda não estiver autenticada.
2. Baixe e verifique as dependências no projeto inicial incluído antes da sessão cronometrada:

```powershell
cd start-intro/rust
cargo check --locked
```

## Apresentação da demo

Diga: "Estamos criando um agente de podcast para The GitHub Podcast. Ele nos permitirá escolher um episódio real, recuperar metadados verificados do feed RSS oficial e transformar esses fatos em texto para redes sociais seguro para patrocinadores."

Diga: "Começaremos com a menor conversa possível do Copilot SDK; depois daremos a ela um propósito, uma identidade e ferramentas pertencentes ao aplicativo."

## Ato um: Hello World

Comece com `src\main.rs`. Ele tem deliberadamente placeholders nomeados para `client`, `is_authenticated` e a sessão.

Adicione esta importação:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

Substitua a importação existente de `SessionConfig`; mantenha `std::io::{self, Write}`.

### 1. Inicie o cliente

Substitua o placeholder do cliente por:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

Diga: "O cliente é minha conexão com o runtime do Copilot. Eu o inicio explicitamente para que o aplicativo controle seu ciclo de vida."

### 2. Verifique a autenticação

Substitua `let is_authenticated = false;` e seu bloco `if` por:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

Diga: "Antes de criar uma sessão, posso perguntar ao runtime se esta máquina está autenticada."

### 3. Crie a sessão

Substitua `let session_is_created = false;` e o bloco vazio `if session_is_created { ... }` por:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

Diga: "A sessão é a conversa. Escolhi o modelo e habilitei o streaming."

Diga: "O manipulador responde a solicitações de permissão. A lista de permissões de ferramentas vazia remove as capacidades de ferramenta deste exercício; aprovar tudo por si só não é um limite de segurança."

### 4. Envie Hello World

Em `// Step 5: Send the first message.`, substitua as três linhas placeholder `let _ = ...` por:

```rust
let prompt = "Hello world! In one sentence, say what the Copilot SDK helps a Rust app do.".to_owned();
let turn = async {
    let mut events = session.subscribe();
    let send = session.send(MessageOptions::new(prompt));
    tokio::pin!(send);
    let mut sent = false;
    let mut idle = false;
    while !sent || !idle {
        tokio::select! {
            result = &mut send, if !sent => {
                result?;
                sent = true;
            }
            event = events.recv() => {
                let event = event?;
                match event.event_type.as_str() {
                    "assistant.message_delta" => {
                        if let Some(delta) = event.data.get("deltaContent").and_then(|v| v.as_str()) {
                            print!("{delta}");
                            io::stdout().flush()?;
                        }
                    }
                    "tool.execution_start" => println!("\n[Tool call started] {}", event.data),
                    "tool.execution_complete" => println!("\n[Tool call complete]"),
                    "session.error" => {
                        return Err(format!("Copilot session failed: {}", event.data).into());
                    }
                    "session.idle" => idle = true,
                    _ => {}
                }
            }
        }
    }
    Ok::<(), Box<dyn std::error::Error>>(())
};
let result = tokio::time::timeout(Duration::from_secs(60), turn).await;
session.disconnect().await?;
client.stop().await?;
result??;
println!();
```

Mantenha o `Ok(())` final. Este loop fornece a assinatura de streaming que falta, começa a escutar
antes de enviar e aguarda tanto a conclusão do envio quanto a inatividade. Ele expõe erros ou um
tempo limite de 60 segundos depois de fechar a sessão e o cliente.

Diga: "Esta é a forma básica: iniciar um cliente, criar uma sessão, assinar eventos e enviar uma mensagem. Quando este loop funcionar, poderemos evoluí-lo para o nosso Podcast Agent."

Execute este checkpoint de Hello World agora a partir da pasta `rust`:

```powershell
cargo run --locked
```

Saída esperada: uma resposta de uma frase transmitida em streaming para o terminal e, depois, a saída do programa.

## Ato dois: transforme-o em um agente de podcast

Depois do Hello World, use o código pronto em `src\workshop.rs` para transformar a mesma sessão em um workflow de podcast fundamentado.

Diga: "A conversa funciona. Agora vamos transformá-la no nosso agente de podcast: um assistente focado que pode pesquisar um episódio selecionado do GitHub Podcast e preparar texto de lançamento sem inventar fatos."

### 1. Deixe o apresentador escolher

Adicione:

```rust
mod workshop;
```

Adicione `SystemMessageConfig` à importação de tipos existente:

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

Depois da autenticação, antes de construir `config`:

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

Diga: "Isso mantém a demo ao vivo. Posso escolher um modelo na sala e depois escolher entre os dez episódios reais mais recentes do GitHub Podcast. Essa seleção se torna a tarefa do agente de podcast."

### 2. Dê capacidades à sessão

Crie a sessão:

```rust
let mut config = SessionConfig::default();
config.model = selected_model;
config.streaming = Some(true);
config.tools = Some(vec![workshop::episode_tool(), workshop::latest_episodes_tool()]);
config.available_tools = Some(vec![
    "get_github_podcast_episode".to_owned(),
    "get_latest_github_podcast_episodes".to_owned(),
]);
config.permission_handler = Some(workshop::permission_prompt());
config = config.with_system_message(
    SystemMessageConfig::new()
        .with_mode("replace")
        .with_content(
            "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
        ),
);
let session = client.create_session(config).await?;
```

Diga: "O modelo não obtém acesso arbitrário ao meu aplicativo. Eu concedo duas capacidades restritas e tipadas, coloco-as na lista de permissões pelo nome e substituo o manipulador que aprova tudo do Hello World por `workshop::permission_prompt`, que nega qualquer coisa que não seja uma dessas ferramentas e me pergunta no stdin antes que uma delas seja executada."

Diga: "Essas ferramentas são o que faz disto um agente, em vez de um chatbot genérico: ele pode agir em relação a uma fonte de dados confiável controlada pelo meu aplicativo."

Diga: "A mensagem de sistema usa replace, não append. Meu aplicativo fornece a identidade completa do agente e a regra de fundamentação desta sessão em vez de herdar o prompt padrão."

### 3. Substitua o prompt

Substitua apenas a linha `let prompt = ...`. Mantenha o loop de streaming, o tempo limite e a
limpeza:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

Diga: "O agente decide chamar a ferramenta de episódio, eu aprovo a consulta somente leitura, e a resposta dele é fundamentada no feed oficial em vez de detalhes inventados."

Execute o Podcast Agent concluído agora a partir da pasta `rust`:

```powershell
cargo run --locked
```

Marcos esperados: seleção de modelo, seleção de dez episódios, execução de ferramenta, prompt de aprovação e, então, texto de lançamento fundamentado.
