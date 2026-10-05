# 7단계: 애플리케이션 실행 및 설명

> **소요 시간:** 10분

## 설명할 수 있게 되는 내용

완성된 애플리케이션을 실행하고 애플리케이션의 상태, 도구 경계, 권한 경계 및 보고서의
한계를 설명합니다.

## 전체 에이전트 시스템 살펴보기

:::language dotnet
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

완성된 보고서는
[`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report)에서도 확인할 수 있습니다.
:::

:::language python
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

완성된 보고서는
[`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report)에서도 확인할 수 있습니다.
:::

:::language go
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
완성된 애플리케이션은 에이전트 호스트입니다. 해당 세션은 모델, 애플리케이션이 소유한
함수 및 별도 프로세스에서 실행되는 브라우저를 조정합니다.

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## 이 워크숍을 넘어 설계 확장하기

이러한 경계를 이해하면 워크숍 코드를 그대로 재현하는 데 그치지 않고 다른 애플리케이션에서도
이 설계를 재사용할 수 있습니다. 데이터베이스 조회, 배포 서비스 또는 이슈 추적기는 서로 다른
도구를 사용할 수 있지만, 소유권과 신뢰에 관한 질문은 동일하게 적용됩니다.

:::language dotnet
전체 흐름은
`URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report`입니다.
:::

:::language nodejs
전체 흐름은
`URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report`입니다.
:::

:::language python
전체 흐름은
`URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report`입니다.
:::

:::language go
전체 흐름은
`URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report`입니다.
:::

:::language rust
전체 흐름은
`URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report`입니다.
:::

:::language java
전체 흐름은
`URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report`입니다.
:::

## 완성을 자축하기

변경할 코드는 없습니다. 이번 실행에서 직접 빌드한 애플리케이션을 테스트할 수 있도록
6단계 구현을 그대로 유지합니다.

## 실행하기

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Java 로컬 데모 경고:** 이 명시적 플래그는
> [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273)에 대한 임시 해결 방법입니다. 이 플래그가 없으면
> 콜백이 권한 페이로드의 정확한 URL을 확인할 수 없는 경우 요청을 거부합니다. 이 플래그를 사용하면
> 세션은 구성된 Playwright `browser_navigate` 허용 목록에 따라 한 번에 하나의 요청에 대해 `mcp`
> 권한 종류만 승인하며 정확한 대상을 적용할 수는 없습니다. 제어된 로컬 워크숍 대상에만 사용하고,
> 프로덕션, 공유 또는 신뢰할 수 없는 URL에는 사용하지 마십시오.
:::
다음 워크숍 대상을 사용합니다.

```text
{{TARGET_APP_URL}}
```

다음 다섯 단계를 모두 확인합니다.

1. 클라이언트가 연결되고 세션 하나를 생성합니다.
2. Playwright가 정확한 대상으로 이동하여 접근성 스냅샷을 생성합니다.
3. 범위가 제한된 로컬 리더가 현재 실행의 스냅샷을 반환합니다.
4. 브라우저에서 확인할 수 있는 발견 사항에 대해 로컬 카탈로그를 호출합니다.
5. 응답이 보고서 계약을 따르고 한계를 명시합니다.

:::language dotnet
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse`는 도구 시작/완료 줄을 출력하고 어시스턴트 텍스트를 표준 출력(stdout)으로 스트리밍합니다.
:::

:::language python
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py`는 `report.main`을 시작하며, `report.main`은 델타를 스트리밍한 후 `session.idle`을 기다립니다.
:::

:::language go
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`Client`가 Copilot CLI 수명 주기를 소유하고, `Session`이 하나의 대화를 소유하며,
권한 처리기가 외부 탐색을 통제한다고 설명합니다. 예상 보고서는 증거에 근거해야 합니다.
:::

:::language rust
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`Client`가 런타임을 관리하고, `Session`이 이벤트를 디스패치하며, 형식화된 도구는 애플리케이션이
소유하고, 권한 처리기는 정확히 일치하는 탐색만 신뢰한다고 설명합니다.
:::

:::language java
트랜스크립트는 달라질 수 있지만 다음과 같은 형태여야 합니다.

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Maven이 Java 17 애플리케이션을 컴파일하고, `CopilotClient`가 런타임을 관리하며, 도구의 범위가
계속 제한된다고 설명합니다. 기본적으로 권한 콜백은 정규 URL만 허용합니다. 명시적 로컬 데모
플래그를 사용하면 구성된 `mcp` 종류로 제한되지만 해당 URL을 확인할 수는 없습니다.
:::

