# Préparation : configurez votre machine

> **Préparation non chronométrée**  
> Terminez cette page avant de commencer l'atelier de 115 minutes.

## Ce que vous aurez préparé

À la fin de la préparation, vous aurez cloné le dépôt, authentifié le Copilot CLI, compilé le projet
de départ, et téléchargé Playwright MCP pour qu'il soit prêt.

Suivez les neuf étapes pratiques, y compris la sélection du modèle et le rapport HTML interactif,
puis terminez par une célébration et des ressources pour continuer à créer.

:::language dotnet
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | Compile et exécute l'application console C# | `dotnet --version` |
| [Node.js 22 ou version ultérieure](https://nodejs.org/) | Exécute le serveur MCP Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Fournit le runtime Copilot utilisé par le SDK | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ dotnet --version
10.0.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```
:::

:::language nodejs
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [Node.js 22.12 ou version ultérieure](https://nodejs.org/) | Exécute l'application d'atelier TypeScript et Playwright MCP | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | Installe `@github/copilot-sdk` et les outils de build | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Fournit le runtime Copilot utilisé par le SDK | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consultez le [guide d'installation officiel du SDK Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs).
:::

:::language python
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [Python 3.11 ou version ultérieure](https://www.python.org/downloads/) | Exécute l'application asynchrone de l'atelier | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | Installe la wheel `github-copilot-sdk` épinglée | `python -m pip --version` |
| [Node.js 22 ou version ultérieure](https://nodejs.org/) | Exécute le serveur MCP Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Remplacement facultatif du runtime local via `COPILOT_CLI_PATH` | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Le SDK Python peut télécharger un runtime épinglé lors de la première utilisation. Consultez le
[guide d'installation officiel du SDK Python](https://github.com/github/copilot-sdk/tree/main/python).
:::

:::language go
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [Go 1.24 ou version ultérieure](https://go.dev/dl/) | Compile et exécute le module Go de l'atelier | `go version` |
| [Node.js 22 ou version ultérieure](https://nodejs.org/) | Exécute le serveur MCP Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Requis dans `PATH` (ou `COPILOT_CLI_PATH`) pour le SDK | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consultez le
[guide d'installation officiel du SDK Go](https://github.com/github/copilot-sdk/tree/main/go).
:::

:::language rust
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [Rust 1.94 ou version ultérieure](https://rustup.rs/) | Compile le crate Rust asynchrone de l'atelier | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | Résout les dépendances verrouillées et exécute l'application | `cargo --version` |
| [Node.js 22 ou version ultérieure](https://nodejs.org/) | Exécute le serveur MCP Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Runtime utilisé lorsque vous ne vous appuyez pas uniquement sur un binaire fourni | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ rustc --version
rustc 1.94.x
$ cargo --version
cargo 1.94.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consultez le
[guide d'installation officiel du SDK Rust](https://github.com/github/copilot-sdk/tree/main/rust).
:::

:::language java
## Ce dont vous avez besoin

| Prérequis | Pourquoi l'atelier en a besoin | Vérification |
|---|---|---|
| [Java 17 ou version ultérieure](https://adoptium.net/) (JDK) | Compile et exécute l'application d'atelier Maven | `java -version` |
| [Node.js 22 ou version ultérieure](https://nodejs.org/) | Exécute le serveur MCP Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Requis dans `PATH` pour le runtime du SDK Java | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Autorise les requêtes Copilot | `copilot login` |
| Microsoft Edge (par défaut) ou Google Chrome | Permet à Playwright d'inspecter la page cible | Ouvrez le navigateur une fois avant l'atelier |

Vos commandes doivent renvoyer une sortie de cette forme :

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Aucune installation séparée de Maven n'est nécessaire : chaque projet Java inclut le Maven Wrapper
(`./mvnw`), qui télécharge la bonne version de Maven lors de la première utilisation. Sous Windows,
exécutez `mvnw.cmd` au lieu de `./mvnw`. Utilisez Maven pour ce parcours. Ne le remplacez pas par
JBang ou Gradle. Consultez le
[guide d'installation officiel du SDK Java](https://github.com/github/copilot-sdk/tree/main/java).
:::

## 1. Clonez le dépôt et choisissez votre projet de départ

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Vous travaillez **directement dans le dépôt**. Il n'y a pas d'étape de copie : vous accédez au
dossier du projet de départ pour votre langage et y restez pendant tout l'atelier. Cela signifie que
vous modifiez des fichiers suivis du dépôt ; vos changements apparaissent donc dans `git status`.
C'est normal. Si vous voulez retrouver un projet de départ propre, exécutez `git checkout -- .`
depuis la racine du dépôt pour abandonner vos modifications.

## 2. Authentifiez Copilot

Installez Copilot CLI avec la méthode indiquée dans le
[guide de configuration officiel](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli),
puis exécutez :

```bash
copilot login
```

Terminez le flux dans le navigateur afin que les appels SDK ultérieurs puissent atteindre GitHub Copilot.

## 3. Préparez Playwright MCP

Exécutez ceci une fois pour télécharger le package épinglé et afficher ses options sans démarrer de serveur :

```bash
npx -y @playwright/mcp@0.0.78 --help
```

La version du package est épinglée afin que tout le monde voie les mêmes noms d'outils et le même
comportement. Le code utilise Microsoft Edge avec `--browser=msedge`. Si vous avez plutôt préparé
Google Chrome, utilisez `--browser=chrome` lorsque l'argument apparaît à l'étape 4.

:::language dotnet
## 4. Placez-vous dans le projet de départ et compilez-le

Si `dotnet build` ne trouve pas Copilot CLI par la suite, définissez son chemin pour le terminal actuel :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Placez-vous dans le projet de départ .NET et compilez-le. Restez dans ce dossier pour chaque étape ultérieure :

```bash
cd start-accessibility/dotnet
dotnet build
```

Une compilation réussie se termine par :

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Vous travaillez dans `start-accessibility/dotnet` pour le reste de l'atelier ; gardez donc ce
terminal ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier
dans votre éditeur favori.

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `copilot` n'est pas reconnu | Redémarrez le terminal après l'installation, ou définissez `COPILOT_CLI_BINARY_PATH` avec la commande ci-dessus. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| La restauration NuGet n'arrive pas à joindre la source de packages | Vérifiez les paramètres de proxy ou de source de packages, puis exécutez `dotnet restore`. |
| `npx` n'est pas reconnu | Installez Node.js 22 ou une version plus récente et redémarrez le terminal. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** `dotnet build` réussit, `copilot login` est terminé, et la
> page cible s'ouvre.
:::

:::language nodejs
## 4. Placez-vous dans le projet de départ et compilez-le

Si le SDK ne trouve pas Copilot CLI par la suite, configurez-le pour utiliser votre installation dans le terminal actuel :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Placez-vous dans le projet de départ Node.js, installez les dépendances et vérifiez les types.
Restez dans ce dossier pour chaque étape ultérieure :

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

Une vérification des types réussie se termine sans erreur TypeScript (sortie vide de
`tsc --noEmit`). Le script de démarrage de `package.json` est `tsx src/index.ts`.

Vous travaillez dans `start-accessibility/nodejs` pour le reste de l'atelier ; gardez donc ce
terminal ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier
dans votre éditeur favori.

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `node` ou `npm` n'est pas reconnu | Installez Node.js 22.12 ou une version plus récente et redémarrez le terminal. |
| Avertissement sur la version de Node | Mettez à niveau vers Node.js 22.12+ ; le projet de départ déclare `"node": ">=22.12.0"`. |
| `npm install` échoue sur le fichier de verrouillage | Restez dans `start-accessibility/nodejs` et conservez `package-lock.json` ; ne le supprimez pas. |
| `copilot` n'est pas reconnu | Redémarrez le terminal après l'installation, ou définissez `COPILOT_CLI_PATH` avec la commande ci-dessus. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| `npx` ne peut pas télécharger Playwright MCP | Vérifiez l'accès réseau, puis relancez la commande de préparation de la section 3. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** `npm run build` réussit, `copilot login` est terminé, et la page
> cible s'ouvre.
:::

:::language python
## 4. Placez-vous dans le projet de départ et compilez-le

Facultatif : forcez le SDK à utiliser votre CLI installée au lieu de télécharger un runtime :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Placez-vous dans le projet de départ Python, créez un environnement virtuel, installez les
dépendances épinglées et vérifiez la compilation. Restez dans ce dossier pour chaque étape
ultérieure :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="venv-windows">
    <pre><code class="language-powershell">cd start-accessibility/python
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
  <div role="tabpanel" data-panel="venv-unix" hidden>
    <pre><code class="language-bash">cd start-accessibility/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
</div>

Une installation réussie affiche les packages résolus, dont `github-copilot-sdk==...`. Une
vérification de compilation réussie n'affiche aucune sortie. Gardez l'environnement virtuel activé
pour les étapes ultérieures.

Vous travaillez dans `start-accessibility/python` pour le reste de l'atelier ; gardez donc ce
terminal ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier
dans votre éditeur favori.

Vous pouvez aussi télécharger le runtime à l'avance maintenant afin que la première exécution de l'étape 1 soit plus rapide :

```bash
python -m copilot download-runtime
```

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `python` pointe vers Python 2 ou est manquant | Utilisez Python 3.11+ (`python3` sur macOS/Linux) et recréez le venv. |
| `pip install` n'arrive pas à joindre PyPI | Vérifiez les paramètres de proxy, puis relancez `python -m pip install -r requirements.txt`. |
| Versions de packages incorrectes | Installez uniquement depuis le `requirements.txt` épinglé ; n'assouplissez pas les contraintes `==`. |
| Le téléchargement du runtime échoue par la suite | Exécutez `python -m copilot download-runtime`, ou définissez `COPILOT_CLI_PATH` sur une CLI fonctionnelle. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| `npx` n'est pas reconnu | Installez Node.js 22 ou une version plus récente et redémarrez le terminal. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** les dépendances épinglées sont installées, `py_compile` réussit,
> `copilot login` est terminé, et la page cible s'ouvre.
:::

:::language go
## 4. Placez-vous dans le projet de départ et compilez-le

Le SDK Go s'attend à trouver Copilot CLI dans `PATH`, ou via `COPILOT_CLI_PATH` :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Placez-vous dans le projet de départ Go et compilez-le en imposant le verrouillage. Restez dans ce
dossier pour chaque étape ultérieure :

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

Une compilation réussie n'affiche aucune erreur et produit un binaire dans le dossier du projet de
départ. Conservez `go.sum` intact afin que la résolution des modules reste déterministe.

Vous travaillez dans `start-accessibility/go` pour le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur favori.

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `go: go.mod requires go >= 1.24` | Installez Go 1.24 ou une version plus récente et rouvrez le terminal. |
| `missing go.sum entry` | Restaurez le `go.sum` versionné ; compilez avec `-mod=readonly` au lieu de réécrire le verrou. |
| Téléchargement des modules bloqué | Configurez `GOPROXY`/l'accès au proxy, puis réessayez la compilation depuis le dossier du projet de départ. |
| `copilot` n'est pas reconnu | Installez la CLI, redémarrez le terminal, ou définissez `COPILOT_CLI_PATH`. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| `npx` n'est pas reconnu | Installez Node.js 22 ou une version plus récente et redémarrez le terminal. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** `go build -mod=readonly ./...` réussit, `copilot login` est terminé, et
> la page cible s'ouvre.

Comparez avec [`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)
si vous voulez un point de référence ultérieur après l'étape 1.
:::

