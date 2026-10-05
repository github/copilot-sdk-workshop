# Etapa 7: Execute e explique o aplicativo

> **Tempo:** 10 minutos

## O que você estará pronto para explicar

Você executará o aplicativo completo e explicará seu estado, limites das ferramentas, limite de
permissões e limitações do relatório.

## Veja todo o sistema de agente

:::language dotnet
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

O relatório concluído também está em [`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report).
:::

:::language python
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

O relatório concluído também está em [`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report).
:::

:::language go
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
O aplicativo finalizado é um host de agente. Sua sessão coordena um modelo, uma função pertencente
ao aplicativo e um navegador em execução em outro processo:

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## Leve o design além deste workshop

Entender esses limites permite reutilizar o design em outro aplicativo, em vez de apenas reproduzir
o código do workshop. Uma consulta de banco de dados, um serviço de implantação ou um rastreador de
problemas pode usar ferramentas diferentes, mas as mesmas perguntas de propriedade e confiança se
aplicam.

:::language dotnet
O fluxo completo é
`URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report`.
:::

:::language nodejs
O fluxo completo é
`URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report`.
:::

:::language python
O fluxo completo é
`URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report`.
:::

:::language go
O fluxo completo é
`URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report`.
:::

:::language rust
O fluxo completo é
`URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report`.
:::

:::language java
O fluxo completo é
`URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report`.
:::

## Comemore a vitória

Não há código a alterar. Mantenha a implementação da Etapa 6 para que esta execução teste o
aplicativo que você criou.

## Execute

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Aviso de demonstração local em Java:** Esse sinalizador explícito é uma solução temporária para
> [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273). Sem ele,
> o callback falha em modo fechado, a menos que consiga verificar a URL exata no payload de permissão. Com ele,
> a sessão aprova apenas o tipo de permissão `mcp`, uma solicitação por vez, dentro da lista de permissões
> Playwright `browser_navigate` configurada; ele não consegue impor o destino exato. Use-o apenas para o
> destino local controlado do workshop, nunca para produção, URLs compartilhadas ou não confiáveis.
:::
Use o destino do workshop:

```text
{{TARGET_APP_URL}}
```

Observe todas as cinco fases:

1. O cliente se conecta e cria uma sessão.
2. O Playwright navega até o destino exato e cria um snapshot de acessibilidade.
3. O leitor local restrito retorna esse snapshot da execução atual.
4. O catálogo local é chamado para achados compatíveis com o navegador.
5. A resposta segue o contrato do relatório e declara seus limites.

:::language dotnet
Sua transcrição vai variar, mas deve ter este formato:

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
Sua transcrição vai variar, mas deve ter este formato:

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse` imprime linhas de início/conclusão da ferramenta e transmite o texto do assistente em streaming para stdout.
:::

:::language python
Sua transcrição vai variar, mas deve ter este formato:

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py` inicia `report.main`, que aguarda `session.idle` depois de transmitir deltas em streaming.
:::

:::language go
Sua transcrição vai variar, mas deve ter este formato:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explique que `Client` é responsável pelo ciclo de vida do Copilot CLI, `Session` é responsável por
uma conversa, e o manipulador de permissões restringe a navegação externa. O relatório esperado é
fundamentado em evidências.
:::

:::language rust
Sua transcrição vai variar, mas deve ter este formato:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explique que `Client` gerencia o runtime, `Session` despacha eventos, as ferramentas tipadas
pertencem ao aplicativo, e o manipulador de permissões confia apenas na navegação exata.
:::

:::language java
Sua transcrição vai variar, mas deve ter este formato:

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Explique que o Maven compila o aplicativo Java 17, `CopilotClient` gerencia o runtime, e as
ferramentas permanecem no escopo. Por padrão, o callback de permissão aceita apenas a URL canônica;
com o sinalizador de demonstração local explícito, ele fica limitado ao tipo `mcp` configurado, mas
não consegue verificar essa URL.
:::

O destino controlado inclui intencionalmente problemas observáveis pelo navegador: uma alternativa
textual ausente, nenhum ponto de referência `main`, uma sequência de títulos ilógica e uma caixa de
texto sem nome acessível. Compare o relatório com o
[HTML de destino publicado](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html);
não aceite um achado ausente tanto do snapshot quanto do código-fonte.

<details>
<summary>Solucionar problemas da execução completa</summary>

| Sintoma | Correção |
|---|---|
| Um problema conhecido é omitido | A saída do agente pode variar. Execute novamente uma vez, mas exija evidências em vez de forçar uma resposta predeterminada. |
| Um problema relatado não está na página | Rejeite-o como não fundamentado; o prompt exige evidências específicas do navegador. |
| Uma ferramenta é negada | Verifique se `browser_navigate` usa o destino exato inserido. |
| O leitor não encontra nenhum snapshot | Mantenha a ordem do prompt: navegue antes de chamar `read_latest_accessibility_snapshot`. |
| O runtime não consegue iniciar | Autentique-se novamente com `copilot login`, confirme se a CLI está no `PATH` e tente novamente o comando de execução para sua linguagem. |

</details>

> **Esta etapa estará concluída quando:** o relatório estiver fundamentado, os nomes das ferramentas estiverem visíveis,
> e você conseguir responder às perguntas de arquitetura abaixo sem ler o código.

## Verifique seu entendimento

1. Qual estado pertence à sessão?
2. Por que o catálogo WCAG é local?
3. Por que o Playwright é externo?
4. Onde as permissões são impostas?
5. O que muda quando outro servidor MCP é adicionado?

<details>
<summary>Compare sua explicação</summary>

1. A sessão é responsável pelas mensagens de uma conversa, pela resposta do modelo e pelos resultados das ferramentas.
2. O aplicativo controla os dados do catálogo e a pesquisa determinística, então a função permanece local.
3. O Playwright é uma capacidade de navegador reutilizável com seu próprio processo e dependências Node.js.
4. A lista de permissões de ferramentas MCP expõe apenas a navegação, e o manipulador de permissões aprova apenas
   o destino exato. O leitor local confiável não aceita nenhum caminho e lê apenas um snapshot recém-gerado;
   o catálogo também é somente leitura. Essas ferramentas pertencentes ao aplicativo dispensam permissão.
5. Adicione a configuração do servidor, exponha apenas as ferramentas necessárias, defina a política de confiança dele e continue
   observando suas chamadas pelo mesmo stream de eventos da sessão.

</details>

## Próxima etapa

Continue para [Etapa 8: Selecione um modelo](08-model-selection.md) e, em seguida, transforme seus
achados em um relatório HTML interativo na Etapa 9.

## Saiba mais

O aplicativo do workshop é executado na sua máquina. Estas páginas abordam o que muda quando o mesmo
design é movido para outro lugar.

- [Serviços de backend](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md):
  execução do SDK no lado do servidor em uma CLI headless em vez de uma local.
- [Escalabilidade e multilocação](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md):
  escalabilidade horizontal e os padrões de isolamento que mantêm a sessão de um usuário fora da de outro.
- [Instrumentação OpenTelemetry](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md):
  rastreamento de chamadas de ferramenta e turnos quando o agente é executado onde você não consegue observar o terminal.
- [Integração com Microsoft Agent Framework](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md):
  colocação de uma sessão do Copilot dentro de um workflow multiagente maior.
