# GitHub Podcast 라이브 데모: Node.js

## 세션 전 준비

1. 이 컴퓨터가 아직 인증되지 않았다면 `copilot auth login`을 실행합니다.
2. 세션 시간 측정 전에 포함된 스타터에서 종속성을 설치합니다:

```powershell
cd start-intro/nodejs
npm ci
```

## 데모 소개

다음과 같이 말합니다: "GitHub Podcast용 팟캐스트 에이전트를 만듭니다. 실제 에피소드를 선택하고 공식 RSS 피드에서 확인된 메타데이터를 가져와 해당 사실을 후원사에 안전한 소셜 문구로 바꿀 수 있습니다."

다음과 같이 말합니다: "가장 작은 Copilot SDK 대화에서 시작한 다음 목적, 정체성 및 애플리케이션 소유 도구를 부여합니다."

## 1막: Hello World

`src\index.ts`를 엽니다. 여기에는 `client`, 인증, `session`, 첫 번째 프롬프트의 자리 표시자가 있습니다.

### 1. 클라이언트 시작

`let client: CopilotClient;`를 다음으로 바꿉니다:

```typescript
const client = new CopilotClient();
try {
  await client.start();
```

`try` 블록은 4단계에서 `finally` 블록을 추가할 때까지 열어 둡니다.
실행하기 전에 네 가지 편집을 모두 완료합니다.

다음과 같이 말합니다: "클라이언트는 Copilot 런타임에 연결하는 수단입니다. 명시적으로 시작하므로 애플리케이션이 수명 주기를 관리합니다."

### 2. 인증 확인

`const isAuthenticated = false;`와 이어지는 `if` 블록을 다음으로 바꿉니다:

```typescript
const isAuthenticated = (await client.getAuthStatus()).isAuthenticated;
if (!isAuthenticated) {
  throw new Error("Run 'copilot auth login' before continuing.");
}
```

다음과 같이 말합니다: "세션을 만들기 전에 이 컴퓨터가 로그인되어 있는지 런타임에 확인할 수 있습니다."

### 3. 스트리밍 세션 만들기

`let session: CopilotSession;`을 다음으로 바꿉니다:

```typescript
const session = await client.createSession({
  model,
  streaming: true,
  availableTools: [],
  onPermissionRequest: approveAll,
});
try {
```

파일 상단의 SDK 가져오기에 `approveAll`을 추가합니다:

```typescript
import { CopilotClient, approveAll, type CopilotSession } from "@github/copilot-sdk";
```

다음과 같이 말합니다: "세션은 대화입니다. 모델을 선택하고 스트리밍을 활성화했습니다, 아래 이벤트 처리기는 도착하는 각 텍스트 조각을 이미 출력합니다."

세션 `try` 블록도 4단계까지 열어 둡니다. 기존
스트리밍 처리기는 그대로 둡니다.

다음과 같이 말합니다: "이 처리기는 권한 요청에 응답합니다. 빈 도구 허용 목록은 이 실습에서 도구 기능을 제거합니다. approve-all만으로는 안전 경계가 되지 않습니다."

### 4. Hello World 전송

`// Step 5: Send the first message.` 아래에 입력합니다:

```typescript
await session.sendAndWait({
    prompt: "Hello world! In one sentence, say what the Copilot SDK helps a Node.js app do.",
}, 60_000);
console.log();
} finally {
  await session.disconnect();
}
} finally {
  await client.stop();
}
```

다음과 같이 말합니다: "기본 형태는 다음과 같습니다: start a client, create a session, listen for events, and send a message. 이 흐름이 작동하면 팟캐스트 에이전트로 발전시킬 수 있습니다."

`nodejs` 폴더에서 다음 Hello World 확인 단계를 실행합니다:

```powershell
npm start
```

예상 출력: 한 문장으로 스트리밍되는 답변과 `sendAndWait`가
턴을 완료합니다. 세션 오류를 전달하고 대기 시간을 다음으로 제한합니다:
60초. 두 `finally` 블록이 세션과 클라이언트를 닫습니다.

## 2막: 팟캐스트 에이전트로 전환

