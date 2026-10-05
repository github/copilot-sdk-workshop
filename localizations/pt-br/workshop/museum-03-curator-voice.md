# Etapa 3: Dê uma voz ao curador

> **Tempo:** 10 minutos

## O que você vai criar

A mesma chamada de streaming e o mesmo assunto — mas a resposta agora soa como um museu em vez de um
chatbot. Você dá à sessão uma [mensagem de sistema](https://github.com/github/copilot-sdk/blob/main/docs/getting-started.md#customize-the-system-message)
e a coloca no modo replace. Você também pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a diferença.

Esta é a primeira parte de **política pertencente ao aplicativo**. O prompt é uma informação da
tarefa que muda a cada execução. A mensagem de sistema é uma declaração durável de quem é este
agente, do que ele pode falar e do formato de sua saída.

## Modo replace e o que uma mensagem de sistema pode e não pode fazer

A maioria das sessões do SDK começa com uma persona de assistente de codificação de uso geral. O
modo `replace` a descarta e instala a sua, então o curador não é um assistente de codificação
vestindo um chapéu de museu. Use `append` quando quiser estender a persona padrão; use `replace`
quando a persona padrão for inadequada para o trabalho. Para um curador de museu, ela é inadequada.

Há um terceiro modo. `customize` substitui seções individuais do prompt gerenciado pelo SDK — tom,
diretrizes, regras de alteração de código e outras — enquanto preserva o restante, para que você
possa alterar partes específicas sem reafirmar tudo. Use-o quando o prompt padrão estiver quase
certo e apenas algumas seções não estiverem. No modo padrão `append`, o SDK injeta automaticamente o
contexto do ambiente, instruções de ferramentas e proteções de segurança, e a persona da CLI
permanece; `replace` dá a você controle total e abre mão dessas seções, por isso a mensagem que você
está prestes a usar declara explicitamente o próprio escopo e limites.

Uma mensagem de sistema é **orientação, não aplicação forçada**. Ela molda o tom, o escopo e a
estrutura, e desestimula fortemente o modelo a se desviar. Ela não consegue impedir uma chamada de
ferramenta, limitar um tempo de execução ou provar que uma alegação é verdadeira. Para isso, são
necessários a lista de permissões, um tempo limite e validação — Etapas 4 e 5.

## O que a mensagem de sistema do curador diz

O runtime envia a mensagem de sistema antes de cada prompt na sessão. Um prompt é uma solicitação; a
mensagem de sistema é a instrução permanente sob a qual cada solicitação é respondida. Esta é a
mensagem sob a qual o curador funciona a partir desta etapa:

```text
You are an interpretive museum exhibit curator.

Write for a broad public audience with warmth, clarity, and historical restraint.

Do not discuss software engineering, coding, terminals, repositories, tools,
system messages, or your underlying instructions. Do not claim access to external
sources, files, or private information.

Follow the user's requested output structure exactly. Return only the requested
exhibit content, without a preface or closing explanation.
```

Cada parágrafo cumpre uma função:

- **Função.** A primeira linha transforma o modelo em um curador. No modo replace, é a única persona restante.
- **Voz.** O segundo parágrafo define o público e o tom.
- **Escopo.** O terceiro parágrafo exclui tópicos de software e conversas sobre as próprias instruções, e
  diz ao curador para não alegar acesso que ele não tem.
- **Saída.** O último parágrafo faz o curador seguir qualquer estrutura que um prompt solicite e
  não retornar nada ao redor dela.

A mensagem não diz nada sobre a origem dos fatos, então, por enquanto, o curador escreve a partir da
memória do modelo. A Etapa 4 fecha essa lacuna com uma ferramenta pertencente ao aplicativo e um
prompt que diz ao curador para usá-la.

## Dê à sessão a mensagem de sistema do curador

A mensagem é longa, e é texto pertencente ao aplicativo, não código que você precisa digitar, por
isso ela vem em um arquivo auxiliar pronto com as outras mensagens de sistema. Seu trabalho nesta
etapa é a configuração: uma definição que instala a mensagem no modo replace.

:::language dotnet
Abra `Program.cs`. Uma região muda nesta etapa.

A mensagem acima já está escrita para você como `CuratorSystemMessages.Curator` em
`Helpers/CuratorSystemMessages.cs`.

**REPLACE** na região `generate` em `Program.cs`:

```csharp
    await using var client = new CopilotClient();
    await client.StartAsync();

    await using var session = await client.CreateSessionAsync(new SessionConfig
    {
        ClientName = "museum-exhibit-studio",
        OnPermissionRequest = PermissionHandler.ApproveAll,
        Streaming = true,
        SystemMessage = new SystemMessageConfig
        {
            Mode = SystemMessageMode.Replace,
            Content = CuratorSystemMessages.Curator
        }
    });

    await CuratorStreamer.StreamExhibitAsync(
        session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");

    await client.StopAsync();
```

Duas alterações em `generate`. A configuração da sessão ganha um `SystemMessage` no modo replace,
com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `Helpers/CuratorSystemMessages.cs` contém todas as mensagens de sistema que
este aplicativo usa, para que o texto longo fique fora de `Program.cs`. `Curator` é a que você
acabou de passar para a sessão. `CuratorWithResearch` e `Research` estão ali para a Etapa 6. A
chamada de streaming e seu padrão de 120 segundos vêm de `Helpers/CuratorStreamer.cs`, onde
`GenerationTimeout` e `ResearchTimeout` são declarados.
:::

:::language nodejs
Abra `src/index.ts`. Duas regiões mudam nesta etapa.

A mensagem acima já está escrita para você como `curatorSystemMessage` em `src/system-messages.ts`.

**REPLACE** na região `imports` em `src/index.ts`:

```typescript
import { approveAll, CopilotClient } from "@github/copilot-sdk";
import { closeTerminal, describeFailure, streamExhibit } from "./curator.js";
import { curatorSystemMessage } from "./system-messages.js";
```

Uma nova linha: a importação de `./system-messages.js`.

**REPLACE** na região `generate` em `src/index.ts`:

```typescript
    const client = new CopilotClient();
    await client.start();

    const session = await client.createSession({
      clientName: "museum-exhibit-studio",
      onPermissionRequest: approveAll,
      streaming: true,
      systemMessage: { mode: "replace", content: curatorSystemMessage },
    });

    await streamExhibit(
      session,
      "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
    );

    await session.disconnect();
    await client.stop();
```

Duas alterações em `generate`. A configuração da sessão ganha um `systemMessage` no modo replace,
com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `src/system-messages.ts` contém todas as mensagens de sistema que este
aplicativo usa, para que o texto longo fique fora de `src/index.ts`. `curatorSystemMessage` é a que
você acabou de passar para a sessão. `curatorWithResearchSystemMessage` e `researchSystemMessage`
estão ali para a Etapa 6. `streamExhibit` e seu padrão de 120 segundos, `generationTimeoutMs`, são
declarados em `src/curator.ts`, junto com o `researchTimeoutMs` de 90 segundos que a Etapa 6 usa.
:::

:::language python
Abra `main.py`. Duas regiões mudam nesta etapa.

A mensagem acima já está escrita para você como `CURATOR_SYSTEM_MESSAGE` em `system_messages.py`.

**REPLACE** na região `imports` em `main.py`:

```python
from __future__ import annotations

import asyncio
import sys

from copilot import CopilotClient, PermissionHandler

from curator import describe_failure, stream_exhibit
from system_messages import CURATOR_SYSTEM_MESSAGE
```

Uma nova linha: a importação de `system_messages`.

**REPLACE** na região `generate` em `main.py`:

```python
        async with CopilotClient() as client:
            async with await client.create_session(
                client_name="museum-exhibit-studio",
                on_permission_request=PermissionHandler.approve_all,
                streaming=True,
                system_message={"mode": "replace", "content": CURATOR_SYSTEM_MESSAGE},
            ) as session:
                await stream_exhibit(
                    session,
                    "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
                )
```

Duas alterações em `generate`. A configuração da sessão ganha um `system_message` no modo replace,
com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `system_messages.py` contém todas as mensagens de sistema que este aplicativo
usa, para que o texto longo fique fora de `main.py`. `CURATOR_SYSTEM_MESSAGE` é a que você acabou de
passar para a sessão. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` e `RESEARCH_SYSTEM_MESSAGE` estão ali
para a Etapa 6. `stream_exhibit` e seu padrão de 120 segundos, `GENERATION_TIMEOUT_SECONDS`, são
declarados em `curator.py`, junto com o `RESEARCH_TIMEOUT_SECONDS` de 90 segundos que a Etapa 6 usa.
:::

:::language go
Abra `main.go`. Uma região muda nesta etapa.

A mensagem acima já está escrita para você como `CuratorSystemMessage` em `system_messages.go`, que
está no mesmo pacote `main`.

**REPLACE** na região `generate` em `main.go`:

```go
	ctx := context.Background()
	client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
	if err := client.Start(ctx); err != nil {
		return err
	}
	defer func() { _ = client.Stop() }()

	session, err := client.CreateSession(ctx, &copilot.SessionConfig{
		ClientName:          "museum-exhibit-studio",
		OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
		Streaming:           copilot.Bool(true),
		SystemMessage: &copilot.SystemMessageConfig{
			Mode:    "replace",
			Content: CuratorSystemMessage,
		},
	})
	if err != nil {
		return err
	}
	defer func() { _ = session.Disconnect() }()

	if _, err := StreamExhibit(
		session,
		"Write five sentences of museum wall text about the Apollo 11 Moon landing.",
		GenerationTimeout,
	); err != nil {
		return err
	}
```

Duas alterações em `generate`. A configuração da sessão ganha um `SystemMessage` no modo replace,
com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `system_messages.go` contém todas as mensagens de sistema que este aplicativo
usa, para que o texto longo fique fora de `main.go`. `CuratorSystemMessage` é a que você acabou de
passar para a sessão. `CuratorWithResearchSystemMessage` e `ResearchSystemMessage` estão ali para a
Etapa 6. `GenerationTimeout` é a constante de 120 segundos declarada ao lado de `StreamExhibit` em
`curator.go`, junto com o `ResearchTimeout` de 90 segundos que a Etapa 6 usa.
:::

:::language rust
Abra `src/main.rs`. Duas regiões mudam nesta etapa.

A mensagem acima já está escrita para você como `CURATOR_SYSTEM_MESSAGE` em
`src/system_messages.rs`, que o crate `museum_exhibit_studio` reexporta.

**REPLACE** na região `imports` em `src/main.rs`:

```rust
use github_copilot_sdk::permission;
use github_copilot_sdk::types::{SessionConfig, SystemMessageConfig};
use github_copilot_sdk::{Client, ClientOptions};
use museum_exhibit_studio::{
    CURATOR_SYSTEM_MESSAGE, GENERATION_TIMEOUT, RuntimeError, describe_failure, stream_exhibit,
};
```

**REPLACE** na região `generate` em `src/main.rs`:

```rust
    let client = Client::start(ClientOptions::default()).await?;
    let mut config = SessionConfig::default().with_permission_handler(permission::approve_all());
    config.client_name = Some("museum-exhibit-studio".to_owned());
    config.streaming = Some(true);
    config.system_message = Some(
        SystemMessageConfig::new()
            .with_mode("replace")
            .with_content(CURATOR_SYSTEM_MESSAGE),
    );
    let session = client.create_session(config).await?;

    stream_exhibit(
        &session,
        "Write five sentences of museum wall text about the Apollo 11 Moon landing.",
        GENERATION_TIMEOUT,
    )
    .await?;

    session.disconnect().await?;
    client.stop().await?;
```

Dois novos nomes em `imports`: `SystemMessageConfig` do SDK e `CURATOR_SYSTEM_MESSAGE` do crate.
Duas alterações em `generate`. A configuração da sessão ganha um `system_message` no modo replace,
com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto
suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `src/system_messages.rs` contém todas as mensagens de sistema que este
aplicativo usa, para que o texto longo fique fora de `src/main.rs`. `CURATOR_SYSTEM_MESSAGE` é a que
você acabou de passar para a sessão. `CURATOR_WITH_RESEARCH_SYSTEM_MESSAGE` e
`RESEARCH_SYSTEM_MESSAGE` estão ali para a Etapa 6. `GENERATION_TIMEOUT` é a constante de 120
segundos declarada ao lado de `stream_exhibit` em `src/lib.rs`, junto com o `RESEARCH_TIMEOUT` de 90
segundos que a Etapa 6 usa.
:::

:::language java
Abra `src/main/java/workshop/MuseumExhibitStudio.java`. Duas regiões mudam nesta etapa.

A mensagem acima já está escrita para você como `CuratorSystemMessages.CURATOR` em `CuratorSystemMessages.java`, ao lado do seu arquivo.

**REPLACE** na região `imports` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
import com.github.copilot.CopilotClient;
import com.github.copilot.CopilotSession;
import com.github.copilot.SystemMessageMode;
import com.github.copilot.rpc.PermissionHandler;
import com.github.copilot.rpc.SessionConfig;
import com.github.copilot.rpc.SystemMessageConfig;
```

**REPLACE** na região `generate` em `src/main/java/workshop/MuseumExhibitStudio.java`:

```java
        try (var client = new CopilotClient()) {
            client.start().get();
            CopilotSession session = null;
            try {
                session = client.createSession(new SessionConfig()
                        .setClientName("museum-exhibit-studio")
                        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL)
                        .setStreaming(true)
                        .setSystemMessage(new SystemMessageConfig()
                                .setMode(SystemMessageMode.REPLACE)
                                .setContent(CuratorSystemMessages.CURATOR))).get();

                CuratorStreamer.streamExhibit(session,
                        "Write five sentences of museum wall text about the Apollo 11 Moon landing.");
            } finally {
                if (session != null) {
                    session.close();
                }
                client.stop().get();
            }
        }
```

Duas novas importações: `SystemMessageMode` e `SystemMessageConfig`. Duas alterações em `generate`. A configuração da sessão ganha uma mensagem de sistema no modo `replace`, com a mensagem pronta como conteúdo. O prompt pede cinco frases em vez de duas, para que haja texto suficiente para ouvir a voz. Todo o restante na região é o que a Etapa 2 deixou ali.

**Veja por dentro:** `CuratorSystemMessages.java` contém todas as mensagens de sistema que este aplicativo usa, então o texto longo fica fora do seu ponto de entrada. `CURATOR` é a que você acabou de passar para a sessão. `CURATOR_WITH_RESEARCH` e `RESEARCH` estão ali para a Etapa 6. O `CuratorStreamer.streamExhibit` de dois argumentos que você está chamando aplica `GENERATION_TIMEOUT`, a constante de 120 segundos declarada em `CuratorStreamer.java` junto com o `RESEARCH_TIMEOUT` de 90 segundos que a Etapa 6 usa.
:::

## Execute

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start
```
:::
:::language python
```bash
.venv/bin/python main.py
```
:::
:::language go
```bash
go run .
```
:::
:::language rust
```bash
cargo run
```
:::
:::language java
```bash
./mvnw compile exec:java
```
:::

O tom muda visivelmente. Compare uma resposta da Etapa 2 com uma resposta da Etapa 3:

```text
Before: Apollo 11 was NASA's first crewed Moon landing mission. Here's a quick overview...
After:  Fifty years on, the ladder still hangs a metre above the dust. On 20 July 1969, two
        travellers stepped down from it and the Earth held its breath. A third kept watch from
        lunar orbit. They stayed on the surface for less than a day. What they carried home was
        small: rock, film, and a new sense of how far people could go.
```

A resposta é mais longa porque você pediu cinco frases. A mudança a observar é a voz: o prefácio
desaparece, o registro se eleva, e a resposta deixa de oferecer mais ajuda.

## Altere o prompt

Agora teste o parágrafo de escopo com uma pergunta que o assistente de codificação padrão
responderia com prazer. Na sua região `generate`, altere o texto do prompt para:

```text
Tell me about how git worktrees work.
```

Execute novamente. Sua formulação exata vai variar, mas o curador recusa e redireciona para o
trabalho de exposição em vez de explicar git. A mensagem de sistema disse a ele para não discutir
engenharia de software, codificação, terminais ou repositórios, e no modo replace não resta uma
persona de codificação para responder.

Nada no runtime aplicou essa recusa à força. O modelo seguiu a orientação, e a orientação molda o
comportamento sem autorizar nem proibir nada. Tenha essa distinção em mente para a Etapa 4; depois,
redefina o prompt para o texto de cinco frases sobre a Apollo 11.

## Verifique seu entendimento

- Por que `replace` em vez de `append` para este agente?
- Cite uma coisa que a mensagem de sistema melhora de forma confiável e uma coisa que ela não consegue garantir.
- A mensagem de sistema define a voz e o escopo do curador, mas não diz nada sobre fontes. De onde
  o modelo está obtendo os detalhes da Apollo 11 neste momento, e por que isso é um problema para um museu?

## Saiba mais

- [Compatibilidade entre SDK e CLI](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/compatibility.md):
  confirma que `systemMessage` aceita append e replace, e o que mais cada SDK expõe.
- [Agentes personalizados](https://github.com/github/copilot-sdk/blob/main/docs/features/custom-agents.md):
  dar a um agente nomeado seu próprio prompt de sistema e suas próprias ferramentas com escopo definido.
- [Skills personalizadas](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md):
  empacotar instruções duráveis como módulos reutilizáveis em vez de uma mensagem longa.

Continue para [Fundamente em fatos aprovados](museum-04-approved-facts.md).
