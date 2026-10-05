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
