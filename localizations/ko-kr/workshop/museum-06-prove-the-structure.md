# 5단계: 구조를 검증하기

> **소요 시간:** 10분

## 빌드할 내용

모든 전시 설명문 아래에 출력되는 `PASS/FAIL` 보고서입니다. 새 코드는 두 줄이면 됩니다. 세션
러너가 이미 반환한 텍스트를 받아, 미리 빌드된 검증기에 전달합니다.

## 결정론적 검사가 입증할 수 있는 것과 입증할 수 없는 것

헬퍼 모듈의 검증기는 모델이 전혀 들어가지 않은 일반 코드입니다. 같은 텍스트를 주면 항상 같은
판정을 반환합니다. 다음을 검사합니다.

- level-one 제목이 정확히 하나인지
- `## Narrative` 섹션이 있는지
- narrative가 100-140단어인지
- 정확히 세 개의 번호 매긴 항목이 있는 `## Visitor questions` 섹션이 있는지
- 번호가 매겨진 모든 항목이 물음표로 끝나는지
- 금지된 어휘가 없는지(`software`, `codebase`, `repository`, `terminal`, `GitHub Copilot`)

이것은 **구조적** 계약이며, 실제로 강제할 수 있습니다. 하지만 **사실적** 계약은 아닙니다. 구조가
완벽한 전시 설명문이라도 승인된 어떤 사실도 뒷받침하지 않는 주장을 담을 수 있습니다. 보고서는 이
점을 마지막에 분명히 밝히며, 그 문장이 바로 이 애플리케이션의 정직한 경계입니다.

```text
Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

여러분이 작성할 것은 검증기 자체가 아닙니다. 기계 판정에 *어떻게 반응할지*, 그리고 그 판정이
정확히 무엇을 다루지 않는지 아는 것이 이 단계의 핵심입니다.

## 검증기 연결하기

:::language dotnet
`Program.cs`를 엽니다. 반환된 전시 설명문을 받아 보고서를 출력합니다.

```csharp
    Console.WriteLine();
    var exhibit = await RunSessionAsync(
        GenerationConfig(approvedFacts),
        BuildExhibitPrompt(),
        CuratorStreamer.GenerationTimeout);

    Console.WriteLine();
    Console.WriteLine(CuratorValidation.FormatValidation(CuratorValidation.ValidateExhibit(exhibit)));

    return 0;
```

`CuratorValidation`은 2단계에서 가져온 `MuseumExhibitStudio.Helpers` 네임스페이스 안에 이미
있으므로, 파일 상단에 새로 추가할 것은 없습니다.

**내부 살펴보기:** `Helpers/CuratorValidation.cs`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는
말의 구체적인 답입니다. `ValidateExhibit`는 텍스트를 줄 단위로 나누고, `TitlePattern` 일치를
세며, `## Narrative`와 `## Visitor questions` 제목을 찾고, `WordPattern`으로 narrative
단어 수를 세고, `QuestionPattern`으로 번호 매긴 항목을 수집하며, 전체 텍스트에서
`ProhibitedVocabulary`에 있는 다섯 용어를 검사합니다. 규칙이 실패할 때마다 평문 문장이
`Errors`에 추가되고, `FormatValidation`이 이를 여러분이 출력하는 보고서로 렌더링합니다. 어느
지점에도 모델은 관여하지 않습니다.
:::

:::language nodejs
`src/index.ts`를 엽니다. 헬퍼 import에 `formatValidation`과 `validateExhibit`를 추가한 뒤,
반환된 전시 설명문을 받아 보고서를 출력합니다.

```typescript
    console.log();
    const exhibit = await runSession(
      generationConfig(approvedFacts),
      buildExhibitPrompt(),
      generationTimeoutMs,
    );

    console.log();
    console.log(formatValidation(validateExhibit(exhibit)));
```

**내부 살펴보기:** `src/curator.ts`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는 말의
구체적인 답입니다. `validateExhibit`는 텍스트를 줄 단위로 나누고, `titlePattern` 일치를 세며,
`## Narrative`와 `## Visitor questions` 제목을 찾고, `wordPattern`으로 narrative 단어 수를
세고, `questionPattern`으로 번호 매긴 항목을 수집하며, `prohibitedVocabulary`에 있는 다섯
용어를 전체 텍스트에서 검사합니다. 규칙이 실패할 때마다 평문 문장이 `errors`에 추가되고,
`formatValidation`이 이를 여러분이 출력하는 보고서로 렌더링합니다. 어느 지점에도 모델은
관여하지 않습니다.
:::

