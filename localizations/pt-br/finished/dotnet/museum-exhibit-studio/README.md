# Museum Exhibit Studio

Este exemplo .NET concluído usa o GitHub Copilot SDK para gerar uma pequena exposição de museu a
partir de fatos aprovados. Os arquivos prontos `Helpers/Curator*.cs` fornecem conjuntos de fatos e o
menu de seleção de fatos, verificação de limites, streaming, validação determinística, permissões da
Wikipedia com escopo definido, permissão de gravação em `exhibit.html` com escopo definido, texto
fixo de prompt e a mensagem de falha, e `Helpers/CuratorSystemMessages.cs` contém as mensagens de
sistema de curador e pesquisa. `Program.cs` permanece escrito pelo aluno: ele escreve as instruções
nos prompts de exposição e página, cria as três configurações de sessão e executa cada uma por meio
de um executor de sessão.

Os comentários `>>> BEGIN` / `<<< END` em `Program.cs` são as regiões nomeadas que as lições
preenchem. Cada linha `BEGIN` lista as etapas que inserem ou substituem aquela região, portanto o
arquivo mostra qual etapa produziu cada parte.

## Execute o exemplo

A partir da raiz do repositório:

```bash
dotnet run --project finished/dotnet/museum-exhibit-studio
```

Defina `COPILOT_MODEL` antes de executar para selecionar um modelo. Caso contrário, o runtime do
Copilot escolhe seu padrão. O exemplo exige um GitHub Copilot CLI autenticado.

Compile sem contatar um modelo:

```bash
dotnet build finished/dotnet/museum-exhibit-studio
```

## O que o exemplo ensina

A sessão de geração sempre registra e adiciona à lista de permissões a ferramenta pertencente ao
aplicativo `approved_fact_lookup`. Quando existe pesquisa citada utilizável, ela também registra e
adiciona à lista de permissões `approved_wikipedia_fact_lookup`, e o prompt solicita ambas as
chamadas antes de escrever a narrativa e as perguntas para visitantes. Uma mensagem de sistema em
modo de substituição dá precedência aos fatos aprovados e trata os resultados da ferramenta como
dados, não instruções. `CuratorFacts.CreateApprovedFactLookup` delimita esses fatos antes que o
modelo possa vê-los, `CuratorFacts.BoundFacts` corta e valida fatos antes de cada envio de geração
ou pesquisa, e `CuratorStreamer.StreamExhibitAsync` transmite a saída do modelo em streaming com
tempos limite explícitos.

A pesquisa opcional da Wikipedia é intencionalmente leve: uma sessão separada expõe apenas
ferramentas MCP `search` e `readArticle` com escopo definido por meio de
`CuratorSafety.WikipediaPermissionHandler`. O modelo escreve notas em prosa e uma lista final
`## Sources`. O aplicativo extrai os títulos e URLs das fontes citadas e retém o corpo do resumo.
`CuratorFacts.CreateApprovedWikipediaFactLookup` retorna uma captura desse corpo e das citações sem
acesso à rede. A pesquisa é suplementar e nunca é mesclada aos fatos aprovados por educadores;
"approved" significa aceito pelo aplicativo, não verificado por humanos. Pesquisas recusadas mantêm
o caminho de ferramenta única. Pesquisa com falha ou um resumo sem citações imprime um aviso e usa o
mesmo fallback. As fontes ainda são impressas após a exposição.

Após a geração, a validação determinística verifica o título, `## Narrative`, o tamanho da narrativa
de 100-140 palavras, `## Visitor questions`, exatamente três perguntas numeradas, pontos de
interrogação e vocabulário proibido. Essas verificações estruturais não comprovam fundamentação
factual, portanto a revisão humana continua necessária.

A atividade final opcional cria `exhibit.html` com `builtin:apply_patch` ou `builtin:create`.
`CuratorSafety.ExhibitWritePermission` permite apenas esse único arquivo no diretório de trabalho do
aplicativo e rejeita qualquer outra solicitação de gravação, shell ou MCP.

## Verificação manual

1. Execute o exemplo e aceite um dos conjuntos de fatos incluídos.
2. Opte pela pesquisa e confirme que ambos os eventos de consulta local aparecem antes da exposição e que as fontes
   são impressas depois dela. Recuse a pesquisa e confirme que apenas `approved_fact_lookup` é chamado.
3. Confirme que a exposição contém um título, uma narrativa de 100-140 palavras e três perguntas.
4. Confirme que o resumo de validação e a ressalva de revisão humana são exibidos.
5. Opcionalmente, gere `exhibit.html` e revise a página interativa autônoma em um navegador.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
