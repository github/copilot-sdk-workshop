# Museum Exhibit Studio

Este exemplo concluído em Node.js/TypeScript tem três arquivos-fonte:

- `src/curator.ts` contém o módulo auxiliar pronto: fatos aprovados e o
  menu de seleção de fatos, streaming delimitado, validação determinística, permissões da Wikipedia
  com escopo definido, a permissão opcional de gravação em `exhibit.html`, texto fixo de prompt e
  a mensagem de falha.
- `src/system-messages.ts` contém as mensagens de sistema prontas de curador e pesquisa.
- `src/index.ts` contém o código do SDK escrito pelo aluno: as instruções nos
  prompts de exposição e página, configurações de sessão, o executor de sessão, pesquisa opcional,
  geração, validação e a atividade final HTML opcional.

Os comentários `>>> BEGIN` / `<<< END` em `src/index.ts` são as regiões nomeadas que as lições
preenchem. Cada linha `BEGIN` lista as etapas que inserem ou substituem aquela região.

## Execute o exemplo

```bash
cd finished/nodejs/museum-exhibit-studio
npm ci
npm start
```

Use `npm run build` para verificar tipos sem contatar um modelo.

## Estrutura de segurança

A geração sempre registra e inclui `approved_fact_lookup` na lista de permissões, que retorna fatos
aprovados delimitados. Com uma pesquisa utilizável com citações, ela também registra e inclui na
lista de permissões a ferramenta local somente leitura `approved_wikipedia_fact_lookup` e pede ao
curador que chame ambas antes de escrever a narrativa e as perguntas dos visitantes. A segunda
consulta retorna um snapshot do corpo da pesquisa e das citações, não acesso ao Wikipedia ao vivo.
Os fatos aprovados têm precedência; a pesquisa é dado suplementar, não instruções nem fatos
verificados por humanos. A pesquisa opcional no Wikipedia é executada em uma sessão separada com
ferramentas `search` e `readArticle` com escopo definido, um manipulador de permissões que nega por
padrão, uma seção `## Sources` com citações e nenhum contrato JSON nem ciclo de aprovação de adições
propostas. A pesquisa nunca é mesclada aos fatos aprovados pelo educador. A pesquisa recusada mantém
o caminho com uma única ferramenta; pesquisa com falha ou um resumo citado inutilizável imprime um
aviso e usa o mesmo fallback. As fontes ainda são impressas depois da exposição. Em uma execução de
pesquisa bem-sucedida, confirme que ambos os eventos de consulta local aparecem antes da geração.

Após a geração, verificações determinísticas relatam estrutura, tamanho da narrativa, perguntas dos
visitantes e vocabulário proibido. Se selecionada, a etapa HTML expõe somente `builtin:apply_patch`
e `builtin:create`. Seu manipulador de permissões aprova a escrita exatamente de `exhibit.html` no
diretório do aplicativo. As verificações estruturais não comprovam fundamentação factual; revise as
afirmações pesquisadas antes de publicar.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
