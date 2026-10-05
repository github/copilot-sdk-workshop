# Démonstration en direct de The GitHub Podcast : Go

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Téléchargez les dépendances dans le projet de départ inclus avant la session chronométrée :

```powershell
cd start-intro/go
go mod download
go mod verify
```

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Commencez par `main.go`. Il contient volontairement des espaces réservés nommés pour `client`, `isAuthenticated` et `session`. Laissez le gestionnaire d'événements en place.

### 1. Démarrez le client

Remplacez `var client *copilot.Client` et le `_ = client` suivant par :

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `isAuthenticated := false` par :

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez la session

Remplacez l'espace réservé de session par :

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               preferredModel,
	Streaming:           copilot.Bool(true),
	AvailableTools:      []string{},
	OnPermissionRequest: copilot.PermissionHandler.ApproveAll,
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Dites : « La session est la conversation. J'ai choisi le modèle, activé le streaming, et le gestionnaire d'événements ci-dessous affiche chaque fragment de texte à mesure qu'il arrive. »

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Ajoutez `"time"` aux imports. Sous `// Step 5: Send the first message.`, remplacez
`_ = context.Background()` par :

```go
ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
defer cancel()
if _, err := session.SendAndWait(ctx, copilot.MessageOptions{
	Prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Go app do.",
}); err != nil {
	panic(err)
}
fmt.Println()
```

Conservez l'abonnement aux événements existant. N'appelez pas aussi `streamResponse` ; cet
utilitaire ajoute un deuxième abonnement et afficherait chaque fragment de texte deux fois.

Dites : « Voilà la forme de base : démarrer un client, créer une session, écouter les événements et envoyer un message. Une fois cette boucle opérationnelle, nous pouvons la faire évoluer en agent de podcast. »

Exécutez maintenant ce point de contrôle Hello World depuis le dossier `go` :

```powershell
go run .
```

Sortie attendue : une réponse d'une phrase diffusée en streaming, suivie de `SendAndWait` qui termine le tour.

## Acte deux : transformez-le en agent de podcast

Après Hello World, utilisez les utilitaires préécrits dans `helpers.go` et `permission_prompt.go` pour transformer la même session en workflow de podcast ancré dans les faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Après l'authentification et avant de créer la session :

```go
selectedModel, err := selectModel(context.Background(), client, preferredModel)
if err != nil {
	panic(err)
}
latestEpisodes, err := getLatestEpisodes()
if err != nil {
	panic(err)
}
selectedEpisode, err := pickEpisode(latestEpisodes)
if err != nil {
	panic(err)
}
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Créez les outils :

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

Créez la session :

```go
session, err := client.CreateSession(context.Background(), &copilot.SessionConfig{
	Model:               selectedModel,
	Streaming:           copilot.Bool(true),
	Tools:               []copilot.Tool{episodeTool, latestEpisodesTool},
	AvailableTools:      []string{"get_github_podcast_episode", "get_latest_github_podcast_episodes"},
	OnPermissionRequest: permissionPrompt,
	SystemMessage: &copilot.SystemMessageConfig{
		Mode:    "replace",
		Content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
	},
})
if err != nil {
	panic(err)
}
defer session.Disconnect()
```

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, je les ajoute à la liste d'autorisation par leur nom, et je remplace le gestionnaire qui approuve tout de Hello World par `permissionPrompt` dans `permission_prompt.go`, qui refuse tout ce qui n'est pas l'un de ces outils et me demande sur stdin avant qu'un outil s'exécute. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise replace, pas append. Mon application fournit l'identité complète de l'agent et la règle d'ancrage pour cette session, au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Construisez le prompt immédiatement avant l'envoi limité existant :

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

Changez le champ `MessageOptions` en `Prompt: prompt`. Mettez à jour la ligne d'état du modèle pour
afficher `selectedModel`. Conservez l'abonnement existant, le contexte limité, le contrôle d'erreur
et le nettoyage différé ; n'ajoutez pas de deuxième abonnement.

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Exécutez maintenant l'agent de podcast terminé depuis le dossier `go` :

```powershell
go run .
```

Jalons attendus : sélection du modèle, sélection parmi dix épisodes, `[Tool call started]`, prompt d'approbation, `[Tool call complete]`, puis texte de lancement diffusé en streaming.
