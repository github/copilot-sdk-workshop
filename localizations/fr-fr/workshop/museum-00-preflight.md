# Museum Exhibit Studio : préparation

> **Durée :** Non chronométré  
> **Atelier :** Agent non-SDLC

## Ce que vous allez créer

Museum Exhibit Studio transforme des faits approuvés par des éducateurs en textes d'exposition prêts pour les visiteurs :

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

Vous créez sur place une application console qui évolue, dans `start-museum/<language>`. Chaque
étape ajoute une idée et se termine par une vraie exécution, si bien que le conservateur prend forme
sous vos yeux :

| Étape | Vous ajoutez | Vous voyez |
|---|---|---|
| 1 | Un client, une session, un prompt | Du texte d'exposition dans votre terminal |
| 2 | L'afficheur de streaming prêt à l'emploi | Le texte arrive en direct |
| 3 | Le message système du conservateur | Une voix et une forme différentes |
| 4 | L'outil de faits approuvés, le prompt et l'exécuteur de session bornée | Un texte qui suit vos faits |
| 5 | Le validateur fourni | Un rapport structurel PASS/FAIL |
| 6 | Une session de recherche Wikipedia limitée au périmètre | Des informations de contexte citées, gardées hors de l'exposition |
| 7 | Une page interactive | `exhibit.html` dans votre navigateur |
| 8 | Une célébration et des ressources | Votre prochain projet commence ici |

Les sept étapes pratiques prennent environ 90 minutes. Terminez-les dans l'ordre, puis célébrez ce
que vous avez créé et explorez les ressources à l'étape finale.

Le projet de départ fournit déjà toute l'infrastructure que vous ne devriez jamais avoir à écrire :
les ensembles de faits approuvés et leurs limites, le menu de sélection des faits, un afficheur de
streaming, la validation déterministe de l'exposition, le serveur MCP Wikipedia limité au périmètre
avec son gestionnaire d'autorisations qui refuse par défaut, l'autorisation d'écrire le fichier
unique `exhibit.html`, les messages système, le texte de prompt fixe pour la structure de
l'exposition, la demande de recherche et les exigences de la page, ainsi que la gestion des erreurs
autour de votre code. **Vous ne modifiez jamais les fichiers utilitaires.** Vous écrivez le code du
SDK : la configuration de la session, l'enregistrement des outils et les configurations de session,
les instructions des prompts d'exposition et de page, et un exécuteur de session.

Vous avez besoin d'un GitHub Copilot CLI authentifié, du runtime de votre langage et d'un terminal.
Vous travaillez directement dans le projet minimal sous `start-museum/<language>`, pas dans
l'application terminée. Le projet terminé sous `finished/<language>/museum-exhibit-studio` est
uniquement une ressource de référence facultative.

## Clonez le dépôt de l'atelier

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Confirmez que le terminal est à la racine du dépôt avant d'entrer dans un projet de départ :

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

La commande doit se terminer correctement sans sortie.

Vous créez l'application de musée **sur place**, dans le dossier du projet de départ pour votre
langage. Il n'y a aucune étape de copie. Cela signifie que vous modifiez des fichiers suivis du
dépôt, donc votre travail apparaît dans `git status` comme des fichiers modifiés. C'est attendu et
correct. Si vous voulez repartir d'un projet de départ propre, exécutez `git checkout -- .` depuis
la racine du dépôt pour supprimer vos modifications.

Entrez maintenant dans le dossier du projet de départ de votre langage et restez-y pour chaque
commande de l'atelier du musée.

:::language dotnet
Entrez dans le projet de départ .NET, puis restaurez, compilez et exécutez son point d'entrée local :

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

Condition de réussite : la compilation réussit et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de `Pre-built curator helpers are ready in Helpers/.`

Vous travaillez dans `start-museum/dotnet` pour le reste de l'atelier ; gardez donc ce terminal ici.
Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans votre
éditeur préféré.

Votre module utilitaire est `Helpers/Curator*.cs` dans l'espace de noms
`MuseumExhibitStudio.Helpers`. Vous écrirez toutes les modifications de leçon dans `Program.cs`.
:::

:::language nodejs
Entrez dans le projet de départ Node.js. Son fichier de verrouillage conserve le SDK 1.0.11 et le
package de plateforme compatible `@github/copilot` 1.0.80 :

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

Condition de réussite : la compilation réussit et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de
`Pre-built curator helpers are ready in src/curator.ts.`

Vous travaillez dans `start-museum/nodejs` pour le reste de l'atelier ; gardez donc ce terminal ici.
Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans votre
éditeur préféré.

Votre module utilitaire est `src/curator.ts`, et les messages système se trouvent dans
`src/system-messages.ts`. Vous écrirez toutes les modifications de leçon dans `src/index.ts`.
:::

:::language python
Entrez dans le projet de départ Python, créez un environnement virtuel isolé et installez le SDK 1.0.11 :

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

Sous Windows, l'interpréteur se trouve à `.venv/Scripts/python.exe`.

Condition de réussite : le code source compile et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de
`Pre-built curator helpers are ready in curator.py.`

