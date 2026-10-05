# Museum Exhibit Studio: preparação

> **Tempo:** Sem limite de tempo  
> **Workshop:** Agente não SDLC

## O que você vai criar

O Museum Exhibit Studio transforma fatos aprovados por educadores em texto de exposição pronto para visitantes:

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

Você cria um único aplicativo de console que cresce no lugar, dentro de `start-museum/<language>`.
Cada etapa adiciona uma ideia e termina com uma execução real, para que o curador tome forma diante
de você:

| Etapa | Você adiciona | Você vê |
|---|---|---|
| 1 | Um cliente, uma sessão, um prompt | Texto de museu no terminal |
| 2 | A impressora de streaming pronta | Texto chegando ao vivo |
| 3 | A mensagem de sistema do curador | Uma voz e uma estrutura diferentes |
| 4 | A ferramenta de fatos aprovados, o prompt e o executor de sessão delimitada | Texto que acompanha seus fatos |
| 5 | O validador pronto | Um relatório estrutural PASS/FAIL |
| 6 | Uma sessão de pesquisa na Wikipedia com escopo delimitado | Contexto citado, mantido fora da exposição |
| 7 | Uma página interativa | `exhibit.html` no seu navegador |
| 8 | Uma celebração e recursos | Seu próximo projeto começa aqui |

As sete etapas práticas levam cerca de 90 minutos. Conclua-as em ordem e depois celebre o que você
criou e explore os recursos na etapa final.

O projeto inicial já traz toda a infraestrutura que você não deveria precisar escrever: os conjuntos
de fatos aprovados e seus limites, o menu de seleção de fatos, uma impressora de streaming,
validação determinística de exposição, o servidor MCP da Wikipedia com escopo delimitado e seu
manipulador de permissões que nega por padrão, a permissão de escrita para o arquivo único
`exhibit.html`, as mensagens de sistema, o texto fixo do prompt para a estrutura da exposição, a
solicitação de pesquisa, os requisitos da página e o tratamento de erros ao redor do seu código.
**Você nunca edita os arquivos auxiliares.** Você escreve o código do SDK: a configuração da sessão,
o registro de ferramentas e as configurações de sessão, as instruções nos prompts de exposição e de
página e um executor de sessão.

Você precisa da GitHub Copilot CLI autenticada, do runtime da sua linguagem e de um terminal. Você
trabalha diretamente no projeto mínimo em `start-museum/<language>`, não no aplicativo finalizado. O
projeto concluído em `finished/<language>/museum-exhibit-studio` é apenas material de referência
opcional.

## Clone o repositório do workshop

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Confirme que o terminal está na raiz do repositório antes de entrar em um projeto inicial:

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

O comando deve ser concluído com sucesso sem produzir saída.

Você cria o aplicativo de museu **no lugar**, dentro do diretório do projeto inicial da sua
linguagem. Não há etapa de cópia. Isso significa que você está editando arquivos rastreados do
repositório, então seu trabalho aparece em `git status` como arquivos modificados. Isso é esperado e
correto. Se quiser recomeçar com um projeto inicial limpo, execute `git checkout -- .` a partir da
raiz do repositório para descartar suas edições.

Entre agora no diretório do projeto inicial da sua linguagem e permaneça nele para todos os comandos
do workshop de museu.

:::language dotnet
Entre no projeto inicial do .NET e depois restaure, compile e execute o ponto de entrada local dele:

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

Condição para passar: a compilação é bem-sucedida e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in Helpers/.`

Você trabalhará em `start-museum/dotnet` pelo restante do workshop, então mantenha este terminal
aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no seu editor
favorito.

Seu módulo auxiliar é `Helpers/Curator*.cs` no namespace `MuseumExhibitStudio.Helpers`. Você
escreverá todas as alterações das lições em `Program.cs`.
:::

:::language nodejs
Entre no projeto inicial do Node.js. O lockfile dele preserva o SDK 1.0.11 e o pacote de plataforma
compatível `@github/copilot` 1.0.80:

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

Condição para passar: a compilação é bem-sucedida e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/curator.ts.`

Você trabalhará em `start-museum/nodejs` pelo restante do workshop, então mantenha este terminal
aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no seu editor
favorito.

Seu módulo auxiliar é `src/curator.ts`, e as mensagens de sistema estão em `src/system-messages.ts`.
Você escreverá todas as alterações das lições em `src/index.ts`.
:::

:::language python
Entre no projeto inicial do Python, crie um ambiente virtual isolado e instale o SDK 1.0.11:

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

No Windows, o interpretador fica em `.venv/Scripts/python.exe`.

