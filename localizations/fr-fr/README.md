# Ateliers GitHub Copilot SDK

Commencez dès aujourd'hui : http://github.github.com/copilot-sdk-workshop/

Choisissez l'un des trois ateliers pratiques GitHub Copilot SDK en .NET, Node.js/TypeScript, Python,
Go, Rust ou Java :

- **SDK 101 (30 minutes) :** commencez par un Hello World en streaming, puis créez un petit
  agent de podcast avec les outils RSS prêts à l'emploi du
  [projet de départ d'introduction inclus](start-intro/README.md).
- **Accessibility Reviewer :** créez un outil de développement SDLC qui inspecte une page web, consulte
  des consignes WCAG propres à l'application et produit un rapport fondé sur des preuves.
- **Museum Exhibit Studio :** créez un conservateur non-SDLC qui transforme des faits approuvés par des enseignants en
  textes d'exposition prêts pour les visiteurs, éventuellement enrichis par des recherches Wikipedia citées au moyen d'une
  recherche locale, derrière des limites de capacités déterministes.

Commencez par SDK 101 si vous découvrez le SDK. Dans les ateliers d'introduction et les ateliers plus approfondis, vous allez :

1. Créer un client Copilot et une session de conversation.
2. Séparer la stratégie durable de l'agent des données propres à la tâche.
3. Choisir entre outils locaux et outils MCP avec des listes d'autorisation d'outils au périmètre très restreint.
4. Appliquer des limites de capacité, d'entrée, de délai d'expiration, de validation et de cycle de vie dans le code de l'application.
5. Expliquer ce que le modèle peut déduire et ce que l'application doit prouver.

SDK 101 comporte exactement 30 minutes de leçons guidées. Prévoyez environ 115 minutes pour
Accessibility Reviewer ou 90 minutes pour Museum Exhibit Studio. La configuration de la machine,
l'authentification et le téléchargement des dépendances se font séparément dans une préparation non
chronométrée pour chaque atelier. Les deux ateliers plus approfondis incluent leurs leçons HTML
interactives et se terminent par une célébration et des ressources.

## Démarrer l'atelier

Ouvrez l'URL GitHub Pages produite par le workflow **Deploy to GitHub Pages** du dépôt. Choisissez
un résultat d'atelier, choisissez un langage, puis démarrez l'atelier sélectionné. Le site déduit
son URL de base Pages à l'exécution ; aucun nom d'hôte Pages d'organisation ou d'utilisateur n'est
donc codé en dur.

Pour prévisualiser le site depuis un clone :

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

Ouvrez <http://localhost:8000/docs/>. N'ouvrez pas `step.html` avec une URL `file://` ; les
navigateurs bloquent les requêtes Markdown utilisées par la visionneuse de leçons.

## Atelier dans votre langue

Cet atelier propose plusieurs langages dans votre locale :

[English](../../README.md) | [한국어](../ko-kr/README.md) | [日本語](../ja-jp/README.md) | [Português (Brasil)](../pt-br/README.md) | [Español](../es-es/README.md) | Français | [Deutsch](../de-de/README.md)

Si vous voulez ajouter la prise en charge d'autres langues, ajoutez d'autres locales à
[`docs/locale-registry.js`](../../docs/locale-registry.js), puis ajoutez les documents localisés
sous le dossier `localizations/`.

## Prérequis

Installez le runtime du langage choisi, pas les six. La préparation de chaque parcours indique les
exigences applicables ; Node.js SDK 101 nécessite la version 22.12 ou ultérieure, et son projet de
départ Java nécessite également Maven 3.9 ou une version ultérieure.

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 ou version ultérieure](https://nodejs.org/)
- [Python 3.11 ou version ultérieure](https://www.python.org/downloads/)
- [Go 1.24 ou version ultérieure](https://go.dev/dl/)
- [Rust 1.94 ou version ultérieure](https://rustup.rs/)
- [Java 17 ou version ultérieure](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- Abonnement ou essai GitHub Copilot
- Microsoft Edge (par défaut dans l'atelier) ou Google Chrome pour les exercices basés sur un navigateur

La préparation passe en revue les vérifications d'installation, l'authentification, les commandes
propres au système d'exploitation, la sortie attendue et le dépannage.

## Structure du dépôt

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## Valider une modification

```bash
bash scripts/validate-workshop.sh
```

La commande vérifie la structure des leçons, les liens internes, les hooks de comportement du site,
la couverture des projets et le budget exact de 30 minutes des leçons du parcours d'introduction.
Elle applique également les leçons du musée à chaque projet de départ du musée et vérifie que le
résultat correspond au point d'entrée terminé. Elle exécute ensuite des tests indépendants du
navigateur pour la sélection de langue, le flux du site et l'achèvement, puis restaure, compile ou
vérifie la syntaxe de chaque projet de départ d'introduction, d'accessibilité et de musée, de chaque
projet terminé et de la cible Blazor sans authentifier Copilot, lancer de navigateur ni envoyer de
prompt. Les projets de musée ne fournissent aucun test, mock ni fixture ; leurs cibles se limitent
donc à la restauration et à la compilation.

Passez un ID de langage pour exécuter une cible de smoke build :

```bash
bash scripts/validate-workshop.sh nodejs
```

Les pull requests exécutent la validation du contenu et les smoke builds des six langages dans des
jobs GitHub Actions séparés ; un échec identifie donc le parcours SDK concerné.

## Atelier SDK 101

Commencez par [`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md). Installez le
runtime choisi, authentifiez Copilot et téléchargez les dépendances **avant** la session
chronométrée. Les quatre leçons guidées sont les bases du SDK (5 minutes), Hello World en streaming
(10 minutes), un agent de podcast (12 minutes) et le récapitulatif (3 minutes).

Les apprenants clonent ce dépôt une seule fois et modifient le point d'entrée dans
[`start-intro/<language>`](start-intro/README.md). Le projet de départ inclut tous les fichiers
sources, les manifestes de dépendances, les lockfiles et les utilitaires prêts à l'emploi pour les
recherches RSS, la sélection du modèle et de l'épisode, ainsi que l'approbation interactive des
outils. Aucun second clone de dépôt ni atelier plus long n'est nécessaire.

Ouvrez `LIVE_DEMO.md` à côté du point d'entrée du projet de départ. L'atelier pratique suit les
**quatre modifications Hello World** de la démonstration source : démarrer le client, vérifier
l'authentification, créer la session et envoyer un message. Continuez avec **Acte deux** dans la
même application pour choisir un modèle et un épisode, accorder des capacités et remplacer le
prompt. Le site web affiche directement ces sections de guide local ; le guide de l'éditeur et
l'atelier en ligne enseignent donc le même code.

Le parcours couvre le cycle de vie client/session, le streaming, l'inscription d'outils locaux, un
message système ciblé et les autorisations. MCP, la validation automatisée de la sortie et les
exercices finaux HTML appartiennent aux ateliers plus approfondis. Vérifiez le texte du podcast
généré par rapport à sa source avant de le publier.

## Atelier Museum Exhibit Studio

Les projets de départ Museum Exhibit Studio se trouvent sous `start-museum/<language>`, avec les
références terminées sous `finished/<language>/museum-exhibit-studio`. Chaque projet de départ
fournit un module utilitaire de conservateur prêt à l'emploi que les apprenants ne modifient
jamais : les ensembles de faits approuvés, leurs limites et le menu de sélection des faits, une
impression en streaming, la validation déterministe de l'exposition, le serveur Wikipedia MCP à
périmètre restreint avec son gestionnaire d'autorisations qui refuse par défaut, l'autorisation
d'écriture du seul fichier `exhibit.html`, les messages système du conservateur et de recherche
(dans leur propre fichier utilitaire), le texte de prompt fixe (structure de l'exposition, demande
de recherche, exigences de page) et le message d'échec imprimé par le point d'entrée.

Les apprenants travaillent directement dans `start-museum/<language>` et font évoluer ce projet
unique au fil des leçons, en l'exécutant à chaque étape. Ils écrivent le code SDK : la configuration
de la session, l'inscription des outils et les trois configurations de session (chacune installant
un message système prêt à l'emploi en mode remplacement), les instructions dans les prompts de
l'exposition et de la page, et un exécuteur de session qui possède le cycle de vie et le délai
d'expiration. L'exemple terminé est ce qu'un apprenant obtient, et non une architecture de référence
séparée.

Chaque endroit où un apprenant écrit du code est une région nommée dans le point d'entrée du projet
de départ, délimitée par deux commentaires de marqueur dont la ligne `BEGIN` liste les étapes qui la
touchent :

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Chaque bloc de code de leçon est introduit par une ligne comme ``**REPLACE** region
`generation-config` in `Program.cs`:`` et contient l'intégralité du contenu de cette région. INSERT
remplit une région vide ; REPLACE écrase ce qu'une étape précédente y a placé. Les lignes de
marqueur ne bougent jamais, et aucune leçon ne remplace tout le fichier. La validation du contenu
applique chaque bloc de leçon au projet de départ et exige que le résultat soit identique au point
d'entrée terminé ; une leçon ne peut donc pas s'écarter de l'application terminée. Lorsque vous
modifiez le code d'une leçon de musée, modifiez le point d'entrée terminé pour qu'il corresponde, et
inversement.

Le parcours destiné aux apprenants commence par
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md), puis enchaîne sept étapes —
première session, streaming, voix du conservateur, faits approuvés, contrôles structurels et
recherche Wikipedia MCP, suivis d'une étape finale interactive `exhibit.html` — avant de se terminer
par la [célébration et les ressources](workshop/museum-09-complete.md).

Lorsqu'il existe des recherches citées utilisables, le conservateur appelle `approved_fact_lookup`
et l'outil en lecture seule `approved_wikipedia_fact_lookup` avant de rédiger le récit et les
questions des visiteurs. Le deuxième outil renvoie des recherches capturées, et non un accès
Wikipedia en direct ni des faits vérifiés par des humains. Les faits approuvés sont prioritaires, et
les recherches refusées, échouées ou non citées conservent le chemin de génération à un seul outil.
La validation structurelle ne prouve pas l'ancrage factuel ; vérifiez les affirmations issues des
recherches avant publication.

Les vérifications Rust partagent un répertoire cible Cargo unique entre tous les projets d'atelier,
ce qui évite de recompiler plusieurs fois les dépendances du SDK.

## Déploiement

Une fois la validation réussie, poussez vers `main`. Le
[workflow Pages](../../.github/workflows/deploy.yml) publie `docs/` ainsi que les leçons Markdown
dans `workshop/` et leurs traductions sous `localizations/`. La compilation et la validation du
contenu s'exécutent séparément dans le workflow de validation.

Activez GitHub Pages dans les paramètres du dépôt et choisissez **GitHub Actions** comme source. Le
job de déploiement indique l'URL canonique de l'atelier dans son environnement.

Le workflow de déploiement vérifie chaque page HTML publiée, chaque ressource du site et chaque
leçon Markdown. Il vérifie par défaut l'URL renvoyée par GitHub Pages. Pour valider à la place un
futur domaine public ou personnalisé, définissez la variable Actions du dépôt `WORKSHOP_SITE_URL`
sur l'URL de base de ce site. Vous pouvez exécuter la même vérification manuellement :

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## Références

- [GitHub Copilot SDK pour .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK pour Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK pour Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK pour Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK pour Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK pour Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Cookbook Copilot SDK](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [API et source Copilot SDK](https://github.com/github/copilot-sdk)
- [Installer GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Licence

Ce projet est sous [licence MIT](../../LICENSE).

Cet atelier est fourni en l'état à des fins pédagogiques. Il est destiné à démontrer des concepts et
des modèles plutôt qu'à servir de service complet de production.