Vous travaillez dans `start-museum/python` pendant le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur préféré.

Votre module utilitaire est `curator.py`, et les messages système se trouvent dans
`system_messages.py`. Vous apporterez toutes les modifications des leçons dans `main.py`.
:::

:::language go
Placez-vous dans le projet de départ Go, téléchargez la dépendance SDK 1.0.11 verrouillée, puis compilez-le :

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

Condition de réussite : la compilation réussit et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de
`Pre-built curator helpers are ready in curator.go.`

Vous travaillez dans `start-museum/go` pendant le reste de l'atelier ; gardez donc ce terminal ici.
Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans votre
éditeur préféré.

Votre module utilitaire est `curator.go`, et les messages système se trouvent dans
`system_messages.go`. Les deux sont dans le même package `main`. Vous apporterez toutes les
modifications des leçons dans `main.go`.
:::

:::language rust
Placez-vous dans le projet de départ Rust, récupérez les dépendances verrouillées, puis vérifiez-le :

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

Condition de réussite : Cargo laisse `Cargo.lock` inchangé et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de
`Pre-built curator helpers are ready in src/lib.rs.`

Vous travaillez dans `start-museum/rust` pendant le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur préféré.

Votre module utilitaire est le crate de bibliothèque `museum_exhibit_studio` dans `src/lib.rs`, avec
les messages système dans `src/system_messages.rs`. Vous apporterez toutes les modifications des
leçons dans `src/main.rs`.
:::

:::language java
Placez-vous dans le projet de départ Maven, résolvez le SDK 1.0.11, compilez et exécutez-le avec le
Maven Wrapper inclus (aucune installation Maven séparée n'est nécessaire ; sous Windows, utilisez
`mvnw.cmd` au lieu de `./mvnw`) :

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

Condition de réussite : Maven réussit et le programme affiche
`=== Museum Exhibit Studio starter ===` suivi de
`Pre-built curator helpers are ready in src/main/java/workshop/.`

Vous travaillez dans `start-museum/java` pendant le reste de l'atelier ; gardez donc ce terminal
ici. Depuis ce dossier, saisissez `code .` pour l'ouvrir dans VS Code, ou ouvrez le dossier dans
votre éditeur préféré.

Votre module utilitaire est `src/main/java/workshop/Curator*.java`. Vous apporterez toutes les
modifications des leçons dans `src/main/java/workshop/MuseumExhibitStudio.java`.
:::

## Fonctionnement des modifications

Ouvrez le point d'entrée nommé à la fin de votre bloc de configuration ci-dessus. Chaque emplacement
où vous écrivez du code est une **région** nommée entre deux commentaires de marqueur :

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

La ligne `BEGIN` énumère toutes les étapes qui modifient la région ; le fichier sert donc aussi de
plan de l'atelier. Chaque bloc de code d'une leçon est introduit par une ligne qui nomme sa région
et l'une des deux actions :

| Action | La région est | Ce que vous faites |
|---|---|---|
| **INSERT** | Vide | Collez le bloc entre les deux lignes de marqueur. |
| **REPLACE** | Contient du code d'une étape précédente | Supprimez tout ce qui se trouve entre les deux lignes de marqueur, puis collez le bloc. |

Un bloc correspond toujours au contenu complet de sa région, vous ne fusionnez donc jamais du code à
la main. Laissez les lignes de marqueur, et le code en dehors des régions, exactement tels qu'ils
sont.

## Établissez la frontière de confiance

| Contrôle | Ce qu'il peut faire |
|---|---|
| Message système | Guider le rôle, le style, le périmètre et la forme de sortie |
| Liste d'autorisation des outils | Déterminer exactement quels outils existent pour une session |
| Code de l'application | Posséder les données derrière un outil, et appliquer les limites, le délai d'expiration, la validation et le nettoyage |
| Relecture humaine | Décider si chaque affirmation historique est étayée |

Les faits approuvés par l'éducateur sont la seule source approuvée, et le conservateur y accède par
un seul outil propre à l'application. La mémoire du modèle n'est pas un savoir muséal vérifié, et
les consignes du prompt ne sont pas une frontière d'autorisation : seules la liste d'autorisation et
le gestionnaire d'autorisations décident de ce que la session peut réellement faire.

## En savoir plus

Le SDK qui sous-tend le conservateur est documenté en dehors de cet atelier. Ces pages méritent
d'être ouvertes en parallèle.

- [Guides pratiques du GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk): documentation
  SDK propre à GitHub, y compris les prérequis couverts par cette préparation.
- [Carte de la documentation du Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md) :
  l'index de la configuration, de l'authentification, des fonctionnalités et de la résolution des problèmes.
- [Configuration par défaut : le CLI inclus](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md) :
  comment le SDK localise et démarre le Copilot CLI, et comment le pointer vers un autre binaire.
- [Guide de débogage](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md) :
  le premier endroit où regarder quand une exécution échoue avant de produire une sortie.

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

Passez à [Votre première session de conservateur](museum-01-first-curator-session.md).
