(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.WorkshopMarkdown = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function directiveError(lineNumber, message) {
        return new Error(`Language directive error on line ${lineNumber}: ${message}`);
    }

    function preprocessLanguageDirectives(markdown, languageId, getLanguage) {
        if (typeof markdown !== 'string') {
            throw new TypeError('Markdown must be a string.');
        }
        if (typeof getLanguage !== 'function' || !getLanguage(languageId)) {
            throw new Error(`A valid workshop language is required to render this lesson: "${languageId ?? ''}".`);
        }

        const output = [];
        let activeLanguageId = null;
        const lines = markdown.split(/\r?\n/);

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const languageMatch = line.match(/^:::language\s+(\S+)\s*$/);
            const closingMatch = /^:::\s*$/.test(line);
            const directiveLike = line.startsWith(':::');

            if (languageMatch) {
                if (activeLanguageId !== null) {
                    throw directiveError(lineNumber, 'language blocks cannot be nested.');
                }
                if (!getLanguage(languageMatch[1])) {
                    throw directiveError(lineNumber, `unknown language "${languageMatch[1]}".`);
                }
                activeLanguageId = languageMatch[1];
                return;
            }

            if (closingMatch) {
                if (activeLanguageId === null) {
                    throw directiveError(lineNumber, 'closing directive has no open language block.');
                }
                activeLanguageId = null;
                return;
            }

            if (directiveLike) {
                throw directiveError(lineNumber, 'expected :::language <id> or :::.');
            }

            if (activeLanguageId === null || activeLanguageId === languageId) {
                output.push(line);
            }
        });

        if (activeLanguageId !== null) {
            throw directiveError(lines.length, `language block for "${activeLanguageId}" is not closed.`);
        }

        return output.join('\n');
    }

    const DEFAULT_DEMO_ACT_HEADINGS = Object.freeze({
        one: '## Act One: Hello World',
        two: '## Act Two: Turn It Into A Podcast Agent'
    });

    function extractLiveDemoAct(markdown, act, actHeadings) {
        if (typeof markdown !== 'string') {
            throw new TypeError('LIVE_DEMO Markdown must be a string.');
        }
        const headings = actHeadings ?? DEFAULT_DEMO_ACT_HEADINGS;
        const heading = act === 'one' || act === 'two' ? headings[act] ?? null : null;
        if (!heading) {
            throw new Error(`Unknown LIVE_DEMO act: "${act}".`);
        }

        const output = [];
        let active = false;
        let fence = null;
        for (const line of markdown.split(/\r?\n/)) {
            const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);
            if (fenceMatch) {
                if (fence === null) {
                    fence = fenceMatch[1];
                } else if (fenceMatch[1][0] === fence[0]
                    && fenceMatch[1].length >= fence.length
                    && fenceMatch[2].trim() === '') {
                    fence = null;
                }
            } else if (fence === null && line.startsWith('## ')) {
                if (active) break;
                active = line === heading;
                continue;
            }
            if (active) output.push(line);
        }
        const content = output.join('\n').trim();
        if (!content) {
            throw new Error(`LIVE_DEMO.md is missing content for "${heading}".`);
        }
        return content;
    }

    function includeLiveDemoAct(lesson, guide, act, actHeadings) {
        const marker = '<!-- LIVE_DEMO -->';
        if (lesson.split(marker).length !== 2) {
            throw new Error('The demo lesson must contain exactly one LIVE_DEMO marker.');
        }
        return lesson.replace(marker, () => extractLiveDemoAct(guide, act, actHeadings));
    }

    return Object.freeze({ preprocessLanguageDirectives, extractLiveDemoAct, includeLiveDemoAct });
}));
