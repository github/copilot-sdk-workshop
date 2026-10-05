'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const WorkshopLanguages = require('../language-registry.js');
const WorkshopLocales = require('../locale-registry.js');
const WorkshopLanguageNavigation = require('../language-navigation.js');
const WorkshopMarkdown = require('../markdown-language-preprocessor.js');
const WorkshopCompletion = require('../workshop-completion.js');

const docs = path.resolve(__dirname, '..');
const homeHtml = fs.readFileSync(path.join(docs, 'index.html'), 'utf8');
const lessonHtml = fs.readFileSync(path.join(docs, 'workshop', 'step.html'), 'utf8');
const homeScript = fs.readFileSync(path.join(docs, 'homepage.js'), 'utf8');
const lessonScript = lessonHtml.match(/<script>([\s\S]*?)<\/script>/i)[1];

class Element {
    constructor() {
        this.attributes = new Map();
        this.listeners = new Map();
        this.dataset = {};
        this.style = {};
        this.textContent = '';
        this.innerHTML = '';
        this.checked = false;
        this.hidden = false;
        this.children = [];
        const classes = new Set();
        this.classList = {
            contains: name => classes.has(name),
            toggle: (name, enabled) => {
                const active = enabled ?? !classes.has(name);
                if (active) classes.add(name);
                else classes.delete(name);
                return active;
            },
            add: (...names) => names.forEach(name => classes.add(name)),
            remove: (...names) => names.forEach(name => classes.delete(name))
        };
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    toggleAttribute(name, enabled) {
        if (enabled) this.setAttribute(name, '');
        else this.removeAttribute(name);
    }
    addEventListener(name, listener) { this.listeners.set(name, listener); }
    emit(name, event = {}) { this.listeners.get(name)?.(event); }
    focus() { this.focused = true; }
    reportValidity() { this.validityReported = true; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    querySelectorAll() { return []; }
}

function createPage(html, address, storedLanguage, blockedStorage = false, options = {}) {
    const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)]
        .map(match => [match[1], new Element()]));
    const languages = [...homeHtml.matchAll(/name="language" value="([^"]+)"/g)]
        .map(match => Object.assign(new Element(), { value: match[1] }));
    const workshops = [...homeHtml.matchAll(/name="workshop" value="([^"]+)"/g)]
        .map(match => Object.assign(new Element(), { value: match[1] }));
    const languageOptions = languages.map(input =>
        Object.assign(new Element(), { dataset: { language: input.value } }));
    const workshopOptions = workshops.map(input =>
        Object.assign(new Element(), { dataset: { workshop: input.value } }));
    const document = {
        body: new Element(),
        documentElement: new Element(),
        getElementById: id => {
            assert.ok(elements.has(id), `Missing element: ${id}`);
            return elements.get(id);
        },
        querySelector: () => new Element(),
        querySelectorAll: selector => ({
            'input[name="language"]': languages,
            'input[name="workshop"]': workshops,
            '.language-option': languageOptions,
            '.workshop-option': workshopOptions
        })[selector] ?? [],
        createElement: () => new Element(),
        addEventListener: () => {}
    };
    const storage = new Map([
        ...(storedLanguage ? [['copilot-sdk-workshop.language', storedLanguage]] : []),
        ...(options.storedLocale ? [['copilot-sdk-workshop.locale', options.storedLocale]] : [])
    ]);
    const window = {
        location: new URL(address),
        localStorage: {
            getItem: key => {
                if (blockedStorage) throw new Error('Storage unavailable');
                return storage.get(key);
            },
            setItem: (key, value) => {
                if (blockedStorage) throw new Error('Storage unavailable');
                storage.set(key, value);
            }
        },
        history: { replaceState: (_state, _title, url) => { window.location = new URL(url); } },
        matchMedia: () => ({
            matches: false,
            addEventListener: () => {},
            removeEventListener: () => {}
        }),
        setTimeout,
        clearTimeout,
        addEventListener: () => {}
    };
    const requests = [];
    const pendingGuides = new Map();
    const context = vm.createContext({
        window, document, URL, URLSearchParams, HTMLElement: Element, console,
        WorkshopLanguages, WorkshopLocales, WorkshopLanguageNavigation, WorkshopMarkdown, WorkshopCompletion,
        hljs: { highlightElement: () => {} },
        marked: { parse: markdown => markdown },
        fetch: async url => {
            requests.push(url.href);
            const localeMatch = url.pathname.match(/\/localizations\/([^/]+)\//);
            if (localeMatch && options.localizedFailure) {
                return { ok: false, status: 404 };
            }
            const localeRoot = localeMatch ? path.join('localizations', localeMatch[1]) : '.';
            const guideMatch = url.pathname.match(/\/start-intro\/([^/]+)\/LIVE_DEMO\.md$/);
            if (guideMatch) {
                if (options.guideFailure) return { ok: false, status: 404 };
                const guidePath = path.join(
                    docs, '..', localeRoot, 'start-intro', guideMatch[1], 'LIVE_DEMO.md');
                if (!fs.existsSync(guidePath)) return { ok: false, status: 404 };
                const markdown = options.guideContent ?? fs.readFileSync(guidePath, 'utf8');
                const response = { ok: true, text: async () => markdown };
                if (options.deferGuideFor === guideMatch[1]) {
                    return new Promise(resolve => pendingGuides.set(guideMatch[1], () => resolve(response)));
                }
                return response;
            }
            const lessonPath = path.join(
                docs, '..', localeRoot, 'workshop', path.basename(url.pathname));
            if (!fs.existsSync(lessonPath)) return { ok: false, status: 404 };
            const markdown = fs.readFileSync(lessonPath, 'utf8');
            return { ok: true, text: async () => markdown };
        }
    });
    return { context, elements, languages, workshops, window, requests, pendingGuides };
}

