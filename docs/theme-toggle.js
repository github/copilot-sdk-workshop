(function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.dataset.theme =
        savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
})();

function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        return;
    }
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    syncThemeControls();
}

function syncThemeControls() {
    const theme = document.documentElement.dataset.theme;
    document.querySelectorAll('input[name="theme"]').forEach(input => {
        input.checked = input.value === theme;
    });
}

document.addEventListener('change', event => {
    if (event.target instanceof HTMLInputElement && event.target.name === 'theme') {
        setTheme(event.target.value);
    }
});
document.addEventListener('DOMContentLoaded', syncThemeControls);
