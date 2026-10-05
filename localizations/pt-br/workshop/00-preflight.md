# Preparação: configure sua máquina

> **Preparação sem tempo cronometrado**  
> Conclua esta página antes de iniciar o workshop de 115 minutos.

## O que você terá pronto

Ao fim da preparação, você terá o repositório clonado, o Copilot CLI autenticado, o projeto inicial
compilado e o Playwright MCP baixado e pronto.

Siga todas as nove etapas práticas, incluindo a seleção de modelo e o relatório HTML interativo, e
então termine com uma comemoração e recursos para continuar criando.

:::language dotnet
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | Compila e executa o aplicativo de console C# | `dotnet --version` |
| [Node.js 22 ou mais recente](https://nodejs.org/) | Executa o servidor Playwright MCP | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Fornece o runtime do Copilot usado pelo SDK | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ dotnet --version
10.0.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```
:::

:::language nodejs
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [Node.js 22.12 ou mais recente](https://nodejs.org/) | Executa o aplicativo TypeScript do workshop e o Playwright MCP | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | Instala `@github/copilot-sdk` e ferramentas de build | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Fornece o runtime do Copilot usado pelo SDK | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consulte o
[guia oficial de instalação do SDK Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs).
:::

:::language python
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [Python 3.11 ou mais recente](https://www.python.org/downloads/) | Executa o aplicativo assíncrono do workshop | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | Instala o wheel fixado `github-copilot-sdk` | `python -m pip --version` |
| [Node.js 22 ou mais recente](https://nodejs.org/) | Executa o servidor Playwright MCP | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Substituição opcional do runtime local via `COPILOT_CLI_PATH` | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

O SDK Python pode baixar um runtime fixado no primeiro uso. Consulte o
[guia oficial de instalação do SDK Python](https://github.com/github/copilot-sdk/tree/main/python).
:::

:::language go
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [Go 1.24 ou mais recente](https://go.dev/dl/) | Compila e executa o módulo Go do workshop | `go version` |
| [Node.js 22 ou mais recente](https://nodejs.org/) | Executa o servidor Playwright MCP | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Obrigatório no `PATH` (ou `COPILOT_CLI_PATH`) para o SDK | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consulte o
[guia oficial de instalação do SDK Go](https://github.com/github/copilot-sdk/tree/main/go).
:::

:::language rust
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [Rust 1.94 ou mais recente](https://rustup.rs/) | Compila o crate Rust assíncrono do workshop | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | Resolve dependências bloqueadas e executa o aplicativo | `cargo --version` |
| [Node.js 22 ou mais recente](https://nodejs.org/) | Executa o servidor Playwright MCP | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Runtime usado quando não se depende exclusivamente de um binário incluído | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ rustc --version
rustc 1.94.x
$ cargo --version
cargo 1.94.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consulte o
[guia oficial de instalação do SDK Rust](https://github.com/github/copilot-sdk/tree/main/rust).
:::

:::language java
## O que você precisa

| Requisito | Por que o workshop precisa dele | Verificar |
|---|---|---|
| [Java 17 ou mais recente](https://adoptium.net/) (JDK) | Compila e executa o aplicativo Maven do workshop | `java -version` |
| [Node.js 22 ou mais recente](https://nodejs.org/) | Executa o servidor Playwright MCP | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Obrigatório no `PATH` para o runtime do SDK Java | `copilot --version` |
| [Acesso ao GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitações do Copilot | `copilot login` |
| Microsoft Edge (padrão) ou Google Chrome | Permite que o Playwright inspecione a página de destino | Abra o navegador uma vez antes do workshop |

Seus comandos devem retornar saída neste formato:

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Nenhuma instalação separada do Maven é necessária: cada projeto Java inclui o Maven Wrapper
(`./mvnw`), que baixa a versão correta do Maven no primeiro uso. No Windows, execute `mvnw.cmd` em
vez de `./mvnw`. Use Maven para esta trilha. Não substitua por JBang nem Gradle. Consulte o
[guia oficial de instalação do SDK Java](https://github.com/github/copilot-sdk/tree/main/java).
:::

## 1. Clone o repositório e escolha seu projeto inicial

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Você trabalha **diretamente dentro do repositório**. Não há etapa de cópia: você entra no diretório
do projeto inicial da sua linguagem e permanece ali durante todo o workshop. Isso significa que você
está editando arquivos rastreados do repositório, então suas alterações aparecem em `git status`.
Isso é esperado. Se quiser um projeto inicial limpo novamente, execute `git checkout -- .` a partir
da raiz do repositório para descartar suas edições.

## 2. Autentique o Copilot

Instale a CLI com o método do [guia oficial de configuração](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
e execute:

```bash
copilot login
```

Conclua o fluxo do navegador para que chamadas posteriores do SDK possam alcançar o GitHub Copilot.

## 3. Prepare o Playwright MCP

Execute isto uma vez para baixar o pacote fixado e imprimir suas opções sem iniciar um servidor:

```bash
npx -y @playwright/mcp@0.0.78 --help
```

A versão do pacote é fixada para que todos vejam os mesmos nomes de ferramentas e o mesmo
comportamento. O código usa Microsoft Edge com `--browser=msedge`. Se você preparou o Google Chrome
em vez disso, use `--browser=chrome` quando o argumento aparecer na Etapa 4.

:::language dotnet
## 4. Entre no projeto inicial e compile-o

Se `dotnet build` não conseguir encontrar a Copilot CLI mais tarde, defina o caminho dela para o terminal atual:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Entre no projeto inicial .NET e compile-o. Permaneça neste diretório em todas as etapas posteriores:

```bash
cd start-accessibility/dotnet
dotnet build
```

Uma compilação bem-sucedida termina com:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Você trabalhará em `start-accessibility/dotnet` pelo restante do workshop, então mantenha este
terminal aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no
editor de sua preferência.

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `copilot` não é reconhecido | Reinicie o terminal após a instalação ou defina `COPILOT_CLI_BINARY_PATH` com o comando acima. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| A restauração do NuGet não consegue acessar a origem do pacote | Verifique as configurações de proxy ou de origem de pacotes e execute `dotnet restore`. |
| `npx` não é reconhecido | Instale o Node.js 22 ou mais recente e reinicie o terminal. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** `dotnet build` for bem-sucedido, `copilot login` estiver concluído e a página de destino
> abrir.
:::

:::language nodejs
## 4. Entre no projeto inicial e compile-o

Se o SDK não conseguir encontrar a Copilot CLI mais tarde, aponte-o para a instalação no terminal atual:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Entre no projeto inicial Node.js, instale as dependências e execute a verificação de tipos.
Permaneça neste diretório em todas as etapas posteriores:

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

Uma verificação de tipos bem-sucedida termina sem erros de TypeScript (saída vazia de
`tsc --noEmit`). O script de inicialização em `package.json` é `tsx src/index.ts`.

Você trabalhará em `start-accessibility/nodejs` pelo restante do workshop, então mantenha este
terminal aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no
editor de sua preferência.

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `node` ou `npm` não é reconhecido | Instale o Node.js 22.12 ou mais recente e reinicie o terminal. |
| Aviso de mecanismo sobre a versão do Node | Atualize para Node.js 22.12+; o projeto inicial declara `"node": ">=22.12.0"`. |
| `npm install` falha no lockfile | Permaneça em `start-accessibility/nodejs` e mantenha `package-lock.json`; não o exclua. |
| `copilot` não é reconhecido | Reinicie o terminal após a instalação ou defina `COPILOT_CLI_PATH` com o comando acima. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| `npx` não consegue baixar o Playwright MCP | Verifique o acesso à rede e execute novamente o comando de preparação da seção 3. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** `npm run build` for bem-sucedido, `copilot login` estiver concluído e a página de destino
> abrir.
:::

:::language python
## 4. Entre no projeto inicial e compile-o

Opcional: force o SDK a usar sua CLI instalada em vez de baixar um runtime:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Entre no projeto inicial Python, crie um ambiente virtual, instale os requisitos fixados e execute a
verificação de compilação. Permaneça neste diretório em todas as etapas posteriores:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="venv-windows">
    <pre><code class="language-powershell">cd start-accessibility/python
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
  <div role="tabpanel" data-panel="venv-unix" hidden>
    <pre><code class="language-bash">cd start-accessibility/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
</div>

Uma instalação bem-sucedida imprime os pacotes resolvidos, incluindo `github-copilot-sdk==...`. Uma
verificação de compilação bem-sucedida não imprime saída. Mantenha o ambiente virtual ativado para
as etapas posteriores.

Você trabalhará em `start-accessibility/python` pelo restante do workshop, então mantenha este
terminal aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no
editor de sua preferência.

Opcionalmente, baixe previamente o runtime agora para que a primeira execução da Etapa 1 seja mais rápida:

```bash
python -m copilot download-runtime
```

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `python` aponta para Python 2 ou está ausente | Use Python 3.11+ (`python3` no macOS/Linux) e recrie o venv. |
| `pip install` não consegue acessar o PyPI | Verifique as configurações de proxy e execute novamente `python -m pip install -r requirements.txt`. |
| Versões de pacote incorretas | Instale somente a partir do `requirements.txt` fixado; não afrouxe as fixações `==`. |
| O download do runtime falha mais tarde | Execute `python -m copilot download-runtime` ou defina `COPILOT_CLI_PATH` para uma CLI funcional. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| `npx` não é reconhecido | Instale o Node.js 22 ou mais recente e reinicie o terminal. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** os requisitos fixados forem instalados, `py_compile` for bem-sucedido, `copilot login` estiver
> concluído e a página de destino abrir.
:::

:::language go
## 4. Entre no projeto inicial e compile-o

O Go SDK espera encontrar a Copilot CLI no `PATH` ou via `COPILOT_CLI_PATH`:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Entre no projeto inicial Go e compile com o lock aplicado. Permaneça neste diretório em todas as
etapas posteriores:

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

Uma compilação bem-sucedida não imprime erros e produz um binário no diretório do projeto inicial.
Mantenha `go.sum` intacto para que a resolução de módulos permaneça determinística.

Você trabalhará em `start-accessibility/go` pelo restante do workshop, então mantenha este terminal
aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no editor de sua
preferência.

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `go: go.mod requires go >= 1.24` | Instale Go 1.24 ou mais recente e reabra o terminal. |
| `missing go.sum entry` | Restaure o `go.sum` confirmado no repositório; compile com `-mod=readonly` em vez de reescrever o lock. |
| Download de módulo bloqueado | Configure `GOPROXY`/acesso ao proxy e tente compilar novamente a partir do diretório do projeto inicial. |
| `copilot` não é reconhecido | Instale a CLI, reinicie o terminal ou defina `COPILOT_CLI_PATH`. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| `npx` não é reconhecido | Instale o Node.js 22 ou mais recente e reinicie o terminal. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** `go build -mod=readonly ./...` for bem-sucedido, `copilot login` estiver concluído e
> a página de destino abrir.

Compare com [`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)
se quiser um ponto de referência posterior após a Etapa 1.
:::

