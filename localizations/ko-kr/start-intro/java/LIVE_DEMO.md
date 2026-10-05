# GitHub Podcast 라이브 데모: Java

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 세션 시간 측정 전에 포함된 스타터에서 종속성을 컴파일합니다:

```powershell
cd start-intro/java
./mvnw compile
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

`src\main\java\demo\CopilotSdkLiveDemo.java`에서 시작합니다. 여기에는 의도적으로 이름이 지정된 자리 표시자가 있습니다: `client`, `isAuthenticated`, 및 `session`.

### 1. 클라이언트 시작

`CopilotClient client;`를 다음으로 바꿉니다:

```java
try (var client = new CopilotClient()) {
client.start().get();
```

이 리소스 블록은 4단계에서 닫는 중괄호를 추가할 때까지 열어 둡니다.
실행하기 전에 네 가지 편집을 모두 완료합니다.

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

`boolean isAuthenticated = false;`를 다음으로 바꿉니다:

```java
boolean isAuthenticated = client.getAuthStatus().get().isAuthenticated();
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 세션 만들기

세션 자리 표시자를 다음으로 바꿉니다:

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

`// Step 4: Stream events from the assistant.` 아래의 주석을 다음으로 바꿉니다:

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

스타터에서 표시한 위치에 스트리밍 처리기를 추가합니다. 세션
리소스 블록도 4단계까지 열어 둡니다.

다음과 같이 말합니다: "세션은 대화입니다. 모델을 선택하고 스트리밍을 활성화했습니다."

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

`// Step 5: Send the first message.` 아래에서 자리 표시자 `var config`와
`if (session != null)` 보호 블록을 제거하고 다음으로 바꿉니다:

```java
session.sendAndWait(new MessageOptions()
        .setPrompt("Hello world! In one sentence, say what the Copilot SDK helps a Java app do."))
        .get(60, TimeUnit.SECONDS);
System.out.println();
}
}
```

닫는 중괄호 두 개로 세션과 클라이언트 리소스 블록을
3단계와 1단계의 세션 및 클라이언트 리소스 블록을 닫습니다. 기존 메서드와 클래스의 닫는 중괄호는 유지합니다.

다음과 같이 말합니다: "기본 형태는 다음과 같습니다. 클라이언트를 시작하고 세션을 만든 다음 이벤트를 수신하면서 메시지를 보냅니다. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

`java` 폴더에서 다음 Hello World 확인 단계를 실행합니다:

```powershell
./mvnw compile exec:java
```

예상 출력: 한 문장으로 스트리밍되는 답변입니다. `sendAndWait`는
완료를 기다리고 오류를 전달하며 리소스 블록이 두 SDK 리소스를 닫습니다.

## 2막: 팟캐스트 에이전트로 전환

Hello World 이후 미리 작성된 도우미 클래스를 사용하여 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

`com.github.copilot.rpc.SystemMessageConfig`와
`com.github.copilot.SystemMessageMode`의 가져오기를 추가합니다. 1막의 `java.util.List`는 유지합니다.
아래에서 `PermissionPrompt`가 이를 대체하므로 `PermissionHandler` 가져오기는 더 이상 사용하지 않습니다.

클라이언트 리소스 블록에서 인증 후 `var config` 앞에 다음을 추가합니다:

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

`var config`와 빌더 체인을 다음으로 바꾸되 기존
`try (var session = client.createSession(config).get())` 블록은 유지합니다:

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

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다. 또한 `PermissionPrompt`로 Hello World의 approve-all 처리기를 바꿉니다. 이 처리기는 지정된 도구가 아니면 거부하고 실행 전에 표준 입력으로 사용자에게 묻습니다."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "시스템 메시지는 APPEND가 아니라 REPLACE를 사용합니다. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

기존 제한 시간 설정이 있는 전송에서 `.setPrompt(...)`의 인수만 다음으로 바꿉니다:

```java
"Use get_github_podcast_episode for the episode titled \"" + selectedEpisode.title() + "\""
                + ". Return exactly a social headline and a sponsor-safe post under 280 characters. "
                + "Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
```

모델 상태 줄이 `selectedModel`을 출력하도록 업데이트합니다. 구독,
60초 대기 및 두 리소스 블록은 변경하지 않습니다.

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

`java` 폴더에서 완성된 팟캐스트 에이전트를 실행합니다:

```powershell
./mvnw compile exec:java
```

예상 단계: 모델 선택, 에피소드 10개 중 선택, 도구 실행, 승인 프롬프트, 그리고 근거 기반 출시 문구입니다.

