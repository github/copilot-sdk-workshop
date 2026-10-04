# 박물관 전시 스튜디오

이 완성된 .NET 샘플은 GitHub Copilot SDK를 사용해 승인된 사실을 바탕으로 작은 박물관
전시를 생성합니다. 미리 빌드된 `Helpers/Curator*.cs` 파일은 사실 집합, 경계 검사,
스트리밍, 결정론적 유효성 검사, 범위가 제한된 Wikipedia 권한, 범위가 제한된
`exhibit.html` 쓰기 권한, 터미널 입력 도우미를 제공합니다. `Program.cs`는 학습자가
작성하는 부분으로 유지되며, 큐레이터 및 조사 시스템 메시지를 정의하고, 프롬프트를
구성하고, 세 가지 세션 구성을 인라인으로 만들고, 콘솔 흐름을 조정합니다.

## 샘플 실행

리포지토리 루트에서 다음 명령을 실행합니다.

```bash
dotnet run --project finished/dotnet/museum-exhibit-studio
```

실행 전에 `COPILOT_MODEL`을 설정하면 모델을 선택할 수 있습니다. 그렇지 않으면 Copilot
런타임이 기본 모델을 선택합니다. 이 샘플은 인증된 GitHub Copilot CLI가 필요합니다.

모델에 연결하지 않고 빌드하려면 다음 명령을 실행합니다.

```bash
dotnet build finished/dotnet/museum-exhibit-studio
```

## 이 샘플에서 배울 내용

생성 세션은 항상 애플리케이션이 소유한 도구 `approved_fact_lookup`를 등록하고 허용 목록에
추가합니다. 사용할 수 있는 인용된 조사 결과가 있으면 읽기 전용 로컬 도구
`approved_wikipedia_fact_lookup`도 등록하고 허용 목록에 추가하며, 프롬프트에서
내러티브와 방문자 질문을 작성하기 전에 두 도구를 모두 호출하도록 요청합니다.
replace-mode 시스템 메시지는 승인된 사실에 우선권을 주고 도구 결과를 지침이 아니라
데이터로 취급합니다. `CuratorFacts.CreateApprovedFactLookup`는 모델이 사실을 보기 전에
해당 사실을 제한하고, `CuratorFacts.BoundFacts`는 생성 또는 조사 전송 전에 매번 사실을
잘라내고 검증하며, `CuratorStreamer.StreamExhibitAsync`는 명시적 시간 제한과 함께
모델 출력을 스트리밍합니다.

선택적 Wikipedia 조사는 의도적으로 가볍게 구성되어 있습니다. 별도의 세션은
`CuratorSafety.WikipediaPermissionHandler`를 통해 범위가 제한된 `search` 및
`readArticle` MCP 도구만 노출합니다. 모델은 산문 형식의 메모와 마지막의
`## Sources` 목록을 작성합니다. 애플리케이션은 인용된 출처 제목과 URL을 추출하고
요약 본문은 유지합니다. `CuratorFacts.CreateApprovedWikipediaFactLookup`는 네트워크
접근 없이 해당 본문과 인용의 캡처된 스냅샷을 반환합니다. 조사는 보충 자료일 뿐이며
교육자가 승인한 사실과 결합되지 않습니다. 여기서 "approved"는 사람이 검증했다는 뜻이
아니라 애플리케이션이 수용했다는 뜻입니다. 조사를 거부하면 단일 도구 경로가 유지됩니다.
조사가 실패하거나 인용이 없는 요약이 반환되면 경고를 출력하고 동일한 대체 경로를
따릅니다. 출처는 전시 뒤에도 계속 출력됩니다.

생성 후에는 결정론적 유효성 검사가 제목, `## Narrative`, 100~140단어 내러티브 길이,
`## Visitor questions`, 정확히 세 개의 번호 매긴 질문, 물음표, 금지된 어휘를
검사합니다. 이러한 구조 검사는 사실적 근거를 증명하지 않으므로 사람의 검토는 여전히
필요합니다.

선택적 캡스톤은 `builtin:apply_patch` 또는 `builtin:create`로 `exhibit.html`을
생성합니다. `CuratorSafety.ExhibitWritePermission`은 애플리케이션 작업 디렉터리의
해당 단일 파일만 허용하고 다른 모든 쓰기, 셸 또는 MCP 요청은 거부합니다.

## 수동 확인

1. 샘플을 실행하고 기본 제공 사실 집합 중 하나를 수락합니다.
2. 조사에 참여하고 전시가 생성되기 전에 두 로컬 조회 이벤트가 모두 표시되는지,
   전시 뒤에 출처가 출력되는지 확인합니다. 조사를 거부하고 `approved_fact_lookup`만
   호출되는지도 확인합니다.
3. 전시에 제목 하나, 100~140단어 내러티브 하나, 질문 세 개가 포함되는지 확인합니다.
4. 유효성 검사 요약과 사람 검토 경고가 표시되는지 확인합니다.
5. 선택 사항으로 `exhibit.html`을 생성하고 브라우저에서 독립 실행형 대화형 페이지를
   검토합니다.

이 애플리케이션은 학습자가 박물관 단원을 마친 뒤 최종적으로 갖게 되는 결과물이며, 별도의
참조 아키텍처가 아닙니다. 엔트리포인트는 클라이언트를 시작하고, 세션을 만들고, 시간
제한을 적용하고, 빈 출력을 거부하고, 모든 경로에서 정리하는 작은 세션 실행기 하나를
유지합니다. 조사, 생성, 선택적 HTML 단계는 서로 다른 세션 구성을 사용하면서 이 실행기를
재사용합니다. 다음 트랙을 따라가십시오.
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).

