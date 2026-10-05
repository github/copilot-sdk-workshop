# Projetos iniciais do SDK 101

Os projetos iniciais completos para o workshop SDK 101 de 30 minutos ficam aqui. Clone **este
repositório do workshop uma vez**, escolha uma linguagem e edite seu ponto de entrada no local. Não
há repositório separado para clonar nem projeto para copiar.

| Linguagem | Pré-requisito | Notas do projeto inicial | Guia de demo | Ponto de entrada |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [Configuração](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [Configuração](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [Configuração](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [Configuração](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [Configuração](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [Configuração](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

Conclua a [preparação](../workshop/intro-00-preflight.md) antes da sessão cronometrada.
Autentique-se com `copilot auth login`, entre em `start-intro/<language>` e abra essa pasta no
editor (`code .` para VS Code). Permaneça nessa pasta para comandos de dependência e execução.

Os pontos de entrada contêm placeholders intencionalmente. Abra **`LIVE_DEMO.md`** ao lado do ponto
de entrada escolhido. Siga **as quatro edições do Ato um**: iniciar o cliente, verificar a
autenticação, criar a sessão e enviar Hello World. Depois siga o **Ato dois** para escolher um
modelo e episódio, conceder capacidades à sessão e substituir o prompt.

O site do workshop exibe estas mesmas seções de guia em sua
[lição Hello World](../workshop/intro-02-hello-world.md) e
[lição de podcast](../workshop/intro-03-podcast-agent.md); ele não ensina uma implementação
diferente. Esses auxiliares incluem seleção de modelo e episódio, ferramentas tipadas de consulta
RSS e aprovação interativa de ferramentas. Mantenha-os inalterados durante o workshop.

As dependências e os arquivos de lock disponíveis estão incluídos. Compilações de smoke test não
precisam de autenticação do Copilot nem de um prompt ao vivo. Executar o aplicativo concluído exige
acesso ao Copilot; o fluxo de trabalho de podcast também precisa de acesso ao feed RSS oficial. Suas
edições no local aparecem em `git status`, o que é esperado.

## Fonte

Esses códigos-fonte iniciais e guias `LIVE_DEMO.md` foram importados de
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro) na revisão
[`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97).
Os guias mantêm a progressão em dois atos e as quatro edições numeradas de Hello World da origem. As
adaptações locais usam os caminhos deste repositório, delimitam as esperas de conclusão, fecham
recursos do SDK, restringem Hello World a uma lista de permissões de ferramentas vazia e fornecem as
assinaturas de streaming ausentes para Java/Rust. Go mantém uma assinatura em vez de imprimir cada
fragmento de texto duas vezes. Node.js deixa o envio delimitado propagar erros de sessão em vez de
lançar de um callback. Seu auxiliar RSS usa decodificação XML baseada em parser e extração de HTML
para texto simples, com testes de regressão para CDATA, decodificação de entidades e exclusão de
script/style. Todos os seis auxiliares RSS usam tempos limite de rede finitos de dez segundos. Java
rejeita declarações DOCTYPE XML e recursos externos ao ler metadados de duração com namespace.
Python e Rust reconhecem os payloads de permissão de ferramenta personalizada do SDK; Rust lê
aprovações em uma thread de entrada destacada para que um tempo limite de turno ainda possa encerrar
o runtime. O repositório upstream é atribuição, não um requisito de configuração.
