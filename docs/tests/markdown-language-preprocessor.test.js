'use strict';

const assert = require('node:assert/strict');
const { getLanguage, languages } = require('../language-registry.js');
const {
    firstLessonUrl,
    homeUrl,
    lessonUrl,
    resolveLanguage,
    siteRootUrl
} = require('../language-navigation.js');
const { preprocessLanguageDirectives, extractLiveDemoAct, includeLiveDemoAct } =
    require('../markdown-language-preprocessor.js');

const preprocess = (markdown, languageId) =>
    preprocessLanguageDirectives(markdown, languageId, getLanguage);

assert.equal(
    preprocess('Shared\n:::language dotnet\n.NET only\n:::\n:::language python\nPython only\n:::\nEnd', 'dotnet'),
    'Shared\n.NET only\nEnd'
);
assert.equal(
    preprocess('Shared\n:::language dotnet\n.NET only\n:::\n:::language python\nPython only\n:::\nEnd', 'python'),
    'Shared\nPython only\nEnd'
);
assert.throws(
    () => preprocess(':::language dotnet\n:::language python\n:::\n:::', 'dotnet'),
    /cannot be nested/
);
assert.throws(() => preprocess(':::language unknown\n:::', 'dotnet'), /unknown language/);
assert.throws(() => preprocess(':::language dotnet\nUnclosed', 'dotnet'), /not closed/);
assert.throws(() => preprocess(':::', 'dotnet'), /closing directive has no open/);
assert.throws(() => preprocess(':::unexpected', 'dotnet'), /expected :::language/);

const guide = [
    '# Guide', '## Preparation', 'Install first.',
    '## Act One: Hello World', '### 1. Start The Client',
    '```text', '## This is code, not a section', '$&', '```',
    '## Act Two: Turn It Into A Podcast Agent', '### 1. Let The Presenter Choose',
    'Use the helpers.'
].join('\n');
assert.equal(extractLiveDemoAct(guide, 'two'),
    '### 1. Let The Presenter Choose\nUse the helpers.');
assert.match(extractLiveDemoAct(guide.replaceAll('\n', '\r\n'), 'one'),
    /## This is code, not a section/);
assert.doesNotMatch(extractLiveDemoAct(guide, 'one'), /Use the helpers|Install first/);
assert.match(includeLiveDemoAct('Before\n<!-- LIVE_DEMO -->\nAfter', guide, 'one'), /\$&/);
assert.throws(() => extractLiveDemoAct(guide, 'three'), /Unknown LIVE_DEMO act/);
assert.throws(() => extractLiveDemoAct('## Act One: Hello World', 'one'), /missing content/);
assert.throws(() => extractLiveDemoAct('## Preparation\nOnly setup.', 'two'), /missing content/);
assert.throws(() => includeLiveDemoAct('No marker', guide, 'one'), /exactly one/);
assert.throws(() => includeLiveDemoAct('<!-- LIVE_DEMO --><!-- LIVE_DEMO -->', guide, 'one'), /exactly one/);

assert.equal(lessonUrl('04-mcp-safety', 'rust'), '?step=04-mcp-safety&lang=rust');
assert.equal(lessonUrl('04-mcp-safety'), '?step=04-mcp-safety');
assert.equal(firstLessonUrl('java'), 'workshop/step.html?step=00-preflight&lang=java');
assert.equal(firstLessonUrl('python', 'museum'), 'workshop/step.html?step=museum-00-preflight&lang=python');
for (const language of languages) {
    assert.equal(firstLessonUrl(language.id, 'intro'),
        `workshop/step.html?step=intro-00-preflight&lang=${language.id}`);
    assert.equal(homeUrl(language.id, 'intro'),
        `../index.html?lang=${language.id}&workshop=intro`);
    assert.equal(lessonUrl('intro-03-podcast-agent', language.id),
        `?step=intro-03-podcast-agent&lang=${language.id}`);
}
assert.equal(homeUrl('python'), '../index.html?lang=python');
assert.equal(homeUrl('python', 'museum'), '../index.html?lang=python&workshop=museum');
assert.equal(homeUrl(), '../index.html');
assert.equal(
    siteRootUrl('https://expert-adventure-l67eo16.pages.github.io/workshop/step.html?step=00-preflight').href,
    'https://expert-adventure-l67eo16.pages.github.io/'
);
assert.equal(
    siteRootUrl('https://github.github.io/copilot-sdk-workshop/workshop/step.html').href,
    'https://github.github.io/copilot-sdk-workshop/'
);
assert.equal(resolveLanguage('?lang=go', 'rust', getLanguage).id, 'go');
assert.equal(resolveLanguage('', 'rust', getLanguage).id, 'rust');
assert.equal(resolveLanguage('?lang=unknown', 'rust', getLanguage), null);

console.log('Workshop language directive and navigation tests passed.');
