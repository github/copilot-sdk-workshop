# GitHub Copilot SDK 워크숍

지금 시작합니다: http://github.github.com/copilot-sdk-workshop/

.NET, Node.js/TypeScript, Python, Go, Rust 또는 Java로 진행하는 세 가지 실습형 GitHub Copilot SDK 워크숍 중 하나를 선택합니다.

- **SDK 101(30분):** 스트리밍 hello world로 시작한 다음,
  [포함된 입문용 스타터](../../start-intro/README.md)의 미리 빌드된 RSS 도구를 사용하여 작은 팟캐스트
  에이전트를 만듭니다.
- **접근성 검토 도구:** 웹 페이지를 검사하고, 애플리케이션에서 관리하는 WCAG 지침을 참조하여
  근거 기반 보고서를 생성하는 SDLC 개발자 도구를 만듭니다.
- **박물관 전시 스튜디오:** 교육 담당자가 승인한 사실을 관람객용 전시 문구로 변환하는 비 SDLC
  큐레이터를 만듭니다. 결정론적 기능 경계 안에서 로컬 조회를 통해 출처가 표시된 Wikipedia
  조사 내용을 선택적으로 보강할 수 있습니다.

SDK를 처음 사용한다면 SDK 101부터 시작합니다. 입문 및 심화 워크숍 전반에서 다음 내용을 학습합니다.

1. Copilot 클라이언트와 대화 세션을 만듭니다.
2. 지속적으로 적용할 에이전트 정책과 작업별 데이터를 분리합니다.
3. 도구 허용 목록의 범위를 엄격하게 제한하여 로컬 도구와 MCP 도구 중에서 선택합니다.
4. 애플리케이션 코드에서 기능, 입력, 제한 시간, 유효성 검사 및 수명 주기 경계를 적용합니다.
5. 모델이 추론할 수 있는 내용과 애플리케이션이 입증해야 하는 내용을 설명합니다.

SDK 101의 안내식 수업 시간은 정확히 30분입니다.
접근성 검토 도구에는 약 115분, 박물관 전시 스튜디오에는 약 90분이 필요합니다.
컴퓨터 설정, 인증 및 종속성 다운로드는 각 워크숍의 시간 제한이 없는 사전 준비 단계에서
별도로 진행합니다.
두 심화 워크숍에는 대화형 HTML 수업이 포함되며, 축하와 리소스 안내로 마무리합니다.

## 워크숍 시작

리포지토리의 **Deploy to GitHub Pages** 워크플로에서 생성된 GitHub Pages URL을 엽니다.
워크숍 결과물과 언어를 선택한 다음 선택한 워크숍을 시작합니다. 사이트는 런타임에 Pages
기본 URL을 확인하므로 조직 또는 사용자 Pages 호스트 이름을 하드 코딩하지 않습니다.

복제한 리포지토리에서 사이트를 미리 보려면 다음 명령을 실행합니다.

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

<http://localhost:8000/docs/>를 엽니다. 브라우저가 수업 뷰어에서 사용하는 Markdown 요청을
차단하므로 `step.html`을 `file://` URL로 열지 않습니다.

## 다른 언어로 워크숍 읽기

사이트에는 서로 독립적인 두 개의 선택기가 있습니다. **Language**는 프로그래밍 언어를
선택하며 URL에 `?lang=`으로 전달됩니다(`dotnet`, `nodejs`, `python`, `go`, `rust`,
`java`). **Docs**는 수업 본문의 자연어를 선택하며 `?locale=`로 전달됩니다.

```text
docs/workshop/step.html?step=intro-02-hello-world&lang=nodejs&locale=ko-kr
```

영어가 기본값이며 URL에서 생략됩니다. 번역된 수업은 원본 디렉터리 구조를 그대로 따라
`localizations/<locale>/` 아래에 있으며, 선택한 값은 `localStorage`에 저장됩니다. 번역된
페이지가 없으면 뷰어가 영어 본문으로 대체합니다.

사용할 수 있는 로케일은 [`docs/locale-registry.js`](../../docs/locale-registry.js)에
정의되어 있습니다. 로케일을 추가하려면 여기에 항목을 추가하고 `localizations/` 아래에
번역된 트리를 만들면 됩니다.

