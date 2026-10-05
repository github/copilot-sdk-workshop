# Preparação: prepare-se para o SDK 101

> **Tempo:** preparação sem limite de tempo, antes do workshop de 30 minutos

## O que você vai criar

Comece com um Hello World em streaming e depois transforme-o em um pequeno assistente de lançamento
para The GitHub Podcast. Você escreve a conexão do SDK e a configuração da sessão; o projeto inicial
já inclui ferramentas de consulta de episódios e auxiliares de seleção no terminal.

As quatro lições cronometradas somam **30 minutos**: noções básicas do SDK (5), Hello World (10),
agente de podcast (12) e recapitulação (3). Conclua a instalação, a autenticação e os downloads de
dependências com antecedência para que a sessão permaneça focada no SDK.

## Verifique seu acesso

Você precisa de Git, um editor, um terminal, acesso à rede e uma assinatura ou avaliação ativa do
GitHub Copilot com acesso a um modelo compatível. Instale o
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) e execute estes
comandos no terminal:

```shell
git --version
copilot --version
copilot auth login
```

Conclua o login no navegador se solicitado. Use a mesma conta e o mesmo ambiente de terminal para o
workshop. Não cole tokens nos arquivos de origem. O exemplo de podcast também precisa de acesso ao
[feed RSS oficial](https://feeds.simplecast.com/ioCY0vfY).

## Obtenha o projeto inicial

Todos os seis projetos iniciais do SDK 101 e seus auxiliares prontos estão incluídos em
`start-intro/` **neste repositório do workshop**. Clone-o uma vez:

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Se você já clonou este repositório, use esse checkout; não clone outro repositório nem copie um
projeto inicial. Escolha apenas uma linguagem abaixo. Todos os comandos começam na raiz deste
repositório. Instale apenas o runtime dessa linguagem. Mantenha as versões de dependência
existentes; você não precisa criar um scaffold de projeto nem instalar o SDK novamente.

Cada pasta da linguagem também contém **`LIVE_DEMO.md`**. Abra-o ao lado do ponto de entrada.
Durante a sessão cronometrada, faça as quatro edições numeradas do Ato um, execute o Hello World e
depois continue com o Ato dois no mesmo arquivo e aplicativo.

:::language dotnet
### Prepare o .NET

Instale o [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/).

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

Abra `start-intro/dotnet` no seu editor (`code .` para VS Code). Seu ponto de entrada é
`Program.cs`. Mais tarde, você executará `dotnet run` nesta pasta.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)
para saber como a CLI é descoberta, incluindo `COPILOT_CLI_BINARY_PATH` se o download do runtime
incluído estiver bloqueado.
:::

:::language nodejs
### Prepare o Node.js

Instale [Node.js 22.12 ou mais recente](https://nodejs.org/).

```shell
node --version
cd start-intro/nodejs
npm ci
```

Abra `start-intro/nodejs` no seu editor (`code .` para VS Code). Seu ponto de entrada é
`src/index.ts`. Mais tarde, você executará `npm start` nesta pasta.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::

:::language python
### Prepare o Python

Instale [Python 3.11 ou mais recente](https://www.python.org/downloads/). Use um ambiente isolado.
No Windows PowerShell:

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

No macOS/Linux:

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Abra `start-intro/python` no seu editor (`code .` para VS Code). Seu ponto de entrada é `main.py`.
Usamos diretamente o interpretador do ambiente nas lições, portanto a ativação e as alterações de
política de execução do PowerShell são desnecessárias.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::

:::language go
### Prepare o Go

Instale [Go 1.24 ou mais recente](https://go.dev/dl/).

```shell
go version
cd start-intro/go
go mod download
```

Abra `start-intro/go` no seu editor (`code .` para VS Code). Seu ponto de entrada é `main.go`. Mais
tarde, você executará `go run .` nesta pasta.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::

:::language java
### Prepare o Java

Instale [Java 17 ou mais recente](https://adoptium.net/). Não é necessária uma instalação separada
do Maven: o projeto inicial inclui o Maven Wrapper (`./mvnw`), que baixa a versão correta do Maven
no primeiro uso. No Windows, execute `mvnw.cmd` em vez de `./mvnw`.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

Abra `start-intro/java` no seu editor (`code .` para VS Code). Seu ponto de entrada é
`src/main/java/demo/CopilotSdkLiveDemo.java`. Mais tarde, você executará `./mvnw compile exec:java`
nesta pasta.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::

:::language rust
### Prepare o Rust

Instale [Rust 1.94 ou mais recente](https://rustup.rs/). No Windows, a toolchain MSVC padrão também
precisa das ferramentas de compilação C++ e do Windows SDK descritas no
[guia de instalação do Rust](https://doc.rust-lang.org/book/ch01-01-installation.html). Conclua essa
configuração antes da sessão.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Abra `start-intro/rust` no seu editor (`code .` para VS Code). Seu ponto de entrada é `src/main.rs`.
Mais tarde, você executará `cargo run --locked` nesta pasta. A verificação antecipada aquece o cache
de compilação; reserve tempo extra de preparação para a primeira compilação de dependências do Rust.

Consulte o [README do projeto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Verificação de prontidão

Você estará pronto quando a autenticação estiver concluída, as dependências forem baixadas e o ponto
de entrada selecionado estiver aberto no seu editor. O ponto de entrada intocado está
**deliberadamente incompleto**: os espaços reservados podem falhar na compilação ou imprimir uma
mensagem de autenticação sem verificar seu login real. Não trate isso como um aplicativo
funcionando. A lição de Hello World os preenche.

Mantenha inalterados os arquivos auxiliares do projeto inicial. Você expande o projeto no lugar
dentro de `start-intro/`; suas edições aparecem em `git status`, o que é esperado.

## Solução de problemas antes da sessão

- **CLI não encontrada:** conclua a instalação da CLI e reabra o terminal. Siga
  o README do projeto inicial da sua linguagem se o SDK não conseguir localizar o executável nativo.
- **Falha no login:** verifique sua assinatura, a política da organização e a conta
  do navegador antes da sessão. Um login bem-sucedido por si só não garante acesso ao modelo.
- **Falha no download de dependências:** resolva agora o acesso ao proxy ou ao registro de pacotes.
  Não substitua dependências fixadas por versões não relacionadas do SDK.
- **Feed RSS bloqueado:** resolva o acesso ao feed oficial antes da lição de podcast.
  Não substitua por fatos de episódios inventados.

Continue para [Noções básicas do SDK](intro-01-sdk-basics.md).

## Saiba mais

- [Projetos iniciais de introdução incluídos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [Copilot SDK oficial](https://github.com/github/copilot-sdk)
