# GitHub Podcast 라이브 데모: Rust: Rust

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 포함된 스타터에서 종속성을 다운로드하고 확인합니다 before the timed session:

```powershell
cd start-intro/rust
cargo check --locked
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

`src\main.rs`에서 시작합니다. 여기에는 의도적으로 이름이 지정된 자리 표시자가 있습니다: `client`, `is_authenticated`, and the session.

Add this import:

```rust
use std::time::Duration;
use github_copilot_sdk::types::{MessageOptions, SessionConfig};
```

다음으로 교체합니다 the existing `SessionConfig` import; keep `std::io::{self, Write}`.

### 1. 클라이언트 시작

다음으로 교체합니다 the client placeholder with:

```rust
let client = Client::start(ClientOptions::default()).await?;
```

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

다음으로 교체합니다 `let is_authenticated = false;` and its `if` block with:

```rust
let is_authenticated = client.get_auth_status().await?.is_authenticated;
if !is_authenticated {
    client.stop().await?;
    return Err("Run 'copilot auth login' before continuing.".into());
}
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 세션 만들기

다음으로 교체합니다 `let session_is_created = false;` and the empty
`if session_is_created { ... }` block with:

```rust
let mut config = SessionConfig::default();
config.model = Some(MODEL.to_owned());
config.streaming = Some(true);
config.available_tools = Some(vec![]);
config.permission_handler = Some(github_copilot_sdk::permission::approve_all());
let session = client.create_session(config).await?;
```

다음과 같이 말합니다: "세션은 대화입니다. I chose the model and enabled streaming."

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

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

마지막 `Ok(())`를 유지합니다. 이 루프는 누락된 스트리밍 구독을 추가하고,
전송 전에 수신을 시작하며 전송 완료와 idle을 모두 기다립니다. It surfaces
errors 또는 60초 제한 시간 세션과 클라이언트를 닫은 후

다음과 같이 말합니다: "기본 형태는 다음과 같습니다: start a client, create a session, subscribe to events, and send a message. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

다음 Hello World 확인 단계를 실행합니다 now `rust` 폴더에서:

```powershell
cargo run --locked
```

예상 출력: a one-sentence answer streamed to the terminal, then program exit.

## 2막: 팟캐스트 에이전트로 전환

After Hello World, use the prewritten code in `src\workshop.rs` 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

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

다음과 같이 말합니다: "이렇게 하면 데모를 실시간으로 진행할 수 있습니다. 현장에서 모델을 선택한 다음 실제 최신 GitHub Podcast 에피소드 10개 중 하나를 선택할 수 있습니다. 선택한 항목이 팟캐스트 에이전트의 작업이 됩니다."

### 2. 세션에 기능 부여

세션을 만듭니다:

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

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다, and swap Hello World's approve-all handler for `workshop::permission_prompt`, which denies anything that is not one of these tools and asks me on stdin before one runs."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "시스템 메시지는 append가 아니라 replace를 사용합니다. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

다음으로 교체합니다 only the `let prompt = ...` line. Keep the streaming loop,
timeout, and cleanup:

```rust
let prompt = format!(
    "Use get_github_podcast_episode for the episode titled \"{}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.",
    selected_episode.title,
);
```

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

완성된 팟캐스트 에이전트를 실행합니다 now `rust` 폴더에서:

```powershell
cargo run --locked
```

예상 단계: model selection, ten-episode selection, tool execution, approval prompt, then grounded launch copy.

