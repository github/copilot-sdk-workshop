# Proyecto inicial de SDK 101: Go

Requiere [Go 1.24 o posterior](https://go.dev/dl/) y acceso autenticado a Copilot.

Desde la raíz del repositorio del taller:

```shell
cd start-intro/go
go mod download
```

Abre esta carpeta en tu editor (`code .`) y edita `main.go` siguiendo las cuatro ediciones numeradas
de [LIVE_DEMO.md](LIVE_DEMO.md), primer acto. Después, ejecuta:

```shell
go run .
```

El punto de entrada sin tocar está incompleto de forma deliberada, no es un Hello World funcional.
Continúa con el segundo acto de la misma guía para el agente de pódcast. Reutiliza `helpers.go` y
`permission_prompt.go` sin editarlos.

Ejecuta `go build -mod=readonly ./...` para compilar sin enviar un prompt de Copilot. Consulta la
[preparación](../../workshop/intro-00-preflight.md) para comprobaciones de acceso y solución de
problemas, y la [API oficial del SDK de Go](https://github.com/github/copilot-sdk/tree/main/go) como
referencia.
