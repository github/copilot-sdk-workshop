# Démo en direct GitHub Podcast : Python

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Créez un environnement dans le projet de départ inclus avant la session chronométrée :

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Sur macOS/Linux, utilisez `.venv/bin/python` au lieu de `.\.venv\Scripts\python.exe`.

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Commencez par `main.py`. Il contient délibérément des espaces réservés nommés pour `client`, `is_authenticated` et `session`. Laissez le gestionnaire d'événements de streaming et l'attente de fin d'exécution en place.

### 1. Démarrez le client

Remplacez `client: CopilotClient` par :

```python
client = CopilotClient()
await client.start()
```

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `is_authenticated = False` et son bloc `if` par :

```python
is_authenticated = (await client.get_auth_status()).isAuthenticated
if not is_authenticated:
    await client.stop()
    raise RuntimeError("Run 'copilot auth login' before continuing.")
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez la session

Remplacez `session = None` par :

```python
session = await client.create_session(
    model=MODEL,
    streaming=True,
    available_tools=[],
    on_permission_request=PermissionHandler.approve_all,
)
```

Étendez l'import du SDK en haut du fichier :

```python
from copilot import CopilotClient, PermissionHandler
```

Dites : « La session est la conversation. J'ai choisi le modèle, activé le streaming, et le gestionnaire d'événements ci-dessous affiche déjà chaque fragment de texte à mesure qu'il arrive. »

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Remplacez tout, de `# Step 5: Send the first message.` jusqu'à la fin de `main()`, par ce bloc
indenté. Conservez le bloc `if __name__ == "__main__":` du module :

```python
    try:
        await session.send(
            "Hello world! In one sentence, say what the Copilot SDK helps a Python app do."
        )
        await asyncio.wait_for(done.wait(), timeout=60)
        if error is not None:
            raise error
        print()
    finally:
        await session.disconnect()
        await client.stop()
```

Dites : « Voilà la forme de base : démarrer un client, créer une session, écouter les événements et envoyer un message. Une fois cette boucle opérationnelle, nous pouvons la faire évoluer en agent de podcast. »

Exécutez ce point de contrôle Hello World depuis `start-intro/python` :

```powershell
.\.venv\Scripts\python.exe main.py
```

Sur macOS/Linux :

```bash
.venv/bin/python main.py
```

Sortie attendue : une réponse d'une phrase diffusée en streaming, suivie de `SessionIdleData` qui termine le programme.

## Acte deux : transformez-le en agent de podcast

Après Hello World, utilisez les utilitaires fournis pour transformer la même session en workflow de podcast appuyé sur des faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Ajoutez les imports :

```python
from github_podcast_tools import (
    get_latest,
    get_latest_github_podcast_episodes,
    get_github_podcast_episode,
    pick_episode,
)
from model_selector import select_model
from permission_prompt import permission_prompt
```

Resserrez à nouveau l'import du SDK, car `permission_prompt` remplace `PermissionHandler` ci-dessous :

```python
from copilot import CopilotClient
```

Après la vérification d'authentification :

```python
model = await select_model(client, MODEL)
latest_episodes = get_latest()
selected_episode = pick_episode(latest_episodes)
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Créez la session avec les outils :

```python
session = await client.create_session(
    model=model,
    streaming=True,
    tools=[get_github_podcast_episode, get_latest_github_podcast_episodes],
    available_tools=["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
    on_permission_request=permission_prompt,
    system_message={
        "mode": "replace",
        "content": "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
    },
)
```

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, je les ajoute à la liste d'autorisation par leur nom, et je remplace le gestionnaire qui approuve tout de Hello World par un gestionnaire qui me sollicite, afin que je reste le point d'approbation avant l'exécution d'un outil. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise replace, pas append. Mon application fournit l'identité complète de l'agent et la règle d'ancrage pour cette session, au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Remplacez le prompt par :

```python
await session.send(
    f"Use get_github_podcast_episode for the episode titled \"{selected_episode.title}\". "
    "Return exactly a social headline and a sponsor-safe post under 280 characters. "
    "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
)
```

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Conservez le gestionnaire d'événements, l'attente de fin d'exécution et le nettoyage inchangés.
Remplacez uniquement l'appel `session.send(...)` dans le bloc `try` existant. Mettez à jour la ligne
d'état du modèle pour afficher le `model` sélectionné.

Exécutez l'agent de podcast terminé depuis le même dossier :

```powershell
.\.venv\Scripts\python.exe main.py
```

Sur macOS/Linux :

```bash
.venv/bin/python main.py
```

Jalons attendus : sélection du modèle, sélection parmi dix épisodes, `[Tool call started]`, prompt d'approbation, `[Tool call complete]`, puis texte de lancement diffusé en streaming.
