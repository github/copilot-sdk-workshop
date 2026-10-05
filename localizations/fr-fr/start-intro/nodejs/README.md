# Projet de départ SDK 101 : Node.js

Nécessite [Node.js 22.12 ou version ultérieure](https://nodejs.org/) et un accès Copilot authentifié.

Depuis la racine du dépôt de l'atelier :

```shell
cd start-intro/nodejs
npm ci
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez `src/index.ts` en suivant les quatre
modifications numérotées dans [LIVE_DEMO.md](LIVE_DEMO.md), Acte un. Exécutez ensuite :

```shell
npm start
```

Le point d'entrée non modifié est délibérément incomplet : ce n'est pas un Hello World fonctionnel.
Poursuivez avec l'Acte deux dans le même guide pour l'agent de podcast. Réutilisez
`src/github-podcast-tools.ts`, `src/model-selector.ts` et `src/permission-prompt.ts` sans les
modifier.

Exécutez `npm run build` pour effectuer une vérification de types sans envoyer de prompt Copilot.
Exécutez `npm test` pour vérifier les régressions d'analyse RSS avec des réponses de flux simulées,
sans authentification Copilot ni requêtes réseau. Consultez la
[préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et le dépannage,
ainsi que la [documentation officielle de l'API du SDK Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs)
comme référence.
