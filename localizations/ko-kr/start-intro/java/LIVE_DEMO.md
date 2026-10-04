# GitHub Podcast 라이브 데모: Java: Java

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 종속성을 컴파일합니다 in the included starter before the timed session:

```powershell
cd start-intro/java
./mvnw compile
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

Start with `src\main\java\demo\CopilotSdkLiveDemo.java`. 여기에는 의도적으로 이름이 지정된 자리 표시자가 있습니다: `client`, `isAuthenticated`, and `session`.

### 1. 클라이언트 시작

다음으로 교체합니다 `CopilotClient client;` with:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

This resource block stays open until step 4 adds its closing brace.
실행하기 전에 네 가지 편집을 모두 완료합니다.

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

다음으로 교체합니다 `boolean isAuthenticated = false;` with:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 세션 만들기

다음으로 교체합니다 the session placeholder with:

```java
var config = new SessionConfig()
        .setModel(MODEL)
        .setStreaming(true)
        .setAvailableTools(List.of())
        .setOnPermissionRequest(PermissionHandler.APPROVE_ALL);
try (var session = client.createSession(config).get()) {
```

다음 가져오기를 추가합니다:

```java
import com.github.copilot.generated.AssistantMessageDeltaEvent;
import com.github.copilot.generated.ToolExecutionStartEvent;
import com.github.copilot.generated.ToolExecutionCompleteEvent;
import com.github.copilot.rpc.MessageOptions;
import com.github.copilot.rpc.PermissionHandler;
import java.util.List;
import java.util.concurrent.TimeUnit;
```

다음으로 교체합니다 the comments under `// Step 4: Stream events from the assistant.` with:

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

스타터에서 표시한 위치에 스트리밍 처리기를 추가합니다. The session
resource block also stays open until step 4.

다음과 같이 말합니다: "세션은 대화입니다. I chose the model and enabled streaming."

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

Under `// Step 5: Send the first message.`, remove the placeholder `var config`
and its `if (session != null)` guard. 다음으로 교체합니다 them with:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

닫는 중괄호 두 개로 세션과 클라이언트 리소스 블록을
3단계와 1단계에서 마칩니다. 기존 항목을 유지합니다 method and class closing braces.

다음과 같이 말합니다: "기본 형태는 다음과 같습니다: start a client, create a session, listen for events, and send a message. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

다음 Hello World 확인 단계를 실행합니다 now `java` 폴더에서:

```powershell
./mvnw compile exec:java
```

예상 출력: a streamed one-sentence answer. `sendAndWait` waits for
completion and propagates errors; the resource blocks close both SDK resources.

## 2막: 팟캐스트 에이전트로 전환

After Hello World, use the prewritten helper classes 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

가져오기를 추가합니다 for `com.github.copilot.rpc.SystemMessageConfig` and
`com.github.copilot.SystemMessageMode`. Keep `java.util.List` from Act One.
The `PermissionHandler` import is no longer used once `PermissionPrompt` replaces it below.

Inside the client resource block, after authentication and before `var config`:

```java
String selectedModel = ModelSelector.select(client, MODEL);
var latestEpisodes = GitHubPodcastEpisodeTool.latest();
var selectedEpisode = GitHubPodcastEpisodeTool.pick(latestEpisodes);
```

다음과 같이 말합니다: "이렇게 하면 데모를 실시간으로 진행할 수 있습니다. 현장에서 모델을 선택한 다음 실제 최신 GitHub Podcast 에피소드 10개 중 하나를 선택할 수 있습니다. 선택한 항목이 팟캐스트 에이전트의 작업이 됩니다."

### 2. 세션에 기능 부여

도구를 만듭니다:

```java
var episodeTool = GitHubPodcastEpisodeTool.episodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.latestEpisodesTool();
```

다음으로 교체합니다 `var config` and its builder chain, keeping the existing
`try (var session = client.createSession(config).get())` block:

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

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다, and swap Hello World's approve-all handler for `PermissionPrompt`, which denies anything that is not one of these tools and asks me on stdin before one runs."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "The system message uses REPLACE, not APPEND. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

다음으로 교체합니다 only the argument of `.setPrompt(...)` in the existing bounded send:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

모델 상태 줄을 업데이트하여 to print `selectedModel`. Keep the subscriptions,
60-second wait, and both resource blocks unchanged.

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

완성된 팟캐스트 에이전트를 실행합니다 now `java` 폴더에서:

```powershell
./mvnw compile exec:java
```

예상 단계: model selection, ten-episode selection, tool execution, approval prompt, then grounded launch copy.

