# 2단계: 스트리밍 Hello World

> **시간:** 10분

## 스타터로 시작하기

사전 준비에서 열어 둔 `start-intro` 폴더의 엔트리 포인트를 편집합니다.
코드와 함께 **`LIVE_DEMO.md`** 파일을 엽니다. 이 레슨에서는 별도의 구현이
아니라 같은 파일의 **1막: Hello World**를 표시합니다.

번호가 매겨진 네 가지 편집 작업을 순서대로 수행합니다. **클라이언트를 시작하고,
인증을 확인하고, 세션을 생성한 다음, Hello World를 전송합니다**. 스타터에
제공된 이벤트 처리 코드는 그대로 유지합니다. Java와 Rust의 경우 표시된 위치에
누락된 구독 코드가 포함되어 있습니다. 실행하기 전에 네 가지 편집 작업을 모두 완료합니다.

:::language dotnet
`start-intro/dotnet`에서 `Program.cs`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
`start-intro/nodejs`에서 `src/index.ts`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
`start-intro/python`에서 `main.py`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
`start-intro/go`에서 `main.go`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
`start-intro/java`에서 `src/main/java/demo/CopilotSdkLiveDemo.java`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
`start-intro/rust`에서 `src/main.rs`를 편집합니다.
[로컬 데모 가이드 열기](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## 1막: Hello World

<!-- LIVE_DEMO -->

## 실행하기

선택한 언어 폴더에서 데모 가이드에 있는 체크포인트 명령을 사용합니다.
실제로 스트리밍되는 한 문장의 응답이 표시된 후 프로그램이 종료되어야 합니다.
스타터의 배너나 인증 메시지만 표시된다면 Hello World가 성공한 것이 아닙니다.

세션은 권한 처리기와 함께 **빈 도구 허용 목록**을 사용합니다.
모두 승인하는 설정 자체는 안전 경계가 아닙니다. 이 첫 번째 실습에서는 빈 허용 목록으로
도구 기능을 제거합니다. 다음 막에서는 두 설정을 모두 교체합니다.

## 이해도 확인하기

수행한 네 가지 편집 작업을 짚어 봅니다. 클라이언트와 세션이 서로 다른 이유와
턴이 완료되었음을 보고하는 이벤트가 무엇인지 설명합니다.

## 실행 문제 해결하기

- **실제 응답이 없음:** 엔트리 포인트를 저장하고 가이드의 네 단계를 모두 완료합니다.
- **인증 오류:** 동일한 환경에서 `copilot auth login`을 실행합니다.
- **모델을 사용할 수 없음:** 스타터의 기본 설정 모델을 계정에서 사용할 수 있는 ID로
  변경합니다. 다음 막에서는 모델 선택기를 소개합니다.
- **턴이 멈춤:** 권한 처리기와 빈 허용 목록을 유지하고 CLI 연결과 완료 대기를
  확인합니다.

[팟캐스트 에이전트 빌드하기](intro-03-podcast-agent.md)로 계속 진행합니다.

## 자세히 알아보기

- [Copilot SDK 언어별 API](https://github.com/github/copilot-sdk)
- [포함된 스타터와 데모 가이드](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
