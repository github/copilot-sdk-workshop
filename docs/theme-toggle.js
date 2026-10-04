(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.dataset.theme =
        savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
})();

function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    updateToggleIcon();
}

function updateToggleIcon() {
    const isLight = document.documentElement.dataset.theme === 'light';
    const labels = resolveThemeLabels();
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.textContent = isLight ? labels.dark : labels.light;
        button.setAttribute('aria-label', isLight ? labels.switchToDark : labels.switchToLight);
    });
}

// The script loads before the locale registry, so English literals stay as the fallback.
function resolveThemeLabels() {
    const fallback = {
        dark: '🌙 Dark',
        light: '☀️ Light',
        switchToDark: 'Switch to dark theme',
        switchToLight: 'Switch to light theme'
    };

    if (typeof WorkshopLocales === 'undefined') {
        return fallback;
    }

    let storedLocaleId = null;
    try {
        storedLocaleId = localStorage.getItem('copilot-sdk-workshop.locale');
    } catch (error) {
        storedLocaleId = null;
    }

    const requestedLocaleId = new URLSearchParams(window.location.search).get('locale');
    const locale = WorkshopLocales.getLocale(requestedLocaleId)
        ?? WorkshopLocales.getLocale(storedLocaleId)
        ?? WorkshopLocales.defaultLocale;

    return locale?.ui?.theme ?? fallback;
}

document.addEventListener('DOMContentLoaded', updateToggleIcon);
