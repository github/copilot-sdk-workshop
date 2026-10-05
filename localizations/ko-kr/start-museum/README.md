# 박물관 전시 스튜디오 시작 프로젝트

워크숍에서 사용할 언어의 디렉터리를 선택하고 해당 디렉터리 안에서 직접 작업합니다. 디렉터리로
이동한 후 같은 폴더를 편집기에서 열고(폴더 안에서 `code .`을 실행하거나 다른 편집기의 폴더 열기
명령 사용) 터미널도 해당 위치에 유지합니다. 이 시작 프로젝트에는 고정된 종속성, 최소 실행 파일,
미리 빌드된 큐레이터 헬퍼 모듈 하나가 포함되어 있습니다. 헬퍼에는 직접 작성할 필요가 없는 기반
기능이 들어 있습니다. 여기에는 승인된 사실 집합과 해당 범위, 큐레이터에게 이러한 사실을 전달하는
미리 빌드된 `approved_fact_lookup` 로컬 도구, 사용할 수 있는 조사 결과가 있을 때 캡처된 조사 내용과
인용을 반환하는 미리 빌드된 `approved_wikipedia_fact_lookup` 로컬 도구, 스트리밍 출력기,
결정론적 전시 검증, 범위가 지정된 Wikipedia MCP 서버와 기본 거부 방식의 권한 처리기,
단일 파일 `exhibit.html` 쓰기 권한, 간단한 터미널 프롬프트가 포함됩니다.
헬퍼는 편집하지 않습니다.

시작 프로젝트에는 큐레이터 시스템 메시지, 전시 프롬프트, 세션 구성, 도구 등록 또는 오케스트레이션
(Orchestration)이 포함되어 있지 **않습니다**. 학습 과정에서 이를 직접 작성합니다. 먼저 세션을 만들고,
이어서 스트리밍, 큐레이터 음성, 사실 도구 등록과 제한된 세션 실행기를 사용하는 해당 프롬프트,
검증 보고서, 범위가 지정된 Wikipedia 조사, 대화형 `exhibit.html` 페이지를 구현합니다.
각 시작 프로젝트의 엔트리 포인트에는 각 단계의 코드를 정확히 어디에 작성해야 하는지 나타내는
주석이 있습니다. [`workshop/museum-00-preflight.md`](../../../workshop/museum-00-preflight.md)에서 시작합니다.

6단계에서는 승인된 사실 조회와 함께 Wikipedia 조회를 조건부로 등록하고, 내러티브와 방문자 질문을
작성하기 전에 두 도구를 모두 호출하도록 큐레이터에게 요청합니다. 조사 내용은 보충 자료이며 교육자가
검증한 자료가 아닙니다. 승인된 사실이 우선합니다. 조사를 거부하거나 사용할 수 있는 인용 요약을
받지 못하면 `approved_fact_lookup`만 사용해 생성을 진행합니다.

| 언어 | 헬퍼 모듈 | 디렉터리 이동, 빌드 및 실행 |
|---|---|---|
| .NET | `Helpers/Curator*.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

시작 프로젝트를 실행하면 프로젝트 식별 정보가 출력되며 Copilot을 시작하거나 인증을 요구하지 않습니다.
이 파일을 제자리에서 편집하므로 변경 내용이 `git status`에 표시됩니다. 이는 정상입니다. 리포지토리
루트에서 `git checkout -- .`을 실행하면 깨끗한 시작 프로젝트 상태로 복원됩니다.

각 시작 프로젝트에는 완성된 애플리케이션에 필요한 종속성이 이미 고정되어 있으므로 워크숍 중에
프로젝트 매니페스트(Manifest)를 편집할 필요가 없습니다. Rust 시작 프로젝트는 `src/lib.rs`에서
`museum_exhibit_studio` 라이브러리 크레이트(Crate)를 빌드합니다. `src/main.rs`에서 해당 헬퍼를
가져옵니다.
