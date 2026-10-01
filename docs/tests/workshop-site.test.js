'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const WorkshopLanguages = require('../language-registry.js');
const WorkshopLanguageNavigation = require('../language-navigation.js');
const WorkshopMarkdown = require('../markdown-language-preprocessor.js');

const docs = path.resolve(__dirname, '..');
const homeHtml = fs.readFileSync(path.join(docs, 'index.html'), 'utf8');
const lessonHtml = fs.readFileSync(path.join(docs, 'workshop', 'step.html'), 'utf8');
const homeScript = fs.readFileSync(path.join(docs, 'homepage.js'), 'utf8');
const lessonScript = [...lessonHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];

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
    const storage = new Map(storedLanguage ? [['copilot-sdk-workshop.language', storedLanguage]] : []);
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
        matchMedia: () => ({ matches: false, addEventListener: () => {} }),
        addEventListener: () => {}
    };
    const requests = [];
    const pendingGuides = new Map();
    const context = vm.createContext({
        window, document, URL, URLSearchParams, HTMLElement: Element, console,
        WorkshopLanguages, WorkshopLanguageNavigation, WorkshopMarkdown,
        hljs: { highlightElement: () => {} },
        marked: { parse: markdown => markdown },
        fetch: async url => {
            requests.push(url.href);
            const guideMatch = url.pathname.match(/\/start-intro\/([^/]+)\/LIVE_DEMO\.md$/);
            if (guideMatch) {
                if (options.guideFailure) return { ok: false, status: 404 };
                const markdown = options.guideContent ?? fs.readFileSync(
                    path.join(docs, '..', 'start-intro', guideMatch[1], 'LIVE_DEMO.md'), 'utf8');
                const response = { ok: true, text: async () => markdown };
                if (options.deferGuideFor === guideMatch[1]) {
                    return new Promise(resolve => pendingGuides.set(guideMatch[1], () => resolve(response)));
                }
                return response;
            }
            const file = path.basename(url.pathname);
            const markdown = fs.readFileSync(path.join(docs, '..', 'workshop', file), 'utf8');
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
            assert.equal(page.elements.get('hubLink').href,
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
            assert.equal(page.elements.get('hubLink').href,
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
        ['00-preflight', 'sdlc', 7],
        ['museum-00-preflight', 'museum', 6],
        ['intro-04-wrap-up', 'intro', 4],
        ['museum-01-curator-role', 'museum', 6],
        ['intro-unknown', 'intro', 4]
    ]) {
        const page = createPage(lessonHtml,
            `http://localhost:8000/docs/workshop/step.html?step=${step}&lang=java`);
        await vm.runInContext(lessonScript, page.context);
        assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuemax'), String(count));
        assert.equal(page.elements.get('hubLink').href, `../index.html?lang=java&workshop=${track}`);
        if (step === 'intro-04-wrap-up') {
            assert.equal(page.elements.get('nextHeaderLink').hidden, true);
            assert.equal(page.elements.get('progressTrack').getAttribute('aria-valuenow'), '4');
        }
        if (step === 'intro-unknown') {
            assert.match(page.requests[0], /intro-00-preflight\.md$/);
        }
    }
    const noLanguage = createPage(lessonHtml,
        'http://localhost:8000/docs/workshop/step.html?step=intro-01-sdk-basics&lang=invalid');
    await vm.runInContext(lessonScript, noLanguage.context);
    assert.equal(noLanguage.requests.length, 0);
    assert.equal(noLanguage.elements.get('hubLink').href, '../index.html?workshop=intro');
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