:::language rust
## 4. Placez-vous dans le projet de départ et compilez-le

Si le démarrage du runtime ne parvient pas à localiser Copilot CLI par la suite, définissez `COPILOT_CLI_PATH` :

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS ou Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Placez-vous dans le projet de départ Rust et vérifiez-le avec le fichier de verrouillage. Restez
dans ce dossier pour chaque étape ultérieure :

```bash
cd start-accessibility/rust
cargo check --locked
```

Une vérification réussie se termine par une ligne `Finished` et aucune erreur. Gardez `Cargo.lock`
versionné afin que le graphe des crates reste verrouillé.

Vous travaillez dans `start-accessibility/rust` pour le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur favori.

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `rustc 1.xx is too old` | Installez Rust 1.94+ avec `rustup update` et rouvrez le terminal. |
| Incompatibilité du fichier de verrouillage avec `--locked` | Conservez le `Cargo.lock` du projet de départ ; n'exécutez pas `cargo update` sans contrainte. |
| Téléchargement des crates bloqué | Vérifiez l'accès réseau/proxy à crates.io, puis réessayez `cargo check`. |
| Le runtime ne peut pas démarrer par la suite | Installez et authentifiez `copilot`, ou définissez `COPILOT_CLI_PATH`. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| `npx` n'est pas reconnu | Installez Node.js 22 ou une version plus récente et redémarrez le terminal. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** `cargo check --locked` réussit, `copilot login` est terminé, et la
> page cible s'ouvre.

