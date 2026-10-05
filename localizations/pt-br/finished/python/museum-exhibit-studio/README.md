# Museum Exhibit Studio

Este exemplo em Python usa o GitHub Copilot SDK como um estúdio focado para exposições de museu. O
aplicativo finalizado tem três módulos:

- `curator.py` contém os auxiliares prontos do workshop: conjuntos de fatos aprovados e
  o menu de seleção de fatos, validação delimitada de fatos, streaming, verificações
  estruturais determinísticas, permissões do Wikipedia com escopo definido, permissão
  com escopo definido para escrita de `exhibit.html`, texto de prompt fixo e a mensagem de falha.
- `system_messages.py` contém as mensagens de sistema prontas do curador e da pesquisa.
- `main.py` contém o código do SDK escrito pelo aluno: as instruções nos prompts da
  exposição e da página, configuração da sessão, o executor da sessão, validação e
  geração HTML opcional.

Os comentários `>>> BEGIN` / `<<< END` em `main.py` são as regiões nomeadas que as lições preenchem.
Cada linha `BEGIN` lista as etapas que inserem ou substituem essa região.

## Execute o exemplo

A partir deste diretório, crie um ambiente e instale a dependência fixada:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Defina `COPILOT_MODEL` para selecionar um modelo; caso contrário, o runtime escolhe o padrão. É
necessário um GitHub Copilot CLI autenticado.

A pesquisa no Wikipedia requer Node.js porque a sessão de pesquisa inicia o pacote fixado
`wikipedia-mcp@1.0.3` por meio de `npx`. Recusar a pesquisa não inicia o servidor MCP.

Verifique o código-fonte sem contatar um modelo:

```powershell
python -m py_compile *.py
```

## O que o exemplo ensina

A geração sempre registra e inclui `approved_fact_lookup` na lista de permissões, que retorna os
fatos aprovados delimitados. Com uma pesquisa utilizável com citações, ela também registra e inclui
na lista de permissões a ferramenta local somente leitura `approved_wikipedia_fact_lookup` e
solicita as duas chamadas antes de escrever a narrativa e as perguntas dos visitantes. A segunda
consulta retorna um snapshot do corpo do resumo e das citações, não acesso ao Wikipedia ao vivo. Os
fatos aprovados têm precedência sobre a pesquisa suplementar. Ela também usa uma mensagem de sistema
do curador em modo de substituição, streaming, um tempo limite de 120 segundos e validação
estrutural determinística. Os módulos importados não têm efeitos colaterais; `main.py` só é
executado sob a guarda `if __name__ == "__main__"`.

A pesquisa opcional no Wikipedia é intencionalmente separada da geração. A sessão de pesquisa expõe
somente ferramentas MCP de pesquisa no Wikipedia e leitura de artigo com escopo definido, usa um
manipulador de permissões que nega por padrão, solicita um resumo em prosa e analisa uma lista final
`## Sources`. O resumo e as citações são mantidos para a consulta local, mas nunca mesclados aos
fatos aprovados pelo educador. "Aprovado" significa pesquisa aceita pelo aplicativo, não fatos
verificados por humanos; trate-a como dados, não instruções. A pesquisa recusada mantém o caminho
com uma única ferramenta. Pesquisa com falha ou um resumo citado inutilizável imprime um aviso e usa
o mesmo fallback. Não há contrato JSON estrito de pesquisa nem ciclo de aprovação de adições
propostas.

Após a validação, a etapa final HTML opcional expõe somente `builtin:apply_patch` e `builtin:create`
e aprova a escrita exatamente de `exhibit.html` no diretório de trabalho do aplicativo. O prompt
solicita um único arquivo HTML semântico independente com CSS e JavaScript incorporados, uma
ressalva de revisão humana e um filtro de perguntas acessível.

As orientações do prompt e a validação estrutural não são limites de autorização nem de
fundamentação. As afirmações geradas ainda exigem revisão humana ou um avaliador separado.

## Verificação manual

1. Execute com cada conjunto de fatos incluído e confirme que os fatos selecionados são impressos antes
   da geração.
2. Confirme que a exposição tem um título, uma narrativa de 100-140 palavras e três
   perguntas dos visitantes.
3. Inspecione o resumo de validação e a ressalva de fundamentação.
4. Recuse a pesquisa e confirme que o único evento de ferramenta é `approved_fact_lookup`.
5. Opte pela pesquisa e confirme que ambos os eventos de consulta local aparecem antes da geração e que as fontes
   são impressas após a exposição, não dentro dela.
6. Opte por `exhibit.html` e confirme que apenas esse arquivo é escrito.

Este é o aplicativo com que um aluno termina após as lições de museu, não uma arquitetura de
referência separada. O ponto de entrada mantém um pequeno executor de sessão que inicia o cliente,
cria a sessão, impõe o tempo limite, rejeita saída em branco e limpa os recursos em todos os
caminhos; as etapas de pesquisa, geração e HTML opcional o reutilizam com configurações de sessão
diferentes. Siga a trilha a partir de [`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
