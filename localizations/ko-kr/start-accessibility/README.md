# 워크숍 시작 프로젝트

워크숍 홈페이지에서 선택한 언어의 디렉터리로 이동한 후 해당 디렉터리 안에서 직접
작업합니다. 별도로 복사할 필요가 없습니다. 해당 디렉터리로 이동하고 같은 폴더를 편집기에서
연 다음(폴더 안에서 `code .`을 실행하거나 다른 편집기의 폴더 열기 명령 사용), 모든 명령을
해당 위치에서 실행합니다. 시작 프로젝트는 의도적으로 최소한의 스캐폴드(Scaffold)로 구성되어 있습니다.
애플리케이션 소유의 WCAG(Web Content Accessibility Guidelines) 카탈로그와 범위가 지정된
권한/스냅샷 리더 헬퍼는 이후 단계를 위해 포함되어 있을 수 있지만, 해당 실행 엔트리 포인트는
각 단계에 도달하기 전까지 Copilot 클라이언트, 세션, 스트리밍 흐름, 로컬 도구, MCP 서버 또는
보고서를 연결하지 않습니다.

| 언어 | 필수 조건 | 디렉터리 이동 및 확인 |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper 포함) | `cd start-accessibility/java && ./mvnw compile` |

이 파일을 제자리에서 편집하므로 변경 내용이 `git status`에 표시됩니다. 이는 정상입니다.
워크숍 리포지토리 루트에서 `git checkout -- .`을 실행하면 깨끗한 시작 프로젝트 상태로 복원됩니다.
Go, Rust, Java 트랙에서 나중에 애플리케이션을 실행하려면
`PATH`에 [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)가
등록되어 있어야 합니다. SDK 설정 및 API 참고 자료는
[공식 Copilot SDK 리포지토리](https://github.com/github/copilot-sdk)와
[쿡북](https://github.com/github/copilot-sdk/tree/main/cookbook)에서 확인할 수 있습니다.

워크숍 전체 과정에서 시작 프로젝트 디렉터리를 유지합니다.
[워크숍 홈페이지](../../../README.md#start-the-workshop)에서 대화형 뷰어로 돌아가고,
학습용 Markdown 파일을 직접 열지 않습니다.
