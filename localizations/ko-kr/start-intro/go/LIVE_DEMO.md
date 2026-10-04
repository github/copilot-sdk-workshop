# GitHub Podcast 라이브 데모: Go: Go

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 종속성을 다운로드합니다 in the included starter before the timed session:

```powershell
cd start-intro/go
go mod download
go mod verify
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

`main.go`에서 시작합니다. 여기에는 의도적으로 이름이 지정된 자리 표시자가 있습니다: `client`, `isAuthenticated`, and `session`. 이벤트 처리기는 그대로 둡니다.

### 1. 클라이언트 시작

다음으로 교체합니다 `var client *copilot.Client` and the following `_ = client` with:

```go
client := copilot.NewClient(&copilot.ClientOptions{LogLevel: "error"})
if err := client.Start(context.Background()); err != nil {
	panic(err)
}
defer client.Stop()
```

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

다음으로 교체합니다 `isAuthenticated := false` with:

```go
authStatus, err := client.GetAuthStatus(context.Background())
if err != nil {
	panic(err)
}
isAuthenticated := authStatus.IsAuthenticated
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 세션 만들기

다음으로 교체합니다 the session placeholder with:

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

다음과 같이 말합니다: "세션은 대화입니다. 모델을 선택하고 스트리밍을 활성화했습니다, and the event handler below prints each text fragment as it arrives."

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

Add `"time"` to the imports. Under `// Step 5: Send the first message.`,
replace `_ = context.Background()` with:

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

기존 항목을 유지합니다 event subscription. `streamResponse`도 호출하지 않습니다.
해당 도우미는 두 번째 구독을 추가하여 각 텍스트 조각을 두 번 출력합니다.

다음과 같이 말합니다: "기본 형태는 다음과 같습니다: start a client, create a session, listen for events, and send a message. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

다음 Hello World 확인 단계를 실행합니다 now `go` 폴더에서:

```powershell
go run .
```

예상 출력: a streamed one-sentence answer, followed by `SendAndWait` completing the turn.

## 2막: 팟캐스트 에이전트로 전환

Hello World 이후 미리 작성된 도우미를 사용하여 in `helpers.go` and `permission_prompt.go` 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

인증 후 세션을 만들기 전에 다음을 추가합니다:

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

다음과 같이 말합니다: "이렇게 하면 데모를 실시간으로 진행할 수 있습니다. 현장에서 모델을 선택한 다음 실제 최신 GitHub Podcast 에피소드 10개 중 하나를 선택할 수 있습니다. 선택한 항목이 팟캐스트 에이전트의 작업이 됩니다."

### 2. 세션에 기능 부여

도구를 만듭니다:

```go
episodeTool := createEpisodeTool()
latestEpisodesTool := createLatestEpisodesTool()
```

세션을 만듭니다:

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

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다, and swap Hello World's approve-all handler for `permissionPrompt` in `permission_prompt.go`, which denies anything that is not one of these tools and asks me on stdin before one runs."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "시스템 메시지는 append가 아니라 replace를 사용합니다. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

Build the prompt immediately before the existing bounded send:

```go
prompt := fmt.Sprintf("Use get_github_podcast_episode for the episode titled %q. Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.", selectedEpisode.Title)
```

`MessageOptions` 필드를 다음으로 변경합니다 `Prompt: prompt`. Update the model-status
line to print `selectedModel`. 기존 항목을 유지합니다 subscription, bounded context,
error check, and deferred cleanup; do not add a second subscription.

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

완성된 팟캐스트 에이전트를 실행합니다 now `go` 폴더에서:

```powershell
go run .
```

예상 단계: model selection, ten-episode selection, `[Tool call started]`, approval prompt, `[Tool call complete]`, then streamed launch copy.

