(function () {
    'use strict';

    const storageKey = 'copilot-sdk-workshop.language';
    const localeStorageKey = 'copilot-sdk-workshop.locale';
    const picker = document.getElementById('languagePicker');
    const localeSelector = document.getElementById('localeSelector');
    const languageInputs = [...document.querySelectorAll('input[name="language"]')];
    const startLink = document.getElementById('startWorkshopLink');
    const docsLink = document.getElementById('sdkDocsLink');
    const summary = document.getElementById('languageSummary');
    const installCommand = document.getElementById('installCommand');
    const runtimeNote = document.getElementById('runtimeNote');
    const workshopInputs = [...document.querySelectorAll('input[name="workshop"]')];
    const targetAppLink = document.getElementById('targetAppLink');
    const previewTitle = document.getElementById('previewTitle');
    const preview = document.getElementById('workshopPreview');
    const startGuidance = document.getElementById('startGuidance');
    let selectedWorkshopId = null;

    const workshops = {
        intro: {
            name: 'SDK 101',
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
            name: 'Accessibility reviewer',
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
            name: 'Museum Exhibit Studio',
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
    };

    function getUi() {
        return getSelectedLocale().ui;
    }

    function getWorkshopText(workshopId) {
        return getUi().workshops[workshopId] ?? workshops[workshopId];
    }

    function getText(ui, key) {
        return key.split('.').reduce((value, part) => value?.[part], ui);
    }

    function applyLocale(locale) {
        const ui = locale.ui;
        document.title = ui.title;
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const value = getText(ui, element.dataset.i18n);
            if (value !== undefined) element.textContent = value;
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(element => {
            const value = getText(ui, element.dataset.i18nAttr);
            if (value !== undefined) {
                const attribute = element.dataset.i18nAttr === 'description'
                    ? 'content'
                    : element.dataset.i18nAttr === 'brandLabel'
                    ? 'aria-label'
                    : element.dataset.i18nAttr === 'resourcesLabel'
                    ? 'aria-label'
                    : element.dataset.i18nAttr === 'docsAriaLabel'
                    ? 'aria-label'
                    : element.dataset.i18nAttr === 'previewAriaLabel'
                    ? 'aria-label'
                    : null;
                if (attribute) element.setAttribute(attribute, value);
            }
        });
        document.documentElement.lang = locale.htmlLang;
    }

    function getStoredLanguageId() {
        try {
            return window.localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    }

    function storeLanguageId(languageId) {
        try {
            window.localStorage.setItem(storageKey, languageId);
        } catch (error) {
            // Local storage can be unavailable in private browsing contexts.
        }
    }

    function getStoredLocaleId() {
        try {
            return window.localStorage.getItem(localeStorageKey);
        } catch (error) {
            return null;
        }
    }

    function storeLocaleId(localeId) {
        try {
            window.localStorage.setItem(localeStorageKey, localeId);
        } catch (error) {
            // Local storage can be unavailable in private browsing contexts.
        }
    }

    function getSelectedLocale() {
        return WorkshopLocales.getLocale(localeSelector.value) ?? WorkshopLocales.defaultLocale;
    }

    function updateSelection(languageId) {
        const language = WorkshopLanguages.getLanguage(languageId);
        const hasLanguage = language !== null;
        const workshop = selectedWorkshopId ? getWorkshopText(selectedWorkshopId) : null;
        const ui = getUi();
        const ready = workshop !== null && hasLanguage;

        picker.disabled = workshop === null;
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.language === language?.id);
        });
        startLink.classList.toggle('disabled', !ready);
        startLink.setAttribute('aria-disabled', String(!ready));
        startLink.href = ready
            ? WorkshopLanguageNavigation.firstLessonUrl(
                language.id, selectedWorkshopId, WorkshopLocales.queryId(getSelectedLocale().id))
            : workshop ? '#language-picker' : '#workshop-picker';
        startLink.textContent = ready
            ? ui.startNamed.replace('{name}', workshop.shortName)
            : ui.startSelected;
        targetAppLink.hidden = selectedWorkshopId !== 'sdlc';

        if (!hasLanguage) {
            docsLink.removeAttribute('href');
            docsLink.setAttribute('aria-disabled', 'true');
            summary.textContent = workshop
                ? ui.chooseLanguageFor.replace('{name}', workshop.name)
                : ui.languageSummary;
            installCommand.textContent = '';
            runtimeNote.textContent = '';
            startGuidance.textContent = workshop?.guidance ??
                ui.startGuidance;
            return;
        }

        docsLink.href = language.docsUrl;
        docsLink.removeAttribute('aria-disabled');
        docsLink.textContent = `📚 ${language.displayName} ${ui.sdkDocs}`;
        summary.textContent = workshop
            ? ui.workshopUsesLanguage
                .replace('{name}', workshop.name)
                .replace('{language}', language.displayName)
            : ui.chooseWorkshopContinue;
        installCommand.textContent = selectedWorkshopId === 'intro'
            ? 'git clone https://github.com/github/copilot-sdk-workshop.git'
            : language.installCommand;
        runtimeNote.textContent = selectedWorkshopId === 'intro'
            ? `Work in start-intro/${language.id}. Preflight covers its runtime and dependency setup.`
            : language.runtimeNote;
        startGuidance.textContent = workshop?.guidance ?? ui.chooseWorkshopContinue;
    }

    function selectWorkshop(workshopId) {
        selectedWorkshopId = workshops[workshopId] ? workshopId : null;
        document.querySelectorAll('.workshop-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.workshop === selectedWorkshopId);
        });
        const workshop = selectedWorkshopId ? getWorkshopText(selectedWorkshopId) : null;
        const ui = getUi();
        previewTitle.textContent = workshop?.previewTitle ?? ui.previewEmptyTitle;
        preview.textContent = workshop?.preview ?? ui.previewEmpty;
        updateSelection(languageInputs.find(input => input.checked)?.value ?? null);
        if (workshop) {
            languageInputs[0].focus();
        }
    }

    WorkshopLocales.locales.forEach(locale => {
        const option = document.createElement('option');
        option.value = locale.id;
        option.textContent = locale.displayName;
        localeSelector.append(option);
    });

    const initialLocale = WorkshopLanguageNavigation.resolveLocale(
        window.location.search,
        getStoredLocaleId(),
        WorkshopLocales.getLocale
    ) ?? WorkshopLocales.defaultLocale;
    localeSelector.value = initialLocale.id;
    applyLocale(initialLocale);

    localeSelector.addEventListener('change', () => {
        const locale = getSelectedLocale();
        storeLocaleId(locale.id);
        const url = new URL(window.location.href);
        const localeQueryId = WorkshopLocales.queryId(locale.id);
        if (localeQueryId) url.searchParams.set('locale', localeQueryId);
        else url.searchParams.delete('locale');
        window.history.replaceState({}, '', url.href);
        applyLocale(locale);
        const workshop = selectedWorkshopId ? getWorkshopText(selectedWorkshopId) : null;
        previewTitle.textContent = workshop?.previewTitle ?? locale.ui.previewEmptyTitle;
        preview.textContent = workshop?.preview ?? locale.ui.previewEmpty;
        updateSelection(languageInputs.find(input => input.checked)?.value ?? null);
    });

    languageInputs.forEach(input => {
        input.addEventListener('change', () => {
            const language = WorkshopLanguages.getLanguage(input.value);
            storeLanguageId(language.id);
            updateSelection(language.id);
        });
    });

    workshopInputs.forEach(input => {
        input.addEventListener('change', () => selectWorkshop(input.value));
    });

    startLink.addEventListener('click', event => {
        if (startLink.getAttribute('aria-disabled') === 'true') {
            event.preventDefault();
            if (!selectedWorkshopId) {
                workshopInputs[0].focus();
            } else {
                languageInputs[0].focus();
                languageInputs[0].reportValidity();
            }
        }
    });

    const initialLanguage = WorkshopLanguageNavigation.resolveLanguage(
        window.location.search,
        getStoredLanguageId(),
        WorkshopLanguages.getLanguage
    );
    if (initialLanguage) {
        const matchingLanguage = languageInputs.find(input => input.value === initialLanguage.id);
        matchingLanguage.checked = true;
        storeLanguageId(initialLanguage.id);
    }

    const requestedWorkshop = new URLSearchParams(window.location.search).get('workshop');
    const matchingWorkshop = workshopInputs.find(input => input.value === requestedWorkshop);
    if (matchingWorkshop) {
        matchingWorkshop.checked = true;
        selectWorkshop(matchingWorkshop.value);
    } else {
        updateSelection(initialLanguage?.id ?? null);
    }
}());