제어된 대상에는 브라우저에서 관찰할 수 있는 문제가 의도적으로 포함되어 있습니다. 텍스트 대체
콘텐츠 누락, `main` 랜드마크 부재, 논리적이지 않은 제목 순서, 접근 가능한 이름이 없는 텍스트 상자가
포함됩니다. 보고서를
[게시된 대상 HTML](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html)과 비교하고,
스냅샷과 소스 어디에도 없는 발견 사항은 받아들이지 마십시오.

<details>
<summary>전체 실행 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| 알려진 문제가 누락됨 | 에이전트 출력은 달라질 수 있습니다. 한 번 다시 실행하되, 미리 정해진 답을 강요하지 말고 증거를 요구합니다. |
| 보고된 문제가 페이지에 없음 | 근거가 없는 것으로 판단하여 거부합니다. 프롬프트에는 구체적인 브라우저 증거가 필요합니다. |
| 도구가 거부됨 | `browser_navigate`가 입력한 정확한 대상을 사용하는지 확인합니다. |
| 리더가 스냅샷을 찾지 못함 | 프롬프트 순서를 유지합니다. `read_latest_accessibility_snapshot`을 호출하기 전에 탐색합니다. |
| 런타임을 시작할 수 없음 | `copilot login`으로 다시 인증하고, CLI가 `PATH`에 있는지 확인한 후 해당 언어의 실행 명령을 다시 시도합니다. |

</details>

> **다음 조건을 충족하면 이 단계를 완료한 것입니다.** 보고서가 근거에 기반하고, 도구 이름이 표시되며,
> 코드를 읽지 않고도 아래 아키텍처 관련 질문에 답할 수 있습니다.

## 이해도 확인

1. 세션에 속하는 상태는 무엇입니까?
2. WCAG 카탈로그가 로컬에 있는 이유는 무엇입니까?
3. Playwright가 외부에 있는 이유는 무엇입니까?
4. 권한은 어디에서 적용됩니까?
5. 다른 MCP 서버를 추가하면 무엇이 달라집니까?

<details>
<summary>설명 비교하기</summary>

1. 세션은 하나의 대화에 포함된 메시지, 모델 응답 및 도구 결과를 소유합니다.
2. 애플리케이션이 카탈로그 데이터와 결정론적 조회를 소유하므로 함수는 로컬에 유지됩니다.
3. Playwright는 자체 Node.js 프로세스와 종속성을 갖춘 재사용 가능한 브라우저 기능입니다.
4. MCP 도구 허용 목록은 탐색 기능만 노출하고, 권한 처리기는 정확한 대상만 승인합니다.
   신뢰할 수 있는 로컬 리더는 경로를 받지 않고 새로 생성된 스냅샷만 읽으며, 카탈로그도
   읽기 전용입니다. 애플리케이션이 소유한 이러한 도구에는 권한 검사를 적용하지 않습니다.
5. 서버 구성을 추가하고, 필요한 도구만 노출하며, 신뢰 정책을 정의하고, 동일한 세션 이벤트
   스트림을 통해 호출을 계속 관찰합니다.

</details>

## 다음 단계

[8단계: 모델 선택](08-model-selection.md)으로 계속 진행한 다음, 9단계에서 발견 사항을
대화형 HTML 보고서로 변환합니다.

## 자세히 알아보기

워크숍 애플리케이션은 사용자의 컴퓨터에서 실행됩니다. 다음 페이지에서는 동일한 설계를 다른 곳으로
이동할 때 무엇이 달라지는지 설명합니다.

- [백엔드 서비스](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md):
  로컬 CLI 대신 헤드리스 CLI를 사용하여 서버 측에서 SDK를 실행합니다.
- [확장 및 멀티테넌시](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md):
  수평 확장 및 한 사용자의 세션을 다른 사용자의 세션과 격리하는 패턴을 설명합니다.
- [OpenTelemetry 계측](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md):
  터미널을 직접 확인할 수 없는 곳에서 에이전트가 실행될 때 도구 호출과 턴을 추적합니다.
- [Microsoft Agent Framework 통합](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md):
  더 큰 멀티 에이전트 워크플로 안에 Copilot 세션을 배치합니다.
