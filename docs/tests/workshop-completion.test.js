'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const languages = require('../language-registry.js');
const navigation = require('../language-navigation.js');
const markdown = require('../markdown-language-preprocessor.js');
const completion = require('../workshop-completion.js');

const repoRoot = path.resolve(__dirname, '..', '..');
function extractViewerSource(html) {
    const match = html.match(/<script>([\s\S]*?)<\/script>/i);
    assert.ok(match, 'The lesson viewer must contain an inline script.');
    return match[1];
}

const viewerSource = extractViewerSource(
    fs.readFileSync(path.join(__dirname, '..', 'workshop', 'step.html'), 'utf8'));
const flush = () => new Promise(resolve => setImmediate(resolve));

test('inline viewer extraction recognizes lowercase, uppercase, and mixed-case script tags', () => {
    for (const [opening, closing] of [
        ['script', 'script'],
        ['SCRIPT', 'SCRIPT'],
        ['ScRiPt', 'sCrIpT']
    ]) {
        assert.equal(
            extractViewerSource(`<script src="external.js"></script><${opening}>const value = 1;</${closing}>`),
            'const value = 1;'
        );
    }
    assert.throws(() => extractViewerSource('<script src="external.js"></script>'), /must contain an inline script/);
});

class Element {
    constructor() {
        this.children = [];
        this.attributes = new Map();
        this.listeners = new Map();
        this.style = { setProperty() {} };
        this.classList = { toggle() {}, contains() { return false; } };
        this.textContent = '';
        this.innerHTML = '';
    }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    toggleAttribute(name, force) {
        if (force) this.setAttribute(name, '');
        else this.removeAttribute(name);
    }
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    append(...children) {
        for (const child of children) {
            child.parent = this;
            this.children.push(child);
        }
    }
    replaceChildren(...children) {
        this.children = [];
        this.append(...children);
    }
    remove() {
        this.parent.children = this.parent.children.filter(child => child !== this);
    }
    querySelectorAll() { return []; }
}

function environment(url, reducedMotion = false) {
    const elements = new Map();
    const media = new Map();
    const timers = new Map();
    const events = new Map();
    let timerId = 0;
    const document = {
        body: new Element(),
        createElement: () => new Element(),
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, new Element());
            return elements.get(id);
        },
        querySelector: selector => document.getElementById(selector),
        querySelectorAll: () => [],
        addEventListener() {}
    };
    const window = {
        location: new URL(url),
        localStorage: { getItem: () => null, setItem() {} },
        history: {
            replaceState(state, unused, value) { window.location = new URL(value); }
        },
        matchMedia(query) {
            if (!media.has(query)) {
                const listeners = new Set();
                media.set(query, {
                    matches: query.includes('reduced-motion') && reducedMotion,
                    addEventListener(name, callback) { listeners.add(callback); },
                    removeEventListener(name, callback) { listeners.delete(callback); },
                    change(value) {
                        this.matches = value;
                        for (const listener of listeners) listener();
                    }
                });
            }
            return media.get(query);
        },
        addEventListener(name, callback) { events.set(name, callback); },
        setTimeout(callback, delay) {
            timers.set(++timerId, { callback, delay });
            return timerId;
        },
        clearTimeout(id) { timers.delete(id); }
    };
    return { document, window, elements, media, timers, events };
}

async function viewer(step, language = 'nodejs', options = {}) {
    const query = navigation.lessonUrl(step, language || undefined);
    const env = environment(`http://localhost:8000/docs/workshop/step.html${query}`, options.reducedMotion);
    env.context = vm.createContext({
        window: env.window,
        document: env.document,
        HTMLElement: Element,
        URL, URLSearchParams, console,
        WorkshopLanguages: languages,
        WorkshopLanguageNavigation: navigation,
        WorkshopMarkdown: markdown,
        WorkshopCompletion: completion,
        hljs: { highlightElement() {} },
        marked: {
            parse(source) {
                if (options.renderFailure) throw new Error('Rendering failed.');
                return source;
            }
        },
        fetch: options.fetch || (async url => ({
            ok: !options.fetchFailure,
            status: options.fetchFailure ? 404 : 200,
            text: async () => fs.readFileSync(
                path.join(repoRoot, 'workshop', new URL(url).pathname.split('/').at(-1)), 'utf8')
        }))
    });
    vm.runInContext(viewerSource, env.context);
    await flush();
    env.state = vm.runInContext('({ steps, currentIndex })', env.context);
    env.changeLanguage = async languageId => {
        const selector = env.document.getElementById('languageSelector');
        selector.value = languageId;
        selector.listeners.get('change')();
        await flush();
    };
    return env;
}

