# SDK 101 starter: Go

Requires [Go 1.24 or newer](https://go.dev/dl/) and authenticated Copilot access.

From the workshop repository root:

```shell
cd start-intro/go
go mod download
```

Open this folder in your editor (`code .`) and edit `main.go` by following the
four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One. Then run:

```shell
go run .
```

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse
`helpers.go` and `permission_prompt.go` without editing them.

Run `go build -mod=readonly ./...` to compile without sending a Copilot prompt.
See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official Go SDK API](https://github.com/github/copilot-sdk/tree/main/go)
for reference.
