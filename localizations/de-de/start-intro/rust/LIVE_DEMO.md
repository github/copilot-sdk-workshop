# Die GitHub Podcast-Live-Demo: Rust

## Vor der Sitzung

1. Führen Sie `copilot auth login` aus, wenn dieser Computer noch nicht authentifiziert ist.
2. Laden Sie vor der zeitlich begrenzten Sitzung die Abhängigkeiten im enthaltenen Starterprojekt herunter und prüfen Sie sie:

```powershell
cd start-intro/rust
cargo check --locked
```

## Demo-Pitch

Sagen Sie: „Wir erstellen einen Podcast-Agenten für The GitHub Podcast. Er ermöglicht uns, eine echte Episode auszuwählen, verifizierte Metadaten aus dem offiziellen RSS-Feed abzurufen und diese Fakten in sponsorensichere Social-Media-Texte zu verwandeln.“

Sagen Sie: „Wir beginnen mit der kleinstmöglichen Unterhaltung mit dem Copilot SDK und geben ihr dann einen Zweck, eine Identität und anwendungseigene Tools.“

## Erster Akt: Hello World

Beginnen Sie mit `src\main.rs`. Die Datei enthält absichtlich benannte Platzhalter für `client`, `is_authenticated` und die Sitzung.

Fügen Sie diesen Import hinzu:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

Ersetzen Sie den vorhandenen `SessionConfig`-Import; behalten Sie `std::io::{self, Write}` bei.

### 1. Client starten

Ersetzen Sie den Client-Platzhalter durch:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

Sagen Sie: „Der Client ist meine Verbindung zur Copilot-Runtime. Ich starte ihn ausdrücklich, sodass die Anwendung für seinen Lebenszyklus verantwortlich ist.“

### 2. Authentifizierung prüfen

Ersetzen Sie `let is_authenticated = false;` und den zugehörigen `if`-Block durch:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

Sagen Sie: „Bevor ich eine Sitzung erstelle, kann ich die Runtime fragen, ob dieser Rechner angemeldet ist.“

### 3. Sitzung erstellen

Ersetzen Sie `let session_is_created = false;` und den leeren `if session_is_created { ... }`-Block
durch:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

Sagen Sie: „Die Sitzung ist die Unterhaltung. Ich habe das Modell ausgewählt und Streaming aktiviert.“

Sagen Sie: „Der Handler beantwortet Berechtigungsanfragen. Die leere Tool-Zulassungsliste entfernt Tool-Funktionen für diese Übung; alles allein zu genehmigen ist keine Sicherheitsgrenze.“

### 4. Hello World senden

Ersetzen Sie unter `// Step 5: Send the first message.` die drei Platzhalterzeilen `let _ = ...`
durch:

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

Behalten Sie das abschließende `Ok(())` bei. Diese Schleife liefert das fehlende
Streaming-Abonnement, lauscht vor dem Senden und wartet sowohl auf den Abschluss des Sendens als
auch auf den Leerlauf. Sie macht Fehler oder ein Timeout von 60 Sekunden sichtbar, nachdem Sitzung
und Client geschlossen wurden.

Sagen Sie: „Das ist die Grundform: einen Client starten, eine Sitzung erstellen, Ereignisse abonnieren und eine Nachricht senden. Sobald diese Schleife funktioniert, können wir sie zu unserem Podcast-Agenten weiterentwickeln.“

Führen Sie diesen Hello World-Checkpoint jetzt aus dem Ordner `rust` aus:

```powershell
cargo run --locked
```

Erwartete Ausgabe: eine in das Terminal gestreamte Antwort in einem Satz, danach beendet sich das Programm.

## Zweiter Akt: In einen Podcast-Agenten verwandeln

Verwenden Sie nach Hello World den vorab geschriebenen Code in `src\workshop.rs`, um dieselbe Sitzung in einen auf Fakten gestützten Podcast-Workflow zu verwandeln.

Sagen Sie: „Die Unterhaltung funktioniert. Jetzt verwandeln wir sie in unseren Podcast-Agenten: einen fokussierten Assistenten, der eine ausgewählte GitHub Podcast-Episode recherchieren und Launch-Texte vorbereiten kann, ohne Fakten zu erfinden.“

### 1. Vortragende wählen lassen

Fügen Sie hinzu:

```rust
mod workshop;
```

Fügen Sie `SystemMessageConfig` dem vorhandenen Typimport hinzu:

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

Nach der Authentifizierung, vor dem Erstellen von `config`:

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

Sagen Sie: „So bleibt die Demo live. Ich kann im Raum ein Modell auswählen und dann aus den echten zehn neuesten GitHub Podcast-Episoden wählen. Diese Auswahl wird zur Aufgabe des Podcast-Agenten.“

### 2. Sitzung mit Funktionen ausstatten

Erstellen Sie die Sitzung:

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

Sagen Sie: „Das Modell erhält keinen beliebigen Zugriff auf meine Anwendung. Ich gewähre zwei eng gefasste, typisierte Fähigkeiten, setze sie anhand ihres Namens auf die Zulassungsliste und tausche den Handler, der in Hello World alles genehmigt, gegen `workshop::permission_prompt` aus; dieser lehnt alles ab, was keines dieser Tools ist, und fragt mich über stdin, bevor eines ausgeführt wird.“

Sagen Sie: „Diese Tools machen daraus einen Agenten statt einen generischen Chatbot: Er kann Aktionen für eine vertrauenswürdige Datenquelle ausführen, die meine Anwendung verwaltet.“

Sagen Sie: „Die Systemnachricht verwendet replace, nicht append. Meine Anwendung liefert die vollständige Agentenidentität und die Fundierungsregel für diese Sitzung, statt den Standard-Prompt zu erben.“

### 3. Prompt ersetzen

Ersetzen Sie nur die Zeile `let prompt = ...`. Behalten Sie Streaming-Schleife, Timeout und
Bereinigung bei:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

Sagen Sie: „Der Agent entscheidet, das Episoden-Tool aufzurufen, ich genehmige den schreibgeschützten Lookup, und seine Antwort ist im offiziellen Feed fundiert statt in erfundenen Details.“

Führen Sie den fertigen Podcast-Agenten jetzt aus dem Ordner `rust` aus:

```powershell
cargo run --locked
```

Erwartete Meilensteine: Modellauswahl, Auswahl von zehn Episoden, Tool-Ausführung, Genehmigungs-Prompt, dann auf Fakten gestützter Launch-Text.
