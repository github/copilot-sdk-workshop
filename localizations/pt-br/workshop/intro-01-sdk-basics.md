# Etapa 1: Noções básicas do SDK

> **Tempo:** 5 minutos

## O SDK em uma frase

O GitHub Copilot SDK permite que seu aplicativo inicie uma conversa do Copilot, transmita as
respostas em streaming e exponha funções específicas do aplicativo como ferramentas.

O SDK não é um modelo que você hospeda por conta própria. Seu aplicativo se conecta ao **runtime do
Copilot**, que coordena solicitações ao modelo e chamadas de ferramenta.

| Termo | O que ele faz neste workshop |
| --- | --- |
| Cliente | Inicia e se conecta ao runtime; verifica a autenticação. |
| Sessão | Mantém uma conversa, a configuração dela, mensagens e resultados de ferramentas. |
| Prompt | Atribui uma tarefa a este turno, como escrever uma frase. |
| Evento | Relata um fragmento de texto, atividade de ferramenta, erro ou turno concluído. |
| Ferramenta | Uma função nomeada do aplicativo que o modelo pode solicitar, como uma consulta RSS. |

O loop básico é:

```text
Your app -> client -> session -> prompt
                              <- response events
Your app <- permission request <- tool request
Your app -> tool result        -> next model response
```

Um cliente pode atender a várias sessões. Para esta introdução, crie um cliente e uma sessão por
execução do programa e depois feche ambos. Você não precisa de um servidor Web, de um framework de
agente nem de um banco de dados.

## Abra o aplicativo

Abra **`LIVE_DEMO.md`** ao lado do ponto de entrada abaixo. O **Ato um** é a sequência prática deste
workshop:

1. Inicie o cliente.
2. Verifique a autenticação.
3. Crie a sessão.
4. Envie Hello World.

O comentário `Step 4` do projeto inicial marca o tratamento de eventos, que é fornecido ou mostrado
no guia; o envio é marcado como `Step 5` no código. Esses são locais na estrutura inicial, não
exercícios adicionais além das quatro edições do guia.

:::language dotnet
Na sua pasta `start-intro/dotnet`, abra `Program.cs`. Encontre os espaços reservados do cliente, da
autenticação e da sessão. O manipulador de eventos já imprime texto transmitido em streaming e
acompanha a conclusão do turno.
:::
:::language nodejs
Na sua pasta `start-intro/nodejs`, abra `src/index.ts`. Encontre os espaços reservados do cliente,
da autenticação e da sessão. O manipulador de eventos já mostra quais eventos o aplicativo pode
observar.
:::
:::language python
Na sua pasta `start-intro/python`, abra `main.py`. Encontre os espaços reservados do cliente, da
autenticação e da sessão. O manipulador de eventos já imprime texto transmitido em streaming e
sinaliza quando o turno termina.
:::
:::language go
Na sua pasta `start-intro/go`, abra `main.go`. Encontre os espaços reservados do cliente, da
autenticação e da sessão. O manipulador de eventos já imprime texto transmitido em streaming e a
atividade de ferramentas.
:::
:::language java
Na sua pasta `start-intro/java`, abra `src/main/java/demo/CopilotSdkLiveDemo.java`. Encontre os
espaços reservados do cliente, da autenticação e da sessão. A próxima lição mostra onde adicionar as
assinaturas ausentes enquanto você segue o guia de demo.
:::
:::language rust
Na sua pasta `start-intro/rust`, abra `src/main.rs`. Encontre os espaços reservados do cliente, da
autenticação e da sessão. A próxima lição mostra onde adicionar a assinatura ausente enquanto você
segue o guia de demo.
:::

## O que você controla

O **aplicativo** escolhe o modelo, a identidade da sessão, as ferramentas expostas e a política de
permissões. O **modelo** propõe texto e chamadas de ferramenta dentro dessa configuração. O
manipulador de permissões responde se uma capacidade solicitada pode ser executada.

O streaming muda como você exibe uma resposta, não a confiabilidade dela. Uma mensagem de sistema
orienta o comportamento; ela não é um mecanismo de controle de acesso nem uma prova de exatidão
factual. Uma ferramenta permite que o aplicativo forneça dados de origem reais, mas você ainda
revisa o texto resultante.

Na primeira execução, a tarefa é apenas um Hello World de uma frase. Na segunda execução, o
aplicativo concede duas ferramentas RSS prontas e somente leitura e pede que você aprove o uso
delas. Não escreveremos um analisador de feed nem configuraremos MCP nesta trilha.

## Verifique seu entendimento

Aponte onde o cliente será iniciado e onde a sessão será criada. Explique a diferença em uma frase:
o cliente se conecta ao runtime; a sessão é a conversa.

Continue para [Hello World em streaming](intro-02-hello-world.md).

## Saiba mais

- [Visão geral do Copilot SDK e APIs de linguagem](https://github.com/github/copilot-sdk)
- [O loop de agente do runtime](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
