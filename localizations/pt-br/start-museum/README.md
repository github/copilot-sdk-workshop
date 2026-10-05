# Projetos iniciais do Museum Exhibit Studio

Escolha o diretório para a linguagem do seu workshop e trabalhe diretamente dentro dele. Depois de
entrar nele, abra essa mesma pasta no seu editor (`code .` a partir de dentro dela, ou o comando de
abrir pasta de qualquer outro editor) e mantenha o terminal ali. Esses projetos iniciais contêm
dependências fixadas, um ponto de entrada organizado como regiões nomeadas, um módulo auxiliar de
curador pronto e um arquivo pronto que contém as mensagens de sistema. Os auxiliares guardam a
infraestrutura que você nunca precisa escrever: os conjuntos de fatos aprovados, seus limites e o
menu que permite a um educador escolhê-los ou digitá-los, a ferramenta local pronta
`approved_fact_lookup` que entrega esses fatos ao curador, a ferramenta local pronta
`approved_wikipedia_fact_lookup` que retorna pesquisas capturadas e citações quando existe pesquisa
utilizável, um auxiliar de impressão de streaming, validação determinística da exposição, o servidor
MCP da Wikipedia com escopo definido e seu manipulador de permissões negar-por-padrão, a permissão
de escrita do arquivo único `exhibit.html`, o texto fixo do prompt (estrutura da exposição,
solicitação de pesquisa e requisitos da página), a consulta `COPILOT_MODEL` e a mensagem de falha. O
arquivo de mensagens de sistema guarda as três mensagens longas sob as quais as sessões são
executadas: a do curador, a do curador quando a pesquisa já está disponível e a do assistente de
pesquisa. Você nunca edita os auxiliares.

Os projetos iniciais **não** incluem as instruções do prompt da exposição, configuração de sessão,
registro de ferramentas nem o executor de sessão. Você escreve isso durante as lições: uma sessão,
depois streaming, depois a voz do curador (instalando a mensagem de sistema pronta), o registro da
ferramenta de fatos e seu prompt com um executor de sessão delimitado, o relatório de validação,
pesquisa na Wikipedia com escopo definido e uma página interativa `exhibit.html`. Comece em
[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md).

## Como o ponto de entrada é organizado

O ponto de entrada do projeto inicial traz a forma fixa do programa (função de entrada, manipulador
de erros, limpeza) e um conjunto de regiões nomeadas vazias. Uma região é formada por dois
comentários marcadores, e sua linha `BEGIN` lista todas as etapas que a tocam:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Cada bloco de código da lição nomeia sua região e uma de duas ações. **INSERT** significa que a
região está vazia: cole o bloco entre as linhas marcadoras. **REPLACE** significa que a região
contém código de uma etapa anterior: exclua tudo entre as linhas marcadoras e, depois, cole o bloco.
Um bloco é sempre o conteúdo completo da região. Nunca edite uma linha marcadora nem o código fora
das regiões.

| Região | Contém | Etapas |
|---|---|---|
| `imports` | Importações | 1, depois sempre que uma etapa precisar de novos nomes |
| `banner` | Banner do programa | 1 |
| `choose-facts` | Chamada de seleção de fatos | 4 |
| `research` | Passagem opcional de pesquisa na Wikipedia | 6 |
| `generate` | A chamada de geração da exposição | 1 a 6 |
| `validate` | Relatório de validação | 5 |
| `sources` | Fontes consultadas | 6 |
| `exhibit-page` | Sessão opcional de `exhibit.html` | 7 |
| `exhibit-prompt` | Builder do prompt da exposição | 4, 6 |
| `html-prompt` | Builder do prompt da página | 7 |
| `generation-config` | Configuração da sessão de geração | 4, 6 |
| `research-config` | Configuração da sessão de pesquisa | 6 |
| `html-config` | Configuração da sessão de página | 7 |
| `session-runner` | Executor de sessão | 4 |

A Etapa 6 registra condicionalmente a consulta à Wikipedia junto com a consulta de fatos aprovados e
pede ao curador para chamar ambas antes de escrever a narrativa e as perguntas dos visitantes. A
pesquisa continua suplementar, não verificada pelo educador; os fatos aprovados têm precedência.
Recusar a pesquisa ou não receber nenhum resumo citado utilizável deixa a geração apenas com
`approved_fact_lookup`.

| Linguagem | Módulo auxiliar | Mensagens de sistema | Mude de diretório, compile e execute |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

Executar o projeto inicial imprime sua identidade e não inicia o Copilot nem exige autenticação.
Como você edita esses arquivos no local, seu trabalho aparece em `git status`. Isso é esperado.
Execute `git checkout -- .` a partir da raiz do repositório para restaurar um projeto inicial limpo.

Todo projeto inicial já fixa as dependências de que o aplicativo finalizado precisa, então você
nunca edita um manifesto de projeto durante o workshop. O projeto inicial Rust compila o crate de
biblioteca `museum_exhibit_studio` a partir de `src/lib.rs`; importe os auxiliares dele em
`src/main.rs`.
