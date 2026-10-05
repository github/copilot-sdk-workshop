# Projets de départ de l'atelier

Choisissez le dossier correspondant au langage sélectionné sur la page d'accueil de l'atelier, puis
travaillez directement dedans. Il n'y a aucune étape de copie. Placez-vous dans ce dossier, ouvrez
le même dossier dans votre éditeur (`code .` depuis celui-ci, ou toute autre commande d'ouverture de
dossier de votre éditeur), et restez-y pour chaque commande. Les projets de départ sont
volontairement des échafaudages minimaux. Le catalogue Web Content Accessibility Guidelines (WCAG)
propre à l'application et les utilitaires de lecteur d'instantanés/d'autorisations limitées peuvent
être présents pour les leçons ultérieures, mais leurs points d'entrée exécutables ne branchent aucun
client Copilot, session, flux de streaming, outil local, serveur MCP ni rapport avant l'étape
correspondante.

| Langage | Prérequis | Changer de dossier et vérifier |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper inclus) | `cd start-accessibility/java && ./mvnw compile` |

Comme vous modifiez ces fichiers sur place, votre travail apparaît dans `git status`. C'est attendu.
Exécutez `git checkout -- .` depuis la racine du dépôt pour restaurer un projet de départ propre.
Les parcours Go, Rust et Java nécessitent la
[GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) dans
`PATH` lorsque vous exécuterez l'application plus tard. La configuration du SDK et les références
d'API sont disponibles dans le [dépôt officiel Copilot SDK](https://github.com/github/copilot-sdk)
et le [cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook).

Restez dans le dossier de votre projet de départ pendant tout l'atelier. Revenez à la visionneuse
interactive depuis la [page d'accueil de l'atelier](../README.md#démarrer-latelier) ; n'ouvrez pas
directement le Markdown des leçons.
