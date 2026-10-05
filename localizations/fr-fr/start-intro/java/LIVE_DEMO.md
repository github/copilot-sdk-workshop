# Démonstration en direct de The GitHub Podcast : Java

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Compilez les dépendances dans le projet de départ inclus avant la session chronométrée :

```powershell
cd start-intro/java
./mvnw compile
```

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Commencez par `src\main\java\demo\CopilotSdkLiveDemo.java`. Il contient volontairement des espaces réservés nommés pour `client`, `isAuthenticated` et `session`.

### 1. Démarrez le client

Remplacez `CopilotClient client;` par :

```java
try (var client = new CopilotClient()) {
client.start().get();
```

Ce bloc de ressources reste ouvert jusqu'à ce que l'étape 4 ajoute son accolade fermante. Terminez
les quatre modifications avant d'exécuter.

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `boolean isAuthenticated = false;` par :

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez la session

Remplacez l'espace réservé de session par :

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

Ajoutez ces imports :

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

Remplacez les commentaires sous `// Step 4: Stream events from the assistant.` par :

```java
session.on(AssistantMessageDeltaEvent.class, event -> {
    String delta = event.getData().deltaContent();
    if (delta != null) {
        System.out.print(delta);
    }
});
session.on(ToolExecutionStartEvent.class, event ->
        System.out.println("\n[Tool call started] " + event.getData().toolName()));
session.on(ToolExecutionCompleteEvent.class, event ->
        System.out.println("\n[Tool call complete]"));
```

Cela fournit le gestionnaire de streaming à l'emplacement marqué par le projet de départ. Le bloc de
ressources de session reste également ouvert jusqu'à l'étape 4.

Dites : « La session est la conversation. J'ai choisi le modèle et activé le streaming. »

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Sous `// Step 5: Send the first message.`, supprimez l'espace réservé `var config` et sa condition
de garde `if (session != null)`. Remplacez-les par :

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

Les deux accolades fermantes terminent les blocs de ressources de session et de client des étapes 3
et 1. Conservez les accolades fermantes existantes de la méthode et de la classe.

Dites : « Voilà la forme de base : démarrer un client, créer une session, écouter les événements et envoyer un message. Une fois cette boucle opérationnelle, nous pouvons la faire évoluer en agent de podcast. »

Exécutez maintenant ce point de contrôle Hello World depuis le dossier `java` :

```powershell
./mvnw compile exec:java
```

Sortie attendue : une réponse d'une phrase diffusée en streaming. `sendAndWait` attend la fin de
l'exécution et propage les erreurs ; les blocs de ressources ferment les deux ressources du SDK.

## Acte deux : transformez-le en agent de podcast

Après Hello World, utilisez les classes utilitaires fournies pour transformer la même session en workflow de podcast appuyé sur des faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Ajoutez les imports de `com.github.copilot.rpc.SystemMessageConfig` et
`com.github.copilot.SystemMessageMode`. Conservez `java.util.List` de l'Acte un. L'import
`PermissionHandler` n'est plus utilisé une fois que `PermissionPrompt` le remplace ci-dessous.

Dans le bloc de ressources du client, après l'authentification et avant `var config` :

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Créez les outils :

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

Remplacez `var config` et sa chaîne d'appels du builder, en conservant le bloc
`try (var session = client.createSession(config).get())` existant :

```java
var config = new SessionConfig()
        .setModel(selectedModel)
        .setStreaming(true)
        .setTools(List.of(episodeTool, latestEpisodesTool))
        .setAvailableTools(List.of("get_github_podcast_episode", "get_latest_github_podcast_episodes"))
        .setOnPermissionRequest(PermissionPrompt.HANDLER)
        .setSystemMessage(new SystemMessageConfig()
                .setMode(SystemMessageMode.REPLACE)
                .setContent("You are the launch assistant for The GitHub Podcast. Use supplied episode facts only."));
```

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, les ajoute à la liste d'autorisation par nom, et remplace le gestionnaire d'approbation systématique de Hello World par `PermissionPrompt`, qui refuse tout ce qui n'est pas l'un de ces outils et me demande confirmation via stdin avant d'en exécuter un. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise REPLACE, pas APPEND. Mon application fournit l'identité complète de l'agent et la règle d'ancrage de cette session au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Remplacez uniquement l'argument de `.setPrompt(...)` dans l'envoi borné existant :

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

Mettez à jour la ligne d'état du modèle pour afficher `selectedModel`. Conservez les abonnements,
l'attente de 60 secondes et les deux blocs de ressources inchangés.

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Exécutez maintenant l'agent de podcast terminé depuis le dossier `java` :

```powershell
./mvnw compile exec:java
```

Jalons attendus : sélection du modèle, sélection de dix épisodes, exécution de l'outil, demande d'approbation, puis texte de lancement appuyé sur des faits.
