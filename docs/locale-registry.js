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