:::language python
`main.py`를 엽니다. 헬퍼 import에 `format_validation`과 `validate_exhibit`를 추가한 뒤,
반환된 전시 설명문을 받아 보고서를 출력합니다.

```python
    try:
        print()
        exhibit = await run_session(
            generation_config(facts),
            build_exhibit_prompt(),
            GENERATION_TIMEOUT_SECONDS,
        )

        print()
        print(format_validation(validate_exhibit(exhibit)))
        return 0
```

**내부 살펴보기:** `curator.py`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는 말의 구체적인
답입니다. `validate_exhibit`는 텍스트를 줄 단위로 나누고, `_TITLE_PATTERN` 일치를 세며,
`## Narrative`와 `## Visitor questions` 제목을 찾고, `_WORD_PATTERN`으로 narrative 단어 수를
세고, `_QUESTION_PATTERN`으로 번호 매긴 항목을 수집하며, `PROHIBITED_VOCABULARY`에 있는
다섯 용어를 전체 텍스트에서 검사합니다. 규칙이 실패할 때마다 평문 문장이 `errors`에 추가되고,
`format_validation`이 이를 여러분이 출력하는 보고서로 렌더링합니다. 어느 지점에도 모델은
관여하지 않습니다.
:::

:::language go
`main.go`를 엽니다. 반환된 전시 설명문을 받아 보고서를 출력합니다.

```go
	fmt.Println()
	exhibit, err := runSession(ctx, exhibitConfig, buildExhibitPrompt(), GenerationTimeout)
	if err != nil {
		return err
	}

	fmt.Println()
	fmt.Println(FormatValidation(ValidateExhibit(exhibit)))
	return nil
```

`FormatValidation`과 `ValidateExhibit`는 같은 패키지의 `curator.go`에 있으므로, 추가할 import는
없습니다.

**내부 살펴보기:** `curator.go`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는 말의 구체적인
답입니다. `ValidateExhibit`는 텍스트를 줄 단위로 나누고, 제목 패턴 일치를 세며,
`## Narrative`와 `## Visitor questions` 제목을 찾고, narrative 단어 수를 세고, 번호 매긴
항목을 수집하며, 소문자로 바꾼 텍스트에서 `prohibitedVocabulary`의 다섯 용어를 검사합니다.
규칙이 실패할 때마다 평문 문장이 `validation.Errors`에 추가되고, `FormatValidation`이 이를
여러분이 출력하는 보고서로 렌더링합니다. 어느 지점에도 모델은 관여하지 않습니다.
:::

:::language rust
`src/main.rs`를 엽니다. 크레이트 import에 `format_validation`과 `validate_exhibit`를 추가한 뒤,
반환된 전시 설명문을 받아 보고서를 출력합니다.

```rust
    println!();
    let exhibit = run_session(
        generation_config(&facts)?,
        build_exhibit_prompt(),
        GENERATION_TIMEOUT,
    )
    .await?;

    println!();
    println!("{}", format_validation(&validate_exhibit(&exhibit)));

    Ok(())
```

**내부 살펴보기:** `src/lib.rs`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는 말의 구체적인
답입니다. `validate_exhibit`는 텍스트를 줄 단위로 나누고, 제목 패턴 일치를 세며,
`## Narrative`와 `## Visitor questions` 제목을 찾고, narrative 단어 수를 세고, 번호 매긴
항목을 수집하며, 소문자로 바꾼 텍스트에서 `PROHIBITED_VOCABULARY`를 검사합니다. 규칙이
실패할 때마다 평문 문장이 `errors`에 추가되고, `format_validation`이 이를 여러분이 출력하는
보고서로 렌더링합니다. 어느 지점에도 모델은 관여하지 않습니다.
:::

:::language java
`src/main/java/workshop/MuseumExhibitStudio.java`를 엽니다. 반환된 전시 설명문을 받아 보고서를
출력합니다.

```java
            System.out.println();
            String exhibit = runSession(
                    generationConfig(facts),
                    buildExhibitPrompt(),
                    CuratorStreamer.GENERATION_TIMEOUT);

            System.out.println();
            System.out.println(CuratorValidation.formatValidation(CuratorValidation.validateExhibit(exhibit)));
```

