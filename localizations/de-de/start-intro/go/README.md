# SDK 101-Starterprojekt: Go

Erfordert [Go 1.24 oder neuer](https://go.dev/dl/) und authentifizierten Copilot-Zugriff.

Aus dem Stamm des Workshop-Repositorys:

```shell
cd start-intro/go
go mod download
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie `main.go`, indem Sie den vier
nummerierten Bearbeitungen in [LIVE_DEMO.md](LIVE_DEMO.md), Erster Akt, folgen. Führen Sie dann
Folgendes aus:

```shell
go run .
```

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem zweiten Akt für den Podcast-Agenten fort. Verwenden Sie
`helpers.go` und `permission_prompt.go` wieder, ohne sie zu bearbeiten.

Führen Sie `go build -mod=readonly ./...` aus, um zu kompilieren, ohne einen Copilot-Prompt zu
senden. Siehe [Vorbereitung](../../workshop/intro-00-preflight.md) für Zugriffsprüfungen und
Problembehandlung sowie die
[offizielle Go SDK-API](https://github.com/github/copilot-sdk/tree/main/go) als Referenz.