for (const [track, finalLesson, finalStep, lessonCount] of [
    ['sdlc', '09-interactive-html-report', '10-complete', 9],
    ['museum', 'museum-08-interactive-exhibit-page', 'museum-09-complete', 7]
]) {
    test(`${track}: every lesson is numbered and completion is last`, async () => {
        const env = await viewer(finalLesson);
        assert.deepEqual(
            Array.from(env.state.steps, step => step.kind),
            ['preflight', ...Array(lessonCount).fill('core'), 'completion']
        );
        assert.deepEqual(
            Array.from(env.state.steps.slice(1), step => step.number),
            Array.from({ length: lessonCount + 1 }, (_, index) => index + 1)
        );
        assert.equal(env.state.steps.at(-1).id, finalStep);
        assert.equal(env.document.getElementById('stepPosition').textContent,
            `Step ${lessonCount} of ${lessonCount + 1}`);
        assert.equal(env.document.getElementById('progressTrack').attributes.get('aria-valuemax'),
            String(lessonCount + 1));
        assert.equal(env.document.getElementById('nextHeaderLink').href,
            navigation.lessonUrl(finalStep, 'nodejs'));
        assert.match(env.document.getElementById('markdownContent').innerHTML,
            new RegExp(`\\?step=${finalStep}&lang=nodejs`));
        assert.doesNotMatch(env.document.getElementById('workshopNavigation').innerHTML, /Optional|\+/);
        assert.equal(env.document.body.children.length, 0);
    });

    test(`${track}: completion retains each language and provides a hub exit`, async () => {
        for (const language of ['dotnet', 'go', 'java', 'nodejs', 'python', 'rust']) {
            const env = await viewer(finalStep, language);
            const content = env.document.getElementById('markdownContent').innerHTML;
            assert.match(content, /# You did it!/);
            assert.ok(content.includes(languages.getLanguage(language).docsUrl));
            assert.ok(content.includes(`/finished/${language}/`));
            for (const other of ['dotnet', 'go', 'java', 'nodejs', 'python', 'rust']) {
                if (other !== language) assert.ok(!content.includes(`/finished/${other}/`));
            }
            assert.equal(env.document.getElementById('previousHeaderLink').href,
                navigation.lessonUrl(finalLesson, language));
            assert.equal(env.document.getElementById('nextHeaderLink').hidden, true);
            assert.ok(env.document.getElementById('lessonFooter').innerHTML
                .includes(navigation.homeUrl(language, track)));
            assert.doesNotMatch(env.document.getElementById('lessonFooter').innerHTML, /disabled/);
            assert.equal(env.document.getElementById('progressFill').style.transform, 'scaleX(1)');
            assert.match(env.document.getElementById('lessonStatus').textContent, /complete/);
            const overlay = env.document.body.children[0];
            assert.equal(overlay.className, 'completion-confetti');
            assert.equal(overlay.attributes.get('aria-hidden'), 'true');
            assert.equal(overlay.children.length, 64);
            const timer = [...env.timers.values()][0];
            assert.equal(timer.delay, 3500);
            timer.callback();
            assert.equal(env.document.body.children.length, 0);
            assert.equal(env.timers.size, 0);
        }
    });
}

test('completion does not animate when motion is reduced', async () => {
    const env = await viewer('10-complete', 'go', { reducedMotion: true });
    assert.match(env.document.getElementById('markdownContent').innerHTML, /# You did it!/);
    assert.equal(env.document.body.children.length, 0);
    assert.equal(env.timers.size, 0);
});

test('celebration stops when reduced motion changes or the page is hidden', async () => {
    for (const stop of [
        env => env.media.get('(prefers-reduced-motion: reduce)').change(true),
        env => env.events.get('pagehide')()
    ]) {
        const env = await viewer('museum-09-complete');
        assert.equal(env.document.body.children.length, 1);
        stop(env);
        assert.equal(env.document.body.children.length, 0);
        assert.equal(env.timers.size, 0);
    }
});

test('changing language clears confetti without replaying it', async () => {
    const env = await viewer('10-complete');
    await env.changeLanguage('rust');
    assert.match(env.document.getElementById('markdownContent').innerHTML, /\/finished\/rust\//);
    assert.equal(env.document.body.children.length, 0);
    assert.equal(env.timers.size, 0);
    assert.ok(env.document.getElementById('lessonFooter').innerHTML.includes('lang=rust'));
});

test('no celebration for missing language, failed fetch, or failed rendering', async () => {
    for (const [language, options, message] of [
        [null, {}, 'Choose a workshop language to continue.'],
        ['nodejs', { fetchFailure: true }, 'Unable to load this lesson.'],
        ['nodejs', { renderFailure: true }, 'Unable to load this lesson.']
    ]) {
        const env = await viewer('10-complete', language, options);
        assert.equal(env.document.getElementById('lessonStatus').textContent, message);
        assert.doesNotMatch(env.document.getElementById('stepPosition').textContent, /complete/i);
        assert.equal(env.document.body.children.length, 0);
        assert.equal(env.timers.size, 0);
    }
});

test('stale completion requests cannot replace the selected language or stop its celebration', async () => {
    const requests = [];
    const env = await viewer('10-complete', 'nodejs', {
        fetch: () => new Promise(resolve => requests.push(resolve))
    });
    await env.changeLanguage('python');
    const source = fs.readFileSync(path.join(repoRoot, 'workshop', '10-complete.md'), 'utf8');
    requests[1]({ ok: true, text: async () => source });
    await flush();
    requests[0]({ ok: false, status: 404 });
    await flush();
    assert.match(env.document.getElementById('markdownContent').innerHTML, /\/finished\/python\//);
    assert.equal(env.document.body.children.length, 1);
    assert.match(env.document.getElementById('lessonStatus').textContent, /complete/);
});
