# 박물관 전시 스튜디오 시작 프로젝트

워크숍에서 사용할 언어의 디렉터리를 선택하고 해당 디렉터리 안에서 직접 작업합니다. 디렉터리로
이동한 후 같은 폴더를 편집기에서 열고(폴더 안에서 `code .`을 실행하거나 다른 편집기의 폴더 열기
명령 사용) 터미널도 해당 위치에 유지합니다. 이 시작 프로젝트에는 고정된 종속성, 이름이 지정된
영역으로 구성된 엔트리 포인트, 미리 빌드된 큐레이터 헬퍼 모듈, 시스템 메시지를 담은 미리 빌드된
파일이 포함되어 있습니다. 헬퍼에는 직접 작성할 필요가 없는 기반 기능이 들어 있습니다. 여기에는
승인된 사실 집합과 해당 범위, 교육자가 이를 선택하거나 입력할 수 있게 해 주는 메뉴, 큐레이터에게
이러한 사실을 전달하는 미리 빌드된 `approved_fact_lookup` 로컬 도구, 사용할 수 있는 조사 결과가
있을 때 캡처된 조사 내용과 인용을 반환하는 미리 빌드된 `approved_wikipedia_fact_lookup` 로컬 도구,
스트리밍 출력기, 결정론적 전시 검증, 범위가 지정된 Wikipedia MCP 서버와 기본 거부 방식의 권한
처리기, 단일 파일 `exhibit.html` 쓰기 권한, 고정된 프롬프트 텍스트(전시 구조, 조사 요청 및 페이지
요구 사항), `COPILOT_MODEL` 조회, 실패 메시지가 포함됩니다. 시스템 메시지 파일에는 세션이
실행되는 세 가지 긴 메시지, 즉 큐레이터용, 조사를 사용할 수 있을 때의 큐레이터용, 조사 어시스턴트용
메시지가 들어 있습니다. 헬퍼는 편집하지 않습니다.

시작 프로젝트에는 전시 프롬프트의 지침, 세션 구성, 도구 등록 또는 세션 실행기가 포함되어 있지
**않습니다**. 학습 과정에서 이를 직접 작성합니다. 먼저 세션을 만들고, 이어서 스트리밍, 큐레이터
음성(미리 빌드된 시스템 메시지 설치), 사실 도구 등록과 제한된 세션 실행기를 사용하는 해당 프롬프트,
검증 보고서, 범위가 지정된 Wikipedia 조사, 대화형 `exhibit.html` 페이지를 구현합니다.
[`workshop/museum-00-preflight.md`](../../../workshop/museum-00-preflight.md)에서 시작합니다.

## 엔트리 포인트 구성 방식

스타터 엔트리 포인트에는 프로그램의 고정된 형태(진입 함수, 오류 처리기, 정리)와 비어 있는 이름
지정 영역 집합이 포함되어 있습니다. 영역은 두 개의 마커 주석이며, 해당 `BEGIN` 줄에는 영역을
건드리는 모든 단계가 나열됩니다.

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

각 수업 코드 블록은 해당 영역과 두 작업 중 하나를 이름으로 지정합니다. **INSERT**는 영역이
비어 있음을 의미합니다. 두 마커 줄 사이에 블록을 붙여 넣습니다. **REPLACE**는 영역에 이전
단계의 코드가 들어 있음을 의미합니다. 두 마커 줄 사이의 모든 내용을 삭제한 다음 블록을 붙여
넣습니다. 블록은 항상 해당 영역의 전체 내용입니다. 마커 줄이나 영역 밖의 코드는 절대 편집하지
않습니다.

| 영역 | 포함 내용 | 단계 |
|---|---|---|
| `imports` | 가져오기 | 1, 이후 단계에 새 이름이 필요할 때마다 |
| `banner` | 프로그램 배너 | 1 |
| `choose-facts` | 사실 선택 호출 | 4 |
| `research` | 선택적 Wikipedia 조사 패스 | 6 |
| `generate` | 전시 생성 호출 | 1~6 |
| `validate` | 검증 보고서 | 5 |
| `sources` | 참조한 출처 | 6 |
| `exhibit-page` | 선택적 `exhibit.html` 세션 | 7 |
| `exhibit-prompt` | 전시 프롬프트 빌더 | 4, 6 |
| `html-prompt` | 페이지 프롬프트 빌더 | 7 |
| `generation-config` | 생성 세션 구성 | 4, 6 |
| `research-config` | 조사 세션 구성 | 6 |
| `html-config` | 페이지 세션 구성 | 7 |
| `session-runner` | 세션 실행기 | 4 |

6단계에서는 승인된 사실 조회와 함께 Wikipedia 조회를 조건부로 등록하고, 내러티브와 방문자 질문을
작성하기 전에 두 도구를 모두 호출하도록 큐레이터에게 요청합니다. 조사 내용은 보충 자료이며 교육자가
검증한 자료가 아닙니다. 승인된 사실이 우선합니다. 조사를 거부하거나 사용할 수 있는 인용 요약을
받지 못하면 `approved_fact_lookup`만 사용해 생성을 진행합니다.

| 언어 | 헬퍼 모듈 | 시스템 메시지 | 디렉터리 이동, 빌드 및 실행 |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

시작 프로젝트를 실행하면 프로젝트 식별 정보가 출력되며 Copilot을 시작하거나 인증을 요구하지 않습니다.
이 파일을 제자리에서 편집하므로 변경 내용이 `git status`에 표시됩니다. 이는 정상입니다. 리포지토리
루트에서 `git checkout -- .`을 실행하면 깨끗한 시작 프로젝트 상태로 복원됩니다.

각 시작 프로젝트에는 완성된 애플리케이션에 필요한 종속성이 이미 고정되어 있으므로 워크숍 중에
프로젝트 매니페스트(Manifest)를 편집할 필요가 없습니다. Rust 시작 프로젝트는 `src/lib.rs`에서
`museum_exhibit_studio` 라이브러리 크레이트(Crate)를 빌드합니다. `src/main.rs`에서 해당 헬퍼를
가져옵니다.
