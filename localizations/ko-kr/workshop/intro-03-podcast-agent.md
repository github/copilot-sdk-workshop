# 3단계: 팟캐스트 에이전트 빌드하기

> **시간:** 12분

## 같은 데모 계속 진행하기

방금 완성한 Hello World 애플리케이션을 그대로 유지합니다. 같은
**`LIVE_DEMO.md`** 파일의 **2막: 팟캐스트 에이전트로 전환하기**를 진행합니다.
이 레슨에서는 해당 막을 직접 표시합니다.

가이드의 세 가지 변경 작업을 수행합니다. 모델과 실제 에피소드를 선택하고,
세션에 기능과 정체성을 부여한 다음, 프롬프트를 교체합니다. 피드 파서를 직접
작성하거나 다른 프로젝트를 시작하지 말고 미리 빌드된 도우미를 재사용합니다.

:::language dotnet
`start-intro/dotnet/Program.cs`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
`start-intro/nodejs/src/index.ts`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
`start-intro/python/main.py`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
`start-intro/go/main.go`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
`start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
`start-intro/rust/src/main.rs`에서 계속 진행합니다.
[데모 가이드의 2막](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## 2막: 팟캐스트 에이전트로 전환하기

<!-- LIVE_DEMO -->

## 실행하기

Hello World에서 사용한 것과 같은 폴더 및 실행 명령을 사용합니다. 모델과 실제
에피소드 하나를 선택합니다. `y`를 입력해 승인하기 전에 요청된 도구 이름을 확인합니다.
Enter 키를 누르면 요청이 거부되며, 거부된 요청은 조회에 성공한 것이 아닙니다.

모델 선택, 에피소드 선택, 도구 시작 이벤트, 승인 프롬프트, 도구 완료 이벤트,
스트리밍되는 출시 홍보 문구가 차례로 표시되어야 합니다.

애플리케이션은 모델이 요청한 도구를 호출하기 전에 에피소드 목록을 가져옵니다.
권한 처리기는 애플리케이션의 모든 네트워크 요청이 아니라 모델이 요청한 도구를
제어합니다. 기존 이벤트 처리 및 정리 코드를 그대로 유지합니다.

## 이해도 확인하기

두 도구 등록, 도구의 허용 목록, 권한 처리기, 시스템 메시지를 찾습니다.
Hello World에서 무엇이 변경되었는지 설명합니다.

결과를 선택한 에피소드의 RSS 메타데이터와 비교합니다. 280자 미만의 게시물을
요청해도 **코드에서 제한을 강제하지는 않습니다**. 시스템 메시지가 사실의 정확성이나
스폰서 관련 안전성을 보장하지는 않습니다. 게시하기 **전에** 주장과 길이를 검토합니다.
이 워크숍 중에는 아무것도 게시하지 않습니다.

## 실행 문제 해결하기

- **에피소드 목록이 없음:** 공식 RSS 피드에 접근할 수 있는지 확인합니다. 조회에
  실패했을 때 지어낸 사실로 대체하지 않습니다.
- **승인 프롬프트가 없음:** 두 도구 이름, 도구의 허용 목록, 교체한 권한 처리기를
  모두 확인합니다.
- **입력 대기 중:** 대화형 터미널을 사용해 프롬프트에 응답합니다.
- **조회가 거부됨:** 적절한 경우 다시 실행하고 예상되는 읽기 전용 도구를 승인합니다.
  거부를 우회하려고 처리기를 제거하지 않습니다.

[요약 및 다음 단계](intro-04-wrap-up.md)로 계속 진행합니다.

## 자세히 알아보기

- [Copilot SDK 및 도구 API](https://github.com/github/copilot-sdk)
- [포함된 스타터와 데모 가이드](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
