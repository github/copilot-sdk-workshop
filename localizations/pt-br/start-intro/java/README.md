# Projeto inicial do SDK 101: Java

Requer [Java 17 ou mais recente](https://adoptium.net/) e acesso autenticado ao Copilot. O Maven
Wrapper (`./mvnw`) está incluído, então nenhuma instalação separada do Maven é necessária. No
Windows, execute `mvnw.cmd` em vez de `./mvnw`.

A partir da raiz do repositório do workshop:

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

Abra esta pasta no seu editor (`code .`) e edite `src/main/java/demo/CopilotSdkLiveDemo.java`
seguindo as quatro edições numeradas em [LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Em seguida, execute:

```shell
./mvnw compile exec:java
```

O ponto de entrada intacto está deliberadamente incompleto, não é um Hello World funcional. Continue
com o Ato dois no mesmo guia para o agente de podcast. Reutilize as classes auxiliares de
ferramenta, seleção de modelo e permissão no pacote `demo`.

Execute `./mvnw compile` para compilar sem enviar um prompt do Copilot. Consulte a
[preparação](../../workshop/intro-00-preflight.md) para verificações de acesso e solução de
problemas, e a [API oficial do SDK Java](https://github.com/github/copilot-sdk/tree/main/java) para
referência.