`CuratorValidation`은 같은 `workshop` 패키지에 있으므로 import를 추가할 필요가 없습니다.

**내부 살펴보기:** `CuratorValidation.java`는 "이것은 모델이 아니라 애플리케이션이 입증한다"는
말의 구체적인 답입니다. `validateExhibit`는 텍스트를 줄 단위로 나누고, `TITLE_PATTERN` 일치를
세며, `## Narrative`와 `## Visitor questions` 제목을 찾고, `WORD_PATTERN`으로 narrative
단어 수를 세고, `QUESTION_PATTERN`으로 번호 매긴 항목을 수집하며, 소문자로 바꾼 텍스트에서
`PROHIBITED_VOCABULARY`의 다섯 용어를 검사합니다. 규칙이 실패할 때마다 평문 문장이 `errors`에
추가되고, `formatValidation`이 이를 여러분이 출력하는 보고서로 렌더링합니다. 어느 지점에도 모델은
관여하지 않습니다.
:::

## 실행하기

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start
```
:::
:::language python
```bash
.venv/bin/python main.py
```
:::
:::language go
```bash
go run .
```
:::
:::language rust
```bash
cargo run
```
:::
:::language java
```bash
./mvnw compile exec:java
```
:::

전시 설명문은 이전과 같이 스트리밍된 뒤, 그 아래에 판정이 나타납니다.

```text
Structural checks passed.
- One level-one title: true
- Narrative section: true
- Narrative length: 126 words (within 100-140: true)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

실패한 실행도 똑같이 많은 정보를 줍니다. 결국 한 번쯤은 보게 될 텐데, 보통은 narrative 길이가
원인입니다.

```text
Structural checks found issues:
- One level-one title: true
- Narrative section: true
- Narrative length: 163 words (within 100-140: false)
- Visitor questions section: true
- Numbered questions: 3 (exactly three: true)
- Every item is a question: true
- Prohibited vocabulary: none
  - The narrative must contain 100-140 words; found 163.

Structural checks do not prove factual grounding. Unsupported claims require human review or a separate evaluator.
```

이 경우에도 실행은 성공으로 종료됩니다. 이것은 의도된 동작입니다. 이 보고서는 빌드 게이트가 아니라,
게시할지 결정하는 인간 큐레이터를 위한 것이기 때문입니다. 전시 설명문을 다시 실행하거나, 사실 목록을
더 다듬은 뒤 다시 시도하십시오.

어휘 규칙이 작동하는 모습을 보려면 일부러 실패를 만들어 보십시오. 직접 사실 하나만 제공합니다.

```text
The museum's ticketing terminal was installed in 1998.
```

전시 설명문이 `terminal`이라는 단어를 반복하고, 보고서가 이를 표시합니다. 이 검사는 의도가 아니라
출력을 읽습니다.

## 이해도 확인

- 보고서에 구조 검사가 통과했다고 나와 있습니다. 그 말이 전시 설명문에 대해 *말해 주지 않은 것*은
  무엇입니까?
- 구조적 실패가 프로그램을 멈추지 않습니다. 언제는 이를 강한 실패로 만드는 것이 맞고, 언제는 그것이
  틀립니까?
- 검증기는 결정론적입니다. 모델 기반 검토기가 조금 더 똑똑한 것보다, 왜 박물관에서는 이 점이 더
  중요합니까?

## 자세히 알아보기

- [User prompt submitted hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-submitted.md):
  런타임이 프롬프트를 보내기 전에 코드에서 이를 검사하거나 거부하는 방법을 설명합니다.
- [User prompt transformed hook](https://github.com/github/copilot-sdk/blob/main/docs/hooks/user-prompt-transformed.md):
  런타임이 실제로 구성한 모델 대상 프롬프트를 읽는 방법을 설명합니다.
- [Hooks overview](https://github.com/github/copilot-sdk/blob/main/docs/hooks/hooks-overview.md):
  각 훅이 턴 안에서 어디에 위치하는지 설명합니다. 나중에 실행하는 검사가 아니라, 런타임이 강제하는
  검사가 필요하다면 여기서 확인하십시오.

[Wikipedia MCP로 조사하기](../../../workshop/museum-07-wikipedia-research.md)로 계속 진행합니다.
