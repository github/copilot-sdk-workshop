(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.WorkshopLanguageNavigation = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function resolveLanguage(search, storedLanguageId, getLanguage) {
        const parameters = new URLSearchParams(search);
        if (parameters.has('lang')) {
            return getLanguage(parameters.get('lang'));
        }
        return getLanguage(storedLanguageId);
    }

    function resolveLocale(search, storedLocaleId, getLocale) {
        const parameters = new URLSearchParams(search);
        if (parameters.has('locale')) {
            return getLocale(parameters.get('locale'));
        }
        return getLocale(storedLocaleId);
    }

    function lessonUrl(stepId, languageId, localeId) {
        const parameters = new URLSearchParams({ step: stepId });
        if (languageId) {
            parameters.set('lang', languageId);
        }
        if (localeId) {
            parameters.set('locale', localeId);
        }
        return `?${parameters.toString()}`;
    }

    function homeUrl(languageId, workshopId, localeId) {
        const parameters = new URLSearchParams();
        if (languageId) {
            parameters.set('lang', languageId);
        }
        if (workshopId) {
            parameters.set('workshop', workshopId);
        }
        if (localeId) {
            parameters.set('locale', localeId);
        }
        const query = parameters.toString();
        return query ? `../index.html?${query}` : '../index.html';
    }

    function firstLessonUrl(languageId, workshopId = 'sdlc', localeId) {
        const firstStep = workshopId === 'intro'
            ? 'intro-00-preflight'
            : workshopId === 'museum'
            ? 'museum-00-preflight'
            : '00-preflight';
        return `workshop/step.html${lessonUrl(firstStep, languageId, localeId)}`;
    }

    function siteRootUrl(lessonPageUrl) {
        return new URL('../', lessonPageUrl);
    }

    return Object.freeze({ resolveLanguage, resolveLocale, lessonUrl, homeUrl, firstLessonUrl, siteRootUrl });
}));