function choose(inputs, value) {
    for (const input of inputs) input.checked = input.value === value;
    const selected = inputs.find(input => input.checked);
    assert.ok(selected, `Unknown choice: ${value}`);
    selected.emit('change');
}

async function main() {
    const home = createPage(homeHtml, 'http://localhost:8000/docs/index.html');
    vm.runInContext(homeScript, home.context);
    assert.equal(home.elements.get('languagePicker').disabled, true);
    assert.equal(home.elements.get('languageSelector').value, '');
    assert.equal(home.elements.get('sdkDocsLink').href, 'https://github.com/github/copilot-sdk');
    assert.equal(home.elements.get('sdkDocsLabel').textContent, 'SDK docs');
    assert.equal(home.elements.get('startWorkshopLink').getAttribute('aria-disabled'), 'true');
    assert.equal(home.workshops.length, 3);
    assert.ok(home.workshops.every(input => !input.checked));
    choose(home.workshops, 'intro');
    assert.equal(home.elements.get('languagePicker').disabled, false);
    assert.equal(home.elements.get('startWorkshopLink').getAttribute('aria-disabled'), 'true');
    choose(home.languages, 'rust');
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=intro-00-preflight&lang=rust');
    assert.equal(home.elements.get('targetAppLink').hidden, true);
    assert.equal(home.elements.get('languageSelector').value, 'rust');
    assert.equal(home.elements.get('sdkDocsLink').href,
        'https://github.com/github/copilot-sdk/tree/main/rust');
    assert.equal(home.elements.get('sdkDocsLabel').textContent, 'Rust SDK docs');
    home.elements.get('languageSelector').value = 'go';
    home.elements.get('languageSelector').emit('change');
    assert.deepEqual(home.languages.filter(input => input.checked).map(input => input.value), ['go']);
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=intro-00-preflight&lang=go');
    choose(home.languages, 'rust');
    assert.equal(home.elements.get('installCommand').textContent,
        'git clone https://github.com/github/copilot-sdk-workshop.git');
    assert.match(home.elements.get('runtimeNote').textContent, /start-intro\/rust/);
    choose(home.workshops, 'sdlc');
    assert.equal(home.elements.get('targetAppLink').hidden, false);
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=00-preflight&lang=rust');
    choose(home.workshops, 'museum');
    assert.equal(home.elements.get('targetAppLink').hidden, true);
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=museum-00-preflight&lang=rust');
    choose(home.workshops, 'intro');
    assert.equal(home.elements.get('startWorkshopLink').textContent, 'Start SDK 101');
    assert.deepEqual(home.elements.get('localeSelector').children.map(option => option.value),
        ['en', 'ko-kr']);
    home.elements.get('localeSelector').value = 'ko-kr';
    home.elements.get('localeSelector').emit('change');
    assert.equal(home.window.location.searchParams.get('locale'), 'ko-kr');
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=intro-00-preflight&lang=rust&locale=ko-kr');
    assert.equal(home.context.document.documentElement.lang, 'ko');
    home.elements.get('localeSelector').value = 'en';
    home.elements.get('localeSelector').emit('change');
    assert.equal(home.window.location.searchParams.get('locale'), null);
    assert.equal(home.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=intro-00-preflight&lang=rust');

    const koreanHome = createPage(homeHtml,
        'http://localhost:8000/docs/index.html?workshop=museum&lang=python&locale=ko-kr');
    vm.runInContext(homeScript, koreanHome.context);
    assert.equal(koreanHome.elements.get('localeSelector').value, 'ko-kr');
    assert.equal(koreanHome.elements.get('languageSelector').value, 'python');
    assert.equal(koreanHome.elements.get('sdkDocsLabel').textContent, 'Python SDK 문서');
    const homeHeader = homeHtml.slice(homeHtml.indexOf('<header'), homeHtml.indexOf('</header>'));
    assert.doesNotMatch(homeHeader, /sdkDocsLink|targetAppLink/);
    for (const control of ['localeSelector', 'languageSelector', 'name="theme"']) {
        assert.ok(homeHeader.indexOf(control) > homeHeader.indexOf('id="settingsPanel"'),
            `${control} belongs in the settings menu`);
    }
    assert.equal(koreanHome.elements.get('startWorkshopLink').href,
        'workshop/step.html?step=museum-00-preflight&lang=python&locale=ko-kr');

    for (const language of WorkshopLanguages.languages) {
        const queryHome = createPage(homeHtml,
            `http://localhost:8000/docs/index.html?workshop=intro&lang=${language.id}`,
            'rust', true);
        vm.runInContext(homeScript, queryHome.context);
        assert.equal(queryHome.elements.get('startWorkshopLink').href,
            `workshop/step.html?step=intro-00-preflight&lang=${language.id}`);
        assert.equal(queryHome.elements.get('targetAppLink').hidden, true);
        assert.match(queryHome.elements.get('runtimeNote').textContent,
            new RegExp(`start-intro/${language.id}`));
    }

    const roots = [
        ['http://localhost:8000/docs/workshop/step.html', 'http://localhost:8000/workshop/'],
        ['https://github.github.io/copilot-sdk-workshop/workshop/step.html',
            'https://github.github.io/copilot-sdk-workshop/workshop/'],
        ['https://workshop.example.com/workshop/step.html', 'https://workshop.example.com/workshop/']
    ];
    for (const [address, markdownRoot] of roots) {
        for (const language of WorkshopLanguages.languages) {
            const page = createPage(lessonHtml,
                `${address}?step=intro-02-hello-world&lang=${language.id}`);
            await vm.runInContext(lessonScript, page.context);
            assert.equal(page.requests[0], `${markdownRoot}intro-02-hello-world.md`);
            assert.equal(page.requests[1],
                `${new URL('../', markdownRoot).href}start-intro/${language.id}/LIVE_DEMO.md`);
            assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuemax'), '4');
            assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuenow'), '2');
            assert.equal(page.elements.get('homeLink').href,
                `../index.html?lang=${language.id}&workshop=intro`);
            assert.match(page.elements.get('nextHeaderLink').href, /^\?step=intro-03-podcast-agent&lang=/);
            assert.doesNotMatch(page.elements.get('workshopNavigation').innerHTML,
                /museum-|04-mcp-safety|Optional extension/);
            assert.match(page.elements.get('markdownContent').innerHTML, /Streaming hello world/);
            assert.deepEqual([...page.elements.get('markdownContent').innerHTML.matchAll(/^### (\d+)\./gm)]
                .map(match => match[1]), ['1', '2', '3', '4']);
            assert.doesNotMatch(page.elements.get('markdownContent').innerHTML, /<!-- LIVE_DEMO -->/);
            assert.equal(page.elements.get('markdownContent').getAttribute('aria-busy'), 'false');

            const selector = page.elements.get('languageSelector');
            selector.value = language.id === 'go' ? 'python' : 'go';
            selector.emit('change');
            await new Promise(resolve => setImmediate(resolve));
            assert.equal(page.window.location.searchParams.get('step'), 'intro-02-hello-world');
            assert.equal(page.window.location.searchParams.get('lang'), selector.value);
            assert.equal(page.elements.get('homeLink').href,
                `../index.html?lang=${selector.value}&workshop=intro`);

            const podcast = createPage(lessonHtml,
                `${address}?step=intro-03-podcast-agent&lang=${language.id}`);
            await vm.runInContext(lessonScript, podcast.context);
            const content = podcast.elements.get('markdownContent').innerHTML;
            assert.deepEqual([...content.matchAll(/^### (\d+)\./gm)]
                .map(match => match[1]), ['1', '2', '3']);
            assert.match(content, /get_github_podcast_episode/);
            assert.doesNotMatch(content, /### 4\. Send/);
        }
    }

    for (const [step, track, count] of [
        ['00-preflight', 'sdlc', 10],
        ['museum-00-preflight', 'museum', 8],
        ['intro-04-wrap-up', 'intro', 4],
        ['museum-01-curator-role', 'museum', 8],
        ['intro-unknown', 'intro', 4]
    ]) {
        const page = createPage(lessonHtml,
            `http://localhost:8000/docs/workshop/step.html?step=${step}&lang=java`);
        await vm.runInContext(lessonScript, page.context);
        assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuemax'), String(count));
        assert.equal(page.elements.get('homeLink').href, `../index.html?lang=java&workshop=${track}`);
        if (step === 'intro-04-wrap-up') {
            assert.equal(page.elements.get('nextHeaderLink').hidden, true);
            assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuenow'), '4');
        }
        if (step === 'intro-unknown') {
            assert.match(page.requests[0], /intro-00-preflight\.md$/);
        }
    }
    for (const [address, markdownRoot] of [
        ['http://localhost:8000/docs/workshop/step.html', 'http://localhost:8000/'],
        ['https://workshop.example.com/workshop/step.html', 'https://workshop.example.com/']
    ]) {
        const korean = createPage(lessonHtml,
            `${address}?step=intro-02-hello-world&lang=nodejs&locale=ko-kr`);
        await vm.runInContext(lessonScript, korean.context);
        assert.equal(korean.requests[0],
            `${markdownRoot}localizations/ko-kr/workshop/intro-02-hello-world.md`);
        assert.equal(korean.requests[1],
            `${markdownRoot}localizations/ko-kr/start-intro/nodejs/LIVE_DEMO.md`);
        assert.equal(korean.elements.get('localeSelector').value, 'ko-kr');
        assert.equal(korean.context.document.documentElement.lang, 'ko');
        assert.equal(korean.elements.get('homeLink').href,
            '../index.html?lang=nodejs&workshop=intro&locale=ko-kr');
        assert.equal(korean.elements.get('previousHeaderLink').textContent, '← 이전');
        assert.equal(korean.elements.get('nextHeaderLink').textContent, '다음 →');
        assert.match(korean.elements.get('lessonFooter').innerHTML, /← SDK 기본 사항/);
        assert.match(korean.elements.get('lessonFooter').innerHTML, /팟캐스트 에이전트 →/);
        assert.match(korean.elements.get('workshopNavigation').innerHTML, /시작하기 전에/);
        assert.match(korean.elements.get('nextHeaderLink').href,
            /^\?step=intro-03-podcast-agent&lang=nodejs&locale=ko-kr$/);
        assert.doesNotMatch(korean.elements.get('markdownContent').innerHTML, /<!-- LIVE_DEMO -->/);
        assert.deepEqual([...korean.elements.get('markdownContent').innerHTML.matchAll(/^### (\d+)\./gm)]
            .map(match => match[1]), ['1', '2', '3', '4']);
        assert.match(korean.elements.get('markdownContent').innerHTML, /[가-힣]/);
        assert.equal(korean.elements.get('sdkDocsLabel').textContent, 'Node.js SDK 문서');
        assert.equal(korean.elements.get('sdkDocsLink').href,
            'https://github.com/github/copilot-sdk/tree/main/nodejs');
        assert.equal(korean.elements.get('newTabNote').textContent, '(새 탭에서 열림)');
        assert.equal(korean.elements.get('settingsButton').getAttribute('aria-label'), '설정');
        assert.equal(korean.elements.get('localeSelectorLabel').textContent, '언어');
        assert.equal(korean.elements.get('themeLabel').textContent, '테마');
        assert.equal(korean.elements.get('themeLightLabel').textContent, '밝게');
        assert.equal(korean.elements.get('themeDarkLabel').textContent, '어둡게');
        assert.equal(korean.elements.get('skipLink').textContent, '수업 내용으로 건너뛰기');
        assert.equal(korean.elements.get('languageSelectorLabel').textContent, '프로그래밍 언어');
        assert.equal(korean.elements.get('chooseLanguageOption').textContent, '언어 선택');
        assert.equal(korean.elements.get('stepPosition').textContent, '4단계 중 2단계');
        assert.equal(korean.elements.get('stepEstimate').textContent, '10분');
        assert.equal(korean.elements.get('navigationTitle').textContent, 'SDK 101 단계');
        assert.equal(korean.elements.get('menuButton').getAttribute('aria-label'), '목차 열기');
    }

    // The header keeps only the brand, step links, and the settings menu.
    for (const removed of ['hubLink', 'headerDocsLink']) {
        assert.doesNotMatch(lessonHtml, new RegExp(`id="${removed}"`));
    }
    const header = lessonHtml.slice(lessonHtml.indexOf('<header'), lessonHtml.indexOf('</header>'));
    for (const control of ['localeSelector', 'languageSelector', 'name="theme"']) {
        assert.ok(header.indexOf(control) > header.indexOf('id="settingsPanel"'),
            `${control} belongs in the settings menu`);
    }
    assert.ok(lessonHtml.indexOf('id="sdkDocsLink"') > lessonHtml.indexOf('id="lessonFooter"'));

    // An unselected or default locale keeps the canonical English URLs unqualified.
    const defaultLocale = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-01-sdk-basics&lang=go&locale=en');
    await vm.runInContext(lessonScript, defaultLocale.context);
    assert.equal(defaultLocale.requests[0], 'http://localhost:8000/workshop/intro-01-sdk-basics.md');
    assert.equal(defaultLocale.elements.get('homeLink').href, '../index.html?lang=go&workshop=intro');
    assert.equal(defaultLocale.elements.get('previousHeaderLink').textContent, '← Prev');
    assert.equal(defaultLocale.elements.get('nextHeaderLink').textContent, 'Next →');
    assert.equal(defaultLocale.elements.get('sdkDocsLabel').textContent, 'Go SDK docs');
    assert.equal(defaultLocale.elements.get('languageSelectorLabel').textContent,
        'Programming language');
    assert.equal(defaultLocale.elements.get('localeSelectorLabel').textContent, 'Language');

    const koreanFirstStep = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=museum-00-preflight&lang=dotnet&locale=ko-kr');
    await vm.runInContext(lessonScript, koreanFirstStep.context);
    assert.match(koreanFirstStep.elements.get('lessonFooter').innerHTML, /← 이전/);
    assert.match(koreanFirstStep.elements.get('lessonFooter').innerHTML, /첫 번째 세션 →/);

    const storedLocale = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-01-sdk-basics&lang=go',
        undefined, false, { storedLocale: 'ko-kr' });
    await vm.runInContext(lessonScript, storedLocale.context);
    assert.equal(storedLocale.requests[0],
        'http://localhost:8000/localizations/ko-kr/workshop/intro-01-sdk-basics.md');

    const switched = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-01-sdk-basics&lang=go');
    await vm.runInContext(lessonScript, switched.context);
    assert.equal(switched.requests[0], 'http://localhost:8000/workshop/intro-01-sdk-basics.md');
    const localeSelector = switched.elements.get('localeSelector');
    assert.deepEqual(localeSelector.children.map(option => option.value), ['en', 'ko-kr']);
    localeSelector.value = 'ko-kr';
    localeSelector.emit('change');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(switched.window.location.searchParams.get('locale'), 'ko-kr');
    assert.equal(switched.requests[1],
        'http://localhost:8000/localizations/ko-kr/workshop/intro-01-sdk-basics.md');
    localeSelector.value = 'en';
    localeSelector.emit('change');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(switched.window.location.searchParams.get('locale'), null);

    // A locale without a translation for a lesson falls back to the English source.
    const fallback = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-02-hello-world&lang=java&locale=ko-kr',
        undefined, false, { localizedFailure: true });
    await vm.runInContext(lessonScript, fallback.context);
    assert.ok(fallback.requests.includes(
        'http://localhost:8000/localizations/ko-kr/workshop/intro-02-hello-world.md'));
    assert.ok(fallback.requests.includes('http://localhost:8000/workshop/intro-02-hello-world.md'));
    assert.match(fallback.elements.get('markdownContent').innerHTML, /Streaming hello world/);
    assert.doesNotMatch(fallback.elements.get('markdownContent').innerHTML, /<!-- LIVE_DEMO -->/);

    const noLanguage = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-01-sdk-basics&lang=invalid');
    await vm.runInContext(lessonScript, noLanguage.context);
    assert.equal(noLanguage.requests.length, 0);
    assert.equal(noLanguage.elements.get('sdkDocsLink').hidden, true);
    assert.equal(noLanguage.elements.get('homeLink').href, '../index.html?workshop=intro');
    assert.equal(noLanguage.elements.get('lessonStatus').textContent,
        'Choose a workshop language to continue.');

    for (const options of [
        { guideFailure: true },
        { guideContent: '# Guide with no acts' }
    ]) {
        const broken = createPage(lessonHtml,
            'http://localhost:8000/docs/workshop/step.html?step=intro-02-hello-world&lang=java',
            undefined, false, options);
        await vm.runInContext(lessonScript, broken.context);
        assert.equal(broken.elements.get('lessonStatus').textContent, 'Unable to load this lesson.');
        assert.equal(broken.elements.get('markdownContent').getAttribute('aria-busy'), 'false');
        assert.match(broken.elements.get('markdownContent').children[0].children[1].textContent,
            /LIVE_DEMO/);
    }

    const delayed = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-02-hello-world&lang=dotnet',
        undefined, false, { deferGuideFor: 'dotnet' });
    const firstLoad = vm.runInContext(lessonScript, delayed.context);
    const selector = delayed.elements.get('languageSelector');
    selector.value = 'python';
    selector.emit('change');
    await new Promise(resolve => setImmediate(resolve));
    const pythonContent = delayed.elements.get('markdownContent').innerHTML;
    assert.match(pythonContent, /Copilot SDK helps a Python app/);
    delayed.pendingGuides.get('dotnet')();
    await firstLoad;
    assert.equal(delayed.elements.get('markdownContent').innerHTML, pythonContent);
    assert.equal(delayed.window.location.searchParams.get('lang'), 'python');

    console.log('Workshop homepage, lesson flow, and six-language routing tests passed.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
