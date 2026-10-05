# Museum Exhibit Studio

Este exemplo de Maven CLI usa o GitHub Copilot SDK como um agente focado de curadoria de museu. Um educador de museu escolhe um dos três conjuntos de fatos aprovados ou insere os próprios fatos delimitados, opcionalmente transmite em streaming pesquisa de contexto da Wikipedia com escopo definido, gera texto de exposição voltado para visitantes, valida sua estrutura e pode optar por uma atividade final com `exhibit.html`.

## Executar

A partir deste diretório:

```bash
./mvnw compile exec:java
```

Defina `COPILOT_MODEL` para selecionar um modelo; caso contrário, o runtime do Copilot escolhe seu padrão. O exemplo exige um GitHub Copilot CLI autenticado.

Compile sem contatar um modelo:

```bash
./mvnw compile
```

## O que ele demonstra

O ponto de entrada `MuseumExhibitStudio` escrito pelo aluno cria sessões diretamente com `new CopilotClient()`. Os auxiliares prontos `Curator*` fornecem fatos aprovados e o menu de seleção de fatos, streaming, validação, permissões com escopo definido, extração de fontes, texto fixo de prompt, a mensagem de falha e (em `CuratorSystemMessages.java`) as mensagens de sistema de curador e pesquisa. Os comentários `>>> BEGIN` / `<<< END` no ponto de entrada são as regiões nomeadas que as lições preenchem; cada linha `BEGIN` lista as etapas que inserem ou substituem aquela região.

A orientação de prompt não é um limite de autorização, portanto o aplicativo também:

- sempre registra e adiciona à lista de permissões `approved_fact_lookup`, adicionando a ferramenta local somente leitura
  `approved_wikipedia_fact_lookup` somente quando existe pesquisa citada utilizável;
- limita a pesquisa ao servidor MCP da Wikipedia configurado e a `wikipedia-search` / `wikipedia-readArticle` por meio de um manipulador de permissões que nega por padrão;
- captura o corpo da pesquisa e as citações finais de `## Sources` para a segunda consulta local,
  nunca os mesclando aos fatos aprovados por educadores nem dando à geração acesso ao vivo à Wikipedia;
- delimita a entrada a 20 fatos de no máximo 500 caracteres cada antes de cada envio ao modelo;
- usa tempos limite explícitos, rejeita saída de exposição em branco e desconecta sessões / interrompe clientes em casos de sucesso e falha;
- verifica um H1, seções obrigatórias, uma narrativa de 100-140 palavras, exatamente três perguntas numeradas terminando em `?` e vocabulário de software proibido; e
- opcionalmente permite que `builtin:apply_patch` e `builtin:create` escrevam apenas `exhibit.html` no diretório de trabalho do aplicativo.

O curador é instruído a chamar ambas as consultas locais antes de escrever a narrativa e as
perguntas para visitantes quando existe pesquisa. Fatos aprovados têm precedência sobre a pesquisa
suplementar, que é dados, não instruções. Pesquisa "Approved" é aceita pelo aplicativo, não
verificada por humanos. Pesquisas recusadas mantêm o caminho de ferramenta única. Pesquisa com falha
ou um resumo citado inutilizável imprime um aviso e usa o mesmo fallback. Confirme ambos os eventos
de consulta em uma execução de pesquisa bem-sucedida; as fontes ainda são impressas após a
exposição. O validador não consegue comprovar fundamentação factual semântica. Afirmações geradas
ainda exigem revisão humana ou um avaliador separado.

## Atividade final HTML opcional

Quando solicitado, responda sim para gerar `exhibit.html`. O Java SDK 1.0.11 fixado preserva campos
de permissão como `fileName`, portanto o manipulador de permissões estrito aprova uma gravação
somente quando seu caminho normalizado é exatamente `exhibit.html` neste diretório. Dados de caminho
ausentes, outros caminhos de arquivo e solicitações que não são de gravação continuam negados; não
há fallback amplo de gravação.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
