(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.WorkshopCompletion = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function createCelebration(window, document) {
        const celebrated = new Set();
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let overlay;
        let cleanupTimer;

        function clear() {
            window.clearTimeout(cleanupTimer);
            overlay?.remove();
            overlay = undefined;
            reducedMotion.removeEventListener('change', clear);
        }

        function show(step) {
            if (step.kind !== 'completion' || celebrated.has(step.id)) {
                return;
            }
            celebrated.add(step.id);
            if (reducedMotion.matches) {
                return;
            }

            clear();
            overlay = document.createElement('div');
            overlay.className = 'completion-confetti';
            overlay.setAttribute('aria-hidden', 'true');
            for (let index = 0; index < 64; index++) {
                const piece = document.createElement('span');
                piece.style.left = `${Math.random() * 100}%`;
                piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 240}px`);
                piece.style.setProperty('--delay', `${Math.random() * 350}ms`);
                piece.style.setProperty('--turn', `${(Math.random() - 0.5) * 1080}deg`);
                overlay.append(piece);
            }
            document.body.append(overlay);
            reducedMotion.addEventListener('change', clear);
            cleanupTimer = window.setTimeout(clear, 3500);
        }

        window.addEventListener('pagehide', clear);
        return Object.freeze({ show, clear });
    }

    return Object.freeze({ createCelebration });
}));
