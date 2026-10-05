# 박물관 전시 스튜디오: 사전 점검

> **시간:** 제한 없음  
> **워크숍:** 비 SDLC 에이전트

## 구축할 항목

박물관 전시 스튜디오(Museum Exhibit Studio)는 교육자가 승인한 사실을 방문객에게 바로
제공할 수 있는 전시 문구로 변환합니다.

```text
approved facts -> bounded prompt -> curator session -> structural checks -> human review
```

`start-museum/<language>`에서 하나의 콘솔 애플리케이션을 계속 확장하며 구축합니다. 각
단계에서는 한 가지 개념을 추가하고 실제 실행으로 마무리하므로, 큐레이터가 완성되는
과정을 직접 확인할 수 있습니다.

| 단계 | 추가하는 항목 | 확인하는 결과 |
|---|---|---|
| 1 | 클라이언트, 세션, 프롬프트 하나 | 터미널에 표시되는 박물관 문구 |
| 2 | 미리 구축된 스트리밍 출력기 | 실시간으로 도착하는 텍스트 |
| 3 | 큐레이터 시스템 메시지 | 달라진 목소리와 형식 |
| 4 | 승인된 사실 도구, 프롬프트 및 경계가 설정된 세션 실행기 | 제공한 사실을 따르는 문구 |
| 5 | 미리 구축된 유효성 검사기 | PASS/FAIL 구조 보고서 |
| 6 | 범위가 제한된 Wikipedia 조사 세션 | 전시에서 분리하여 보관하는 인용된 배경 정보 |
| 7 | 대화형 페이지 | 브라우저의 `exhibit.html` |
| 8 | 완료 축하 및 리소스 | 여기에서 시작하는 다음 프로젝트 |

실습 단계 7개에는 약 90분이 걸립니다. 순서대로 완료한 후 마지막 단계에서 완성한 결과를
축하하고 리소스를 살펴보십시오.

시작 프로젝트에는 직접 작성할 필요가 없는 기반 기능이 이미 포함되어 있습니다. 여기에는
승인된 사실 집합과 해당 경계, 스트리밍 출력기, 결정론적 전시 유효성 검사, 기본적으로
거부하는 권한 처리기가 포함된 범위 제한 Wikipedia MCP 서버, 단일 파일 `exhibit.html`
쓰기 권한 및 간단한 터미널 프롬프트가 포함됩니다. **도우미 모듈은 절대 편집하지
않습니다.** 세션 설정, 시스템 메시지 2개, 프롬프트 빌더, 세션 실행기 하나 및 `main`을
작성합니다.

인증된 GitHub Copilot CLI, 사용할 언어의 런타임 및 터미널이 필요합니다. 완성된
애플리케이션이 아니라 `start-museum/<language>` 아래의 최소 프로젝트에서 직접
작업합니다. `finished/<language>/museum-exhibit-studio` 아래의 완성된 프로젝트는 선택적
참고 자료일 뿐입니다.

## 워크숍 리포지토리 복제

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

시작 프로젝트 디렉터리로 이동하기 전에 터미널이 리포지토리 루트에 있는지 확인합니다.

```bash
test "$(git rev-parse --show-toplevel)" = "$PWD"
```

이 명령은 출력 없이 성공적으로 종료되어야 합니다.

사용할 언어의 시작 디렉터리에서 박물관 애플리케이션을 **그 자리에서** 구축합니다.
복사하는 단계는 없습니다. 따라서 추적되는 리포지토리 파일을 편집하게 되며, 수정한 파일은
`git status`에 표시됩니다. 이는 예상된 올바른 동작입니다. 깨끗한 시작 프로젝트에서 다시
시작하려면 리포지토리 루트에서 `git checkout -- .`을 실행하여 편집 내용을 삭제합니다.

이제 사용할 언어의 시작 디렉터리로 이동한 후 박물관 워크숍의 모든 명령을 해당
디렉터리에서 실행합니다.

:::language dotnet
.NET 시작 디렉터리로 이동한 후 복원하고 빌드하여 로컬 진입점을 실행합니다.

```bash
cd start-museum/dotnet
dotnet restore
dotnet build --no-restore
dotnet run --no-build
```

통과 조건: 빌드가 성공하고 프로그램이 `=== Museum Exhibit Studio starter ===`를 출력한
다음 `Pre-built curator helpers are ready in Helpers/.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/dotnet`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 `MuseumExhibitStudio.Helpers` 네임스페이스의 `Helpers/Curator*.cs`입니다.
모든 단원의 변경 사항은 `Program.cs`에 작성합니다.
:::

:::language nodejs
Node.js 시작 디렉터리로 이동합니다. 잠금 파일은 SDK 1.0.11 및 호환되는
`@github/copilot` 1.0.80 플랫폼 패키지를 그대로 유지합니다.

```bash
cd start-museum/nodejs
npm ci --ignore-scripts --no-audit --fund=false
npm run build
npm start
```

통과 조건: 빌드가 성공하고 프로그램이 `=== Museum Exhibit Studio starter ===`를 출력한
다음 `Pre-built curator helpers are ready in src/curator.ts.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/nodejs`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 `src/curator.ts`입니다. 모든 단원의 변경 사항은 `src/index.ts`에
작성합니다.
:::

:::language python
Python 시작 디렉터리로 이동하여 격리된 가상 환경을 만들고 SDK 1.0.11을 설치합니다.

