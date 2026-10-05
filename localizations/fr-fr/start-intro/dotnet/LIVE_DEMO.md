# Démonstration en direct de The GitHub Podcast

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Travaillez dans le projet de départ inclus et restaurez les dépendances avant la session chronométrée :

```powershell
cd start-intro/dotnet
dotnet restore
```

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Commencez par `Program.cs`. Il contient volontairement des espaces réservés nommés pour `client`, `isAuthenticated` et `session`. Laissez en place le gestionnaire d'événements de streaming et l'attente de complétion.

### 1. Démarrez le client

Remplacez `CopilotClient client;` par :

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `var isAuthenticated = false;` par :

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez la session

Ajoutez `using GitHub.Copilot.Rpc;` en haut. Remplacez `CopilotSession session = null!;` par :

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

Dites : « La session est la conversation. J'ai choisi le modèle, activé le streaming, et le gestionnaire d'événements ci-dessous affiche déjà chaque fragment de texte à mesure qu'il arrive. »

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Sous `// Step 5: Send the first message.`, saisissez :

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

Remplacez le dernier `await complete.Task;` par :

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

Le gestionnaire d'événements existant est déjà fourni ; ce n'est pas un cinquième exercice de
modification. Il affiche les deltas, signale les erreurs de session et se termine en cas
d'inactivité. `await using` ferme le client et la session après l'exécution.

Dites : « Voilà la forme de base : démarrer un client, créer une session, écouter les événements et envoyer un message. Une fois cette boucle opérationnelle, nous pouvons la faire évoluer en agent de podcast. »

Sortie attendue : une réponse d'une phrase diffusée en streaming, suivie de l'événement `SessionIdleEvent` existant qui termine le programme.

Exécutez ce point de contrôle Hello World depuis `start-intro/dotnet` :

```powershell
dotnet run
```

## Acte deux : transformez-le en agent de podcast

Après Hello World, ajoutez les utilitaires préécrits dans `Helpers` et `Tools` pour transformer la même session en workflow de podcast ancré dans les faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Ajoutez les usings des utilitaires préécrits :

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

Après l'authentification, avant le signal de complétion et la session, ajoutez un sélecteur et
sélectionnez l'un des dix épisodes les plus récents :

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Créez les outils propres à l'application :

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

Remplacez les champs `SessionConfig` de Hello World par ceux-ci, en conservant
`await using var session = await client.CreateSessionAsync(...)` :

```csharp
Model = model,
Streaming = true,
Tools = [episodeTool, latestEpisodesTool],
AvailableTools = ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
OnPermissionRequest = PermissionPrompt.RequestAsync,
SystemMessage = new SystemMessageConfig
{
    Mode = SystemMessageMode.Replace,
    Content = "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."
}
```

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, je les ajoute à la liste d'autorisation par leur nom, et je remplace le gestionnaire qui approuve tout de Hello World par un gestionnaire qui me sollicite, afin que je reste le point d'approbation avant l'exécution d'un outil. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise Replace, pas Append. Mon application fournit l'identité complète de l'agent et la règle d'ancrage pour cette session, au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Remplacez Hello World par la requête sélectionnée et ancrée sur l'épisode :

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Jalons attendus : sélection du modèle, sélection parmi dix épisodes, `[Tool call started]`, prompt d'approbation, `[Tool call complete]`, puis texte de lancement diffusé en streaming.

Mettez à jour la ligne d'état du modèle pour utiliser le `model` sélectionné, et non `Model`.
Conservez le gestionnaire d'événements, l'attente de complétion limitée et les déclarations
`await using`.

Exécutez l'agent de podcast terminé depuis le même dossier :

```powershell
dotnet run
```
