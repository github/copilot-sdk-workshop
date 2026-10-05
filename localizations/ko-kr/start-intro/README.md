# SDK 101 시작 프로젝트

30분 분량의 SDK 101 워크숍을 위한 전체 시작 프로젝트가 이 디렉터리에 있습니다.
**이 워크숍 리포지토리를 한 번만 복제**하고, 언어 하나를 선택한 다음 해당 엔트리 포인트를
제자리에서 편집합니다. 별도로 복제할 리포지토리나 복사할 프로젝트는 없습니다.

| 언어 | 필수 조건 | 시작 프로젝트 참고 사항 | 데모 가이드 | 엔트리 포인트 |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [설정](dotnet/README.md) | [LIVE_DEMO](../../../start-intro/dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [설정](nodejs/README.md) | [LIVE_DEMO](../../../start-intro/nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [설정](python/README.md) | [LIVE_DEMO](../../../start-intro/python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [설정](go/README.md) | [LIVE_DEMO](../../../start-intro/go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [설정](java/README.md) | [LIVE_DEMO](../../../start-intro/java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [설정](rust/README.md) | [LIVE_DEMO](../../../start-intro/rust/LIVE_DEMO.md) | `rust/src/main.rs` |

시간이 정해진 세션을 시작하기 전에 [사전 점검](../../../workshop/intro-00-preflight.md)을 완료합니다.
`copilot auth login`으로 인증하고 `start-intro/<language>`로 이동한 다음,
해당 폴더를 편집기에서 엽니다(VS Code에서는 `code .` 실행). 종속성 관련 명령과 실행 명령을
모두 해당 폴더에서 실행합니다.

엔트리 포인트에는 의도적으로 자리 표시자가 포함되어 있습니다. 선택한 엔트리 포인트 옆의
**`LIVE_DEMO.md`** 파일을 엽니다. **1막의 네 가지 수정 단계**에 따라 클라이언트를 시작하고,
인증을 확인하고, 세션을 만들고, hello world를 전송합니다. 그런 다음 **2막**에 따라
모델과 에피소드를 선택하고, 세션에 필요한 기능을 허용하고, 프롬프트를 교체합니다.

워크숍 웹 사이트는 [hello-world 학습 과정](../../../workshop/intro-02-hello-world.md)과
[팟캐스트 학습 과정](../../../workshop/intro-03-podcast-agent.md)에서 이와 동일한 가이드 섹션을
표시하며, 다른 구현을 설명하지 않습니다.
이러한 헬퍼에는 모델 및 에피소드 선택, 형식이 지정된 RSS 조회 도구, 대화형 도구 승인이 포함되어
있습니다. 워크숍 중에는 헬퍼를 변경하지 않습니다.

종속성과 사용 가능한 잠금 파일이 포함되어 있습니다. 스모크 빌드(Smoke build)에는 Copilot 인증이나
라이브 프롬프트가 필요하지 않습니다. 완성된 애플리케이션을 실행하려면 Copilot 액세스가 필요하며,
팟캐스트 워크플로(Workflow)에는 공식 RSS 피드에 대한 액세스도 필요합니다.
제자리에서 수행한 편집 내용이 `git status`에 표시되는 것은 정상입니다.

## 출처

이 시작 프로젝트 소스와 `LIVE_DEMO.md` 가이드는
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro)의
리비전(Revision)
[`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97)에서
가져왔습니다.
가이드는 원본의 2막 진행 방식과 번호가 매겨진 네 가지 hello-world 수정 단계를 유지합니다.
로컬 조정 사항은 이 리포지토리의 경로를 사용하고, 완료 대기 시간을 제한하고, SDK 리소스를 닫고,
hello world를 빈 도구 허용 목록으로 제한하며, 누락된 Java/Rust 스트리밍 구독을 제공합니다.
Go는 각 텍스트 조각을 두 번 출력하는 대신 구독 하나를 유지합니다. Node.js에서는 제한된 전송이
콜백에서 예외를 발생시키는 대신 세션 오류를 전파합니다.
Node.js의 RSS 헬퍼는 파서 기반 XML 디코딩과 HTML-일반 텍스트 추출을 사용하며,
CDATA, 엔터티 디코딩, script/style 제외에 대한 회귀 테스트를 포함합니다.
6개 RSS 헬퍼는 모두 10초의 유한한 네트워크 타임아웃을 사용합니다. Java는 네임스페이스가 지정된
재생 시간 메타데이터를 읽을 때 XML DOCTYPE 선언과 외부 리소스를 거부합니다.
Python과 Rust는 SDK의 사용자 지정 도구 권한 페이로드(Payload)를 인식합니다.
Rust는 분리된 입력 스레드에서 승인을 읽으므로 턴 타임아웃이 발생해도 런타임을 종료할 수 있습니다.
업스트림 리포지토리는 출처 표기를 위한 것이며 설정 요구 사항이 아닙니다.