```bash
cd start-museum/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m py_compile *.py
.venv/bin/python main.py
```

Windows에서 인터프리터는 `.venv/Scripts/python.exe`에 있습니다.

통과 조건: 소스가 컴파일되고 프로그램이 `=== Museum Exhibit Studio starter ===`를
출력한 다음 `Pre-built curator helpers are ready in curator.py.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/python`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 `curator.py`입니다. 모든 단원의 변경 사항은 `main.py`에 작성합니다.
:::

:::language go
Go 시작 디렉터리로 이동하여 잠긴 SDK 1.0.11 종속성을 다운로드하고 빌드합니다.

```bash
cd start-museum/go
go mod download
go build -mod=readonly ./...
go run .
```

통과 조건: 빌드가 성공하고 프로그램이 `=== Museum Exhibit Studio starter ===`를 출력한
다음 `Pre-built curator helpers are ready in curator.go.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/go`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 동일한 `main` 패키지의 `curator.go`입니다. 모든 단원의 변경 사항은
`main.go`에 작성합니다.
:::

:::language rust
Rust 시작 디렉터리로 이동하여 잠긴 종속성을 가져오고 검사합니다.

```bash
cd start-museum/rust
cargo fetch --locked
cargo check --locked
cargo run --locked
```

통과 조건: Cargo가 `Cargo.lock`을 변경하지 않고 프로그램이
`=== Museum Exhibit Studio starter ===`를 출력한 다음
`Pre-built curator helpers are ready in src/lib.rs.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/rust`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 `src/lib.rs`의 `museum_exhibit_studio` 라이브러리 크레이트입니다. 모든
단원의 변경 사항은 `src/main.rs`에 작성합니다.
:::

:::language java
Maven 시작 디렉터리로 이동하여 SDK 1.0.11을 확인하고 컴파일한 후, 포함된 Maven
Wrapper를 사용하여 실행합니다. 별도로 Maven을 설치할 필요가 없으며 Windows에서는
`./mvnw` 대신 `mvnw.cmd`를 사용합니다.

```bash
cd start-museum/java
./mvnw dependency:go-offline
./mvnw compile
./mvnw exec:java
```

통과 조건: Maven이 성공하고 프로그램이 `=== Museum Exhibit Studio starter ===`를 출력한
다음 `Pre-built curator helpers are ready in src/main/java/workshop/.`를 출력합니다.

워크숍의 나머지 과정에서는 `start-museum/java`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력하여 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

도우미 모듈은 `src/main/java/workshop/Curator*.java`입니다. 모든 단원의 변경 사항은
`src/main/java/workshop/MuseumExhibitStudio.java`에 작성합니다.
:::

## 신뢰 경계 설정

| 제어 수단 | 수행할 수 있는 작업 |
|---|---|
| 시스템 메시지 | 역할, 어조, 범위 및 출력 형식을 안내합니다. |
| 도구 허용 목록 | 세션에 어떤 도구가 존재하는지 정확하게 결정합니다. |
| 애플리케이션 코드 | 도구에서 사용하는 데이터를 소유하고 제한, 시간 제한, 유효성 검사 및 정리를 적용합니다. |
| 사람의 검토 | 모든 역사적 주장이 뒷받침되는지 판단합니다. |

교육자가 승인한 사실만 승인된 출처이며, 큐레이터는 애플리케이션이 소유하는 하나의 도구를
통해 해당 사실에 접근합니다. 모델의 메모리는 검증된 박물관 지식이 아니며 프롬프트 지침은
권한 부여 경계가 아닙니다. 세션에서 실제로 수행할 수 있는 작업은 허용 목록과 권한
처리기만 결정합니다.

## 자세히 알아보기

큐레이터의 기반이 되는 SDK 설명서는 이 워크숍 외부에서 제공됩니다. 워크숍과 함께 다음
페이지를 열어 두면 유용합니다.

- [GitHub Copilot SDK 방법 가이드](https://docs.github.com/en/copilot/how-tos/copilot-sdk):
  이 사전 점검에서 다루는 필수 조건을 포함한 GitHub의 공식 SDK 설명서입니다.
- [Copilot SDK 설명서 맵](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  설정, 인증, 기능 및 문제 해결을 위한 색인입니다.
- [기본 설정: 번들 CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  SDK가 Copilot CLI를 찾아 시작하는 방법과 다른 바이너리를 지정하는 방법을 설명합니다.
- [디버깅 가이드](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  실행 시 출력이 생성되기 전에 실패하면 가장 먼저 확인할 자료입니다.

:::language dotnet
- [.NET SDK 참조](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  .NET SDK의 패키지 설치 방법과 최소 예제를 제공합니다.
:::

:::language nodejs
- [Node.js SDK 참조](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  Node.js SDK의 패키지 설치 방법과 최소 예제를 제공합니다.
:::

:::language python
- [Python SDK 참조](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  Python SDK의 패키지 설치 방법과 최소 예제를 제공합니다.
:::

:::language go
- [Go SDK 참조](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  Go SDK의 모듈 설치 방법과 최소 예제를 제공합니다.
:::

:::language rust
- [Rust SDK 참조](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  Rust SDK의 크레이트 설치 방법과 최소 예제를 제공합니다.
:::

:::language java
- [Java SDK 참조](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  Java SDK의 종속성 좌표와 최소 예제를 제공합니다.
:::

[첫 번째 큐레이터 세션](museum-01-first-curator-session.md)으로 계속 진행합니다.