:::language rust
## 4. Entre no projeto inicial e compile-o

Se a inicialização do runtime não conseguir resolver a CLI mais tarde, defina `COPILOT_CLI_PATH`:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Entre no projeto inicial Rust e verifique-o em relação ao lockfile. Permaneça neste diretório em
todas as etapas posteriores:

```bash
cd start-accessibility/rust
cargo check --locked
```

Uma verificação bem-sucedida termina com uma linha `Finished` e sem erros. Mantenha `Cargo.lock`
confirmado para que o grafo de crates permaneça fixado.

Você trabalhará em `start-accessibility/rust` pelo restante do workshop, então mantenha este
terminal aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no
editor de sua preferência.

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `rustc 1.xx is too old` | Instale Rust 1.94+ com `rustup update` e reabra o terminal. |
| Incompatibilidade de lockfile com `--locked` | Mantenha o `Cargo.lock` do projeto inicial; não execute `cargo update` sem restrições. |
| Download de crate bloqueado | Verifique o acesso de rede/proxy ao crates.io e tente `cargo check` novamente. |
| O runtime não consegue iniciar mais tarde | Instale e autentique `copilot`, ou defina `COPILOT_CLI_PATH`. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| `npx` não é reconhecido | Instale o Node.js 22 ou mais recente e reinicie o terminal. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** `cargo check --locked` for bem-sucedido, `copilot login` estiver concluído e a
> página de destino abrir.