사이트의 라틴 문자 웹폰트에는 한글이 없으므로, 한국어 페이지는
[`docs/korean-typography.css`](../../docs/korean-typography.css)로 한국어 글꼴 스택을
적용합니다. 본문에는 나눔고딕(Google Fonts)을 플랫폼 기본 한국어 글꼴보다 앞에 두고,
코드에는 D2Coding을 사용합니다. D2Coding은
[SIL Open Font License 1.1](../../docs/fonts/LICENSE-D2Coding.txt)에 따라 `docs/fonts/`에
직접 호스팅하며, 한글 영역만 서브셋했기 때문에 영어 페이지에서는 내려받지 않습니다.

## 필수 조건

6개 언어의 런타임을 모두 설치하지 말고 선택한 언어의 런타임만 설치합니다. 각 트랙의 사전 준비에서
해당 요구 사항을 안내합니다. Node.js SDK 101에는 22.12 이상이 필요하며, Java
스타터에는 Maven 3.9 이상도 필요합니다.

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 이상](https://nodejs.org/)
- [Python 3.11 이상](https://www.python.org/downloads/)
- [Go 1.24 이상](https://go.dev/dl/)
- [Rust 1.94 이상](https://rustup.rs/)
- [Java 17 이상](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- GitHub Copilot 구독 또는 평가판
- 브라우저 기반 실습용 Microsoft Edge(워크숍 기본값) 또는 Google Chrome

사전 준비에서는 설치 확인, 인증, 운영 체제별 명령, 예상 출력 및 문제 해결 방법을 안내합니다.

## 리포지토리 구조

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## 변경 내용 검증

```bash
bash scripts/validate-workshop.sh
```

이 명령은 수업 구조, 내부 링크, 사이트 동작 훅, 프로젝트 지원 범위 및 입문 트랙의 정확한
30분 수업 시간 배정을 확인합니다.
그런 다음 브라우저와 독립적인 언어 선택, 사이트 흐름 및 완료 테스트를 실행하고, Copilot 인증,
브라우저 실행 또는 프롬프트 전송 없이 모든 입문용, 접근성 및 박물관 스타터와 모든 완성 프로젝트,
Blazor 대상을 복원, 빌드 또는 구문 검사합니다. 박물관 프로젝트에는 테스트, 모의 객체 또는
픽스처가 포함되지 않으므로 해당 대상은 복원과 빌드만 수행합니다.

언어 ID를 전달하면 하나의 스모크 빌드 대상을 실행할 수 있습니다.

```bash
bash scripts/validate-workshop.sh nodejs
```

풀 리퀘스트는 콘텐츠 검증과 6개 언어의 스모크 빌드를 별도의 GitHub Actions 작업으로
실행하므로, 실패 시 영향을 받은 SDK 트랙을 확인할 수 있습니다.

## SDK 101 워크숍

[`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md)에서 시작합니다. 시간 제한이
있는 세션을 시작하기 **전에** 선택한 런타임을 설치하고 Copilot을 인증한 후 종속성을 다운로드합니다.
안내식 수업 네 개는 SDK 기본 사항(5분), 스트리밍 hello world(10분),
팟캐스트 에이전트(12분), 요약(3분)으로 구성됩니다.

학습자는 이 리포지토리를 한 번 복제하고
[`start-intro/<language>`](../../start-intro/README.md)의 진입점을 편집합니다. 스타터에는
모든 소스 파일, 종속성 매니페스트, 잠금 파일뿐 아니라 RSS 조회, 모델 및 에피소드 선택,
대화형 도구 승인을 위한 미리 빌드된 도우미가 포함되어 있습니다. 두 번째 리포지토리를 복제하거나
더 긴 워크숍을 진행할 필요가 없습니다.

스타터의 진입점 옆에서 `LIVE_DEMO.md`를 엽니다. 실습형 워크숍은 소스 데모의
**hello world 편집 네 단계**, 즉 클라이언트 시작, 인증 확인, 세션 생성 및 메시지 전송을
따릅니다. 같은 애플리케이션의 **Act Two**에서 계속하여 모델과 에피소드를 선택하고,
기능을 허용한 후 프롬프트를 바꿉니다. 웹사이트는 이러한 로컬 가이드 섹션을 직접 렌더링하므로
편집기 가이드와 온라인 워크숍에서 동일한 코드를 설명합니다.

이 트랙에서는 클라이언트/세션 수명 주기, 스트리밍, 로컬 도구 등록, 명확한 목적의
시스템 메시지 및 권한을 다룹니다. MCP, 자동화된 출력 유효성 검사 및 HTML 캡스톤은
심화 워크숍에서 다룹니다. 생성된 팟캐스트 문구를 게시하기 전에 원본과 대조하여 검토합니다.

## 박물관 전시 스튜디오 워크숍

박물관 전시 스튜디오 스타터는 `start-museum/<language>`에 있고 완성된 참조 구현은
`finished/<language>/museum-exhibit-studio`에 있습니다. 각 스타터에는 학습자가 편집하지
않는 미리 빌드된 큐레이터 도우미 모듈 하나가 포함되어 있습니다. 이 모듈에는 승인된 사실 집합과
그 범위, 스트리밍 출력기, 결정론적 전시 유효성 검사, 기본적으로 거부하는 권한 처리기를 갖춘
범위 제한 Wikipedia MCP 서버, 단일 파일 `exhibit.html` 쓰기 권한 및 간단한 터미널
프롬프트가 들어 있습니다.

학습자는 `start-museum/<language>`에서 직접 작업하며 수업을 진행하는 동안 하나의 프로젝트를
확장하고 각 단계에서 실행합니다. 세션 설정, 큐레이터 및 조사 시스템 메시지, 프롬프트 빌더,
수명 주기와 제한 시간을 관리하는 세션 실행기 하나 및 `main`만 작성합니다. 완성된 샘플은 별도의
참조 아키텍처가 아니라 학습자가 최종적으로 완성하는 결과물입니다.

학습자용 트랙은
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md)에서 시작하여 첫 세션,
스트리밍, 큐레이터 문체, 승인된 사실, 구조 검사 및 Wikipedia MCP 조사라는 7개 단계를 거친 후
대화형 `exhibit.html` 캡스톤을 진행하고 [축하와 리소스](workshop/museum-09-complete.md)로
마무리합니다.

사용할 수 있고 출처가 표시된 조사 내용이 있으면 큐레이터는 설명문과 관람객 질문을 작성하기 전에
`approved_fact_lookup`과 읽기 전용 `approved_wikipedia_fact_lookup`을 호출합니다. 두 번째
도구는 실시간 Wikipedia 접근 또는 사람이 검증한 사실이 아니라 캡처한 조사 내용을 반환합니다.
승인된 사실을 우선하며, 조사를 거절했거나 조사에 실패했거나 출처가 없으면 단일 도구 생성 경로를
유지합니다. 구조적 유효성 검사만으로 사실에 근거했음을 입증할 수는 없으므로, 게시 전에 조사한
주장을 검토합니다.

Rust 검사는 모든 워크숍 프로젝트에서 하나의 Cargo 대상 디렉터리를 공유하여 SDK 종속성을
반복해서 컴파일하지 않습니다.

## 배포

검증을 통과하면 `main`에 푸시합니다.
[Pages 워크플로](../../.github/workflows/deploy.yml)는 `docs/`와 `workshop/`의 Markdown
수업, 그리고 `localizations/` 아래의 번역본을 게시합니다. 빌드 및 콘텐츠 검증은 검증
워크플로에서 별도로 실행합니다.

리포지토리 설정에서 GitHub Pages를 사용하도록 설정하고 소스로 **GitHub Actions**를 선택합니다.
배포 작업은 환경에 정식 워크숍 URL을 보고합니다.

배포 워크플로는 게시된 모든 HTML 페이지, 사이트 자산 및 Markdown 수업을 확인합니다.
기본적으로 GitHub Pages가 반환한 URL을 검사합니다. 향후 공개 도메인 또는 사용자 지정
도메인을 대신 검증하려면 리포지토리 Actions 변수 `WORKSHOP_SITE_URL`을 해당 사이트의 기본
URL로 설정합니다. 같은 검사를 다음과 같이 수동으로 실행할 수 있습니다.

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## 참고 자료

- [.NET용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [Node.js/TypeScript용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [Python용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/python)
- [Go용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/go)
- [Rust용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/rust)
- [Java용 GitHub Copilot SDK](https://github.com/github/copilot-sdk/tree/main/java)
- [Copilot SDK 쿡북](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Copilot SDK API 및 소스](https://github.com/github/copilot-sdk)
- [GitHub Copilot CLI 설치](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 라이선스

이 프로젝트에는 [MIT License](../../LICENSE)가 적용됩니다.

이 워크숍은 교육 목적으로 현 상태 그대로 제공됩니다. 완전한 프로덕션 서비스를 제공하기보다
개념과 패턴을 설명하는 것을 목적으로 합니다.
