# Démo en direct GitHub Podcast : Rust

## Avant la session

1. Exécutez `copilot auth login` si cette machine n'est pas déjà authentifiée.
2. Téléchargez et vérifiez les dépendances dans le projet de départ inclus avant la session chronométrée :

```powershell
cd start-intro/rust
cargo check --locked
```

## Argumentaire de démonstration

Dites : « Nous créons un agent de podcast pour The GitHub Podcast. Il nous permettra de choisir un véritable épisode, de récupérer des métadonnées vérifiées dans le flux RSS officiel et de transformer ces faits en texte pour les réseaux sociaux compatible avec les sponsors. »

Dites : « Nous commencerons par la conversation Copilot SDK la plus petite possible, puis nous lui donnerons un objectif, une identité et des outils propres à l'application. »

## Acte un : Hello World

Commencez par `src\main.rs`. Il contient délibérément des espaces réservés nommés pour `client`, `is_authenticated` et la session.

Ajoutez cet import :

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

Remplacez l'import `SessionConfig` existant ; conservez `std::io::{self, Write}`.

### 1. Démarrez le client

Remplacez l'espace réservé du client par :

```rust
let client = Client::start(ClientOptions::default()).await?;
```

Dites : « Le client est ma connexion au runtime Copilot. Je le démarre explicitement afin que l'application maîtrise son cycle de vie. »

### 2. Vérifiez l'authentification

Remplacez `let is_authenticated = false;` et son bloc `if` par :

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

Dites : « Avant de créer une session, je peux demander au runtime si cette machine est connectée. »

### 3. Créez la session

Remplacez `let session_is_created = false;` et le bloc vide `if session_is_created { ... }` par :

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

Dites : « La session est la conversation. J'ai choisi le modèle et activé le streaming. »

Dites : « Le gestionnaire répond aux demandes d'autorisation. La liste d'autorisation d'outils vide retire les capacités d'outil pour cet exercice ; l'approbation systématique seule n'est pas une frontière de sécurité. »

### 4. Envoyez Hello World

Sous `// Step 5: Send the first message.`, remplacez les trois lignes d'espace réservé `let _ = ...`
par :

```rust
let prompt = "Hello world! In one sentence, say what the Copilot SDK helps a Rust app do.".to_owned();
let turn = async {
    let mut events = session.subscribe();
    let send = session.send(MessageOptions::new(prompt));
    tokio::pin!(send);
    let mut sent = false;
    let mut idle = false;
    while !sent || !idle {
        tokio::select! {
            result = &mut send, if !sent => {
                result?;
                sent = true;
            }
            event = events.recv() => {
                let event = event?;
                match event.event_type.as_str() {
                    "assistant.message_delta" => {
                        if let Some(delta) = event.data.get("deltaContent").and_then(|v| v.as_str()) {
                            print!("{delta}");
                            io::stdout().flush()?;
                        }
                    }
                    "tool.execution_start" => println!("\n[Tool call started] {}", event.data),
                    "tool.execution_complete" => println!("\n[Tool call complete]"),
                    "session.error" => {
                        return Err(format!("Copilot session failed: {}", event.data).into());
                    }
                    "session.idle" => idle = true,
                    _ => {}
                }
            }
        }
    }
    Ok::<(), Box<dyn std::error::Error>>(())
};
let result = tokio::time::timeout(Duration::from_secs(60), turn).await;
session.disconnect().await?;
client.stop().await?;
result??;
println!();
```

Conservez le `Ok(())` final. Cette boucle fournit l'abonnement de streaming manquant, écoute avant
l'envoi, et attend à la fois la fin de l'envoi et l'inactivité. Elle fait remonter les erreurs ou un
délai d'attente de 60 secondes après la fermeture de la session et du client.

Dites : « C'est la forme de base : démarrer un client, créer une session, s'abonner aux événements et envoyer un message. Une fois cette boucle fonctionnelle, nous pouvons la faire évoluer en agent de podcast. »

Exécutez maintenant ce point de contrôle Hello World depuis le dossier `rust` :

```powershell
cargo run --locked
```

Sortie attendue : une réponse d'une phrase diffusée en streaming dans le terminal, puis la sortie du programme.

## Acte deux : transformez-le en agent de podcast

Après Hello World, utilisez le code fourni dans `src\workshop.rs` pour transformer la même session en workflow de podcast appuyé sur des faits.

Dites : « La conversation fonctionne. Nous allons maintenant la transformer en agent de podcast : un assistant spécialisé qui peut rechercher un épisode sélectionné de The GitHub Podcast et préparer un texte de lancement sans inventer de faits. »

### 1. Laissez le présentateur choisir

Ajoutez :

```rust
mod workshop;
```

Ajoutez `SystemMessageConfig` à l'import de types existant :

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

Après l'authentification, avant de construire `config` :

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

Dites : « Cela garde la démonstration en direct. Je peux choisir un modèle dans la salle, puis choisir parmi les dix véritables épisodes les plus récents de The GitHub Podcast. Cette sélection devient la mission de l'agent de podcast. »

### 2. Donnez des capacités à la session

Créez la session :

```rust
let mut config = SessionConfig::default();
config.model = selected_model;
config.streaming = Some(true);
config.tools = Some(vec![workshop::episode_tool(), workshop::latest_episodes_tool()]);
config.available_tools = Some(vec![
    "get_github_podcast_episode".to_owned(),
    "get_latest_github_podcast_episodes".to_owned(),
]);
config.permission_handler = Some(workshop::permission_prompt());
config = config.with_system_message(
    SystemMessageConfig::new()
        .with_mode("replace")
        .with_content(
            "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
        ),
);
let session = client.create_session(config).await?;
```

Dites : « Le modèle n'obtient pas un accès arbitraire à mon application. J'accorde deux capacités restreintes et typées, les ajoute à la liste d'autorisation par nom, et remplace le gestionnaire d'approbation systématique de Hello World par `workshop::permission_prompt`, qui refuse tout ce qui n'est pas l'un de ces outils et me demande confirmation via stdin avant d'en exécuter un. »

Dites : « Ces outils sont ce qui en fait un agent plutôt qu'un chatbot générique : il peut agir sur une source de données fiable que mon application contrôle. »

Dites : « Le message système utilise replace, pas append. Mon application fournit l'identité complète de l'agent et la règle d'ancrage pour cette session, au lieu d'hériter du prompt par défaut. »

### 3. Remplacez le prompt

Remplacez uniquement la ligne `let prompt = ...`. Conservez la boucle de streaming, le délai
d'attente et le nettoyage inchangés :

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

Dites : « L'agent décide d'appeler l'outil d'épisode, j'approuve la recherche en lecture seule, et sa réponse est ancrée dans le flux officiel plutôt que dans des détails inventés. »

Exécutez maintenant l'agent de podcast terminé depuis le dossier `rust` :

```powershell
cargo run --locked
```

Jalons attendus : sélection du modèle, sélection de dix épisodes, exécution de l'outil, demande d'approbation, puis texte de lancement appuyé sur des faits.
