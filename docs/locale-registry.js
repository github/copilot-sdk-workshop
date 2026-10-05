(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.WorkshopLocales = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const locales = Object.freeze([
        {
            id: 'en',
            displayName: 'English',
            htmlLang: 'en',
            contentPath: '',
            ui: Object.freeze({
                title: 'Choose your workshop | GitHub Copilot SDK',
                description: 'Start with a 30-minute GitHub Copilot SDK 101 workshop, or go deeper with an accessibility reviewer or museum curator.',
                skipLink: 'Skip to workshop overview',
                brandLabel: 'GitHub Copilot SDK Workshop home',
                resourcesLabel: 'Workshop resources',
                targetApp: 'Target app',
                sdkDocs: 'SDK docs',
                sdkDocsNamed: '{language} SDK docs',
                newTab: '(opens in a new tab)',
                settings: {
                    label: 'Settings',
                    locale: 'Language',
                    theme: 'Theme',
                    light: 'Light',
                    dark: 'Dark'
                },
                heroTitle: 'Choose what your agent is here to do.',
                heroDefinition: 'Start with SDK 101 in 30 minutes. Then go deeper: build an agent for the software lifecycle, or take Copilot into a different domain.',
                workshopLegend: 'Choose a workshop',
                languageTitle: 'Choose your workshop language',
                languageSummary: 'Choose a workshop first, then select its implementation language.',
                programmingLanguage: 'Programming language',
                startSelected: 'Start selected workshop',
                startNamed: 'Start {name}',
                startGuidance: 'Choose a workshop and language. No prior agent or SDK experience required.',
                chooseLanguageFor: 'Now choose a language for {name}.',
                workshopUsesLanguage: '{name} will use the {language} SDK.',
                chooseWorkshopContinue: 'Choose a workshop to continue.',
                introRuntimeNote: 'Work in start-intro/{language}. Preflight covers its runtime and dependency setup.',
                runtimeNotes: {
                    dotnet: 'Requires the .NET SDK and a supported C# runtime.',
                    go: 'Requires a supported Go toolchain and module.',
                    java: 'Requires a supported JDK and a Maven or Gradle project.',
                    nodejs: 'Requires a current Node.js LTS release.',
                    python: 'Requires Python and an isolated virtual environment.',
                    rust: 'Requires Rust and Cargo from rustup.'
                },
                lesson: {
                    previous: 'Previous',
                    previousShort: 'Prev',
                    nextShort: 'Next',
                    previousAria: 'Previous: {title}',
                    nextAria: 'Next: {title}',
                    backToHub: 'Back to workshop hub',
                    beforeYouBegin: 'Before you begin',
                    workshop: 'Workshop',
                    skipLink: 'Skip to lesson',
                    siteTitle: 'Copilot SDK Workshop',
                    homeAriaLabel: 'Copilot SDK Workshop home',
                    openSections: 'Open sections',
                    closeSections: 'Close sections',
                    lessonActions: 'Lesson actions',
                    chooseLanguageOption: 'Choose language',
                    progressAriaLabel: 'Workshop progress',
                    loading: 'Loading',
                    stepPosition: 'Step {number} of {count}',
                    preflight: 'Preflight',
                    navigationTitle: '{workshop} steps',
                    navigationAriaLabel: 'Workshop steps',
                    paginationAriaLabel: 'Lesson pagination',
                    loadingLesson: 'Loading lesson.',
                    loadingLessonProgress: 'Loading lesson...',
                    loadingNamed: 'Loading {title}.',
                    loadedNamed: 'Loaded {title}.',
                    completeStatus: '{workshop} complete. You did it! Resources are ready below.',
                    documentTitle: '{step} | {language} | Copilot SDK Workshop',
                    chooseLanguageDocumentTitle: 'Choose a language | Copilot SDK Workshop',
                    chooseLanguageShort: 'Choose a language',
                    chooseLanguageHeading: 'Choose a workshop language',
                    chooseLanguageDetails:
                        'Open Settings and choose one of the six supported programming languages to load this lesson.',
                    chooseLanguageStatus: 'Choose a workshop language to continue.',
                    loadErrorHeading: 'Unable to load this lesson',
                    loadErrorStatus: 'Unable to load this lesson.',
                    loadErrorFileGuidance:
                        'Serve the repository with a local HTTP server; browsers block lesson fetches from file URLs.',
                    loadErrorGuidance:
                        'Refresh the page. If the problem continues, verify that the workshop Markdown was deployed.',
                    copy: 'Copy',
                    copied: 'Copied',
                    copyFailed: 'Copy failed',
                    copyAriaLabel: 'Copy code block',
                    times: {
                        untimed: 'Untimed',
                        resources: 'Resources',
                        minutes: '{count} min'
                    },
                    workshopTitles: {},
                    stepLabels: {},
                    stepTitles: {}
                },
                previewAriaLabel: 'Selected workshop preview',
                previewEmptyTitle: 'workshop-preview',
                previewEmpty: 'Select a workshop to preview its agent flow.',
                outcomesTitle: 'Build the app. Understand the boundary.',
                outcomes: [
                    'Create and manage a Copilot session.',
                    'Separate durable agent policy from task data.',
                    'Choose the right tool surface for the job.',
                    'Validate objective output requirements in code.',
                    'Explain where prompt guidance ends and hard controls begin.'
                ],
                workshops: {
                    intro: {
                        kicker: 'Beginner intro · 30 minutes',
                        name: 'Get started with SDK 101',
                        shortName: 'SDK 101',
                        description: 'Go from a streaming hello world to a podcast agent using the included starter projects. Complete setup beforehand.',
                        capabilities: 'Client and session · streaming · prebuilt local tools · approvals',
                        previewTitle: 'start-intro',
                        preview: `Client → streaming hello world
       → select a podcast episode
       → approve an RSS tool
       → headline and launch post

[tool] get_github_podcast_episode

30 minutes · six languages
Complete setup before the session.`,
                        guidance: 'Learn SDK basics in 30 minutes. Install, authenticate, and download starter dependencies beforehand.'
                    },
                    sdlc: {
                        kicker: 'Developer tool · 115 minutes',
                        name: 'Review web accessibility',
                        shortName: 'accessibility review',
                        description: 'Build an SDLC agent that inspects a page, consults WCAG guidance, and produces an evidence-based report.',
                        capabilities: 'Streaming · local tools · Playwright MCP · permissions',
                        previewTitle: 'accessibility-reviewer',
                        preview: `URL → Playwright inspection
     → WCAG lookup
     → structured report

[tool] playwright-browser_navigate
[tool] accessibility_rule_lookup

Finding
The name input has no accessible name.`,
                        guidance: 'Build an SDLC developer tool in a 115-minute workshop, then celebrate and keep building.'
                    },
                    museum: {
                        kicker: 'Non-SDLC tool · 90 minutes',
                        name: 'Curate a museum exhibit',
                        shortName: 'museum exhibit',
                        description: 'Build a grounded interpretive agent that turns approved facts into visitor-ready exhibit copy.',
                        capabilities: 'Custom persona · one application-owned tool · validation · evaluation',
                        previewTitle: 'museum-exhibit-studio',
                        preview: `Approved facts → curator session
               → exhibit validation
               → visitor-ready copy

Available tools: []
System message: replace

# Journey to the Moon
## Narrative
## Visitor questions`,
                        guidance: 'Build a non-SDLC curator tool in a 90-minute workshop, then celebrate and keep building.'
                    }
                }
            }),
            demoActHeadings: Object.freeze({
                one: '## Act One: Hello World',
                two: '## Act Two: Turn It Into A Podcast Agent'
            })
        },
        {
            id: 'ko-kr',
            displayName: '한국어',
            htmlLang: 'ko',
            contentPath: 'localizations/ko-kr/',
            ui: Object.freeze({
                title: '워크숍 선택 | GitHub Copilot SDK',
                description: '30분 GitHub Copilot SDK 101 워크숍으로 시작하거나, 접근성 검토자 또는 박물관 큐레이터를 만들어 더 깊이 학습해 보세요.',
                skipLink: '워크숍 개요로 건너뛰기',
                brandLabel: 'GitHub Copilot SDK 워크숍 홈',
                resourcesLabel: '워크숍 리소스',
                targetApp: '대상 앱',
                sdkDocs: 'SDK 문서',
                sdkDocsNamed: '{language} SDK 문서',
                newTab: '(새 탭에서 열림)',
                settings: {
                    label: '설정',
                    locale: '언어',
                    theme: '테마',
                    light: '밝게',
                    dark: '어둡게'
                },
                heroTitle: '에이전트가 수행할 작업을 선택하세요.',
                heroDefinition: '30분 만에 SDK 101을 시작하세요. 그런 다음 소프트웨어 수명 주기용 에이전트를 만들거나 Copilot을 다른 분야에 적용해 보세요.',
                workshopLegend: '워크숍 선택',
                languageTitle: '워크숍 프로그래밍 언어 선택',
                languageSummary: '먼저 워크숍을 선택한 다음 구현 언어를 선택하세요.',
                programmingLanguage: '프로그래밍 언어',
                startSelected: '선택한 워크숍 시작',
                startNamed: '{name} 시작',
                startGuidance: '워크숍과 언어를 선택하세요. 사전 에이전트 또는 SDK 경험은 필요하지 않습니다.',
                chooseLanguageFor: '{name}에 사용할 언어를 선택하세요.',
                workshopUsesLanguage: '{name}에서 {language} SDK를 사용합니다.',
                chooseWorkshopContinue: '계속하려면 워크숍을 선택하세요.',
                introRuntimeNote: 'start-intro/{language}에서 작업합니다. 런타임과 종속성 설정은 사전 점검에서 다룹니다.',
                runtimeNotes: {
                    dotnet: '.NET SDK와 지원되는 C# 런타임이 필요합니다.',
                    go: '지원되는 Go 도구 체인과 모듈이 필요합니다.',
                    java: '지원되는 JDK와 Maven 또는 Gradle 프로젝트가 필요합니다.',
                    nodejs: '최신 Node.js LTS 릴리스가 필요합니다.',
                    python: 'Python과 격리된 가상 환경이 필요합니다.',
                    rust: 'rustup으로 설치한 Rust와 Cargo가 필요합니다.'
                },
                lesson: {
                    previous: '이전',
                    previousShort: '이전',
                    nextShort: '다음',
                    previousAria: '이전: {title}',
                    nextAria: '다음: {title}',
                    backToHub: '워크숍 허브로 돌아가기',
                    beforeYouBegin: '시작하기 전에',
                    workshop: '워크숍',
                    skipLink: '수업 내용으로 건너뛰기',
                    siteTitle: 'Copilot SDK 워크숍',
                    homeAriaLabel: 'Copilot SDK 워크숍 홈',
                    openSections: '목차 열기',
                    closeSections: '목차 닫기',
                    lessonActions: '수업 동작',
                    chooseLanguageOption: '언어 선택',
                    progressAriaLabel: '워크숍 진행률',
                    loading: '불러오는 중',
                    stepPosition: '{count}단계 중 {number}단계',
                    preflight: '사전 점검',
                    navigationTitle: '{workshop} 단계',
                    navigationAriaLabel: '워크숍 단계',
                    paginationAriaLabel: '수업 페이지 이동',
                    loadingLesson: '수업을 불러오는 중입니다.',
                    loadingLessonProgress: '수업을 불러오는 중...',
                    loadingNamed: '{title} 수업을 불러오는 중입니다.',
                    loadedNamed: '{title} 수업을 불러왔습니다.',
                    completeStatus: '{workshop}을(를) 완료했습니다. 해내셨습니다! 아래에 자료가 준비되어 있습니다.',
                    documentTitle: '{step} | {language} | Copilot SDK 워크숍',
                    chooseLanguageDocumentTitle: '언어 선택 | Copilot SDK 워크숍',
                    chooseLanguageShort: '언어 선택',
                    chooseLanguageHeading: '워크숍 언어를 선택하세요',
                    chooseLanguageDetails:
                        '수업을 불러오려면 설정을 열고 지원되는 6개 프로그래밍 언어 중 하나를 선택하세요.',
                    chooseLanguageStatus: '계속하려면 워크숍 언어를 선택하세요.',
                    loadErrorHeading: '이 수업을 불러올 수 없습니다',
                    loadErrorStatus: '이 수업을 불러올 수 없습니다.',
                    loadErrorFileGuidance:
                        '로컬 HTTP 서버로 저장소를 제공하세요. 브라우저는 file URL에서의 수업 요청을 차단합니다.',
                    loadErrorGuidance:
                        '페이지를 새로 고치세요. 문제가 계속되면 워크숍 Markdown이 배포되었는지 확인하세요.',
                    copy: '복사',
                    copied: '복사됨',
                    copyFailed: '복사 실패',
                    copyAriaLabel: '코드 블록 복사',
                    times: {
                        untimed: '시간 제한 없음',
                        resources: '자료',
                        minutes: '{count}분'
                    },
                    workshopTitles: {
                        'SDK 101': 'SDK 101',
                        'Accessibility Reviewer': '접근성 검토 도구',
                        'Museum Exhibit Studio': '박물관 전시 스튜디오'
                    },
                    stepTitles: {
                        'intro-00-preflight': '사전 준비: SDK 101 준비',
                        'intro-01-sdk-basics': '1단계: SDK 기본 사항',
                        'intro-02-hello-world': '2단계: 스트리밍 Hello World',
                        'intro-03-podcast-agent': '3단계: 팟캐스트 에이전트 빌드하기',
                        'intro-04-wrap-up': '4단계: 요약 및 다음 단계',
                        '00-preflight': '사전 점검: 작업 환경 준비',
                        '01-first-session': '1단계: 첫 번째 Copilot 세션 만들기',
                        '02-streaming': '2단계: 응답 스트리밍',
                        '03-local-tool': '3단계: 애플리케이션 소유 지식 추가',
                        '04-mcp-safety': '4단계: 외부 도구를 안전하게 연결하기',
                        '05-combine-tools': '5단계: 로컬 도구와 MCP 도구 결합하기',
                        '06-structured-report': '6단계: 구조화된 보고서 작성',
                        '07-run-explain': '7단계: 애플리케이션 실행 및 설명',
                        '08-model-selection': '8단계: 모델 선택',
                        '09-interactive-html-report': '9단계: 대화형 HTML 보고서 생성',
                        '10-complete': '해냈습니다!',
                        'museum-00-preflight': '박물관 전시 스튜디오: 사전 점검',
                        'museum-01-first-curator-session': '1단계: 첫 번째 큐레이터 세션',
                        'museum-02-stream-the-curator': '2단계: 큐레이터 응답 스트리밍',
                        'museum-03-curator-voice': '3단계: 큐레이터에 목소리 부여하기',
                        'museum-04-approved-facts': '4단계: 승인된 사실에 근거 두기',
                        'museum-06-prove-the-structure': '5단계: 구조를 검증하기',
                        'museum-07-wikipedia-research': '6단계: Wikipedia MCP로 조사하기',
                        'museum-08-interactive-exhibit-page': '7단계: 대화형 전시 페이지 게시하기',
                        'museum-09-complete': '해냈습니다!'
                    },
                    stepLabels: {
                        'intro-00-preflight': '사전 점검',
                        'intro-01-sdk-basics': 'SDK 기본 사항',
                        'intro-02-hello-world': 'Hello World',
                        'intro-03-podcast-agent': '팟캐스트 에이전트',
                        'intro-04-wrap-up': '복습',
                        '00-preflight': '사전 점검',
                        '01-first-session': '첫 번째 세션',
                        '02-streaming': '스트리밍',
                        '03-local-tool': '로컬 도구',
                        '04-mcp-safety': 'MCP 및 권한',
                        '05-combine-tools': '도구 결합',
                        '06-structured-report': '구조화된 보고서',
                        '07-run-explain': '실행 및 설명',
                        '08-model-selection': '모델 선택',
                        '09-interactive-html-report': '대화형 보고서',
                        '10-complete': '축하 및 다음 단계',
                        'museum-00-preflight': '사전 점검',
                        'museum-01-first-curator-session': '첫 번째 세션',
                        'museum-02-stream-the-curator': '스트리밍',
                        'museum-03-curator-voice': '큐레이터의 목소리',
                        'museum-04-approved-facts': '승인된 사실',
                        'museum-06-prove-the-structure': '구조 검사',
                        'museum-07-wikipedia-research': 'Wikipedia 조사',
                        'museum-08-interactive-exhibit-page': '전시 페이지',
                        'museum-09-complete': '축하 및 다음 단계'
                    }
                },
                previewAriaLabel: '선택한 워크숍 미리 보기',
                previewEmptyTitle: '워크숍 미리 보기',
                previewEmpty: '워크숍을 선택하면 에이전트 흐름을 미리 볼 수 있습니다.',
                outcomesTitle: '앱을 만들고 경계를 이해하세요.',
                outcomes: [
                    'Copilot 세션을 만들고 관리합니다.',
                    '지속되는 에이전트 정책과 작업 데이터를 분리합니다.',
                    '작업에 적합한 도구 표면을 선택합니다.',
                    '코드에서 객관적인 출력 요구 사항을 검증합니다.',
                    '프롬프트 지침이 끝나고 강제 제어가 시작되는 지점을 설명합니다.'
                ],
                workshops: {
                    intro: {
                        kicker: '초급 입문 · 30분',
                        name: 'SDK 101 시작하기',
                        shortName: 'SDK 101',
                        description: '포함된 스타터 프로젝트로 스트리밍 Hello World에서 팟캐스트 에이전트까지 진행합니다. 미리 설정을 완료하세요.',
                        capabilities: '클라이언트 및 세션 · 스트리밍 · 사전 제작 로컬 도구 · 승인',
                        previewTitle: 'start-intro',
                        preview: `클라이언트 → 스트리밍 Hello World
           → 팟캐스트 에피소드 선택
           → RSS 도구 승인
           → 헤드라인 및 게시물 작성

[도구] get_github_podcast_episode

30분 · 6개 언어
세션 전에 설정을 완료하세요.`,
                        guidance: '30분 만에 SDK 기본 사항을 학습합니다. 미리 설치, 인증, 스타터 종속성 다운로드를 완료하세요.'
                    },
                    sdlc: {
                        kicker: '개발자 도구 · 115분',
                        name: '웹 접근성 검토하기',
                        shortName: '웹 접근성 검토',
                        description: '페이지를 검사하고 WCAG 지침을 참고하며 근거 기반 보고서를 작성하는 SDLC 에이전트를 만듭니다.',
                        capabilities: '스트리밍 · 로컬 도구 · Playwright MCP · 권한',
                        previewTitle: 'accessibility-reviewer',
                        preview: `URL → Playwright 검사
    → WCAG 조회
    → 구조화된 보고서

[도구] playwright-browser_navigate
[도구] accessibility_rule_lookup

발견 사항
이름 입력에 접근 가능한 이름이 없습니다.`,
                        guidance: '115분 워크숍에서 SDLC 개발자 도구를 만들고, 결과를 축하한 뒤 계속 발전시켜 보세요.'
                    },
                    museum: {
                        kicker: '비-SDLC 도구 · 90분',
                        name: '박물관 전시 큐레이션하기',
                        shortName: '박물관 전시',
                        description: '승인된 사실을 방문객용 전시 문구로 바꾸는 근거 기반 해석 에이전트를 만듭니다.',
                        capabilities: '사용자 지정 페르소나 · 애플리케이션 소유 도구 하나 · 검증 · 평가',
                        previewTitle: 'museum-exhibit-studio',
                        preview: `승인된 사실 → 큐레이터 세션
            → 전시 검증
            → 방문객용 문구

사용 가능한 도구: []
시스템 메시지: replace

# 달을 향한 여정
## 내러티브
## 방문객 질문`,
                        guidance: '90분 워크숍에서 비-SDLC 큐레이터 도구를 만들고, 결과를 축하한 뒤 계속 발전시켜 보세요.'
                    }
                }
            }),
            demoActHeadings: Object.freeze({
                one: '## 1막: Hello World',
                two: '## 2막: 팟캐스트 에이전트로 전환'
            })
        },
        {
            id: 'ja-jp',
            displayName: '日本語',
            htmlLang: 'ja',
            contentPath: 'localizations/ja-jp/',
            ui: Object.freeze({
                title: 'ワークショップを選択 | GitHub Copilot SDK',
                description: '30 分の GitHub Copilot SDK 101 ワークショップから始めるか、アクセシビリティレビューアーや博物館キュレーターで一歩進んだ内容に取り組みます。',
                skipLink: 'ワークショップ概要へスキップ',
                brandLabel: 'GitHub Copilot SDK ワークショップのホーム',
                resourcesLabel: 'ワークショップリソース',
                targetApp: '対象アプリ',
                sdkDocs: 'SDK ドキュメント',
                sdkDocsNamed: '{language} SDK ドキュメント',
                newTab: '(新しいタブで開きます)',
                settings: {
                    label: '設定',
                    locale: '表示言語',
                    theme: 'テーマ',
                    light: 'ライト',
                    dark: 'ダーク'
                },
                heroTitle: 'エージェントの目的を選択する。',
                heroDefinition: 'まず 30 分で SDK 101 に取り組みます。さらに、ソフトウェアライフサイクル向けのエージェントを構築したり、Copilot を別の分野で活用したりします。',
                workshopLegend: 'ワークショップを選択',
                languageTitle: 'ワークショップのプログラミング言語を選択',
                languageSummary: 'まずワークショップを選び、次に実装言語を選択します。',
                programmingLanguage: 'プログラミング言語',
                startSelected: '選択したワークショップを開始',
                startNamed: '「{name}」を開始',
                startGuidance: 'ワークショップと言語を選択します。エージェントや SDK の事前経験は不要です。',
                chooseLanguageFor: '「{name}」の言語を選択します。',
                workshopUsesLanguage: '「{name}」では {language} SDK を使用します。',
                chooseWorkshopContinue: '続行するワークショップを選択します。',
                introRuntimeNote: 'start-intro/{language} で作業します。事前準備では、そのランタイムと依存関係のセットアップを扱います。',
                runtimeNotes: {
                    dotnet: '.NET SDK と対応する C# ランタイムが必要です。',
                    go: '対応する Go ツールチェーンとモジュールが必要です。',
                    java: '対応する JDK と Maven または Gradle プロジェクトが必要です。',
                    nodejs: '最新の Node.js LTS リリースが必要です。',
                    python: 'Python と分離された仮想環境が必要です。',
                    rust: 'rustup から入手した Rust と Cargo が必要です。'
                },
                lesson: {
                    previous: '前へ',
                    previousShort: '前へ',
                    nextShort: '次へ',
                    previousAria: '前へ: {title}',
                    nextAria: '次へ: {title}',
                    backToHub: 'ワークショップハブに戻る',
                    beforeYouBegin: '始める前に',
                    workshop: 'ワークショップ',
                    skipLink: 'レッスンへスキップ',
                    siteTitle: 'Copilot SDK ワークショップ',
                    homeAriaLabel: 'Copilot SDK ワークショップのホーム',
                    openSections: 'セクションを開く',
                    closeSections: 'セクションを閉じる',
                    lessonActions: 'レッスン操作',
                    chooseLanguageOption: '言語を選択',
                    progressAriaLabel: 'ワークショップの進行状況',
                    loading: '読み込み中',
                    stepPosition: 'ステップ {number}/{count}',
                    preflight: '事前準備',
                    navigationTitle: '{workshop} のステップ',
                    navigationAriaLabel: 'ワークショップのステップ',
                    paginationAriaLabel: 'レッスンのページ移動',
                    loadingLesson: 'レッスンを読み込んでいます。',
                    loadingLessonProgress: 'レッスンを読み込み中...',
                    loadingNamed: '{title} を読み込んでいます。',
                    loadedNamed: '{title} を読み込みました。',
                    completeStatus: '{workshop} が完了しました。やり遂げました！リソースは以下で利用できます。',
                    documentTitle: '{step} | {language} | Copilot SDK ワークショップ',
                    chooseLanguageDocumentTitle: '言語を選択 | Copilot SDK ワークショップ',
                    chooseLanguageShort: '言語を選択',
                    chooseLanguageHeading: 'ワークショップのプログラミング言語を選択',
                    chooseLanguageDetails:
                        'このレッスンを読み込むには、設定を開き、対応する 6 つのプログラミング言語から 1 つを選択します。',
                    chooseLanguageStatus: '続行するには、ワークショップのプログラミング言語を選択します。',
                    loadErrorHeading: 'このレッスンを読み込めません',
                    loadErrorStatus: 'このレッスンを読み込めません。',
                    loadErrorFileGuidance:
                        'ローカル HTTP サーバーでリポジトリを配信してください。ブラウザーは file URL からのレッスン取得をブロックします。',
                    loadErrorGuidance:
                        'ページを更新してください。問題が続く場合は、ワークショップ Markdown がデプロイされていることを確認してください。',
                    copy: 'コピー',
                    copied: 'コピー済み',
                    copyFailed: 'コピー失敗',
                    copyAriaLabel: 'コードブロックをコピー',
                    times: {
                        untimed: '時間制限なし',
                        resources: 'リソース',
                        minutes: '{count} 分'
                    },
                    workshopTitles: {},
                    stepLabels: {
                        'intro-00-preflight': '事前準備',
                        'intro-01-sdk-basics': 'SDK の基本',
                        'intro-02-hello-world': 'Hello World',
                        'intro-03-podcast-agent': 'ポッドキャストエージェント',
                        'intro-04-wrap-up': 'まとめ',
                        '00-preflight': '事前準備',
                        '01-first-session': '最初のセッション',
                        '02-streaming': 'ストリーミング',
                        '03-local-tool': 'アプリ所有の知識',
                        '04-mcp-safety': '外部ツール接続',
                        '05-combine-tools': 'ツールの組み合わせ',
                        '06-structured-report': '構造化レポート',
                        '07-run-explain': '実行と説明',
                        '08-model-selection': 'モデル選択',
                        '09-interactive-html-report': 'インタラクティブレポート',
                        '10-complete': '達成と次のステップ',
                        'museum-00-preflight': '事前準備',
                        'museum-01-first-curator-session': '最初のキュレーターセッション',
                        'museum-02-stream-the-curator': 'キュレーターのストリーミング',
                        'museum-03-curator-voice': 'キュレーターの語り口',
                        'museum-04-approved-facts': '承認済みの事実',
                        'museum-06-prove-the-structure': '構造の検証',
                        'museum-07-wikipedia-research': 'Wikipedia 調査',
                        'museum-08-interactive-exhibit-page': '展示ページ',
                        'museum-09-complete': '達成と次のステップ'
                    },
                    stepTitles: {
                        'intro-00-preflight': '事前準備: SDK 101 の準備をする',
                        'intro-01-sdk-basics': 'ステップ 1: SDK の基本',
                        'intro-02-hello-world': 'ステップ 2: ストリーミングで Hello World',
                        'intro-03-podcast-agent': 'ステップ 3: ポッドキャストエージェントを構築する',
                        'intro-04-wrap-up': 'ステップ 4: まとめと次のステップ',
                        '00-preflight': '事前準備: マシンをセットアップする',
                        '01-first-session': 'ステップ 1: 最初の Copilot セッションを作成する',
                        '02-streaming': 'ステップ 2: 応答をストリーミングする',
                        '03-local-tool': 'ステップ 3: アプリケーションが所有する知識を追加する',
                        '04-mcp-safety': 'ステップ 4: 外部ツールを安全に接続する',
                        '05-combine-tools': 'ステップ 5: ローカルツールと MCP ツールを組み合わせる',
                        '06-structured-report': 'ステップ 6: 構造化レポートを生成する',
                        '07-run-explain': 'ステップ 7: アプリケーションを実行して説明する',
                        '08-model-selection': 'ステップ 8: モデルを選択する',
                        '09-interactive-html-report': 'ステップ 9: インタラクティブな HTML レポートを生成する',
                        '10-complete': 'やり遂げました！',
                        'museum-00-preflight': 'Museum Exhibit Studio: 事前準備',
                        'museum-01-first-curator-session': 'ステップ 1: 最初のキュレーターセッション',
                        'museum-02-stream-the-curator': 'ステップ 2: キュレーターの応答をストリーミングする',
                        'museum-03-curator-voice': 'ステップ 3: キュレーターに語り口を与える',
                        'museum-04-approved-facts': 'ステップ 4: 承認済みの事実に基づかせる',
                        'museum-06-prove-the-structure': 'ステップ 5: 構造を検証する',
                        'museum-07-wikipedia-research': 'ステップ 6: Wikipedia MCP で調査する',
                        'museum-08-interactive-exhibit-page': 'ステップ 7: インタラクティブな展示ページを公開する',
                        'museum-09-complete': 'やり遂げました！'
                    }
                },
                previewAriaLabel: '選択したワークショップのプレビュー',
                previewEmptyTitle: 'workshop-preview',
                previewEmpty: 'ワークショップを選択するとエージェントフローをプレビューできます。',
                outcomesTitle: 'アプリを構築し、境界を理解する。',
                outcomes: [
                    'Copilot セッションを作成して管理します。',
                    '永続的なエージェントポリシーをタスクデータから分離します。',
                    '作業に適したツールサーフェスを選択します。',
                    '客観的な出力要件をコードで検証します。',
                    'プロンプトのガイダンスが終わり、厳格な制御が始まる場所を説明します。'
                ],
                workshops: {
                    intro: {
                        kicker: '初級入門 · 30 分',
                        name: 'SDK 101 を始める',
                        shortName: 'SDK 101',
                        description: '付属のスタータープロジェクトを使って、ストリーミング Hello World からポッドキャストエージェントまで進みます。事前にセットアップを完了します。',
                        capabilities: 'クライアントとセッション · ストリーミング · あらかじめ用意されたローカルツール · 承認',
                        previewTitle: 'start-intro',
                        preview: `クライアント → ストリーミング Hello World
             → ポッドキャストエピソードを選択
             → RSS ツールを承認
             → 見出しと公開投稿

[ツール] get_github_podcast_episode

30 分 · 6 言語
セッション前にセットアップを完了。`,
                        guidance: '30 分で SDK の基本を学びます。事前にインストール、認証、スターターの依存関係のダウンロードを完了します。'
                    },
                    sdlc: {
                        kicker: '開発者ツール · 115 分',
                        name: 'Web アクセシビリティをレビュー',
                        shortName: 'アクセシビリティレビュー',
                        description: 'ページを検査し、WCAG ガイダンスを参照して、証拠に基づくレポートを生成する SDLC エージェントを構築します。',
                        capabilities: 'ストリーミング · ローカルツール · Playwright MCP · 権限',
                        previewTitle: 'accessibility-reviewer',
                        preview: `URL → Playwright 検査
    → WCAG 参照
    → 構造化レポート

[ツール] playwright-browser_navigate
[ツール] accessibility_rule_lookup

検出事項
名前入力にアクセシブルな名前がありません。`,
                        guidance: '115 分のワークショップで SDLC 開発者ツールを構築し、その後は完成を祝って開発を続けます。'
                    },
                    museum: {
                        kicker: '非 SDLC ツール · 90 分',
                        name: '博物館の展示をキュレーション',
                        shortName: '博物館展示',
                        description: '承認済みの事実を来館者向けの展示コピーに変換する、根拠に基づいた解説エージェントを構築します。',
                        capabilities: 'カスタムペルソナ · アプリケーション所有のツール 1 つ · 検証 · 評価',
                        previewTitle: 'museum-exhibit-studio',
                        preview: `承認済みの事実 → キュレーターセッション
               → 展示の検証
               → 来館者向けのコピー

利用可能なツール: []
システムメッセージ: replace

# Journey to the Moon
## Narrative
## Visitor questions`,
                        guidance: '90 分のワークショップで非 SDLC のキュレーターツールを構築し、その後は完成を祝って開発を続けます。'
                    }
                }
            }),
            demoActHeadings: Object.freeze({
                one: '## 第 1 幕: Hello World',
                two: '## 第 2 幕: ポッドキャストエージェントに作り変える'
            })
        },
        {
            id: 'pt-br',
            displayName: 'Português (Brasil)',
            htmlLang: 'pt-BR',
            contentPath: 'localizations/pt-br/',
            ui: Object.freeze({
                title: 'Escolha seu workshop | GitHub Copilot SDK',
                description: 'Comece com um workshop GitHub Copilot SDK 101 de 30 minutos ou aprofunde-se com um revisor de acessibilidade ou curador de museu.',
                skipLink: 'Pular para a visão geral do workshop',
                brandLabel: 'Início do workshop do GitHub Copilot SDK',
                resourcesLabel: 'Recursos do workshop',
                targetApp: 'Aplicativo de destino',
                sdkDocs: 'Documentação do SDK',
                sdkDocsNamed: 'Documentação do SDK de {language}',
                newTab: '(abre em uma nova guia)',
                settings: {
                    label: 'Configurações',
                    locale: 'Idioma',
                    theme: 'Tema',
                    light: 'Claro',
                    dark: 'Escuro'
                },
                heroTitle: 'Escolha o que o agente deve fazer.',
                heroDefinition: 'Comece com o SDK 101 em 30 minutos. Depois, aprofunde-se: crie um agente para o ciclo de vida do software ou leve o Copilot para outro domínio.',
                workshopLegend: 'Escolha um workshop',
                languageTitle: 'Escolha a linguagem do workshop',
                languageSummary: 'Escolha primeiro um workshop e depois selecione a linguagem de implementação.',
                programmingLanguage: 'Linguagem de programação',
                startSelected: 'Iniciar workshop selecionado',
                startNamed: 'Iniciar {name}',
                startGuidance: 'Escolha um workshop e uma linguagem. Não é preciso ter experiência prévia com agentes ou SDK.',
                chooseLanguageFor: 'Agora escolha uma linguagem para “{name}”.',
                workshopUsesLanguage: '“{name}” usará o SDK de {language}.',
                chooseWorkshopContinue: 'Escolha um workshop para continuar.',
                introRuntimeNote: 'Trabalhe em start-intro/{language}. A preparação cobre a configuração do tempo de execução e das dependências.',
                runtimeNotes: {
                    dotnet: 'Requer o SDK do .NET e um tempo de execução C# compatível.',
                    go: 'Requer uma toolchain Go compatível e um módulo Go.',
                    java: 'Requer um JDK compatível e um projeto Maven ou Gradle.',
                    nodejs: 'Requer uma versão LTS atual do Node.js.',
                    python: 'Requer Python e um ambiente virtual isolado.',
                    rust: 'Requer Rust e Cargo do rustup.'
                },
                lesson: {
                    previous: 'Anterior',
                    previousShort: 'Anterior',
                    nextShort: 'Próxima',
                    previousAria: 'Anterior: {title}',
                    nextAria: 'Próxima: {title}',
                    backToHub: 'Voltar ao hub do workshop',
                    beforeYouBegin: 'Antes de começar',
                    workshop: 'Workshop',
                    skipLink: 'Pular para a lição',
                    siteTitle: 'Workshop do Copilot SDK',
                    homeAriaLabel: 'Início do workshop do Copilot SDK',
                    openSections: 'Abrir seções',
                    closeSections: 'Fechar seções',
                    lessonActions: 'Ações da lição',
                    chooseLanguageOption: 'Escolha a linguagem',
                    progressAriaLabel: 'Progresso do workshop',
                    loading: 'Carregando',
                    stepPosition: 'Etapa {number} de {count}',
                    preflight: 'Preparação',
                    navigationTitle: 'Etapas de {workshop}',
                    navigationAriaLabel: 'Etapas do workshop',
                    paginationAriaLabel: 'Paginação da lição',
                    loadingLesson: 'Carregando lição.',
                    loadingLessonProgress: 'Carregando lição...',
                    loadingNamed: 'Carregando {title}.',
                    loadedNamed: 'Carregado: {title}.',
                    completeStatus: '{workshop} concluído. Você conseguiu! Os recursos estão prontos abaixo.',
                    documentTitle: '{step} | {language} | Workshop do Copilot SDK',
                    chooseLanguageDocumentTitle: 'Escolha uma linguagem | Workshop do Copilot SDK',
                    chooseLanguageShort: 'Escolha uma linguagem',
                    chooseLanguageHeading: 'Escolha uma linguagem do workshop',
                    chooseLanguageDetails:
                        'Abra Configurações e escolha uma das seis linguagens de programação compatíveis para carregar esta lição.',
                    chooseLanguageStatus: 'Escolha uma linguagem do workshop para continuar.',
                    loadErrorHeading: 'Não foi possível carregar esta lição',
                    loadErrorStatus: 'Não foi possível carregar esta lição.',
                    loadErrorFileGuidance:
                        'Disponibilize o repositório por um servidor HTTP local; os navegadores bloqueiam o carregamento de lições a partir de URLs de arquivo.',
                    loadErrorGuidance:
                        'Atualize a página. Se o problema continuar, verifique se o Markdown do workshop foi implantado.',
                    copy: 'Copiar',
                    copied: 'Copiado',
                    copyFailed: 'Falha ao copiar',
                    copyAriaLabel: 'Copiar bloco de código',
                    times: {
                        untimed: 'Sem tempo definido',
                        resources: 'Recursos',
                        minutes: '{count} min'
                    },
                    workshopTitles: {},
                    stepLabels: {
                        'intro-00-preflight': 'Preparação',
                        'intro-01-sdk-basics': 'Noções do SDK',
                        'intro-02-hello-world': 'Hello World',
                        'intro-03-podcast-agent': 'Agente de podcast',
                        'intro-04-wrap-up': 'Recapitulação',
                        '00-preflight': 'Preparação',
                        '01-first-session': 'Primeira sessão',
                        '02-streaming': 'Streaming',
                        '03-local-tool': 'Ferramenta local',
                        '04-mcp-safety': 'MCP e permissões',
                        '05-combine-tools': 'Combinar ferramentas',
                        '06-structured-report': 'Relatório estruturado',
                        '07-run-explain': 'Executar e explicar',
                        '08-model-selection': 'Seleção de modelo',
                        '09-interactive-html-report': 'Relatório interativo',
                        '10-complete': 'Celebre e continue criando',
                        'museum-00-preflight': 'Preparação',
                        'museum-01-first-curator-session': 'Primeira sessão',
                        'museum-02-stream-the-curator': 'Streaming',
                        'museum-03-curator-voice': 'Voz do curador',
                        'museum-04-approved-facts': 'Fatos aprovados',
                        'museum-06-prove-the-structure': 'Verificações da estrutura',
                        'museum-07-wikipedia-research': 'Pesquisa na Wikipedia',
                        'museum-08-interactive-exhibit-page': 'Página da exposição',
                        'museum-09-complete': 'Celebre e continue criando'
                    },
                    stepTitles: {
                        'intro-00-preflight': 'Preparação: prepare-se para o SDK 101',
                        'intro-01-sdk-basics': 'Etapa 1: Noções básicas do SDK',
                        'intro-02-hello-world': 'Etapa 2: Hello World em streaming',
                        'intro-03-podcast-agent': 'Etapa 3: Crie o agente de podcast',
                        'intro-04-wrap-up': 'Etapa 4: Recapitulação e próximos passos',
                        '00-preflight': 'Preparação: configure sua máquina',
                        '01-first-session': 'Etapa 1: Crie sua primeira sessão do Copilot',
                        '02-streaming': 'Etapa 2: Transmita uma resposta em streaming',
                        '03-local-tool': 'Etapa 3: Adicione conhecimento pertencente ao aplicativo',
                        '04-mcp-safety': 'Etapa 4: Conecte uma ferramenta externa com segurança',
                        '05-combine-tools': 'Etapa 5: Combine ferramentas locais e MCP',
                        '06-structured-report': 'Etapa 6: Produza um relatório estruturado',
                        '07-run-explain': 'Etapa 7: Execute e explique o aplicativo',
                        '08-model-selection': 'Etapa 8: Selecione um modelo',
                        '09-interactive-html-report': 'Etapa 9: Gere um relatório HTML interativo',
                        '10-complete': 'Você conseguiu!',
                        'museum-00-preflight': 'Museum Exhibit Studio: preparação',
                        'museum-01-first-curator-session': 'Etapa 1: Sua primeira sessão de curador',
                        'museum-02-stream-the-curator': 'Etapa 2: Transmita o curador em streaming',
                        'museum-03-curator-voice': 'Etapa 3: Dê uma voz ao curador',
                        'museum-04-approved-facts': 'Etapa 4: Fundamente em fatos aprovados',
                        'museum-06-prove-the-structure': 'Etapa 5: Comprove a estrutura',
                        'museum-07-wikipedia-research': 'Etapa 6: Pesquise com o Wikipedia MCP',
                        'museum-08-interactive-exhibit-page': 'Etapa 7: Publique uma página de exposição interativa',
                        'museum-09-complete': 'Você conseguiu!'
                    }
                },
                previewAriaLabel: 'Prévia do workshop selecionado',
                previewEmptyTitle: 'workshop-preview',
                previewEmpty: 'Selecione um workshop para ver a prévia do fluxo do agente.',
                outcomesTitle: 'Crie o aplicativo. Entenda o limite.',
                outcomes: [
                    'Crie e gerencie uma sessão do Copilot.',
                    'Separe a política persistente do agente dos dados da tarefa.',
                    'Escolha a superfície de ferramenta certa para o trabalho.',
                    'Valide no código os requisitos objetivos de saída.',
                    'Explique onde a orientação do prompt termina e os controles rígidos começam.'
                ],
                workshops: {
                    intro: {
                        kicker: 'Introdução para iniciantes · 30 minutos',
                        name: 'Primeiros passos com o SDK 101',
                        shortName: 'SDK 101',
                        description: 'Passe de um Hello World em streaming a um agente de podcast usando os projetos iniciais incluídos. Conclua a configuração antes.',
                        capabilities: 'Cliente e sessão · streaming · ferramentas locais prontas · aprovações',
                        previewTitle: 'start-intro',
                        preview: `Cliente → Hello World em streaming
        → selecionar um episódio de podcast
        → aprovar uma ferramenta RSS
        → título e post de lançamento

[ferramenta] get_github_podcast_episode

30 minutos · seis linguagens
Conclua a configuração antes da sessão.`,
                        guidance: 'Aprenda noções básicas do SDK em 30 minutos. Instale, autentique-se e baixe as dependências dos projetos iniciais antes.'
                    },
                    sdlc: {
                        kicker: 'Ferramenta de desenvolvedor · 115 minutos',
                        name: 'Revisão de acessibilidade na Web',
                        shortName: 'revisão de acessibilidade',
                        description: 'Crie um agente de SDLC que inspeciona uma página, consulta orientações da WCAG e produz um relatório baseado em evidências.',
                        capabilities: 'Streaming · ferramentas locais · Playwright MCP · permissões',
                        previewTitle: 'accessibility-reviewer',
                        preview: `URL → inspeção do Playwright
    → consulta à WCAG
    → relatório estruturado

[ferramenta] playwright-browser_navigate
[ferramenta] accessibility_rule_lookup

Achado
O campo de nome não tem um nome acessível.`,
                        guidance: 'Crie uma ferramenta de desenvolvedor de SDLC em um workshop de 115 minutos; depois, celebre e continue criando.'
                    },
                    museum: {
                        kicker: 'Ferramenta não SDLC · 90 minutos',
                        name: 'Curadoria de exposição de museu',
                        shortName: 'curadoria de exposição',
                        description: 'Crie um agente interpretativo fundamentado que transforma fatos aprovados em texto de exposição pronto para visitantes.',
                        capabilities: 'Persona personalizada · uma ferramenta pertencente ao aplicativo · validação · avaliação',
                        previewTitle: 'museum-exhibit-studio',
                        preview: `Fatos aprovados → sessão de curador
                → validação da exposição
                → texto pronto para visitantes

Ferramentas disponíveis: []
Mensagem de sistema: replace

# Journey to the Moon
## Narrative
## Visitor questions`,
                        guidance: 'Crie uma ferramenta de curador não SDLC em um workshop de 90 minutos; depois, celebre e continue criando.'
                    }
                }
            }),
            demoActHeadings: Object.freeze({
                one: '## Ato um: Hello World',
                two: '## Ato dois: transforme-o em um agente de podcast'
            })
        }
    ]);

    const defaultLocale = locales[0];

    const localeById = Object.freeze(Object.fromEntries(
        locales.map(locale => [locale.id, locale])
    ));

    function getLocale(localeId) {
        return localeById[String(localeId ?? '').toLowerCase()] ?? null;
    }

    function resolveLocale(localeId) {
        return getLocale(localeId) ?? defaultLocale;
    }

    // The default locale owns the canonical source tree, so its URLs stay unqualified.
    function queryId(localeId) {
        const locale = getLocale(localeId);
        return locale && locale.id !== defaultLocale.id ? locale.id : null;
    }

    function contentUrlPath(file, localeId) {
        return `${resolveLocale(localeId).contentPath}${file}`;
    }

    return Object.freeze({ locales, defaultLocale, getLocale, resolveLocale, queryId, contentUrlPath });
}));
