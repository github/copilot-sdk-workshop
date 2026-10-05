# Etapa 2: Hello World em streaming

> **Tempo:** 10 minutos

## Comece com o projeto inicial

Edite o ponto de entrada na pasta `start-intro` que você abriu durante a preparação. Abra o
**`LIVE_DEMO.md`** ao lado do código. Esta lição exibe **Ato um: Hello World** desse mesmo arquivo,
não uma implementação separada.

Siga as quatro edições numeradas do guia em ordem: **inicie o cliente, verifique a autenticação,
crie a sessão e envie Hello World**. Mantenha o tratamento de eventos fornecido pelo projeto
inicial; Java e Rust incluem a assinatura ausente no local marcado. Conclua todas as quatro edições
antes de executar.

:::language dotnet
Trabalhe em `start-intro/dotnet`, editando `Program.cs`.
[Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
Trabalhe em `start-intro/nodejs`, editando `src/index.ts`.
[Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
Trabalhe em `start-intro/python`, editando `main.py`.
[Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
Trabalhe em `start-intro/go`, editando `main.go`. [Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
Trabalhe em `start-intro/java`, editando `src/main/java/demo/CopilotSdkLiveDemo.java`.
[Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
Trabalhe em `start-intro/rust`, editando `src/main.rs`.
[Abra o guia de demo local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## Ato um: Hello World

<!-- LIVE_DEMO -->

## Execute

Use o comando de checkpoint no seu guia de demo, a partir da pasta da linguagem selecionada. Espere
uma resposta real de uma frase, transmitida em streaming, e então o encerramento do programa.
Somente o banner do projeto inicial ou uma mensagem de autenticação não é um Hello World
bem-sucedido.

A sessão usa uma **lista de permissões de ferramentas vazia** com um manipulador de permissões. A
aprovação de tudo não é, por si só, um limite de segurança; a lista de permissões vazia remove as
capacidades de ferramenta neste primeiro exercício. O próximo ato substitui as duas configurações.

## Verifique seu entendimento

Aponte as quatro edições que você fez. Explique por que o cliente e a sessão são diferentes e qual
evento informa que o turno está concluído.

## Solução de problemas desta execução

- **Nenhuma resposta real:** salve o ponto de entrada e conclua todas as quatro etapas do guia.
- **Erro de autenticação:** execute `copilot auth login` no mesmo ambiente.
- **Modelo indisponível:** altere o modelo preferido do projeto inicial para uma ID disponível
  para sua conta. O próximo ato apresenta o seletor de modelo.
- **Turno travado:** mantenha o manipulador de permissões e a lista de permissões vazia; verifique a conectividade da CLI
  e a espera de conclusão.

Continue para [Crie o agente de podcast](intro-03-podcast-agent.md).

## Saiba mais

- [APIs de linguagem do Copilot SDK](https://github.com/github/copilot-sdk)
- [Projetos iniciais e guias de demo incluídos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
