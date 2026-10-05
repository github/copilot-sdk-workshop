# 4단계: 요약 및 다음 단계

> **시간:** 3분

## 빌드한 결과

30분간의 가이드 실습을 통해 애플리케이션을 Copilot에 연결하고, 응답을 스트리밍하고,
세션에 명확한 정체성과 읽기 전용 팟캐스트 도구를 부여했습니다. 설치와 인증은
사전 준비에서 별도로 진행했습니다.

## 이해도 확인하기

다음 순서대로 애플리케이션을 설명합니다.

1. **클라이언트**가 연결을 시작하고 인증을 확인합니다.
2. **세션**이 대화와 해당 구성을 유지합니다.
3. **프롬프트**가 이 에피소드의 작업을 지정합니다.
4. 요청하고 승인하면 **도구**가 RSS 정보를 제공합니다.
5. **이벤트**가 응답을 출력하고 도구 활동을 보여 줍니다.
6. 애플리케이션이 완료를 기다리고, 실패를 표시하고, 리소스를 닫습니다.

## 결과 보여 주기

선택한 에피소드, 도구 호출 체크포인트, 그 결과로 생성된 헤드라인과 게시물을
짚어 봅니다. 게스트, 주제, 스폰서 또는 링크를 지어내지 않았는지 확인합니다.
요청한 게시물 길이를 직접 확인합니다.

그런 다음 도구 허용 목록과 권한 처리기를 짚어 봅니다. 시스템 메시지가 둘 중
어느 것도 대체할 수 없는 이유를 설명합니다. 지금까지 빌드한 것은 입문용 데모이며,
생성된 홍보 문구를 자동으로 게시해도 안전하다는 점을 입증한 것은 아닙니다.

:::language dotnet
작업 결과는 `start-intro/dotnet/Program.cs`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[.NET 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)을 검토합니다.
:::
:::language nodejs
작업 결과는 `start-intro/nodejs/src/index.ts`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[Node.js 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md)을 검토합니다.
:::
:::language python
작업 결과는 `start-intro/python/main.py`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[Python 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md)을 검토합니다.
:::
:::language go
작업 결과는 `start-intro/go/main.go`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[Go 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md)을 검토합니다.
:::
:::language java
작업 결과는 `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[Java 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md)을 검토합니다.
:::
:::language rust
작업 결과는 `start-intro/rust/src/main.rs`에 있습니다.
[Hello World](intro-02-hello-world.md) 및
[팟캐스트 에이전트](intro-03-podcast-agent.md) 레슨과
[Rust 스타터 참고 사항](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md)을 검토합니다.
:::

## 심화 워크숍 선택하기

위의 **Hub**를 사용해 워크숍 선택 화면으로 돌아갑니다. 선택한 언어는 유지됩니다.
다음 중 하나를 선택합니다.

- **접근성 검토자(115분):** 페이지를 검사하고, 로컬 가이드와 Playwright MCP를
  결합하고, 증거에 기반한 보고서를 작성합니다.
- **박물관 전시 스튜디오(90분):** 큐레이터 페르소나를 만들고, 승인된 사실을
  사용하고, 구조를 확인하고, 범위가 지정된 Wikipedia 조사를 추가합니다.

각 심화 워크숍에는 자체 사전 준비와 스타터가 있습니다. 이는 다음 단계이며,
이 30분 트랙을 완료하기 위한 추가 요구 사항은 아닙니다.

## 자세히 알아보기

- [공식 Copilot SDK](https://github.com/github/copilot-sdk)
- [SDK 쿡북](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [포함된 입문용 스타터](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