Compare com [`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)
se quiser um ponto de referência posterior após a Etapa 1.
:::

:::language java
## 4. Entre no projeto inicial e compile-o

O Java SDK espera encontrar a Copilot CLI no `PATH` quando o aplicativo iniciar. Confirme isso antes
de compilar:

```bash
copilot --version
```

Entre no projeto inicial Java e compile com Maven. Permaneça neste diretório em todas as etapas posteriores:

```bash
cd start-accessibility/java
./mvnw compile
```

Uma compilação bem-sucedida termina com:

```text
[INFO] BUILD SUCCESS
```

O `pom.xml` já configura `exec-maven-plugin` com `mainClass` `workshop.AccessibilityReport`.
Permaneça no Maven para esta trilha.

Você trabalhará em `start-accessibility/java` pelo restante do workshop, então mantenha este
terminal aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no
editor de sua preferência.

Abra a página de destino controlada uma vez para garantir que você consegue acessá-la:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solução de problemas da preparação</summary>

| Sintoma | Correção |
|---|---|
| `java` não é reconhecido | Instale o JDK 17+ e reinicie o terminal. |
| `./mvnw: Permission denied` | Execute `chmod +x mvnw` ou use `sh mvnw` em vez disso. No Windows, use `mvnw.cmd`. |
| Erros de release do compilador | Confirme que `java -version` informa 17 ou mais recente; o POM define `maven.compiler.release` como 17. |
| Falha no download de dependências | Verifique as configurações do Maven Central / proxy e execute novamente `./mvnw compile`. |
| Tentação de trocar de ferramentas | Não substitua Maven por JBang ou Gradle neste workshop. |
| `copilot` não é reconhecido | Instale a CLI, reinicie o terminal e verifique `copilot --version`. |
| O Copilot solicita autenticação | Execute `copilot login`, conclua o fluxo no navegador e tente novamente. |
| `npx` não é reconhecido | Instale o Node.js 22 ou mais recente e reinicie o terminal. |
| O navegador não consegue iniciar mais tarde | Instale Edge ou Chrome, ou siga a [configuração de navegador do Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicie a Etapa 1 quando:** `./mvnw compile` imprimir `BUILD SUCCESS`, `copilot login` estiver concluído e a
> página de destino abrir.

Compare com [`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)
se quiser um ponto de referência posterior após a Etapa 1.
:::

