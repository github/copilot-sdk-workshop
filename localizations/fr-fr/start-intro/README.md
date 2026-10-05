# Projets de départ SDK 101

Les projets de départ complets de l'atelier SDK 101 de 30 minutes se trouvent ici. Clonez **ce dépôt
d'atelier une seule fois**, choisissez un langage et modifiez son point d'entrée sur place. Il n'y a
aucun dépôt séparé à cloner ni projet à copier.

| Langage | Prérequis | Notes du projet de départ | Guide de démonstration | Point d'entrée |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [Configuration](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [Configuration](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [Configuration](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [Configuration](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [Configuration](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [Configuration](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

Terminez la [préparation](../workshop/intro-00-preflight.md) avant la session chronométrée.
Authentifiez-vous avec `copilot auth login`, placez-vous dans `start-intro/<language>`, et ouvrez ce
dossier dans votre éditeur (`code .` pour VS Code). Restez dans ce dossier pour les commandes de
dépendances et d'exécution.

Les points d'entrée contiennent volontairement des espaces réservés. Ouvrez **`LIVE_DEMO.md`** à
côté du point d'entrée choisi. Suivez les **quatre modifications de l'acte un** : démarrez le
client, vérifiez l'authentification, créez la session et envoyez Hello World. Suivez ensuite
l'**acte deux** pour choisir un modèle et un épisode, accorder ses capacités à la session et
remplacer le prompt.

Le site web de l'atelier affiche ces mêmes sections de guide dans sa
[leçon Hello World](../workshop/intro-02-hello-world.md) et sa
[leçon podcast](../workshop/intro-03-podcast-agent.md) ; il n'enseigne pas une implémentation
différente. Ces utilitaires incluent la sélection du modèle et de l'épisode, des outils typés de
recherche RSS et l'approbation interactive des outils. Gardez-les inchangés pendant l'atelier.

Les dépendances et les lockfiles disponibles sont inclus. Les compilations de vérification rapide
n'ont pas besoin d'authentification Copilot ni de prompt actif. L'exécution de l'application
terminée nécessite un accès Copilot ; le workflow de podcast nécessite aussi l'accès au flux RSS
officiel. Vos modifications sur place apparaissent dans `git status`, ce qui est attendu.

## Source

Ces sources de départ et guides `LIVE_DEMO.md` ont été importés depuis
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro) à la
révision [`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97).
Les guides conservent la progression en deux actes de la source et les quatre modifications Hello
World numérotées. Les adaptations locales utilisent les chemins de ce dépôt, limitent les attentes
de complétion, ferment les ressources SDK, restreignent Hello World à une liste d'autorisation
d'outils vide et fournissent les abonnements de streaming Java/Rust manquants. Go conserve un seul
abonnement au lieu d'afficher chaque fragment de texte deux fois. Node.js laisse l'envoi limité
propager les erreurs de session au lieu de lever une exception depuis un callback. Son utilitaire
RSS utilise un décodage XML basé sur un analyseur et une extraction HTML vers texte brut, avec des
tests de régression pour CDATA, le décodage des entités et l'exclusion de script/style. Les six
utilitaires RSS utilisent des délais réseau finis de dix secondes. Java rejette les déclarations XML
DOCTYPE et les ressources externes lors de la lecture des métadonnées de durée avec espace de noms.
Python et Rust reconnaissent les charges utiles d'autorisation d'outils personnalisés du SDK ; Rust
lit les approbations sur un thread d'entrée détaché afin qu'un délai d'expiration de tour puisse
quand même arrêter le runtime. Le dépôt amont sert d'attribution, pas de prérequis de configuration.
