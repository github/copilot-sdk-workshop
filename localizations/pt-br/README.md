# Workshops do GitHub Copilot SDK

Comece hoje: http://github.github.com/copilot-sdk-workshop/

Escolha um dos três workshops práticos do GitHub Copilot SDK em .NET, Node.js/TypeScript, Python,
Go, Rust ou Java:

- **SDK 101 (30 minutos):** comece com um Hello World em streaming e depois crie um pequeno agente
  de podcast usando ferramentas RSS prontas do
  [projeto inicial introdutório incluído](start-intro/README.md).
- **Accessibility Reviewer:** crie uma ferramenta de desenvolvedor de SDLC que inspeciona uma página da Web, consulta
  orientações WCAG pertencentes ao aplicativo e produz um relatório baseado em evidências.
- **Museum Exhibit Studio:** crie um curador que não é do SDLC e transforma fatos aprovados por educadores em
  texto de exposição pronto para visitantes, opcionalmente enriquecido por pesquisa citada da Wikipedia por meio de uma consulta
  local, por trás de limites determinísticos de capacidade.

Comece pelo SDK 101 se você ainda não conhece o SDK. Nos workshops introdutório e avançados, você vai:

1. Criar um cliente do Copilot e uma sessão de conversa.
2. Separar a política durável do agente dos dados específicos da tarefa.
3. Escolher entre ferramentas locais e ferramentas MCP com listas de permissões de ferramentas estritamente delimitadas.
4. Impor limites de capacidade, entrada, tempo limite, validação e ciclo de vida no código do aplicativo.
5. Explicar o que o modelo pode inferir e o que o aplicativo deve comprovar.

O SDK 101 tem exatamente 30 minutos de lições guiadas. Planeje cerca de 115 minutos para o
Accessibility Reviewer ou 90 minutos para o Museum Exhibit Studio. A configuração da máquina, a
autenticação e os downloads de dependências acontecem separadamente em uma preparação sem tempo
cronometrado para cada workshop. Os dois workshops avançados incluem suas lições HTML interativas e
terminam com uma celebração e recursos.

## Inicie o workshop

Abra a URL do GitHub Pages produzida pelo workflow **Deploy to GitHub Pages** do repositório.
Escolha um resultado de workshop, escolha uma linguagem e depois inicie o workshop selecionado. O
site deriva sua URL base do Pages em tempo de execução, portanto não há nome de host do Pages de
organização ou usuário codificado.

Para visualizar o site a partir de um clone:

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

Abra <http://localhost:8000/docs/>. Não abra `step.html` com uma URL `file://`; os navegadores
bloqueiam as solicitações Markdown usadas pelo visualizador de lições.

## Workshop no seu idioma

Este workshop oferece vários idiomas no seu locale:

[English](../../README.md) | [한국어](../ko-kr/README.md) | [日本語](../ja-jp/README.md) | Português (Brasil) | [Español](../es-es/README.md) | [Français](../fr-fr/README.md) | [Deutsch](../de-de/README.md)

Se quiser adicionar suporte a mais idiomas, adicione mais locales a
[`docs/locale-registry.js`](../../docs/locale-registry.js) e depois adicione documentos localizados
no diretório `localizations/`.

## Pré-requisitos

Instale o runtime da linguagem escolhida, não todos os seis. A preparação de cada trilha fornece os
requisitos aplicáveis; o SDK 101 para Node.js exige a versão 22.12 ou mais recente, e o projeto
inicial em Java também exige Maven 3.9 ou mais recente.