## Saiba mais

O SDK que você está prestes a instalar é documentado fora deste workshop. Estas páginas são as que
vale a pena marcar antes da Etapa 1.

- [Guias de instruções do GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk): a documentação
  do próprio SDK da GitHub, incluindo os pré-requisitos que esta preparação espelha.
- [Mapa da documentação do Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  o índice de configuração, autenticação, recursos e solução de problemas.
- [Configuração padrão: a CLI incluída](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  como o SDK localiza e inicia a Copilot CLI e como apontá-lo para um binário diferente.
- [Guia de depuração](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  o primeiro lugar para procurar quando uma execução falha antes de produzir qualquer saída.

:::language dotnet
- [Referência do .NET SDK](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  instalação do pacote e um exemplo mínimo para o .NET SDK.
:::

:::language nodejs
- [Referência do Node.js SDK](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  instalação do pacote e um exemplo mínimo para o Node.js SDK.
:::

:::language python
- [Referência do Python SDK](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  instalação do pacote e um exemplo mínimo para o Python SDK.
:::

:::language go
- [Referência do Go SDK](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  instalação do módulo e um exemplo mínimo para o Go SDK.
:::

:::language rust
- [Referência do Rust SDK](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  instalação do crate e um exemplo mínimo para o Rust SDK.
:::

:::language java
- [Referência do Java SDK](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  coordenadas de dependência e um exemplo mínimo para o Java SDK.
:::

Continue para [Etapa 1: Crie sua primeira sessão do Copilot](01-first-session.md).
