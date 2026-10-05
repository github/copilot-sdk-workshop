(function () {
    'use strict';

    const container = document.getElementById('settings');
    const button = document.getElementById('settingsButton');
    const panel = document.getElementById('settingsPanel');
    if (!container || !button || !panel) {
        return;
    }

    function setOpen(open, restoreFocus) {
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
        if (!open && restoreFocus) {
            button.focus();
        }
    }

    button.addEventListener('click', () => setOpen(panel.hidden, false));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false, container.contains(document.activeElement));
        }
    });

    document.addEventListener('pointerdown', event => {
        if (!panel.hidden && !container.contains(event.target)) {
            setOpen(false, false);
        }
    });

    // Tabbing past the last setting closes the menu instead of leaving it open behind the focus.
    container.addEventListener('focusout', event => {
        if (!panel.hidden && event.relatedTarget && !container.contains(event.relatedTarget)) {
            setOpen(false, false);
        }
    });
}());
