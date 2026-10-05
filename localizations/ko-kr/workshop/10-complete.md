# 해냈습니다!

첫 세션부터 브라우저에서 열어 살펴볼 수 있는 대화형 보고서까지 GitHub Copilot SDK를
사용하여 접근성 검토 도구(Accessibility Reviewer)를 완성했습니다. 잠시 시간을 내어
완성한 결과를 감상해 보십시오.

## 하나로 결합한 요소

- 선택한 모델을 사용하는 스트리밍 Copilot 세션
- 애플리케이션이 소유하는 WCAG 지침과 범위가 제한된 Playwright MCP 검사 및
  코드에서 적용하는 권한
- 정상적으로 작동하는 필터가 포함된 독립 실행형 HTML 보고서의 증거 기반 결과

각 결과의 근거가 되는 증거를 계속 검토하십시오. 생성된 보고서는 접근성을 조사하는 데
도움을 주지만, 페이지가 모든 WCAG 요구 사항을 충족한다는 인증서는 아닙니다.

## 프로젝트와 SDK

완성된 프로젝트와 작업 결과를 비교하거나 다음 애플리케이션에서 SDK를 활용하십시오.

:::language dotnet
- [완성된 .NET 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/dotnet/accessibility-report)
- [.NET용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/dotnet)
:::
:::language nodejs
- [완성된 Node.js 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report)
- [Node.js용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/nodejs)
:::
:::language python
- [완성된 Python 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report)
- [Python용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/python)
:::
:::language go
- [완성된 Go 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/accessibility-report)
- [Go용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/go)
:::
:::language rust
- [완성된 Rust 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/accessibility-report)
- [Rust용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/rust)
:::
:::language java
- [완성된 Java 접근성 검토 도구](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/accessibility-report)
- [Java용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/java)
:::

## 자세히 알아보기

- [Copilot SDK 쿡북](https://github.com/github/copilot-sdk/tree/main/cookbook):
  학습한 내용을 바탕으로 개발할 수 있는 실용적인 예제를 제공합니다.
- [Copilot SDK 설명서](https://github.com/github/copilot-sdk/tree/main/docs):
  세션 구성, 도구, 인증 및 배포 지침을 제공합니다.
- [Playwright MCP](https://github.com/microsoft/playwright-mcp):
  애플리케이션의 허용 목록을 좁게 유지하면서 브라우저 기능을 살펴봅니다.
- [Model Context Protocol](https://modelcontextprotocol.io/):
  에이전트가 사용한 외부 도구의 기반이 되는 표준을 이해합니다.

## 계속 개발하기

직접 소유한 다른 페이지를 검토하거나 동일한 세션 및 도구 패턴을 다른 개발자
워크플로에 적용해 보십시오. 새로운 기능을 추가하기 전에 애플리케이션에서 반드시
적용해야 할 사항을 결정하십시오.

아래의 **워크숍 허브로 돌아가기**를 사용하여 선택한 언어로 박물관 전시 스튜디오를
체험하거나, 이전 단계로 돌아가 대화형 보고서를 개선하십시오.
