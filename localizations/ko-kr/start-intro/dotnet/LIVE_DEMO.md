# GitHub Podcast 라이브 데모: .NET

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 포함된 스타터에서 작업합니다 and restore dependencies before the timed session:

```powershell
cd start-intro/dotnet
dotnet restore
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

`Program.cs`에서 시작합니다. 여기에는 의도적으로 이름이 지정된 자리 표시자가 있습니다: `client`, `isAuthenticated`, and `session`. 스트리밍 이벤트 처리기와 완료 대기는 그대로 둡니다.

### 1. 클라이언트 시작

다음으로 교체합니다 `CopilotClient client;` with:

```csharp
await using var client = new CopilotClient();
await client.StartAsync();
```

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

다음으로 교체합니다 `var isAuthenticated = false;` with:

```csharp
var isAuthenticated = (await client.GetAuthStatusAsync()).IsAuthenticated;
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 세션 만들기

Add `using GitHub.Copilot.Rpc;` 파일 상단에 추가합니다. 다음으로 교체합니다
`CopilotSession session = null!;` with:

```csharp
await using var session = await client.CreateSessionAsync(new SessionConfig
{
    Model = Model,
    Streaming = true,
    AvailableTools = [],
    OnPermissionRequest = PermissionHandler.ApproveAll
});
```

다음과 같이 말합니다: "세션은 대화입니다. 모델을 선택하고 스트리밍을 활성화했습니다, and the event handler below already prints each text fragment as it arrives."

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

Under `// Step 5: Send the first message.`, type:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = "Hello world! In one sentence, say what the Copilot SDK helps a .NET app do."
});
```

다음으로 교체합니다 the final `await complete.Task;` with:

```csharp
await complete.Task.WaitAsync(TimeSpan.FromSeconds(60));
Console.WriteLine();
```

기존 event handler 이미 제공됩니다; it is not a fifth editing
exercise. It prints deltas, surfaces session errors, and finishes on idle.
`await using` closes the client and session after the run.

다음과 같이 말합니다: "기본 형태는 다음과 같습니다: start a client, create a session, listen for events, and send a message. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

예상 출력: a streamed one-sentence answer, followed by the existing `SessionIdleEvent` completing the program.

다음 Hello World 확인 단계를 실행합니다 from `start-intro/dotnet`:

```powershell
dotnet run
```

## 2막: 팟캐스트 에이전트로 전환

After Hello World, add the prewritten helpers in `Helpers` and `Tools` 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

Add usings for the prewritten helpers:

```csharp
using CopilotSdkLiveDemo.Helpers;
using CopilotSdkLiveDemo.Tools;
```

인증 후 완료 신호와 세션을 만들기 전에 선택기를 추가합니다
and 최신 에피소드 10개 중 하나를 선택합니다:

```csharp
var model = await ModelSelector.PickAsync(client, Model);
var latestEpisodes = await GitHubPodcastEpisodeTool.GetLatestAsync();
var selectedEpisode = EpisodeSelector.Pick(latestEpisodes);
var selectedEpisodeTitle = selectedEpisode.Title;
```

다음과 같이 말합니다: "이렇게 하면 데모를 실시간으로 진행할 수 있습니다. 현장에서 모델을 선택한 다음 실제 최신 GitHub Podcast 에피소드 10개 중 하나를 선택할 수 있습니다. 선택한 항목이 팟캐스트 에이전트의 작업이 됩니다."

### 2. 세션에 기능 부여

애플리케이션 소유 도구를 만듭니다:

```csharp
var episodeTool = GitHubPodcastEpisodeTool.CreateEpisodeTool();
var latestEpisodesTool = GitHubPodcastEpisodeTool.CreateLatestEpisodesTool();
```

다음으로 교체합니다 the hello-world `SessionConfig` fields with these, keeping
`await using var session = await client.CreateSessionAsync(...)`:

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

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다, and swap Hello World's approve-all handler for one that prompts me, so I remain the approval point before a tool executes."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "The system message uses 다음으로 교체합니다, not Append. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

다음으로 교체합니다 Hello World 선택한 근거 기반 에피소드 요청으로 교체합니다:

```csharp
await session.SendAsync(new MessageOptions
{
    Prompt = $"Use get_github_podcast_episode for the episode titled \"{selectedEpisodeTitle}\". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links."
});
```

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

예상 단계: model selection, ten-episode selection, `[Tool call started]`, approval prompt, `[Tool call complete]`, then streamed launch copy.

모델 상태 줄을 업데이트하여 to use the selected `model`, not `Model`.
이벤트 처리기를 유지합니다, bounded completion wait, and `await using` declarations.

완성된 팟캐스트 에이전트를 실행합니다 같은 폴더에서:

```powershell
dotnet run
```

