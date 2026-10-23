"use strict";
const walk = document.getElementById('walk');
if (walk) {
    const stepEls = Array.from(walk.querySelectorAll('.wstep'));
    const fill = document.getElementById('walk-fill');
    const text = document.getElementById('walk-text');
    const prev = document.getElementById('walk-prev');
    const next = document.getElementById('walk-next');
    const total = stepEls.length;
    let current = 0;
    walk.classList.add('is-interactive');
    function show(index, focus = true) {
        current = Math.max(0, Math.min(index, total - 1));
        stepEls.forEach((el, i) => {
            el.hidden = i !== current;
        });
        fill.style.width = `${((current + 1) / total) * 100}%`;
        text.textContent = `Step ${current + 1} of ${total}`;
        prev.disabled = current === 0;
        next.disabled = current === total - 1;
        if (focus) {
            stepEls[current].querySelector('h2')?.focus({ preventScroll: true });
        }
    }
    next.addEventListener('click', () => show(current + 1));
    prev.addEventListener('click', () => show(current - 1));
    document.addEventListener('keydown', (event) => {
        const tag = event.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA')
            return;
        if (event.key === 'ArrowRight' && !next.disabled)
            show(current + 1);
        if (event.key === 'ArrowLeft' && !prev.disabled)
            show(current - 1);
    });
    show(0, false);
}