- [SDK do .NET 10](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 ou mais recente](https://nodejs.org/)
- [Python 3.11 ou mais recente](https://www.python.org/downloads/)
- [Go 1.24 ou mais recente](https://go.dev/dl/)
- [Rust 1.94 ou mais recente](https://rustup.rs/)
- [Java 17 ou mais recente](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- Assinatura ou avaliação do GitHub Copilot
- Microsoft Edge (o padrão do workshop) ou Google Chrome para exercícios baseados em navegador

A preparação percorre verificações de instalação, autenticação, comandos específicos do sistema
operacional, saída esperada e solução de problemas.

## Layout do repositório

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## Validar uma alteração

```bash
bash scripts/validate-workshop.sh
```

O comando verifica a estrutura das lições, links internos, hooks de comportamento do site, cobertura
dos projetos e o orçamento exato de 30 minutos da trilha introdutória. Ele também aplica as lições
de museu a cada projeto inicial de museu e verifica se o resultado é o ponto de entrada finalizado.
Depois, executa testes de seleção de idioma, fluxo do site e conclusão independentes de navegador e
restaura, compila ou verifica a sintaxe de todos os projetos iniciais de introdução, acessibilidade
e museu, todos os projetos finalizados e o destino Blazor sem autenticar o Copilot, iniciar um
navegador ou enviar um prompt. Os projetos de museu não incluem testes, mocks nem fixtures, portanto
seus destinos apenas restauram e compilam.

Passe uma ID de linguagem para executar um destino de smoke build:

```bash
bash scripts/validate-workshop.sh nodejs
```

Pull requests executam a validação de conteúdo e os smoke builds de todas as seis linguagens como
jobs separados do GitHub Actions, para que uma falha identifique a trilha de SDK afetada.

## Workshop SDK 101

Comece em [`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md). Instale o runtime
escolhido, autentique o Copilot e baixe as dependências **antes** da sessão cronometrada. As quatro
lições guiadas são noções básicas do SDK (5 minutos), Hello World em streaming (10 minutos), um
agente de podcast (12 minutos) e recapitulação (3 minutos).

Os alunos clonam este repositório uma vez e editam o ponto de entrada em
[`start-intro/<language>`](start-intro/README.md). O projeto inicial inclui todos os arquivos-fonte,
manifestos de dependências, lockfiles e auxiliares prontos para consultas RSS, seleção de modelo e
episódio e aprovação interativa de ferramentas. Não é necessário clonar um segundo repositório nem
fazer um workshop mais longo.

Abra `LIVE_DEMO.md` ao lado do ponto de entrada do projeto inicial. O workshop prático segue as
**quatro edições de Hello World** da demonstração de origem: iniciar o cliente, verificar a
autenticação, criar a sessão e enviar uma mensagem. Continue com o **Ato dois** no mesmo aplicativo
para escolher um modelo e um episódio, conceder capacidades e substituir o prompt. O site renderiza
essas seções do guia local diretamente, portanto o guia do editor e o workshop online ensinam o
mesmo código.

A trilha aborda o ciclo de vida de cliente/sessão, streaming, registro de ferramentas locais, uma
mensagem de sistema focada e permissões. MCP, validação automatizada de saída e atividades finais em
HTML pertencem aos workshops avançados. Revise o texto de podcast gerado em relação à origem antes
de publicar.

## Workshop Museum Exhibit Studio

Os projetos iniciais do Museum Exhibit Studio ficam em `start-museum/<language>`, com referências
concluídas em `finished/<language>/museum-exhibit-studio`. Cada projeto inicial inclui um módulo
auxiliar de curador pronto que os alunos nunca editam: conjuntos de fatos aprovados, seus limites e
o menu de seleção de fatos, um utilitário de impressão em streaming, validação determinística da
exposição, o servidor MCP da Wikipedia com escopo definido e seu manipulador de permissões que nega
por padrão, a permissão de gravação no arquivo único `exhibit.html`, as mensagens de sistema de
curador e pesquisa (no próprio arquivo auxiliar), o texto fixo do prompt (estrutura da exposição,
solicitação de pesquisa, requisitos da página) e a mensagem de falha impressa pelo ponto de entrada.

Os alunos trabalham diretamente em `start-museum/<language>` e desenvolvem esse único projeto ao
longo das lições, executando-o a cada etapa. Eles escrevem o código do SDK: a configuração da
sessão, o registro de ferramentas e as três configurações de sessão (cada uma instala uma mensagem
de sistema pronta no modo de substituição), as instruções nos prompts de exposição e página e um
executor de sessão que controla o ciclo de vida e o tempo limite. O exemplo finalizado é aquilo com
que o aluno termina, não uma arquitetura de referência separada.

Cada local em que um aluno escreve código é uma região nomeada no ponto de entrada do projeto
inicial, delimitada por dois comentários marcadores cuja linha `BEGIN` lista as etapas que a tocam:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Cada bloco de código de lição é introduzido por uma linha como ``**REPLACE** region
`generation-config` in `Program.cs`:`` e contém o conteúdo completo dessa região. INSERT preenche
uma região vazia; REPLACE substitui o que uma etapa anterior colocou ali. As linhas marcadoras nunca
se movem, e nenhuma lição substitui o arquivo inteiro. A validação de conteúdo aplica cada bloco de
lição ao projeto inicial e exige que o resultado seja igual ao ponto de entrada finalizado, portanto
uma lição não pode se desviar do aplicativo finalizado. Quando alterar o código de uma lição de
museu, altere o ponto de entrada finalizado para corresponder, e vice-versa.

A trilha voltada para o aluno começa em
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md) e depois percorre sete etapas —
primeira sessão, streaming, voz do curador, fatos aprovados, verificações estruturais e pesquisa com
Wikipedia MCP, seguida por uma atividade final interativa com `exhibit.html` — e termina com
[celebração e recursos](workshop/museum-09-complete.md).

Quando existe pesquisa citada utilizável, o curador chama `approved_fact_lookup` e a ferramenta
somente leitura `approved_wikipedia_fact_lookup` antes de escrever a narrativa e as perguntas para
visitantes. A segunda ferramenta retorna pesquisa capturada, não acesso ao vivo à Wikipedia nem
fatos verificados por humanos. Fatos aprovados têm precedência, e pesquisas recusadas, com falha ou
sem citação mantêm o caminho de geração com ferramenta única. A validação estrutural não comprova
fundamentação factual; revise as afirmações pesquisadas antes de publicar.

As verificações de Rust compartilham um diretório de destino Cargo entre todos os projetos do
workshop, evitando recompilação repetida de dependências do SDK.

## Implantação

Depois que a validação passar, envie para `main`. O
[workflow do Pages](../../.github/workflows/deploy.yml) publica `docs/` mais as lições Markdown em
`workshop/` e suas traduções em `localizations/`. A compilação e a validação de conteúdo são
executadas separadamente no workflow de validação.

Habilite o GitHub Pages nas configurações do repositório e escolha **GitHub Actions** como origem. O
job de implantação relata a URL canônica do workshop no ambiente dele.

O workflow de implantação verifica todas as páginas HTML, todos os assets do site e todas as lições
Markdown publicados. Ele verifica por padrão a URL retornada pelo GitHub Pages. Para validar, em vez
disso, um domínio público ou personalizado futuro, defina a variável de Actions do repositório
`WORKSHOP_SITE_URL` como a URL base desse site. Você pode executar a mesma verificação manualmente:

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## Referências

- [GitHub Copilot SDK para .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK para Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK para Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK para Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK para Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK para Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Cookbook do Copilot SDK](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [API e código-fonte do Copilot SDK](https://github.com/github/copilot-sdk)
- [Instalar o GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Licença

Este projeto é licenciado sob a [Licença MIT](../../LICENSE).

Este workshop é fornecido no estado em que se encontra para fins educacionais. Ele se destina a
demonstrar conceitos e padrões, e não a servir como um serviço de produção completo.
