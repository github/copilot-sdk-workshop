# Démo en direct GitHub Podcast : Node.js

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Installez les dépendances dans le projet de départ inclus avant la session chronométrée :

```powershell
cd start-intro/nodejs
npm ci
```

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Ouvrez `src\index.ts`. Il contient des espaces réservés pour `client`, l'authentification, `session` et le premier prompt.

### 1. Démarrez le client

Remplacez `let client: CopilotClient;` par :

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

Le bloc `try` reste ouvert jusqu'à ce que l'étape 4 ajoute son bloc `finally`. Terminez les quatre
modifications avant d'exécuter.

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `const isAuthenticated = false;` et le bloc `if` qui suit par :

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez une session de streaming

Remplacez `let session: CopilotSession;` par :

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

Ajoutez `approveAll` à l'import du SDK en haut du fichier :

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

Dites : « La session est la conversation. J'ai choisi le modèle, activé le streaming, et le gestionnaire d'événements ci-dessous affiche déjà chaque fragment de texte à mesure qu'il arrive. »

Le bloc `try` de la session reste lui aussi ouvert jusqu'à l'étape 4. Laissez le gestionnaire de
streaming existant en place.

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Sous `// Step 5: Send the first message.`, saisissez :

```typescript
await session.sendAndWait({
    prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Node.js app do.",
}, 60_000);
console.log();
} finally {
  await session.disconnect();
}
} finally {
  await client.stop();
}
```

Dites : « Voilà la forme de base : démarrer un client, créer une session, écouter les événements et envoyer un message. Une fois cette boucle opérationnelle, nous pouvons la faire évoluer en agent de podcast. »

Exécutez maintenant ce point de contrôle Hello World depuis le dossier `nodejs` :

```powershell
npm start
```

Sortie attendue : une réponse d'une phrase diffusée en streaming, suivie de `sendAndWait` qui
termine le tour. Il propage les erreurs de session et limite l'attente à 60 secondes. Les deux blocs
`finally` ferment la session et le client.

## Acte deux : transformez-le en agent de podcast

Après Hello World, utilisez les utilitaires fournis dans `src` pour transformer la même session en workflow de podcast appuyé sur des faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Ajoutez les imports :

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

Retirez `approveAll` de l'import du SDK, car `permissionPrompt` le remplace ci-dessous :

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

Dans le bloc `try` du client, après l'authentification et avant la création de la session, ajoutez :

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Remplacez la configuration de session par :

```typescript
const session = await client.createSession({
  model: selectedModel,
  streaming: true,
  tools: [episodeTool, latestEpisodesTool],
  availableTools: ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
  onPermissionRequest: permissionPrompt,
  systemMessage: {
    mode: "replace",
    content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
  },
});
```

Conservez le bloc `try` de la session après cette configuration.

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, je les ajoute à la liste d'autorisation par leur nom, et je remplace le gestionnaire qui approuve tout de Hello World par un gestionnaire qui me sollicite, afin que je reste le point d'approbation avant l'exécution d'un outil. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise replace, pas append. Mon application fournit l'identité complète de l'agent et la règle d'ancrage pour cette session, au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Remplacez uniquement le prompt dans l'appel `sendAndWait` existant par :

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Exécutez maintenant l'agent de podcast terminé depuis le dossier `nodejs` :

```powershell
npm start
```

Jalons attendus : sélection du modèle, sélection parmi dix épisodes, `[Tool call started]`, prompt d'approbation, `[Tool call complete]`, puis texte de lancement diffusé en streaming.

Mettez à jour la ligne d'état du modèle pour utiliser `selectedModel`. Conservez le gestionnaire
d'événements, le délai d'attente de 60 secondes et les deux blocs `finally`.
