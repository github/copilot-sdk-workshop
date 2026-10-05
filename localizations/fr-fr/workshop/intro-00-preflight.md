# Préparation : préparez-vous pour SDK 101

> **Durée :** Préparation non chronométrée, avant l'atelier de 30 minutes

## Ce que vous allez créer

Commencez par un Hello World en streaming, puis transformez-le en petit assistant de lancement pour
The GitHub Podcast. Vous écrivez la connexion au SDK et la configuration de session ; le projet de
départ inclut déjà les outils de recherche d'épisodes et les utilitaires de sélection dans le
terminal.

Les quatre leçons chronométrées totalisent **30 minutes** : bases du SDK (5), Hello World (10),
agent de podcast (12) et récapitulatif (3). Terminez l'installation, l'authentification et le
téléchargement des dépendances à l'avance afin que la session reste centrée sur le SDK.

## Vérifiez votre accès

Vous avez besoin de Git, d'un éditeur, d'un terminal, d'un accès réseau et d'un abonnement ou essai
GitHub Copilot actif avec accès à un modèle pris en charge. Installez le
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli), puis exécutez
ces commandes dans votre terminal :

```shell
git --version
copilot --version
copilot auth login
```

Terminez la connexion dans le navigateur si elle est demandée. Utilisez le même compte et le même
environnement de terminal pour l'atelier. Ne collez pas de jetons dans vos fichiers source.
L'exemple de podcast nécessite également l'accès au
[flux RSS officiel](https://feeds.simplecast.com/ioCY0vfY).

## Récupérez le projet de départ

Les six projets de départ SDK 101 et leurs utilitaires prêts à l'emploi sont inclus dans
`start-intro/` dans **ce dépôt d'atelier**. Clonez-le une fois :

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Si vous avez déjà cloné ce dépôt, utilisez cette copie de travail ; ne clonez pas un autre dépôt et
ne copiez pas de projet de départ. Choisissez juste un langage ci-dessous. Toutes les commandes
partent de la racine de ce dépôt. Installez uniquement le runtime de ce langage. Conservez les
versions existantes des dépendances ; vous n'avez pas besoin de générer un projet ni de réinstaller
le SDK.

Chaque dossier de langage contient aussi **`LIVE_DEMO.md`**. Ouvrez-le à côté du point d'entrée.
Pendant la session chronométrée, effectuez les quatre modifications numérotées de l'Acte un,
exécutez Hello World, puis continuez avec l'Acte deux dans le même fichier et la même application.

:::language dotnet
### Préparez .NET

Installez le [SDK .NET 10](https://learn.microsoft.com/dotnet/core/install/).

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

Ouvrez `start-intro/dotnet` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`Program.cs`. Plus tard, vous exécuterez `dotnet run` depuis ce dossier.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)
pour savoir comment détecter le CLI, notamment `COPILOT_CLI_BINARY_PATH` si le téléchargement du
runtime intégré est bloqué.
:::

:::language nodejs
### Préparez Node.js

Installez [Node.js 22.12 ou une version plus récente](https://nodejs.org/).

```shell
node --version
cd start-intro/nodejs
npm ci
```

Ouvrez `start-intro/nodejs` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`src/index.ts`. Plus tard, vous exécuterez `npm start` depuis ce dossier.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::

:::language python
### Préparez Python

Installez [Python 3.11 ou une version plus récente](https://www.python.org/downloads/). Utilisez un
environnement isolé. Dans Windows PowerShell :

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Sur macOS/Linux :

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Ouvrez `start-intro/python` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`main.py`. Nous utilisons directement l'interpréteur de l'environnement dans les leçons ;
l'activation et les changements de stratégie d'exécution PowerShell sont donc inutiles.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::

:::language go
### Préparez Go

Installez [Go 1.24 ou une version plus récente](https://go.dev/dl/).

```shell
go version
cd start-intro/go
go mod download
```

Ouvrez `start-intro/go` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`main.go`. Plus tard, vous exécuterez `go run .` depuis ce dossier.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::

:::language java
### Préparez Java

Installez [Java 17 ou une version plus récente](https://adoptium.net/). Aucune installation Maven
distincte n'est nécessaire : le projet de départ inclut le Maven Wrapper (`./mvnw`), qui télécharge
la bonne version de Maven lors de la première utilisation. Sous Windows, exécutez `mvnw.cmd` au lieu
de `./mvnw`.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

Ouvrez `start-intro/java` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`src/main/java/demo/CopilotSdkLiveDemo.java`. Plus tard, vous exécuterez `./mvnw compile exec:java`
depuis ce dossier.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::

:::language rust
### Préparez Rust

Installez [Rust 1.94 ou une version plus récente](https://rustup.rs/). Sous Windows, la chaîne
d'outils MSVC par défaut nécessite aussi les outils de compilation C++ et le Windows SDK décrits
dans le [guide d'installation de Rust](https://doc.rust-lang.org/book/ch01-01-installation.html).
Terminez cette configuration avant la session.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Ouvrez `start-intro/rust` dans votre éditeur (`code .` pour VS Code). Votre point d'entrée est
`src/main.rs`. Plus tard, vous exécuterez `cargo run --locked` depuis ce dossier. La vérification
préalable préchauffe le cache de compilation ; prévoyez du temps de préparation supplémentaire pour
la première compilation des dépendances Rust.

Consultez le [README du projet de départ](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Vérification de préparation

Vous êtes prêt lorsque l'authentification est terminée, que les dépendances sont téléchargées et que
le point d'entrée sélectionné est ouvert dans votre éditeur. Le point d'entrée non modifié est
**délibérément incomplet** : des espaces réservés peuvent empêcher la compilation ou afficher un
message d'authentification sans vérifier votre connexion réelle. Ne considérez pas cela comme une
application fonctionnelle. La leçon Hello World les complète.

Laissez les fichiers utilitaires du projet de départ inchangés. Vous faites évoluer le projet sur
place dans `start-intro/` ; vos modifications apparaissent dans `git status`, ce qui est attendu.

## Dépannage avant la session

- **CLI introuvable :** terminez l'installation du CLI et rouvrez votre terminal. Suivez
  le README du projet de départ de votre langage si le SDK ne peut pas localiser l'exécutable natif.
- **Échec de la connexion :** vérifiez votre abonnement, la stratégie de votre organisation et le compte du
  navigateur avant la session. Une connexion réussie à elle seule ne garantit pas l'accès au modèle.
- **Échec du téléchargement des dépendances :** résolvez dès maintenant les problèmes d'accès au proxy ou au registre de packages.
  Ne remplacez pas les dépendances épinglées par des versions du SDK sans rapport.
- **Flux RSS bloqué :** résolvez l'accès au flux officiel avant la leçon sur le podcast.
  N'utilisez pas de faits d'épisode inventés à la place.

Continuez avec [Les bases du SDK](intro-01-sdk-basics.md).

## En savoir plus

- [Projets de départ d'introduction inclus](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [Copilot SDK officiel](https://github.com/github/copilot-sdk)
