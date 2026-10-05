# Projetos iniciais do workshop

Escolha o diretório da linguagem selecionada na página inicial do workshop e trabalhe diretamente
dentro dele. Não há etapa de cópia. Entre nesse diretório, abra a mesma pasta no editor (`code .` de
dentro dela, ou qualquer outro comando de abrir pasta do editor) e permaneça nela para todos os
comandos. Os projetos iniciais são estruturas básicas intencionalmente mínimas. O catálogo Web
Content Accessibility Guidelines (WCAG) pertencente ao aplicativo e os auxiliares de
permissão/leitura de snapshot com escopo definido podem estar presentes para lições posteriores, mas
seus pontos de entrada executáveis não conectam um cliente Copilot, sessão, fluxo de streaming,
ferramenta local, servidor MCP nem relatório até a etapa correspondente.

| Linguagem | Pré-requisito | Altere o diretório e verifique |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper incluído) | `cd start-accessibility/java && ./mvnw compile` |

Como você edita esses arquivos no local, o trabalho aparece em `git status`. Isso é esperado.
Execute `git checkout -- .` a partir da raiz do repositório para restaurar um projeto inicial limpo.
As trilhas de Go, Rust e Java exigem o
[GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) no
`PATH` quando você executar o aplicativo mais tarde. A configuração do SDK e as referências de API
estão disponíveis no [repositório oficial do Copilot SDK](https://github.com/github/copilot-sdk) e
no [cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook).

Permaneça no diretório do projeto inicial durante todo o workshop. Retorne ao visualizador
interativo a partir da [página inicial do workshop](../README.md#inicie-o-workshop); não abra o
Markdown da lição diretamente.
