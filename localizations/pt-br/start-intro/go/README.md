# Projeto inicial do SDK 101: Go

Requer [Go 1.24 ou mais recente](https://go.dev/dl/) e acesso autenticado ao Copilot.

A partir da raiz do repositório do workshop:

```shell
cd start-intro/go
go mod download
```

Abra esta pasta no editor (`code .`) e edite `main.go` seguindo as quatro edições numeradas em
[LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Depois execute:

```shell
go run .
```

O ponto de entrada intacto é deliberadamente incompleto, não um Hello World funcional. Continue com
o Ato dois no mesmo guia para o agente de podcast. Reutilize `helpers.go` e `permission_prompt.go`
sem editá-los.

Execute `go build -mod=readonly ./...` para compilar sem enviar um prompt ao Copilot. Consulte a
[preparação](../../workshop/intro-00-preflight.md) para verificações de acesso e solução de
problemas, e a [API oficial do SDK para Go](https://github.com/github/copilot-sdk/tree/main/go) como
referência.
