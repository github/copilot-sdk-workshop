# Museum Exhibit Studio

Este exemplo em Rust usa o GitHub Copilot SDK como um harness de agente focado em um cenário que não é de engenharia de software. Os auxiliares prontos ficam em `src/lib.rs`: conjuntos de fatos aprovados e o menu de seleção de fatos, streaming, validação, permissões com escopo definido, texto de prompt fixo e a mensagem de falha. As mensagens de sistema do curador e da pesquisa estão prontas em `src/system_messages.rs`. O código do SDK escrito pelo aluno fica em `src/main.rs`: as instruções nos prompts da exposição e da página, configuração da sessão e o executor da sessão.

Os comentários `>>> BEGIN` / `<<< END` em `src/main.rs` são as regiões nomeadas que as lições preenchem. Cada linha `BEGIN` lista as etapas que inserem ou substituem essa região.

## Execute o exemplo

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

Defina `COPILOT_MODEL` para selecionar um modelo de geração. O exemplo requer um GitHub Copilot CLI autenticado.

Verifique sem contatar um modelo:

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## O que o exemplo ensina

A sessão de geração usa uma mensagem de sistema do curador em modo de substituição, valida fatos
aprovados, transmite em streaming com um tempo limite de 120 segundos, sempre registra e inclui
`approved_fact_lookup` na lista de permissões, rejeita saída em branco e imprime validação
estrutural determinística. Com uma pesquisa utilizável com citações, ela também registra e inclui na
lista de permissões o `approved_wikipedia_fact_lookup` local somente leitura e solicita as duas
chamadas antes de escrever a narrativa e as perguntas dos visitantes.

A pesquisa opcional no Wikipedia é separada: ela expõe somente as ferramentas MCP `search` e
`readArticle` com escopo definido, usa um manipulador de permissões que nega por padrão e produz um
resumo e fontes citadas. A nova consulta local retorna um snapshot desse corpo e das citações, sem
acesso ao Wikipedia ao vivo nem mesclar pesquisa aos fatos aprovados pelo educador. Os fatos
aprovados têm precedência; a pesquisa "aprovada" é dado suplementar aceito pelo aplicativo, não
fatos verificados por humanos nem instruções. A pesquisa recusada mantém o caminho com uma única
ferramenta. Pesquisa com falha ou um resumo citado inutilizável imprime um aviso e usa o mesmo
fallback. As fontes são impressas após a exposição; uma pesquisa bem-sucedida deve mostrar ambos os
eventos de consulta local antes da geração. As verificações estruturais não comprovam fundamentação
factual, portanto revise as afirmações pesquisadas antes de publicar.

A geração HTML opcional usa `builtin:apply_patch` ou `builtin:create` com um manipulador de permissões de arquivo único que pode escrever apenas `exhibit.html` no diretório de trabalho do aplicativo.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
