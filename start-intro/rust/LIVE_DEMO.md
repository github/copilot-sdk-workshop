# The GitHub Podcast Live Demo: Rust

## Before The Session

1. Run `copilot auth login` if this machine is not already authenticated.
2. Download and check dependencies in the included starter before the timed session:

```powershell
cd start-intro/rust
cargo check --locked
```

## Demo Pitch

Say: "We are building a Podcast Agent for The GitHub Podcast. It will let us choose a real episode, retrieve verified metadata from the official RSS feed, and turn those facts into sponsor-safe social copy."

Say: "We will begin with the smallest possible Copilot SDK conversation, then give it a purpose, an identity, and application-owned tools."

## Act One: Hello World

Start with `src\main.rs`. It deliberately has named placeholders for `client`, `is_authenticated`, and the session.

Add this import:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

Replace the existing `SessionConfig` import; keep `std::io::{self, Write}`.

### 1. Start The Client

Replace the client placeholder with:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

Say: "The client is my connection to the Copilot runtime. I start it explicitly, so the application owns its lifecycle."

### 2. Check Authentication

Replace `let is_authenticated = false;` and its `if` block with:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

Say: "Before creating a session, I can ask the runtime whether this machine is signed in."

### 3. Create The Session

Replace `let session_is_created = false;` and the empty
`if session_is_created { ... }` block with:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

Say: "The session is the conversation. I chose the model and enabled streaming."

Say: "The handler answers permission requests. The empty tool allowlist removes tool capabilities for this exercise; approve-all alone is not a safety boundary."

### 4. Send Hello World

Under `// Step 5: Send the first message.`, replace the three `let _ = ...`
placeholder lines with:

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

Keep the final `Ok(())`. This loop supplies the missing streaming subscription,
listens before sending, and waits for both send completion and idle. It surfaces
errors or a 60-second timeout after closing the session and client.

Say: "That is the basic shape: start a client, create a session, subscribe to events, and send a message. Once this loop works, we can evolve it into our Podcast Agent."

Run this Hello World checkpoint now from the `rust` folder:

```powershell
cargo run --locked
```

Expected output: a one-sentence answer streamed to the terminal, then program exit.

## Act Two: Turn It Into A Podcast Agent

After Hello World, use the prewritten code in `src\workshop.rs` to turn the same session into a grounded podcast workflow.

Say: "The conversation works. Now we will turn it into our Podcast Agent: a focused assistant that can research a selected GitHub Podcast episode and prepare launch copy without inventing facts."

### 1. Let The Presenter Choose

Add:

```rust
mod workshop;
```

Add `SystemMessageConfig` to the existing types import:

```rust
use github_copilot_sdk::types::{MessageOptions, SessionConfig, SystemMessageConfig};
```

After authentication, before constructing `config`:

```rust
let selected_model = workshop::select_model(&client, MODEL).await?;
let latest_episodes = workshop::get_latest_episodes().await?;
let selected_episode = workshop::pick_episode(&latest_episodes)?;
```

Say: "This keeps the demo live. I can choose a model in the room, then choose from the real ten newest GitHub Podcast episodes. That selection becomes the Podcast Agent's assignment."

### 2. Give The Session Capabilities

Create the session:

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

Say: "The model does not get arbitrary access to my application. I grant two narrow, typed capabilities, allowlist them by name, and swap Hello World's approve-all handler for `workshop::permission_prompt`, which denies anything that is not one of these tools and asks me on stdin before one runs."

Say: "These tools are what make this an agent rather than a generic chatbot: it can take action against a trusted data source that my application controls."

Say: "The system message uses replace, not append. My application supplies the complete agent identity and grounding rule for this session instead of inheriting the default prompt."

### 3. Replace The Prompt

Replace only the `let prompt = ...` line. Keep the streaming loop,
timeout, and cleanup:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

Say: "The agent decides to call the episode tool, I approve the read-only lookup, and its response is grounded in the official feed rather than invented details."

Run the completed Podcast Agent now from the `rust` folder:

```powershell
cargo run --locked
```

Expected milestones: model selection, ten-episode selection, tool execution, approval prompt, then grounded launch copy.