Condição de aprovação: o código-fonte compila e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in curator.py.`

Você trabalhará em `start-museum/python` pelo restante do workshop, então mantenha este terminal
aqui. A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no editor de sua
preferência.

Seu módulo auxiliar é `curator.py`, e as mensagens de sistema estão em `system_messages.py`. Você
escreverá todas as alterações da lição em `main.py`.
:::

:::language go
Entre no projeto inicial em Go, baixe a dependência fixada do SDK 1.0.11 e compile-o:

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

Condição de aprovação: a compilação é bem-sucedida e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in curator.go.`

Você trabalhará em `start-museum/go` pelo restante do workshop, então mantenha este terminal aqui. A
partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no editor de sua
preferência.

Seu módulo auxiliar é `curator.go`, e as mensagens de sistema estão em `system_messages.go`. Ambos
estão no mesmo pacote `main`. Você escreverá todas as alterações da lição em `main.go`.
:::

:::language rust
Entre no projeto inicial em Rust, busque as dependências fixadas e verifique-o:

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

Condição de aprovação: o Cargo deixa `Cargo.lock` inalterado e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/lib.rs.`

Você trabalhará em `start-museum/rust` pelo restante do workshop, então mantenha este terminal aqui.
A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no editor de sua
preferência.

Seu módulo auxiliar é o crate de biblioteca `museum_exhibit_studio` em `src/lib.rs`, com as
mensagens de sistema em `src/system_messages.rs`. Você escreverá todas as alterações da lição em
`src/main.rs`.
:::

:::language java
Entre no projeto inicial Maven, resolva o SDK 1.0.11, compile e execute-o com o Maven Wrapper
incluído (não é necessária uma instalação separada do Maven; no Windows, use `mvnw.cmd` em vez de
`./mvnw`):

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

Condição de aprovação: o Maven é bem-sucedido e o programa imprime
`=== Museum Exhibit Studio starter ===` seguido de
`Pre-built curator helpers are ready in src/main/java/workshop/.`

Você trabalhará em `start-museum/java` pelo restante do workshop, então mantenha este terminal aqui.
A partir desta pasta, digite `code .` para abri-la no VS Code ou abra a pasta no editor de sua
preferência.

Seu módulo auxiliar é `src/main/java/workshop/Curator*.java`. Você escreverá todas as alterações da
lição em `src/main/java/workshop/MuseumExhibitStudio.java`.
:::

## Como as edições funcionam

Abra o ponto de entrada indicado no fim do bloco de configuração acima. Todos os lugares em que você
escreve código são uma **região** nomeada entre dois comentários marcadores:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

A linha `BEGIN` lista todas as etapas que alteram a região, então o arquivo também funciona como um
mapa do workshop. Cada bloco de código em uma lição é introduzido por uma linha que nomeia sua
região e uma de duas ações:

| Ação | A região está | O que você faz |
|---|---|---|
| **INSERT** | Vazia | Cole o bloco entre as duas linhas marcadoras. |
| **REPLACE** | Contém código de uma etapa anterior | Exclua tudo entre as duas linhas marcadoras e cole o bloco. |

Um bloco é sempre o conteúdo completo de sua região, então você nunca mescla código manualmente.
Deixe as linhas marcadoras e o código fora das regiões exatamente como estão.

## Estabeleça o limite de confiança

| Controle | O que ele pode fazer |
|---|---|
| Mensagem de sistema | Orientar função, tom, escopo e formato da saída |
| Lista de permissões de ferramentas | Decidir exatamente quais ferramentas existem para uma sessão |
| Código do aplicativo | Ter propriedade dos dados por trás de uma ferramenta e impor limites, tempo limite, validação e limpeza |
| Revisão humana | Decidir se toda alegação histórica tem suporte |

Os fatos aprovados pelo educador são a única fonte aprovada, e o curador os acessa por meio de uma
ferramenta pertencente ao aplicativo. A memória do modelo não é conhecimento de museu verificado, e
a orientação do prompt não é um limite de autorização: somente a lista de permissões e o manipulador
de permissões decidem o que a sessão pode realmente fazer.

## Saiba mais

O SDK por trás do curador está documentado fora deste workshop. Vale a pena manter estas páginas
abertas junto com o workshop.

- [Como fazer do GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk):
  documentação do SDK do próprio GitHub, incluindo os pré-requisitos que esta preparação cobre.
- [Mapa da documentação do Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  o índice de configuração, autenticação, recursos e solução de problemas.
- [Configuração padrão: a CLI incluída](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  como o SDK localiza e inicia o Copilot CLI, e como apontá-lo para um binário diferente.
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

Continue para [Sua primeira sessão de curador](museum-01-first-curator-session.md).