Comparez avec [`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)
si vous voulez un point de référence ultérieur après l'étape 1.
:::

:::language java
## 4. Placez-vous dans le projet de départ et compilez-le

Le SDK Java s'attend à trouver Copilot CLI dans `PATH` au démarrage de l'application. Vérifiez-le
avant de compiler :

```bash
copilot --version
```

Placez-vous dans le projet de départ Java et compilez-le avec Maven. Restez dans ce dossier pour chaque étape ultérieure :

```bash
cd start-accessibility/java
./mvnw compile
```

Une compilation réussie se termine par :

```text
[INFO] BUILD SUCCESS
```

Le `pom.xml` configure déjà `exec-maven-plugin` avec `mainClass` `workshop.AccessibilityReport`.
Restez avec Maven pour ce parcours.

Vous travaillez dans `start-accessibility/java` pour le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur favori.

Ouvrez la page cible contrôlée une fois pour vérifier que vous pouvez y accéder :

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Dépannage de la préparation</summary>

| Symptôme | Correction |
|---|---|
| `java` n'est pas reconnu | Installez JDK 17+, puis redémarrez le terminal. |
| `./mvnw: Permission denied` | Exécutez `chmod +x mvnw`, ou utilisez plutôt `sh mvnw`. Sous Windows, utilisez `mvnw.cmd`. |
| Erreurs de version cible du compilateur | Vérifiez que `java -version` indique 17 ou une version plus récente ; le POM définit `maven.compiler.release` sur 17. |
| Le téléchargement des dépendances échoue | Vérifiez les paramètres de Maven Central / proxy, puis relancez `./mvnw compile`. |
| Tenté de changer d'outil | Ne remplacez pas Maven par JBang ou Gradle pour cet atelier. |
| `copilot` n'est pas reconnu | Installez la CLI, redémarrez le terminal et vérifiez `copilot --version`. |
| Copilot vous demande de vous authentifier | Exécutez `copilot login`, terminez le parcours dans le navigateur, puis réessayez. |
| `npx` n'est pas reconnu | Installez Node.js 22 ou une version plus récente et redémarrez le terminal. |
| Le navigateur ne peut pas démarrer par la suite | Installez Edge ou Chrome, ou suivez la [configuration du navigateur Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Commencez l'étape 1 lorsque :** `./mvnw compile` affiche `BUILD SUCCESS`, `copilot login` est terminé, et la
> page cible s'ouvre.

Comparez avec [`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)
si vous voulez un point de référence ultérieur après l'étape 1.
:::

