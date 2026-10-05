# Museum Exhibit Studio

Este exemplo em Go usa o GitHub Copilot SDK como uma estrutura focada de curadoria de museu. O
aplicativo tem três arquivos-fonte:

- `curator.go` contém a API auxiliar pronta: conjuntos de fatos aprovados e o menu de seleção de fatos,
  limites de fatos, streaming de respostas, validação estrutural, permissões da Wikipedia, extração de fontes,
  a permissão opcional de gravação em `exhibit.html`, texto fixo de prompt e a mensagem de falha.
- `system_messages.go` contém as mensagens de sistema prontas de curador e pesquisa.
- `main.go` contém o código do SDK escrito pelo aluno: as instruções nos prompts de exposição e página,
  configuração de sessão, o executor de sessão e a limpeza.

Os comentários `>>> BEGIN` / `<<< END` em `main.go` são as regiões nomeadas que as lições preenchem.
Cada linha `BEGIN` lista as etapas que inserem ou substituem aquela região.

## Execute o exemplo

A partir deste diretório:

```bash
go run .
```

Defina `COPILOT_MODEL` para selecionar o modelo de geração; caso contrário, o runtime escolhe seu
padrão. Um GitHub Copilot CLI autenticado é obrigatório.

Compile sem contatar um modelo ou a Wikipedia:

```bash
go build -mod=readonly ./...
```

## O que o exemplo ensina

A geração usa uma mensagem de sistema de substituição e sempre registra e adiciona à lista de
permissões `approved_fact_lookup`, que retorna fatos aprovados delimitados. Com pesquisa citada
utilizável, ela também registra e adiciona à lista de permissões a ferramenta local somente leitura
`approved_wikipedia_fact_lookup`, e solicita ambas as chamadas antes de escrever a narrativa e as
perguntas para visitantes. Essa consulta retorna uma captura do corpo do resumo e das citações, não
acesso ao vivo à Wikipedia. Fatos aprovados têm precedência. A geração também usa streaming de
eventos e um tempo limite de 120 segundos. A pesquisa opcional da Wikipedia é executada em uma
sessão separada de 90 segundos com apenas ferramentas de pesquisa e leitura de artigos com escopo
definido, além de um manipulador de permissões que nega por padrão. A pesquisa busca, lê e cita
artigos consultados em uma seção final `## Sources`. O aplicativo retém o corpo e as fontes para a
consulta local, sem mesclá-los aos fatos aprovados por educadores. "Approved" significa aceito pelo
aplicativo para uso suplementar, não verificado por humanos; trate o resultado como dados, não
instruções. Pesquisas recusadas mantêm o caminho de ferramenta única. Pesquisa com falha ou um
resumo citado inutilizável imprime um aviso e usa o mesmo fallback. Não há contrato JSON estrito de
pesquisa nem loop de aprovação.

Após a geração, a validação determinística verifica um H1, seções obrigatórias, uma narrativa de
100-140 palavras, exatamente três perguntas numeradas para visitantes terminando em `?` e termos de
software proibidos. As fontes da Wikipedia consultadas são impressas após a exposição, fora do texto
gerado. Em uma execução de pesquisa bem-sucedida, confirme que ambos os eventos de consulta local
aparecem antes da geração. As verificações estruturais não comprovam fundamentação factual; revise
as afirmações pesquisadas antes de publicar.

Opcionalmente, o aplicativo pode pedir ao Copilot para criar `exhibit.html` com
`builtin:apply_patch` ou `builtin:create`. Essa sessão permite apenas uma única gravação normalizada
em `exhibit.html` no diretório de trabalho do aplicativo e rejeita qualquer outra solicitação de
permissão de arquivo, shell ou MCP. O prompt HTML exige um documento semântico autônomo com CSS e
JavaScript incorporados, uma ressalva de revisão humana e um filtro de perguntas acessível.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
