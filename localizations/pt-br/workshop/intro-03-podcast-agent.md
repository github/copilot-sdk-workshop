# Etapa 3: Crie o agente de podcast

> **Tempo:** 12 minutos

## Continue a mesma demo

Mantenha o aplicativo de Hello World que você acabou de concluir. Siga **Ato dois: transforme-o em
um agente de podcast** no mesmo **`LIVE_DEMO.md`**. Esta lição exibe esse ato diretamente.

Faça as três alterações do guia: escolha um modelo e um episódio real, dê à sessão suas capacidades
e identidade e depois substitua o prompt. Reutilize os auxiliares prontos em vez de escrever um
analisador de feed ou iniciar um projeto diferente.

:::language dotnet
Continue em `start-intro/dotnet/Program.cs`. [Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
Continue em `start-intro/nodejs/src/index.ts`. [Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
Continue em `start-intro/python/main.py`. [Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
Continue em `start-intro/go/main.go`. [Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
Continue em `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
[Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
Continue em `start-intro/rust/src/main.rs`. [Ato dois no seu guia de demo](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## Ato dois: transforme-o em um agente de podcast

<!-- LIVE_DEMO -->

## Execute

Use a mesma pasta e o mesmo comando de execução do Hello World. Selecione um modelo e um dos
episódios reais. Leia o nome da ferramenta solicitada antes de aprová-la com `y`. Pressionar Enter
rejeita a solicitação; a rejeição não é uma consulta bem-sucedida.

Espere a seleção de modelo, a seleção de episódio, um evento de início de ferramenta, um prompt de
aprovação, um evento de conclusão de ferramenta e, em seguida, o texto de lançamento transmitido em
streaming.

O aplicativo busca a lista de episódios antes de uma chamada de ferramenta solicitada pelo modelo. O
manipulador de permissões governa as ferramentas solicitadas pelo modelo, não todas as solicitações
de rede feitas pelo seu aplicativo. Mantenha o tratamento de eventos e a limpeza existentes.

## Verifique seu entendimento

Encontre os dois registros de ferramentas, a lista de permissões deles, o manipulador de permissões
e a mensagem de sistema. Explique o que mudou em relação ao Hello World.

Compare o resultado com os metadados RSS do episódio selecionado. Pedir uma publicação com menos de
280 caracteres **não impõe o limite no código**. Uma mensagem de sistema não comprova exatidão
factual nem segurança quanto a patrocinadores. Revise afirmações e o tamanho **antes de publicar**;
não publique nada durante este workshop.

## Solução de problemas desta execução

- **Nenhuma lista de episódios:** verifique o acesso ao feed RSS oficial; não substitua
  uma consulta com falha por fatos inventados.
- **Nenhum prompt de aprovação:** verifique ambos os nomes de ferramentas, a lista de permissões delas e o
  manipulador de permissões substituto.
- **Aguardando entrada:** use um terminal interativo e responda ao prompt dele.
- **Consulta negada:** execute novamente e aprove a ferramenta somente leitura esperada, se apropriado.
  Não remova o manipulador para contornar uma rejeição.

Continue para [Recapitulação e próximos passos](intro-04-wrap-up.md).

## Saiba mais

- [Copilot SDK e APIs de ferramentas](https://github.com/github/copilot-sdk)
- [Projetos iniciais e guias de demo incluídos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