## En savoir plus

Le SDK que vous allez installer est documenté en dehors de cet atelier. Ces pages sont celles qui
méritent d'être ajoutées à vos favoris avant l'étape 1.

- [Guides pratiques du GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk) : la documentation SDK
  de GitHub, y compris les prérequis que cette préparation reprend.
- [Carte de la documentation du Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md) :
  l'index pour la configuration, l'authentification, les fonctionnalités et le dépannage.
- [Configuration par défaut : la CLI incluse](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md) :
  comment le SDK localise et démarre Copilot CLI, et comment lui indiquer un autre binaire.
- [Guide de débogage](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md) :
  le premier endroit à consulter lorsqu'une exécution échoue avant de produire la moindre sortie.

:::language dotnet
- [Référence du SDK .NET](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md) :
  installation du package et exemple minimal pour le SDK .NET.
:::

:::language nodejs
- [Référence du SDK Node.js](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md) :
  installation du package et exemple minimal pour le SDK Node.js.
:::

:::language python
- [Référence du SDK Python](https://github.com/github/copilot-sdk/blob/main/python/README.md) :
  installation du package et exemple minimal pour le SDK Python.
:::

:::language go
- [Référence du SDK Go](https://github.com/github/copilot-sdk/blob/main/go/README.md) :
  installation du module et exemple minimal pour le SDK Go.
:::

:::language rust
- [Référence du SDK Rust](https://github.com/github/copilot-sdk/blob/main/rust/README.md) :
  installation de la crate et exemple minimal pour le SDK Rust.
:::

:::language java
- [Référence du SDK Java](https://github.com/github/copilot-sdk/blob/main/java/README.md) :
  coordonnées de dépendance et exemple minimal pour le SDK Java.
:::

Continuez avec [Étape 1 : Créez votre première session Copilot](01-first-session.md).
