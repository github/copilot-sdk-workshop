# Projet de départ SDK 101 : Go

Nécessite [Go 1.24 ou version ultérieure](https://go.dev/dl/) et un accès Copilot authentifié.

Depuis la racine du dépôt de l'atelier :

```shell
cd start-intro/go
go mod download
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez `main.go` en suivant les quatre
modifications numérotées de [LIVE_DEMO.md](LIVE_DEMO.md), acte un. Exécutez ensuite :

```shell
go run .
```

Le point d'entrée intact est volontairement incomplet, ce n'est pas un Hello World fonctionnel.
Continuez avec l'acte deux du même guide pour l'agent de podcast. Réutilisez `helpers.go` et
`permission_prompt.go` sans les modifier.

Exécutez `go build -mod=readonly ./...` pour compiler sans envoyer de prompt Copilot. Consultez la
[préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et la résolution
des problèmes, ainsi que
l'[API officielle Go SDK](https://github.com/github/copilot-sdk/tree/main/go) comme référence.