Hello World 이후 `src`의 미리 작성된 도우미를 사용하여 같은 세션을 근거 기반 팟캐스트 흐름으로 전환합니다.

다음과 같이 말합니다: "대화가 작동합니다. 이제 이를 팟캐스트 에이전트로 전환합니다: 선택한 GitHub Podcast 에피소드를 조사하고 사실을 만들지 않고 출시 문구를 준비하는 전문 도우미입니다."

### 1. 발표자가 선택하도록 설정

가져오기를 추가합니다:

```typescript
import { selectModel } from "./model-selector.js";
import { episodeTool, latestEpisodesTool, getLatestEpisodes, pickEpisode } from "./github-podcast-tools.js";
import { permissionPrompt } from "./permission-prompt.js";
```

아래에서 `permissionPrompt`가 대체하므로 SDK 가져오기에서 `approveAll`을 제거합니다:

```typescript
import { CopilotClient, type CopilotSession } from "@github/copilot-sdk";
```

클라이언트 `try` 블록에서 인증 후 세션을 만들기 전에 다음을 추가합니다:

```typescript
const selectedModel = await selectModel(client, model);
const latestEpisodes = await getLatestEpisodes();
const selectedEpisode = await pickEpisode(latestEpisodes);
```

다음과 같이 말합니다: "이렇게 하면 데모를 실시간으로 진행할 수 있습니다. 현장에서 모델을 선택한 다음 실제 최신 GitHub Podcast 에피소드 10개 중 하나를 선택할 수 있습니다. 선택한 항목이 팟캐스트 에이전트의 작업이 됩니다."

### 2. 세션에 기능 부여

세션 구성을 다음으로 바꿉니다:

```typescript
const session = await client.createSession({
  model: selectedModel,
  streaming: true,
  tools: [episodeTool, latestEpisodesTool],
  availableTools: ["get_github_podcast_episode", "get_latest_github_podcast_episodes"],
  onPermissionRequest: permissionPrompt,
  systemMessage: {
    mode: "replace",
    content: "You are the launch assistant for The GitHub Podcast. Use supplied episode facts only.",
  },
});
```

이 구성 뒤에 세션 `try` 블록을 유지합니다.

다음과 같이 말합니다: "모델에 애플리케이션에 대한 임의의 접근 권한을 주지 않습니다. 범위가 좁고 형식이 지정된 기능 두 개를 부여하고 이름으로 허용 목록에 추가합니다. 또한 Hello World의 approve-all 처리기를 사용자에게 묻는 처리기로 바꾸어 도구가 실행되기 전에 제가 승인하도록 합니다."

다음과 같이 말합니다: "이 도구가 있어 일반 챗봇이 아니라 에이전트가 됩니다: 애플리케이션이 제어하는 신뢰할 수 있는 데이터 원본에 대해 작업을 수행할 수 있습니다."

다음과 같이 말합니다: "시스템 메시지는 append가 아니라 replace를 사용합니다. 기본 프롬프트를 상속하지 않고 애플리케이션이 이 세션의 에이전트 정체성과 근거 규칙을 완전히 제공합니다."

### 3. 프롬프트 교체

기존 `sendAndWait` 호출의 프롬프트만 다음으로 바꿉니다:

```typescript
prompt: `Use get_github_podcast_episode for the episode titled "${selectedEpisode.title}". Return exactly a social headline and a sponsor-safe post under 280 characters. Use only facts returned by the tool; do not invent guests, sponsors, topics, or links.`,
```

다음과 같이 말합니다: "에이전트가 에피소드 도구를 호출하면 읽기 전용 조회를 승인합니다. 응답은 만든 세부 정보가 아니라 공식 피드에 근거합니다."

`nodejs` 폴더에서 완성된 팟캐스트 에이전트를 실행합니다:

```powershell
npm start
```

예상 단계: 모델 선택, 에피소드 10개 중 선택, `[Tool call started]`, 승인 프롬프트, `[Tool call complete]`, 그리고 스트리밍되는 출시 문구입니다.

모델 상태 줄이 `selectedModel`을 사용하도록 업데이트합니다. 이벤트 처리기,
60초 제한 시간 및 두 `finally` 블록을 유지합니다.

